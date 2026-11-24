(function () {
    var TABLE = 'x_1234_cafenow_menu';
    var VENDOR_TABLE = 'x_1234_cafenow_vendor';
    var ROLES = ['x_1234_cafenow.vendor_admin', 'x_1234_cafenow.vendor_staff'];
    var FIELDS = ['vendor', 'item_name', 'description', 'price', 'active', 'in_stock'];
    var NEW_CURRENCY = 'USD'; // Installation choice: confirm building currency before use.
    data.items = []; data.vendors = []; data.error = ''; data.saved = false;
    data.authorized = false; data.can_manage = false; data.can_add = false;
    data.page = 1; data.has_more = false; data.new_currency = NEW_CURRENCY;
    data.signed_in = gs.getUserName() !== 'guest';
    if (!data.signed_in) return;
    input = input || {};
    try {
        // Exact assigned/inherited role names: platform admin is not an implicit grant.
        var user = gs.getUser();
        var roleNames = ',' + String(user.getRoles()).replace(/\s/g, '') + ',';
        var hasVendorRole = false;
        for (var r = 0; r < ROLES.length; r++) {
            if (roleNames.indexOf(',' + ROLES[r] + ',') !== -1 && user.hasRole(ROLES[r]))
                hasVendorRole = true;
        }
        if (!hasVendorRole) {
            data.error = gs.getMessage('A CafeNow vendor Admin or Staff role is required.');
            return;
        }
        var userId = String(gs.getUserID());
        var authorizedGroups = {};
        // Internal authorization metadata only. These fixed, read-only lookups do not
        // require staff to have administrative table/field read ACLs. Never expose
        // membership records or accept a user/group/table from browser input.
        // Business Menu records below still use GlideRecordSecure and field ACLs.
        // Direct membership plus one parent hop only; never use names or broad ancestry.
        var memberships = new GlideRecord('sys_user_grmember');
        requireFields(memberships, ['user', 'group']);
        memberships.addQuery('user', userId);
        memberships.query();
        while (memberships.next()) {
            if (String(memberships.getValue('user')) !== userId)
                continue;
            var groupId = String(memberships.getValue('group') || '');
            if (!validId(groupId)) continue;
            var group = new GlideRecord('sys_user_group');
            requireFields(group, ['parent', 'active']);
            if (!group.get(groupId) ||
                    String(group.getValue('active')) !== '1') continue;
            authorizedGroups[groupId] = true;
            if (group.isValidField('parent')) {
                var parentId = String(group.getValue('parent') || '');
                if (validId(parentId)) {
                    var parent = new GlideRecord('sys_user_group');
                    if (parent.get(parentId) && parent.isValidField('active') &&
                            String(parent.getValue('active')) === '1') authorizedGroups[parentId] = true;
                }
            }
        }
        var groupIds = keys(authorizedGroups);
        if (!groupIds.length) {
            data.error = gs.getMessage('No active vendor group membership was found for your account. Check your group membership and group Active setting.');
            return;
        }
        var vendors = new GlideRecord(VENDOR_TABLE);
        requireFields(vendors, ['vendor_group', 'name', 'active']);
        vendors.addQuery('vendor_group', 'IN', groupIds.join(','));
        vendors.addQuery('active', true);
        vendors.query();
        var authorizedVendors = {};
        while (vendors.next()) {
            if (String(vendors.getValue('active')) !== '1' ||
                    !authorizedGroups[String(vendors.getValue('vendor_group'))]) continue;
            var vendorId = String(vendors.getUniqueValue());
            if (validId(vendorId)) authorizedVendors[vendorId] = String(vendors.getDisplayValue('name') || '');
        }
        var vendorIds = keys(authorizedVendors);
        if (!vendorIds.length) {
            data.error = gs.getMessage('No active Vendor record matches your groups. Check Vendor.vendor_group and the Admin/Staff group Parent reference.');
            return;
        }
        data.authorized = true;
        data.can_manage = roleNames.indexOf(',' + ROLES[0] + ',') !== -1 && user.hasRole(ROLES[0]);
        for (var v = 0; v < vendorIds.length; v++)
            data.vendors.push({sys_id: vendorIds[v], name: authorizedVendors[vendorIds[v]]});
        var action = String(input.action || 'list');
        if (action !== 'list' && action !== 'save') fail('Unsupported menu action.');
        var page = Number(input.page || 1);
        if (!isFinite(page) || page < 1 || page > 10000 || Math.floor(page) !== page) fail('Invalid page.');
        data.page = page;
        var probe = new GlideRecordSecure(TABLE);
        requireFields(probe, FIELDS.concat(['sys_mod_count']));
        probe.initialize();
        probe.setValue('vendor', vendorIds[0]);
        data.can_add = data.can_manage && probe.canCreate() && writable(probe, FIELDS);
        if (action === 'save') {
            if (!data.can_manage) fail('A vendor administrator role is required to change menu items.');
            var item = input.item;
            if (!item || typeof item !== 'object') fail('Menu item is missing.');
            var id = String(item.sys_id || '');
            var row = new GlideRecordSecure(TABLE);
            var vendorId, currency;
            if (id) {
                if (!validId(id) || !row.get(id) || !row.canRead() || !readable(row, 'vendor'))
                    fail('Menu item is unavailable.');
                vendorId = String(row.getValue('vendor'));
                if (!owns(vendorId)) fail('Menu item is unavailable.');
                if (String(item.vendor || '') !== vendorId) fail('Moving menu items between vendors is not allowed.');
                if (!row.canWrite() || !writable(row, FIELDS.slice(1))) fail('Menu write access is required.');
                if (!readable(row, 'sys_mod_count') || String(item.revision) !== String(row.getValue('sys_mod_count')))
                    fail('This item changed. Cancel, refresh, and reopen it before saving.');
                if (!readable(row, 'price')) fail('Price access is required.');
                currency = String(row.getElement('price').getCurrencyCode());
            } else {
                vendorId = String(item.vendor || '');
                if (!validId(vendorId) || !owns(vendorId)) fail('Choose one of your authorized vendors.');
                row.initialize(); row.setValue('vendor', vendorId);
                if (!row.canCreate() || !writable(row, FIELDS)) fail('Menu create access is required.');
                currency = NEW_CURRENCY;
            }
            if (!/^[A-Z]{3}$/.test(currency)) fail('Menu currency configuration needs review.');
            var name = text(item.item_name, 100, true);
            var description = text(item.description, 500, false);
            var price = String(item.price === undefined ? '' : item.price);
            if (!/^(0|[1-9][0-9]{0,6})(\.[0-9]{1,2})?$/.test(price)) fail('Enter a valid non-negative price with up to two decimal places.');
            if (typeof item.active !== 'boolean' || typeof item.in_stock !== 'boolean') fail('Invalid availability values.');
            row.setValue('item_name', name); row.setValue('description', description);
            row.setValue('price', currency + ';' + Number(price).toFixed(2));
            row.setValue('active', item.active); row.setValue('in_stock', item.in_stock);
            // Fixed allowlist only: no client-selected fields, vendor reassignment, or audit writes.
            var savedId = id ? row.update() : row.insert();
            if (!savedId) fail('Save was rejected. Refresh the menu before trying again.');
            data.saved = true;
        }
        var menus = new GlideRecordSecure(TABLE);
        menus.addQuery('vendor', 'IN', vendorIds.join(','));
        menus.orderBy('item_name'); menus.orderBy('sys_id');
        menus.query();
        // Count only permitted rows so inaccessible records cannot break page navigation.
        var skipped = 0;
        while (menus.next()) {
            if (!menus.canRead() || !readableAll(menus, FIELDS.concat(['sys_mod_count']))) continue;
            var owner = String(menus.getValue('vendor'));
            if (!owns(owner)) continue;
            if (skipped++ < (page - 1) * 25) continue;
            if (data.items.length === 25) { data.has_more = true; break; }
            var priceElement = menus.getElement('price');
            data.items.push({sys_id: String(menus.getUniqueValue()), vendor: owner,
                vendor_name: authorizedVendors[owner], item_name: String(menus.getValue('item_name') || ''),
                description: String(menus.getValue('description') || ''),
                image_url: imageUrl(menus),
                number: readable(menus, 'number') ? String(menus.getValue('number') || '') : '',
                price: String(priceElement.getCurrencyValue()), currency: String(priceElement.getCurrencyCode()),
                active: String(menus.getValue('active')) === '1', in_stock: String(menus.getValue('in_stock')) === '1',
                revision: String(menus.getValue('sys_mod_count')),
                can_edit: data.can_manage && menus.canWrite() && writable(menus, FIELDS.slice(1))});
        }
    } catch (error) {
        data.items = [];
        data.error = error.menu_message || 'Menu operation could not be confirmed. Refresh and check the menu before saving again, or contact the CafeNow team.';
        gs.error('CafeNow vendor menu operation failed. Review schema, ACLs, application access and automation.');
    }
    function fail(message) { var error = new Error(message); error.menu_message = message; throw error; }
    function imageUrl(record) {
        if (!readable(record, 'item_image')) return '';
        var imageId = String(record.getValue('item_image') || '');
        return validId(imageId) ? '/' + imageId + '.iix' : '';
    }
    function owns(id) { return Object.prototype.hasOwnProperty.call(authorizedVendors, id); }
    function text(value, limit, required) {
        if (typeof value !== 'string') fail('Invalid text field.');
        var result = value.replace(/^\s+|\s+$/g, '');
        if ((required && !result) || result.length > limit) fail('Check item name and description lengths.');
        return result;
    }
    function writable(record, fields) {
        for (var i = 0; i < fields.length; i++)
            if (!record.isValidField(fields[i]) || !record.getElement(fields[i]).canWrite()) return false;
        return true;
    }
    function readableAll(record, fields) {
        for (var i = 0; i < fields.length; i++) if (!readable(record, fields[i])) return false;
        return true;
    }
    function readable(record, field) {
        return record.isValidField(field) && record.getElement(field).canRead();
    }
    function requireFields(record, fields) {
        if (!record.isValid()) throw new Error('Table configuration');
        for (var i = 0; i < fields.length; i++) {
            if (!record.isValidField(fields[i])) throw new Error('Field configuration');
        }
    }
    function validId(value) { return /^[a-f0-9]{32}$/.test(value); }
    function keys(map) {
        var result = [];
        for (var key in map) {
            if (Object.prototype.hasOwnProperty.call(map, key)) result.push(key);
        }
        return result;
    }
})();
