var CafeNowCheckout = Class.create();
CafeNowCheckout.prototype = {
    initialize: function () {
        // Existing identifiers are from the retained export; verify in your dictionary.
        this.T = {order: 'x_1234_cafenow_order', menu: 'x_1234_cafenow_menu',
            vendor: 'x_1234_cafenow_vendor', window: 'x_1234_cafenow_pickup_window',
            checkout: 'x_1234_cafenow_checkout', reservation: 'x_1234_cafenow_pickup_reservation'};
        this.P = 'x_1234_cafenow.checkout.';
        this.MAX_QUANTITY = 99; // Widget bound, not a confirmed product limit.
        this.MAX_LINES = 100;
        this.userId = String(gs.getUserID());
    },

    handle: function (input) {
        var out = {items: [], windows: [], error: '', setup_message: '', ok: false,
            signed_in: gs.getUserName() !== 'guest', can_checkout: false, can_submit: false,
            timezone: 'America/New_York', menu_url: '?id=cafe_menu'};
        if (!out.signed_in) return out;
        var action = String(input.action || 'refresh');
        try {
            if (action === 'status') return this.status(String(input.token || ''), out);
            if (['refresh', 'quantity', 'remove', 'submit'].indexOf(action) === -1)
                this.fail('Unsupported cart action.');
            // A repeated token is resolved before touching a possibly emptied cart.
            if (action === 'submit') {
                this.id(input.token);
                var prior = this.lookupAttempt(input.token);
                if (prior) return this.attemptResult(prior, out);
            }
            var pending = this.pendingForUser();
            if (pending) return this.attemptResult(pending, out);
            var cart = new sn_sc.CartJS();
            var cartId = String(cart.getCartID());
            this.id(cartId);
            var owner = new GlideRecordSecure('sc_cart');
            if (!owner.get(cartId) || !owner.canRead() || !this.read(owner, 'user') ||
                    !this.read(owner, 'name') || String(owner.getValue('user')) !== this.userId ||
                    String(owner.getValue('name')) !== 'DEFAULT') this.fail('Your default cart could not be accessed.');
            if (action === 'quantity' || action === 'remove') {
                this.ensureUnlocked(cartId);
                this.changeItem(cart, cartId, input);
                out.ok = true;
            }
            var state = this.loadCart(cart, cartId, out);
            out.pickup_date = this.clock().date;
            out.terms_url = String(gs.getProperty(this.P + 'terms_url', ''));
            out.terms_version = String(gs.getProperty(this.P + 'terms_version', ''));
            if (out.terms_url && !/^\?id=[a-zA-Z0-9_-]+$/.test(out.terms_url))
                this.fail('The CafeNow terms page needs configuration.');
            if (state.vendor) this.loadWindows(state.vendor, out);
            out.snapshot = state.snapshot;
            out.token = gs.generateGUID();
            out.can_checkout = out.items.length > 0 && !state.problem;
            if (state.problem) out.error = state.problem;
            var enabled = gs.getProperty(this.P + 'enabled', 'false') === 'true';
            var backendReady = gs.getProperty(this.P + 'storage_verified', 'false') === 'true' &&
                gs.getProperty(this.P + 'enforce_order_guard', 'false') === 'true';
            out.can_submit = out.can_checkout && enabled && backendReady && !!out.terms_url && !!out.terms_version;
            if (!enabled) out.setup_message = gs.getMessage('Pickup review is available. Order submission is awaiting setup.');
            else if (!backendReady) out.setup_message = gs.getMessage('Storage verification and Order protection must be enabled before submission.');
            else if (!out.terms_url || !out.terms_version)
                out.setup_message = gs.getMessage('The terms page and version need configuration before submission.');
            if (action === 'submit') {
                if (!out.can_submit) this.fail('Checkout is not ready for submission. Contact the CafeNow team.');
                this.submit(cart, cartId, state, input, out);
            }
        } catch (error) {
            out.error = error.cafenow_message || gs.getMessage('The cart could not be confirmed. Refresh or contact the CafeNow team.');
            out.can_checkout = false;
            out.can_submit = false;
            gs.error('CafeNow checkout failed at action ' + action + '. Check application logs and configuration.');
        }
        return out;
    },

    loadCart: function (cart, cartId, out) {
        var catalogId = String(gs.getProperty(this.P + 'catalog_id', ''));
        if (!/^[a-f0-9]{32}$/.test(catalogId)) this.fail('Configure the CafeNow catalog sys_id before using this cart.');
        if (!new sn_sc.Catalog(catalogId).canView()) this.fail('The CafeNow catalog is not available to your account.');
        // Raw count is only a completeness guard. No raw item fields are returned.
        var raw = new GlideRecord('sc_cart_item');
        raw.addQuery('cart', cartId);
        raw.query();
        var expected = Number(raw.getRowCount());
        if (expected > this.MAX_LINES) this.fail('This cart has too many food lines. Contact the CafeNow team.');
        var rows = new GlideRecordSecure('sc_cart_item');
        rows.addQuery('cart', cartId);
        rows.orderBy('sys_id');
        rows.query();
        var vendorId = '', fingerprint = [], problem = '', count = 0, lines = [];
        while (rows.next()) {
            if (!rows.canRead() || !this.read(rows, 'cart') || !this.read(rows, 'cat_item') ||
                    !this.read(rows, 'quantity') || String(rows.getValue('cart')) !== cartId)
                this.fail('One or more cart items cannot be read. Contact the CafeNow team.');
            count++;
            var quantity = Number(rows.getValue('quantity'));
            if (!this.quantity(quantity)) problem = 'Update food quantities to whole numbers from 1 to 99.';
            var itemId = String(rows.getValue('cat_item'));
            var food = this.food(itemId, catalogId);
            if (!food) problem = 'A food is unavailable or is missing its CafeNow Menu/Vendor mapping. Remove it before checkout.';
            else if (vendorId && vendorId !== food.vendor) problem = 'Your cart contains more than one vendor. Keep food from one vendor before checkout.';
            else if (!vendorId) { vendorId = food.vendor; out.vendor_name = food.vendor_name; }
            var lineId = String(rows.getUniqueValue());
            lines.push({cat_item: itemId, quantity: quantity});
            out.items.push({sys_id: lineId, name: String(rows.getDisplayValue('cat_item') || ''), quantity: quantity,
                can_update: rows.canWrite() && rows.getElement('quantity').canWrite(), can_remove: rows.canDelete()});
            fingerprint.push([lineId, itemId, String(quantity), String(rows.getValue('sys_updated_on') || ''),
                food ? food.vendor : '', food ? food.revision : ''].join(':'));
        }
        if (count !== expected) this.fail('The complete cart could not be read. No checkout was attempted.');
        // Documented native price strings: no currency parsing or browser totals.
        var details = this.json(cart.getCartDetails());
        out.total_display = details.show_subtotal_price === false || details.show_subtotal_price === 'false' ? '' : String(details.subtotal_price || '');
        var priceIndex = {};
        this.priceIndex(details, priceIndex, 0);
        for (var i = 0; i < out.items.length; i++) {
            var price = priceIndex[out.items[i].sys_id] || '';
            out.items[i].unit_price = price;
            fingerprint.push(out.items[i].sys_id + ':' + price);
        }
        if (out.items.length && !out.total_display) problem = 'Native cart pricing could not be loaded. Contact the CafeNow team.';
        fingerprint.push(out.total_display);
        fingerprint.push(JSON.stringify(details)); // include native variable answers and prices in review identity
        out.quantity_count = out.items.reduce(function (sum, item) { return sum + item.quantity; }, 0);
        return {vendor: vendorId, lines: lines, snapshot: new GlideDigest().getSHA256Hex(fingerprint.join('|')), problem: problem};
    },

    food: function (itemId, catalogId) {
        var item = new GlideRecordSecure('sc_cat_item');
        if (!item.get(itemId) || !item.canRead() || !this.read(item, 'u_cafenow_menu_item') ||
                !this.read(item, 'active') || String(item.getValue('active')) !== '1' ||
                String(item.getValue('sys_class_name')) !== 'sc_cat_item' || !new sn_sc.CatItem(itemId).canView()) return null;
        if (String(item.getValue('no_cart')) === '1' || String(item.getValue('recurring_frequency') || '')) return null;
        var membership = new GlideRecord('sc_cat_item_catalog');
        membership.addQuery('sc_cat_item', itemId);
        membership.addQuery('sc_catalog', catalogId);
        membership.query();
        if (!membership.next()) return null;
        var menu = new GlideRecordSecure(this.T.menu);
        if (!menu.get(String(item.getValue('u_cafenow_menu_item'))) || !menu.canRead() || !this.read(menu, 'vendor')) return null;
        var flags = ['active', 'available', 'published'];
        for (var i = 0; i < flags.length; i++) {
            if (menu.isValidField(flags[i]) && (!this.read(menu, flags[i]) || String(menu.getValue(flags[i])) !== '1')) return null;
        }
        var vendorId = String(menu.getValue('vendor') || '');
        var vendor = new GlideRecordSecure(this.T.vendor);
        if (!vendor.get(vendorId) || !vendor.canRead() || !this.read(vendor, 'name') ||
                !this.read(vendor, 'active') || String(vendor.getValue('active')) !== '1') return null;
        return {vendor: vendorId, vendor_name: String(vendor.getDisplayValue('name') || ''),
            revision: String(item.getValue('sys_updated_on')) + ':' + String(menu.getValue('sys_updated_on'))};
    },

    loadWindows: function (vendorId, out) {
        var now = this.clock();
        var windows = new GlideRecordSecure(this.T.window);
        this.fields(windows, ['vendor', 'is_active', 'start_time', 'end_time', 'time_slot_v2', 'max_order_capacity']);
        windows.addQuery('vendor', vendorId);
        windows.addQuery('is_active', true);
        windows.orderBy('start_time');
        windows.query();
        while (windows.next()) {
            var names = ['vendor', 'is_active', 'start_time', 'end_time', 'time_slot_v2', 'max_order_capacity'];
            var allowed = windows.canRead();
            for (var i = 0; i < names.length; i++) if (!this.read(windows, names[i])) allowed = false;
            if (!allowed || String(windows.getValue('vendor')) !== vendorId || String(windows.getValue('is_active')) !== '1') continue;
            var start = this.seconds(windows.getValue('start_time'));
            var end = this.seconds(windows.getValue('end_time'));
            var capacity = Number(windows.getValue('max_order_capacity'));
            if (start === null || end === null || start < 4 * 3600 || end <= start ||
                    !isFinite(capacity) || capacity % 1 || capacity < 1 || capacity > 20) continue;
            // Exact boundary is conservative: at cutoff the window is closed.
            if (now.seconds >= start - 30 * 60) continue;
            // Advisory full-window filtering; the unique seat insert remains authoritative.
            var holds = new GlideRecord(this.T.reservation);
            if (holds.isValid()) {
                holds.addQuery('vendor', vendorId);
                holds.addQuery('pickup_window', String(windows.getUniqueValue()));
                holds.addQuery('pickup_date', now.date);
                holds.query();
                if (Number(holds.getRowCount()) >= capacity) continue;
            }
            out.windows.push({sys_id: String(windows.getUniqueValue()), label: String(windows.getValue('time_slot_v2') || ''),
                start: start, end: end, capacity: capacity});
        }
    },

    changeItem: function (cart, cartId, input) {
        this.id(input.item_id);
        var row = new GlideRecordSecure('sc_cart_item');
        if (!row.get(String(input.item_id)) || !row.canRead() || !this.read(row, 'cart') ||
                String(row.getValue('cart')) !== cartId) this.fail('That food is not available in your cart.');
        if (input.action === 'remove') {
            if (!row.canDelete() || !row.deleteRecord()) this.fail('The food could not be removed.');
            return;
        }
        if ((typeof input.quantity !== 'number' && typeof input.quantity !== 'string') || !this.quantity(Number(input.quantity)))
            this.fail('Enter a whole-number quantity from 1 to 99.');
        if (!row.canWrite() || !row.isValidField('quantity') || !row.getElement('quantity').canWrite())
            this.fail('You cannot change this food quantity.');
        cart.updateItem({sysparm_quantity: String(Number(input.quantity))}, String(input.item_id));
        var check = new GlideRecordSecure('sc_cart_item');
        if (!check.get(String(input.item_id)) || !this.read(check, 'quantity') || !this.read(check, 'cart') ||
                String(check.getValue('cart')) !== cartId || Number(check.getValue('quantity')) !== Number(input.quantity))
            this.fail('The quantity update could not be confirmed. Refresh before retrying.');
    },

    submit: function (cart, cartId, state, input, out) {
        if (input.accept_terms !== true) this.fail('Accept the Terms & Conditions before submitting.');
        if (String(input.pickup_date || '') !== out.pickup_date)
            this.fail('The pickup day changed. Refresh and review your pickup selection.');
        if (String(input.terms_version || '') !== out.terms_version)
            this.fail('The Terms & Conditions changed. Read and accept the current version.');
        if (typeof input.instructions !== 'undefined' && typeof input.instructions !== 'string') this.fail('Invalid order instructions.');
        var instructions = String(input.instructions || '');
        if (instructions.length > 1000) this.fail('Keep instructions within 1000 characters.');
        if (String(input.snapshot || '') !== state.snapshot) this.fail('Your cart changed. Review it again before submitting.');
        this.id(input.window_id);
        var selected = null;
        for (var i = 0; i < out.windows.length; i++) {
            if (out.windows[i].sys_id === String(input.window_id)) selected = out.windows[i];
        }
        if (!selected) this.fail('Select an available pickup window for this vendor.');
        this.requireStorage();
        this.checkLegacyOrders(state.vendor, selected.sys_id, out.pickup_date);
        this.ensureUnlocked(cartId);
        var attempt = new GlideRecord(this.T.checkout);
        attempt.initialize();
        attempt.setValue('token', String(input.token));
        attempt.setValue('cart_key', cartId);
        attempt.setValue('user', this.userId);
        attempt.setValue('cart', cartId);
        attempt.setValue('vendor', state.vendor);
        attempt.setValue('pickup_window', selected.sys_id);
        attempt.setValue('pickup_date', out.pickup_date);
        attempt.setValue('window_label', selected.label);
        attempt.setValue('snapshot', state.snapshot);
        attempt.setValue('items_json', JSON.stringify(state.lines));
        attempt.setValue('terms_version', out.terms_version);
        attempt.setValue('accepted_at', new GlideDateTime().getValue());
        attempt.setValue('instructions', instructions);
        attempt.setValue('state', 'processing');
        var attemptId = this.insert(attempt);
        if (!attemptId) {
            var duplicate = this.lookupAttempt(String(input.token));
            if (duplicate) { this.attemptResult(duplicate, out); return; }
            this.fail('Another checkout is processing this cart. Check My Orders before retrying.');
        }
        var reservationId = '', invoked = false;
        try {
            reservationId = this.reserve(attemptId, state.vendor, selected, out.pickup_date);
            if (!reservationId) this.fail('This pickup window is full. Select another window.');
            // Re-read after obtaining the cart lock. Changed mappings/prices/lines invalidate review.
            var freshOut = {items: []};
            var fresh = this.loadCart(cart, cartId, freshOut);
            if (fresh.problem || fresh.snapshot !== state.snapshot || fresh.vendor !== state.vendor)
                this.fail('Your cart changed. Review it before submitting.');
            var freshWindows = {windows: []};
            this.loadWindows(state.vendor, freshWindows);
            var stillValid = false;
            for (var f = 0; f < freshWindows.windows.length; f++) {
                if (freshWindows.windows[f].sys_id === selected.sys_id &&
                        freshWindows.windows[f].capacity === selected.capacity && this.clock().date === out.pickup_date)
                    stillValid = true;
            }
            if (!stillValid) this.fail('The pickup window changed or its ordering cutoff passed.');
            if (typeof cart.validateCartItems === 'function') {
                var validation = String(cart.validateCartItems());
                if (validation !== 'valid') this.fail('Review required food options before checkout: ' + validation);
            }
            // Everything after this boundary is potentially committed: never auto-resubmit.
            invoked = true;
            var result = this.json(cart.submitOrder({requested_for: this.userId, special_instructions: instructions}));
            this.id(result.request_id);
            attempt.setValue('request', String(result.request_id));
            attempt.setValue('request_number', String(result.request_number || ''));
            attempt.setValue('state', 'submitted');
            attempt.setValue('cart_key', attemptId); // release cart lock; token still remains unique
            if (!attempt.update()) this.fail('Request may have been submitted. Contact the CafeNow team before retrying.');
            out.submitted = true;
            out.ok = true;
            out.request_number = String(result.request_number || '');
            out.token = String(input.token);
            out.items = [];
            out.windows = [];
            out.quantity_count = 0;
        } catch (error) {
            if (invoked) {
                // Keep both capacity and cart lock until reconciliation; release may oversell.
                attempt.setValue('state', 'unknown');
                attempt.setValue('cart_key', cartId);
                attempt.update();
                out.pending = true;
                out.token = String(input.token);
                this.fail('Submission needs review. Check status or contact the CafeNow team before ordering again.');
            }
            if (reservationId) {
                var seat = new GlideRecord(this.T.reservation);
                if (seat.get(reservationId) && String(seat.getValue('checkout')) === attemptId && !seat.deleteRecord()) {
                    attempt.setValue('state', 'unknown');
                    attempt.update();
                    this.fail('A capacity hold needs review. Contact the CafeNow team before retrying.');
                }
            }
            attempt.setValue('state', 'rejected');
            attempt.setValue('cart_key', attemptId);
            attempt.update();
            throw error;
        }
    },

    reserve: function (attemptId, vendorId, window, date) {
        // A DATABASE UNIQUE index on slot_key arbitrates simultaneous final bookings.
        // A second unique index on checkout prevents two seats for the same attempt.
        var prior = new GlideRecord(this.T.reservation);
        prior.addQuery('checkout', attemptId);
        prior.query();
        if (prior.next()) return ''; // never allocate another seat for this attempt
        for (var seat = 1; seat <= window.capacity; seat++) {
            var slotKey = vendorId + ':' + date + ':' + window.sys_id + ':' + seat;
            var occupied = new GlideRecord(this.T.reservation);
            occupied.addQuery('slot_key', slotKey);
            occupied.query();
            if (occupied.next()) continue; // avoid expected duplicate errors for already-known holds
            var claim = new GlideRecord(this.T.reservation);
            claim.initialize();
            claim.setValue('slot_key', slotKey);
            claim.setValue('checkout', attemptId);
            claim.setValue('vendor', vendorId);
            claim.setValue('pickup_window', window.sys_id);
            claim.setValue('pickup_date', date);
            claim.setValue('seat', seat);
            var result = this.insert(claim);
            if (result) return String(result);
        }
        return '';
    },

    lookupAttempt: function (token) {
        var record = new GlideRecord(this.T.checkout);
        if (!record.isValid()) return null; // allows read-only preview before table creation
        record.addQuery('token', token);
        record.query();
        if (!record.next()) return null;
        if (String(record.getValue('user')) !== this.userId) this.fail('This submission is not available to your account.');
        return record;
    },
    pendingForUser: function () {
        var record = new GlideRecord(this.T.checkout);
        if (!record.isValid()) return null;
        record.addQuery('user', this.userId);
        record.addQuery('state', 'IN', 'processing,unknown');
        record.query();
        while (record.next()) {
            if (String(record.getValue('user')) === this.userId &&
                    ['processing', 'unknown'].indexOf(String(record.getValue('state'))) !== -1) return record;
        }
        return null;
    },
    status: function (token, out) {
        this.id(token);
        var attempt = this.lookupAttempt(token);
        out.token = token;
        if (!attempt) { out.pending = true; out.error = gs.getMessage('No submission result is available. Contact the CafeNow team before ordering again.'); return out; }
        return this.attemptResult(attempt, out);
    },
    attemptResult: function (attempt, out) {
        out.token = String(attempt.getValue('token'));
        var state = String(attempt.getValue('state'));
        if ((state === 'submitted' || state === 'fulfilled') && attempt.getValue('request')) {
            out.submitted = true;
            out.ok = true;
            out.request_number = String(attempt.getValue('request_number') || '');
        } else {
            out.pending = state !== 'rejected';
            out.error = gs.getMessage(state === 'rejected' ? 'This checkout was rejected before submission. Refresh the cart and try again.' :
                'This checkout is processing or needs review. Contact the CafeNow team before ordering again.');
        }
        return out;
    },
    ensureUnlocked: function (cartId) {
        var lock = new GlideRecord(this.T.checkout);
        if (!lock.isValid()) return;
        lock.addQuery('cart_key', cartId);
        lock.query();
        if (lock.next()) this.fail('This cart has a checkout in progress or awaiting review. Check My Orders or contact the CafeNow team.');
    },
    requireStorage: function () {
        var checkout = new GlideRecord(this.T.checkout);
        this.fields(checkout, ['token', 'cart_key', 'user', 'cart', 'vendor', 'pickup_window', 'pickup_date',
            'window_label', 'snapshot', 'items_json', 'terms_version', 'accepted_at', 'instructions', 'state', 'request', 'request_number', 'order']);
        var seats = new GlideRecord(this.T.reservation);
        this.fields(seats, ['slot_key', 'checkout', 'vendor', 'pickup_window', 'pickup_date', 'seat']);
        if (gs.getProperty(this.P + 'storage_verified', 'false') !== 'true')
            this.fail('Checkout unique indexes and capacity setup need verification. Contact the CafeNow team.');
    },
    checkLegacyOrders: function (vendorId, windowId, date) {
        var windowField = String(gs.getProperty(this.P + 'order_window_field', 'time_slot_v2'));
        var unknownDate = new GlideRecord(this.T.order);
        this.fields(unknownDate, ['vendor', windowField, 'pickup_date', 'checkout_context', 'state']);
        unknownDate.addQuery('vendor', vendorId);
        unknownDate.addQuery('state', 'IN', '-5,1,2');
        unknownDate.addQuery('pickup_date', '');
        unknownDate.query();
        if (unknownDate.next()) this.fail('Existing vendor orders need their pickup dates reconciled before new capacity can be booked.');
        var unreserved = new GlideRecord(this.T.order);
        unreserved.addQuery('vendor', vendorId);
        unreserved.addQuery(windowField, windowId);
        unreserved.addQuery('pickup_date', date);
        unreserved.addQuery('state', 'IN', '-5,1,2,3');
        unreserved.addQuery('checkout_context', '');
        unreserved.query();
        if (unreserved.next()) this.fail('Existing orders need capacity reservation migration before this window can be booked.');
    },

    // Eastern building clock, independent of the employee's profile/browser timezone.
    // Supports America/New_York only, contemporary post-2007 US DST rules.
    clock: function () {
        if (String(gs.getProperty(this.P + 'timezone', 'America/New_York')) !== 'America/New_York')
            this.fail('This checkout clock must be configured for America/New_York.');
        var utc = Number(new GlideDateTime().getNumericValue());
        var year = new Date(utc).getUTCFullYear();
        if (year < 2007 || year > 2030) this.fail('The building timezone rules need review.');
        var march = 1 + (7 - new Date(Date.UTC(year, 2, 1)).getUTCDay()) % 7 + 7;
        var november = 1 + (7 - new Date(Date.UTC(year, 10, 1)).getUTCDay()) % 7;
        var summer = utc >= Date.UTC(year, 2, march, 7) && utc < Date.UTC(year, 10, november, 6);
        var local = new Date(utc + (summer ? -4 : -5) * 3600000);
        var pad = function (n) { return n < 10 ? '0' + n : String(n); };
        return {date: local.getUTCFullYear() + '-' + pad(local.getUTCMonth() + 1) + '-' + pad(local.getUTCDate()),
            seconds: local.getUTCHours() * 3600 + local.getUTCMinutes() * 60 + local.getUTCSeconds()};
    },
    seconds: function (value) {
        var match = /(?:^| )(\d{2}):(\d{2}):(\d{2})$/.exec(String(value || ''));
        if (!match || Number(match[1]) > 23 || Number(match[2]) > 59 || Number(match[3]) > 59) return null;
        var seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
        // Time fields can encode UTC on an epoch date. Confirm raw stored values
        // against a known building time; never silently infer from the user's profile.
        var mode = String(gs.getProperty(this.P + 'window_time_storage', ''));
        if (mode === 'wall_clock') return seconds;
        if (mode === 'utc_1970' && /^1970-01-01 /.test(String(value)))
            return (seconds - 5 * 3600 + 86400) % 86400;
        this.fail('Pickup-window time storage needs configuration. Contact the CafeNow team.');
    },
    priceIndex: function (object, index, depth) {
        if (!object || typeof object !== 'object' || depth > 5) return;
        if (object.cart_item_id && object.show_price !== false && object.show_price !== 'false')
            index[String(object.cart_item_id)] = String(object.localized_price || object.price || '');
        for (var key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key) && typeof object[key] === 'object')
                this.priceIndex(object[key], index, depth + 1);
        }
    },
    read: function (record, field) { return record.isValidField(field) && record.getElement(field).canRead(); },
    quantity: function (n) { return isFinite(n) && n % 1 === 0 && n >= 1 && n <= this.MAX_QUANTITY; },
    fields: function (record, fields) {
        if (!record.isValid()) this.fail('A CafeNow checkout table needs configuration.');
        for (var i = 0; i < fields.length; i++) {
            if (!record.isValidField(fields[i])) {
                gs.error('CafeNow checkout configuration: missing ' + record.getTableName() + '.' + fields[i]);
                this.fail('A CafeNow checkout field needs configuration.');
            }
        }
    },
    id: function (value) { if (!/^[a-f0-9]{32}$/.test(String(value || ''))) this.fail('An invalid record reference was supplied.'); },
    insert: function (record) { try { return String(record.insert() || ''); } catch (error) { return ''; } },
    json: function (value) { return typeof value === 'string' ? JSON.parse(value) : (value || {}); },
    fail: function (message) { var error = new Error(message); error.cafenow_message = gs.getMessage(message); throw error; },
    type: 'CafeNowCheckout'
};
