var CafeNowDirectOrdering = Class.create();
CafeNowDirectOrdering.prototype = {
    initialize: function () {
        this.T = {vendor: 'x_1234_cafenow_vendor', menu: 'x_1234_cafenow_menu',
            window: 'x_1234_cafenow_pickup_window', order: 'x_1234_cafenow_order', line: 'x_1234_cafenow_order_line'};
        this.P = 'x_1234_cafenow.direct.';
        this.userId = String(gs.getUserID());
        this.windowField = 'time_slot_v2'; // Confirmed reference in the November 9 export.
        this.ownerField = 'opened_by'; // Inherited Task field; no requested_for column in export.
    },
    handle: function (input, options, route) {
        var views = ['vendors', 'menu', 'sidebar', 'cart', 'orders', 'details'];
        var view = views.indexOf(String(options.view)) >= 0 ? String(options.view) : 'menu';
        var out = {view: view, signed_in: gs.getUserName() !== 'guest', user_id: this.userId,
            vendors: [], menu: [], items: [], windows: [], orders: [], lines: [], error: '', can_submit: false};
        if (!out.signed_in) return out;
        try {
            var action = String(input.action || 'preview');
            if (['preview', 'submit', 'status'].indexOf(action) < 0) this.fail('Unsupported CafeNow action.');
            if (action === 'status') {
                out.pending = true;
                this.fail('Automatic retry lookup is deferred. Check My Orders or ask an administrator before submitting again.');
            }
            if (view === 'orders') { this.myOrders(out); return out; }
            if (view === 'details') { this.details(String(route.order_id || ''), out); return out; }
            this.browse(String(input.vendor_id || route.vendor || ''), out);
            var quote = this.quote(input.items || [], out);
            if (quote.problem) out.error = quote.problem;
            out.pickup_date = this.clock().date;
            out.timezone = 'America/New_York';
            out.terms_url = String(gs.getProperty(this.P + 'terms_url', ''));
            out.terms_version = String(gs.getProperty(this.P + 'terms_version', ''));
            if (out.terms_url && !/^\?id=[a-zA-Z0-9_-]+$/.test(out.terms_url)) this.fail('Configure a CafeNow terms page.');
            if (quote.vendor) this.listWindows(quote.vendor, out);
            out.token = gs.generateGUID();
            out.snapshot = new GlideDigest().getSHA256Hex(JSON.stringify(quote.identity) + out.pickup_date + out.terms_version);
            out.can_submit = !quote.problem && out.items.length > 0 && out.windows.length > 0;
            if (!out.can_submit) out.notice = gs.getMessage('Add available food from one vendor and select a pickup window.');
            if (action === 'submit') this.submit(input, quote, out);
        } catch (error) {
            out.error = error.cafenow_message || gs.getMessage('CafeNow could not confirm this operation. Contact the CafeNow team.');
            out.can_submit = false;
        }
        return out;
    },
    browse: function (vendorId, out) {
        var vendors = new GlideRecordSecure(this.T.vendor);
        vendors.addQuery('active', true);
        vendors.orderBy('name'); vendors.query();
        var visible = {};
        while (vendors.next()) {
            if (!vendors.canRead() || !this.read(vendors, 'name') || !this.read(vendors, 'active') || String(vendors.getValue('active')) !== '1') continue;
            var id = String(vendors.getUniqueValue());
            visible[id] = true;
            out.vendors.push({sys_id: id, name: String(vendors.getValue('name')), url: '?id=cafe_menu&vendor=' + id});
        }
        if (!vendorId) return;
        this.id(vendorId);
        if (!visible[vendorId]) this.fail('This vendor is not available.');
        out.selected_vendor = vendorId;
        var menus = new GlideRecordSecure(this.T.menu);
        menus.addQuery('vendor', vendorId); menus.addQuery('active', true); menus.orderBy('item_name'); menus.query();
        while (menus.next()) {
            if (!menus.canRead() || !this.read(menus, 'vendor') || String(menus.getValue('vendor')) !== vendorId) continue;
            var food = this.food(String(menus.getUniqueValue()), false);
            if (food) out.menu.push(food);
        }
    },
    food: function (id, forOrder) {
        this.id(id);
        var row = new GlideRecordSecure(this.T.menu);
        if (!row.get(id) || !row.canRead()) return null;
        var fields = ['vendor', 'item_name', 'price', 'active', 'in_stock'];
        for (var i = 0; i < fields.length; i++) if (!this.read(row, fields[i])) return null;
        if (String(row.getValue('active')) !== '1') return null;
        var vendor = new GlideRecordSecure(this.T.vendor);
        var vendorId = String(row.getValue('vendor'));
        if (!vendor.get(vendorId) || !vendor.canRead() || !this.read(vendor, 'active') || !this.read(vendor, 'name') ||
                !this.read(vendor, 'accepting_orders') || String(vendor.getValue('active')) !== '1') return null;
        var available = String(row.getValue('in_stock')) === '1' && String(vendor.getValue('accepting_orders')) === '1';
        if (forOrder && !available) return null;
        var price = row.getElement('price');
        if (typeof price.getCurrencyValue !== 'function' || typeof price.getCurrencyCode !== 'function')
            this.fail('Menu price currency configuration needs review.');
        var cents = this.cents(String(price.getCurrencyValue()));
        var currency = String(price.getCurrencyCode());
        if (!/^[A-Z]{3}$/.test(currency)) this.fail('Menu currency is invalid.');
        var imageId = this.read(row, 'item_image') ? String(row.getValue('item_image') || '') : '';
        var imageUrl = /^[a-f0-9]{32}$/.test(imageId) ? '/' + imageId + '.iix' : '';
        return {sys_id: id, vendor_id: vendorId, vendor_name: String(vendor.getValue('name')), image_url: imageUrl,
            name: String(row.getValue('item_name')), description: this.read(row, 'description') ? String(row.getValue('description') || '') : '',
            cents: cents, currency: currency, unit_display: currency + ' ' + this.amount(cents), available: available,
            revision: String(row.getValue('sys_updated_on') || '')};
    },
    quote: function (items, out) {
        if (!Array.isArray(items) || items.length > 100) this.fail('Your cart must contain at most 100 food lines.');
        var merged = {}, keys = [], vendor = '', currency = '', identity = [], total = 0, problem = '';
        for (var i = 0; i < items.length; i++) {
            var id = String(items[i].menu_id || ''); this.id(id);
            var quantity = Number(items[i].quantity);
            if ((typeof items[i].quantity !== 'number' && typeof items[i].quantity !== 'string') ||
                    !isFinite(quantity) || quantity % 1 || quantity < 1 || quantity > 99) this.fail('Food quantities must be whole numbers from 1 to 99.');
            if (!merged[id]) { merged[id] = 0; keys.push(id); }
            merged[id] += quantity;
            if (merged[id] > 99) this.fail('Combined food quantity must not exceed 99.');
        }
        keys.sort();
        for (var k = 0; k < keys.length; k++) {
            var food = this.food(keys[k], true);
            if (!food) {
                problem = 'Remove unavailable food before checkout.';
                out.items.push({menu_id: keys[k], name: gs.getMessage('Unavailable food'), quantity: merged[keys[k]], unavailable: true});
                identity.push([keys[k], merged[keys[k]], 'unavailable']);
                continue;
            }
            if (vendor && vendor !== food.vendor_id) problem = 'Keep food from one vendor in your cart.';
            if (currency && currency !== food.currency) problem = 'All food prices in an order must use one currency.';
            vendor = food.vendor_id; currency = food.currency;
            var lineCents = food.cents * merged[food.sys_id];
            total += lineCents;
            if (!isFinite(total) || total > 9007199254740991) this.fail('The cart total is too large.');
            out.items.push({menu_id: food.sys_id, name: food.name, image_url: food.image_url, quantity: merged[food.sys_id], cents: food.cents,
                unit_display: food.unit_display, line_cents: lineCents, line_display: currency + ' ' + this.amount(lineCents)});
            identity.push([food.sys_id, merged[food.sys_id], food.cents, food.currency, food.vendor_id, food.revision]);
            out.cart_vendor = vendor; out.cart_vendor_name = food.vendor_name;
        }
        out.total_display = currency && !problem ? currency + ' ' + this.amount(total) : '';
        return {vendor: vendor, currency: currency, total: total, identity: identity, problem: problem};
    },
    // Display records without applying booking eligibility rules.
    listWindows: function (vendorId, out) {
        var rows = new GlideRecordSecure(this.T.window);
        rows.addQuery('vendor', vendorId);
        rows.addQuery('is_active', true);
        rows.orderBy('start_time'); rows.query();
        while (rows.next()) {
            if (!rows.canRead() || !this.read(rows, 'vendor') || !this.read(rows, 'is_active') ||
                    !this.read(rows, 'time_slot_v2') || String(rows.getValue('vendor')) !== vendorId ||
                    String(rows.getValue('is_active')) !== '1') continue;
            out.windows.push({sys_id: String(rows.getUniqueValue()), label: String(rows.getDisplayValue('time_slot_v2'))});
        }
    },
    submit: function (input, quote, out) {
        if (!out.can_submit) this.fail('Review your cart and select a pickup window.');
        if (input.accept_terms !== true) this.fail('Accept the Terms & Conditions.');
        if (String(input.pickup_date || '') !== out.pickup_date ||
                String(input.snapshot || '') !== out.snapshot)
            this.fail('Your cart or pickup date changed. Review checkout again.');
        this.id(input.window_id);
        var selected = false;
        for (var i = 0; i < out.windows.length; i++)
            if (out.windows[i].sys_id === String(input.window_id)) selected = true;
        if (!selected) this.fail('Select an active pickup window for your vendor.');

        var vendor = new GlideRecord(this.T.vendor);
        if (!vendor.get(quote.vendor)) this.fail('Vendor mapping disappeared.');
        // Reuse the vendor building; retain the existing property as an optional fallback.
        var locationId = String(vendor.getValue('location') || gs.getProperty(this.P + 'building_location', ''));
        var location = new GlideRecord('cmn_location');
        if (!/^[a-f0-9]{32}$/.test(locationId) || !location.get(locationId))
            this.fail('Set a valid building Location on this Vendor before placing an order.');
        var order = new GlideRecord(this.T.order);
        this.requireFields(order, [this.ownerField, 'vendor', this.windowField, 'order_total', 'location', 'state', 'active']);
        var lineSchema = new GlideRecord(this.T.line);
        this.requireFields(lineSchema, ['order', 'menu_item', 'item_name', 'quantity', 'unit_price', 'line_price']);
        order.initialize();
        order.setValue(this.ownerField, this.userId);
        if (order.isValidField('requested_for')) order.setValue('requested_for', this.userId);
        order.setValue('vendor', quote.vendor);
        order.setValue(this.windowField, String(input.window_id));
        if (order.isValidField('pickup_date')) order.setValue('pickup_date', out.pickup_date);
        if (order.isValidField('terms_version')) order.setValue('terms_version', out.terms_version);
        if (order.isValidField('terms_accepted_at')) order.setValue('terms_accepted_at', new GlideDateTime().getValue());
        order.setValue('location', locationId);
        order.setValue('state', '-5');
        // Order extends Task: keep Submitted active so Task automation does not treat it as closed.
        order.setValue('active', true);
        order.setValue('order_total', quote.currency + ';' + this.amount(quote.total));
        order.setValue('assignment_group', String(vendor.getValue('vendor_group') || ''));
        order.setValue('short_description', 'CafeNow food order');
        var orderId = this.insert(order);
        if (!orderId) this.fail('The Order could not be saved. Check mandatory fields and Order rules.');
        try {
            if (!/^ORD[0-9]+$/.test(String(order.getValue('number') || '')))
                this.fail('Order numbering needs configuration.');
            for (var j = 0; j < out.items.length; j++) {
                var item = out.items[j], line = new GlideRecord(this.T.line); line.initialize();
                line.setValue('order', orderId);
                line.setValue('menu_item', item.menu_id);
                line.setValue('item_name', item.name);
                line.setValue('quantity', item.quantity);
                line.setValue('unit_price', quote.currency + ';' + this.amount(item.cents));
                line.setValue('line_price', quote.currency + ';' + this.amount(item.line_cents));
                if (!this.insert(line)) this.fail('An Order Line could not be saved.');
            }
            order.setValue('state', '-5');
            order.setValue('active', true);
            if (!order.update()) this.fail('The Order could not be finalized.');
        } catch (error) {
            if (!this.cleanup(orderId)) {
                out.pending = true;
                this.fail('A partial Order needs administrator review. Do not submit again.');
            }
            throw error;
        }
        var saved = new GlideRecord(this.T.order);
        if (!saved.get(orderId) || String(saved.getValue('state')) !== '-5' || String(saved.getValue('active')) !== '1') {
            out.pending = true;
            this.fail('The Order was saved but automation changed its Submitted state. Contact the CafeNow team; do not submit again.');
        }
        out.submitted = true;
        out.order_id = orderId;
        out.order_number = String(order.getValue('number'));
        out.order_url = '?id=cafenow_order_details&order_id=' + orderId;
    },
    cleanup: function (orderId) {
        var lines = new GlideRecord(this.T.line); lines.addQuery('order', orderId); lines.query();
        var clean = true;
        while (lines.next()) if (!lines.deleteRecord()) clean = false;
        var order = new GlideRecord(this.T.order);
        if (!order.get(orderId)) return clean;
        if (clean && order.deleteRecord()) return true;
        return false;
    },
    canReadOrder: function (order) {
        if (gs.getUserName() === 'guest') return false;
        if (String(order.getValue('state')) === '-5' && String(order.getValue('active')) === '0') return false;
        if (order.isValidField('submission_status')) {
            var status = String(order.getValue('submission_status') || '');
            if (status && status !== 'complete') return false;
        }
        if (String(order.getValue(this.ownerField)) === this.userId) return true;
        return this.canManageVendorOrder(order);
    },
    canManageVendorOrder: function (order) {
        if (gs.getUserName() === 'guest') return false;
        if (String(order.getValue('state')) === '-5' && String(order.getValue('active')) === '0') return false;
        var submissionStatus = order.isValidField('submission_status') ? String(order.getValue('submission_status') || '') : '';
        if (submissionStatus && submissionStatus !== 'complete') return false;
        var roles = ',' + String(gs.getUser().getRoles()).replace(/\s/g, '') + ',';
        var roleAllowed = (roles.indexOf(',x_1234_cafenow.vendor_admin,') >= 0 && gs.getUser().hasRole('x_1234_cafenow.vendor_admin')) ||
            (roles.indexOf(',x_1234_cafenow.vendor_staff,') >= 0 && gs.getUser().hasRole('x_1234_cafenow.vendor_staff'));
        if (!roleAllowed) return false;
        var vendor = new GlideRecord(this.T.vendor);
        if (!vendor.get(String(order.getValue('vendor')))) return false;
        var target = String(vendor.getValue('vendor_group') || '');
        if (!target) return false;
        var member = new GlideRecord('sys_user_grmember'); member.addQuery('user', this.userId); member.query();
        while (member.next()) {
            if (String(member.getValue('user')) !== this.userId) continue;
            var group = new GlideRecord('sys_user_group');
            if (!group.get(String(member.getValue('group'))) || String(group.getValue('active')) !== '1') continue;
            if (String(group.getUniqueValue()) === target) return true;
            var parent = new GlideRecord('sys_user_group');
            if (String(group.getValue('parent')) === target && parent.get(target) && String(parent.getValue('active')) === '1') return true;
        }
        return false;
    },
    canReadLine: function (line) {
        var order = new GlideRecord(this.T.order);
        return order.get(String(line.getValue('order') || '')) && this.canReadOrder(order);
    },
    myOrders: function (out) {
        var rows = new GlideRecordSecure(this.T.order); rows.addQuery(this.ownerField, this.userId); rows.orderByDesc('sys_created_on'); rows.setLimit(100); rows.query();
        while (rows.next()) {
            if (rows.canRead() && String(rows.getValue(this.ownerField)) === this.userId && this.canReadOrder(rows) && this.read(rows, 'number') && this.read(rows, 'state'))
                out.orders.push({sys_id: String(rows.getUniqueValue()), number: String(rows.getDisplayValue('number')),
                    state: String(rows.getDisplayValue('state')), url: '?id=cafenow_order_details&order_id=' + String(rows.getUniqueValue())});
        }
    },
    details: function (id, out) {
        this.id(id);
        var order = new GlideRecordSecure(this.T.order);
        if (!order.get(id) || !order.canRead() || !this.canReadOrder(order) || !this.read(order, 'number') || !this.read(order, 'state'))
            this.fail('This Order is not available to your account.');
        out.order = {number: String(order.getDisplayValue('number')), state: String(order.getDisplayValue('state')),
            pickup: this.read(order, this.windowField) ? String(order.getDisplayValue(this.windowField)) : '',
            total: this.read(order, 'order_total') ? String(order.getDisplayValue('order_total')) : ''};
        var lines = new GlideRecordSecure(this.T.line); lines.addQuery('order', id); lines.orderBy('sys_created_on'); lines.query();
        while (lines.next()) {
            var fields = ['order', 'item_name', 'quantity', 'unit_price', 'line_price'], allowed = lines.canRead();
            for (var f = 0; f < fields.length; f++) if (!this.read(lines, fields[f])) allowed = false;
            if (allowed && String(lines.getValue('order')) === id)
                out.lines.push({sys_id: String(lines.getUniqueValue()), name: String(lines.getValue('item_name')), quantity: Number(lines.getValue('quantity')),
                    unit_display: String(lines.getDisplayValue('unit_price')), line_display: String(lines.getDisplayValue('line_price'))});
        }
    },
    cents: function (value) {
        var m = /^(\d+)(?:\.(\d+))?$/.exec(value);
        if (!m || /[1-9]/.test((m[2] || '').substring(2))) this.fail('Menu prices must use supported two-decimal currency values.');
        var cents = Number(m[1]) * 100 + Number(((m[2] || '') + '00').substring(0, 2));
        if (!isFinite(cents) || cents > 9007199254740991) this.fail('Menu price is invalid.');
        return cents;
    },
    amount: function (cents) { return String(Math.floor(cents / 100)) + '.' + ('0' + String(cents % 100)).slice(-2); },
    clock: function () {
        var utc = Number(new GlideDateTime().getNumericValue()), year = new Date(utc).getUTCFullYear();
        if (year < 2007 || year > 2030) this.fail('Review the New York timezone rules.');
        var march = 1 + (7 - new Date(Date.UTC(year, 2, 1)).getUTCDay()) % 7 + 7;
        var november = 1 + (7 - new Date(Date.UTC(year, 10, 1)).getUTCDay()) % 7;
        var summer = utc >= Date.UTC(year, 2, march, 7) && utc < Date.UTC(year, 10, november, 6);
        var d = new Date(utc + (summer ? -4 : -5) * 3600000), pad = function (n) { return n < 10 ? '0' + n : String(n); };
        return {date: d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()), seconds: d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds()};
    },
    requireFields: function (record, fields) {
        for (var i = 0; i < fields.length; i++) if (!record.isValidField(fields[i])) this.fail('Direct-order submission fields need configuration.');
    },
    read: function (record, field) { return record.isValidField(field) && record.getElement(field).canRead(); },
    id: function (id) { if (!/^[a-f0-9]{32}$/.test(String(id || ''))) this.fail('Invalid record reference.'); },
    insert: function (record) { try { return String(record.insert() || ''); } catch (e) { return ''; } },
    fail: function (message) { var e = new Error(message); e.cafenow_message = gs.getMessage(message); throw e; },
    type: 'CafeNowDirectOrdering'
};
