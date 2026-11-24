(function () {
    // Assumed table names; verify dictionary/mappings before enabling.
    var CONFIGURED = true; // User enabled requester testing after ACL setup.
    var TABLES = {requester: 'x_1234_cafenow_user_complaints', vendor: 'x_1234_cafenow_cafenow_vendor_compliants'};
    // Requester labels: Reporter, Submission Type, Category, Summary, Details, Vendor, Order ID.
    // Values below are technical column names, not display labels.
    var FIELDS = {
        requester: {reporter: 'submitted_by', kind: 'complaint_type', category: 'category',
            summary: 'short_description', details: 'description', vendor: 'vendor', order: 'order_id'},
        vendor: {reporter: 'submitted_by', kind: 'submission_type', category: 'complaint_category',
            summary: 'complaint_summary', details: 'complaint_description', vendor: 'vendor'}
    }; // Vendor Submission Type and capitalized stored values confirmed by user.
    var CATEGORIES = ['order_issue', 'food_quality', 'pickup_delay', 'menu_issue', 'portal_issue', 'other'];
    var VENDOR_CATEGORIES = [
        {value: 'Asset & Maintenance', label: 'Asset & Maintenance'},
        {value: 'HVAC/Ventilation', label: 'HVAC/Ventilation'},
        {value: 'Internet/Network', label: 'Internet/Network'},
        {value: 'Power/Utilities', label: 'Power/Utilities'},
        {value: 'Safety', label: 'Safety'},
        {value: 'Billing', label: 'Billing'},
        {value: 'Service', label: 'Services'}
    ];
    data.categoryOptions = {
        requester: [
            {value: 'order_issue', label: 'Order issue'}, {value: 'food_quality', label: 'Food quality'},
            {value: 'pickup_delay', label: 'Pickup delay'}, {value: 'menu_issue', label: 'Menu issue'},
            {value: 'portal_issue', label: 'Portal issue'}, {value: 'other', label: 'Other'}
        ], vendor: VENDOR_CATEGORIES
    };
    data.authorized = false; data.ready = false; data.saved = false;
    data.error = ''; data.vendors = []; data.canRequester = false; data.canVendor = false;
    data.number = ''; data.history_url = '?id=cafenow_my_support';
    if (gs.getUserName() === 'guest') return;
    var uid = String(gs.getUserID());
    var user = gs.getUser();
    // Normalize both comma-separated and Java-list-style [role, role] output.
    var roles = ',' + String(user.getRoles()).replace(/[\[\]\s]/g, '') + ',';
    function has(role) { return roles.indexOf(',' + role + ',') >= 0 && user.hasRole(role); }
    data.canRequester = has('x_1234_cafenow.user');
    // Enabled for vendor testing; target ACLs and shared insert validation require verification.
    data.canVendor = has('x_1234_cafenow.vendor_admin');
    data.authorized = data.canRequester || data.canVendor;
    if (!data.authorized) return;
    if (!CONFIGURED) { data.error = 'Support form setup is pending dictionary and ACL verification.'; return; }
    var stage = 'vendor authorization';
    try {
        var allowed = {};
        if (data.canVendor) {
            // Fixed internal authorization lookup, never returned to the browser.
            var membership = new GlideRecord('sys_user_grmember');
            membership.addQuery('user', uid); membership.query();
            var groups = {};
            while (membership.next()) {
                if (String(membership.getValue('user')) !== uid) continue;
                var group = new GlideRecord('sys_user_group');
                if (!group.get(String(membership.getValue('group'))) || String(group.getValue('active')) !== '1') continue;
                groups[String(group.getUniqueValue())] = true;
                var parentId = String(group.getValue('parent') || '');
                if (id(parentId)) {
                    var parent = new GlideRecord('sys_user_group');
                    if (parent.get(parentId) && String(parent.getValue('active')) === '1') groups[parentId] = true;
                }
            }
            var groupIds = [];
            for (var g in groups) if (groups.hasOwnProperty(g)) groupIds.push(g);
            if (groupIds.length) {
                var vendors = new GlideRecordSecure('x_1234_cafenow_vendor');
                vendors.addQuery('vendor_group', 'IN', groupIds.join(',')); vendors.addQuery('active', true); vendors.query();
                while (vendors.next()) {
                    if (!vendors.canRead() || !read(vendors, 'vendor_group') || !read(vendors, 'name') || !read(vendors, 'active')) continue;
                    if (String(vendors.getValue('active')) !== '1' || !groups[String(vendors.getValue('vendor_group'))]) continue;
                    var vid = String(vendors.getUniqueValue());
                    allowed[vid] = true;
                    data.vendors.push({sys_id: vid, name: String(vendors.getDisplayValue('name'))});
                }
            }
        }
        data.ready = true;
        if (!input) return;
        if (input.action !== 'submit') fail('Unsupported action.');
        var form = input.form || {};
        var audience = String(form.audience || '');
        if ((audience !== 'requester' && audience !== 'vendor') ||
            (audience === 'requester' && !data.canRequester) || (audience === 'vendor' && !data.canVendor)) fail('Submission role is not permitted.');
        var F = FIELDS[audience];
        if (!F.kind) fail('Vendor Submission Type field setup is pending.');
        var kind = String(form.kind || '');
        if (kind !== 'complaint' && kind !== 'request') fail('Choose complaint or request.');
        var category = String(form.category || '');
        var allowedCategories = audience === 'vendor' ? VENDOR_CATEGORIES.map(function (choice) { return choice.value; }) : CATEGORIES;
        if (allowedCategories.indexOf(category) < 0) fail('Choose a valid category.');
        var summary = text(form.summary, audience === 'vendor' ? 40 : 160);
        var details = text(form.details, audience === 'vendor' ? 250 : 4000);
        var vendorId = '', orderId = '';
        if (audience === 'vendor') {
            vendorId = String(form.vendor || '');
            if (!id(vendorId) || !allowed[vendorId]) fail('Choose one of your authorized vendors.');
        }
        var orderNumber = String(form.order_number || '').replace(/^\s+|\s+$/g, '');
        if (audience === 'vendor' && orderNumber) fail('Order linking is not configured for vendor requests.');
        if (orderNumber) {
            if (!/^[A-Za-z0-9_-]{1,40}$/.test(orderNumber)) fail('Enter a valid order number.');
            var order = new GlideRecordSecure('x_1234_cafenow_order');
            order.addQuery('number', orderNumber);
            if (audience === 'requester') order.addQuery('opened_by', uid);
            else order.addQuery('vendor', vendorId);
            order.setLimit(1); order.query();
            if (!order.next() || !order.canRead() || !read(order, 'number') || !read(order, 'vendor') ||
                String(order.getValue('number')) !== orderNumber) fail('Order is unavailable to your account.');
            if (audience === 'requester' && (!read(order, 'opened_by') || String(order.getValue('opened_by')) !== uid)) fail('Order is unavailable to your account.');
            if (audience === 'vendor' && String(order.getValue('vendor')) !== vendorId) fail('Order is unavailable to your account.');
            orderId = String(order.getUniqueValue());
            vendorId = String(order.getValue('vendor') || '');
            if (!id(vendorId)) fail('Order vendor is unavailable.');
        }
        stage = 'initialize support record';
        var row = new GlideRecordSecure(TABLES[audience]); row.initialize();
        var storedKind = audience === 'vendor' ? (kind === 'complaint' ? 'Complaint' : 'Request') : kind;
        var values = {reporter: uid, kind: storedKind, category: category, summary: summary,
            details: details, vendor: vendorId};
        if (F.order) values.order = orderId;
        // Set authorized ownership before evaluating conditional create ACLs.
        for (var key in values) if (values.hasOwnProperty(key)) {
            stage = 'set field ' + F[key];
            if (!row.isValidField(F[key])) fail('Missing submission field: ' + F[key]);
            row.setValue(F[key], values[key]);
        }
        stage = 'table create check';
        if (!row.canCreate()) fail('Support record create access is required.');
        for (var field in values) if (values.hasOwnProperty(field)) {
            stage = 'field create check ' + F[field];
            var element = row.getElement(F[field]);
            if (!element) fail('Submission field could not be accessed: ' + F[field]);
            if (typeof element.canCreate !== 'function') {
                fail('Field canCreate() is unavailable in this widget context for: ' + F[field] + '. Ask the administrator to verify the instance release and supported API.');
            }
            if (!element.canCreate()) fail('Create-time field access is required for: ' + F[field]);
        }
        stage = 'insert support record';
        var saved = row.insert();
        if (!saved) fail('Submission was rejected. Contact the CafeNow team before trying again.');
        data.saved = true;
        // A failed receipt read must not turn a successful insert into a retry error.
        try {
            var receipt = new GlideRecordSecure(TABLES[audience]);
            if (receipt.get(String(saved)) && receipt.canRead() && read(receipt, F.reporter) &&
                String(receipt.getValue(F.reporter)) === uid && read(receipt, 'number')) {
                data.number = String(receipt.getDisplayValue('number') || '');
            }
        } catch (receiptError) { /* Keep saved=true; review read ACLs independently. */ }
    } catch (e) {
        data.error = e.supportMessage || 'Submission could not be confirmed (step: ' + stage + '). Contact the CafeNow team before trying again.';
        // Stage contains fixed operation/field names only, never submitted content.
        gs.error('CafeNow support submission failed at ' + stage + '; review platform errors, dictionary, ACLs and automation.');
        // Technical exception detail belongs in administrator logs, not the portal.
        // Redact submitted values and reference IDs before logging the bounded message.
        if (!e.supportMessage) {
            var diagnostic = String(e.message || e.name || 'Unknown exception');
            var submitted = input && input.form ? input.form : {};
            for (var supplied in submitted) if (Object.prototype.hasOwnProperty.call(submitted, supplied)) {
                var raw = String(submitted[supplied] || '');
                if (raw) diagnostic = diagnostic.split(raw).join('[redacted]');
            }
            diagnostic = diagnostic.replace(/[a-f0-9]{32}/gi, '[reference]').replace(/[\r\n]/g, ' ').substring(0, 600);
            gs.error('CafeNow support technical exception at ' + stage + ': ' + diagnostic);
        }
    }
    function fail(message) { var e = new Error(message); e.supportMessage = message; throw e; }
    function id(value) { return /^[a-f0-9]{32}$/.test(value); }
    function read(row, field) { var element = row.isValidField(field) && row.getElement(field); return element && element.canRead(); }
    function text(value, max) {
        if (typeof value !== 'string') fail('Summary and description are required.');
        value = value.replace(/^\s+|\s+$/g, '');
        if (!value || value.length > max) fail('Required text is missing or exceeds its maximum length.');
        return value;
    }
})();
