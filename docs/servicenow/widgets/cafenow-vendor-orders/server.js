(function () {
    // Server-owned configuration; browser input and instance vendor options are ignored.
    var TABLE = 'x_1234_cafenow_order';
    var VENDOR_TABLE = 'x_1234_cafenow_vendor';
    var ROLES = ['x_1234_cafenow.vendor_admin', 'x_1234_cafenow.vendor_staff'];
    var LIMIT = 200;
    var STATES = {'-5': 'Submitted', '1': 'Confirmed', '2': 'Ready for Pickup'};
    data.groups = [];
    data.count = 0;
    data.truncated = false;
    data.error = '';
    data.signed_in = gs.getUserName() !== 'guest';
    if (!data.signed_in) return;
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
        // Business Order records below still use GlideRecordSecure and field ACLs.
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
        var orders = new GlideRecordSecure(TABLE);
        // User reported time_slot_v2; retained older export used pickup_window.
        var pickupField = orders.isValidField('time_slot_v2') ? 'time_slot_v2' : 'pickup_window';
        var fields = ['vendor', pickupField, 'state', 'number'];
        if (!orders.isValid()) throw new Error('Configuration');
        for (var f = 0; f < fields.length; f++) {
            if (!orders.isValidField(fields[f])) throw new Error('Configuration');
        }
        orders.addQuery('vendor', 'IN', vendorIds.join(','));
        orders.addQuery('state', 'IN', '-5,1,2');
        orders.orderBy('vendor');
        orders.orderBy(pickupField);
        orders.orderBy('sys_created_on');
        orders.orderBy('sys_id');
        orders.setLimit(LIMIT + 1);
        orders.query();
        var buckets = {};
        while (orders.next()) {
            if (!orders.canRead()) continue;
            if (orders.isValidField('submission_status')) {
                if (!readable(orders, 'submission_status')) continue;
                var submissionStatus = String(orders.getValue('submission_status') || '');
                if (submissionStatus && submissionStatus !== 'complete') continue;
            }
            var allowed = true;
            for (var i = 0; i < fields.length; i++) {
                if (!orders.getElement(fields[i]).canRead()) allowed = false;
            }
            var orderVendor = String(orders.getValue('vendor') || '');
            if (!allowed || !Object.prototype.hasOwnProperty.call(authorizedVendors, orderVendor)) continue;
            var state = String(orders.getValue('state'));
            if (!Object.prototype.hasOwnProperty.call(STATES, state)) continue;
            if (data.count === LIMIT) { data.truncated = true; break; }
            var windowId = String(orders.getValue(pickupField) || '');
            var key = 'vendor_' + orderVendor + '_window_' + windowId;
            if (!buckets[key]) {
                buckets[key] = {
                    key: key,
                    vendor_name: authorizedVendors[orderVendor],
                    label: String(orders.getDisplayValue(pickupField) || gs.getMessage('Pickup window missing')),
                    orders: []
                };
                data.groups.push(buckets[key]);
            }
            buckets[key].orders.push({
                sys_id: String(orders.getUniqueValue()),
                number: String(orders.getDisplayValue('number') || ''),
                state_label: gs.getMessage(STATES[state])
            });
            data.count++;
        }
    } catch (error) {
        data.groups = [];
        data.count = 0;
        data.truncated = false;
        data.error = gs.getMessage('Vendor orders could not be loaded. Contact the CafeNow team.');
        gs.error('CafeNow vendor queue failed. Check configuration, ACLs and application access.');
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
