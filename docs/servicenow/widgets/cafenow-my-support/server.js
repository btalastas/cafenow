(function () {
    var SOURCES = {
        requester: {table: 'x_1234_cafenow_user_complaints', label: 'Employee', role: 'x_1234_cafenow.user',
            kind: 'complaint_type', category: 'category', summary: 'short_description', details: 'description'},
        vendor: {table: 'x_1234_cafenow_cafenow_vendor_compliants', label: 'Vendor', role: 'x_1234_cafenow.vendor_admin',
            kind: 'submission_type', category: 'complaint_category', summary: 'complaint_summary', details: 'complaint_description'}
    };
    data.authorized = false; data.rows = []; data.sources = []; data.error = ''; data.has_more = false;
    data.page = 1; data.search = ''; data.audience = ''; data.submit_url = '?id=cafenow_support';
    if (gs.getUserName() === 'guest') return;
    var uid = String(gs.getUserID());
    var user = gs.getUser();
    var roles = ',' + String(user.getRoles()).replace(/[\[\]\s]/g, '') + ',';
    var allowed = {};
    for (var key in SOURCES) if (Object.prototype.hasOwnProperty.call(SOURCES, key)) {
        var source = SOURCES[key];
        if (roles.indexOf(',' + source.role + ',') !== -1 && user.hasRole(source.role)) {
            allowed[key] = source; data.sources.push({value: key, label: source.label}); data.authorized = true;
        }
    }
    if (!data.authorized) return;
    var request = input || {};
    function read(record, field) {
        var element = record.isValidField(field) && record.getElement(field);
        return !!(element && element.canRead());
    }
    function display(record, field) { return read(record, field) ? String(record.getDisplayValue(field) || '') : ''; }
    function own(record) {
        return record.canRead() && read(record, 'submitted_by') && String(record.getValue('submitted_by')) === uid;
    }
    try {
        if (request.action === 'details') {
            var selected = String(request.audience || ''), selectedId = String(request.record_id || '');
            if (!Object.prototype.hasOwnProperty.call(allowed, selected) || !/^[a-f0-9]{32}$/.test(selectedId)) {
                data.error = 'This submission is unavailable to your account.'; return;
            }
            var definition = allowed[selected], detail = new GlideRecordSecure(definition.table);
            if (!detail.get(selectedId) || !own(detail) || !read(detail, 'number')) {
                data.error = 'This submission is unavailable to your account.'; return;
            }
            data.detail = {number: display(detail, 'number'), summary: display(detail, definition.summary),
                description: display(detail, definition.details), category: display(detail, definition.category),
                kind: display(detail, definition.kind), created: display(detail, 'sys_created_on'),
                vendor: display(detail, 'vendor'), audience: definition.label};
            return;
        }
        var page = Number(request.page || 1);
        if (!isFinite(page) || page < 1 || page !== Math.floor(page) || page > 100) page = 1;
        data.page = page;
        data.search = String(request.search || '').replace(/^\s+|\s+$/g, '').substring(0, 40);
        var audience = String(request.audience || '');
        if (audience && !Object.prototype.hasOwnProperty.call(allowed, audience)) {
            data.error = 'That submission view is unavailable to your account.'; return;
        }
        data.audience = audience;
        var merged = [], size = 20, needed = page * size + 1;
        for (var name in allowed) if (Object.prototype.hasOwnProperty.call(allowed, name)) {
            if (audience && audience !== name) continue;
            var config = allowed[name], records = new GlideRecordSecure(config.table);
            records.addQuery('submitted_by', uid);
            if (data.search) records.addQuery('number', 'CONTAINS', data.search);
            records.orderByDesc('sys_created_on'); records.orderByDesc('sys_id'); records.query();
            var accepted = 0;
            while (accepted < needed && records.next()) {
                if (!own(records) || !read(records, 'number') || !read(records, 'sys_created_on')) continue;
                var id = String(records.getUniqueValue());
                merged.push({key: name + ':' + id, sys_id: id, audience: name, source: config.label,
                    number: display(records, 'number'), kind: display(records, config.kind),
                    category: display(records, config.category), summary: display(records, config.summary),
                    vendor: display(records, 'vendor'), created: display(records, 'sys_created_on'),
                    sort_date: String(records.getValue('sys_created_on'))});
                accepted++;
            }
        }
        merged.sort(function (a, b) {
            if (a.sort_date !== b.sort_date) return a.sort_date < b.sort_date ? 1 : -1;
            if (a.sys_id !== b.sys_id) return a.sys_id < b.sys_id ? 1 : -1;
            return a.audience < b.audience ? -1 : a.audience > b.audience ? 1 : 0;
        });
        data.has_more = merged.length > page * size && page < 100;
        data.rows = merged.slice((page - 1) * size, page * size);
        for (var r = 0; r < data.rows.length; r++) delete data.rows[r].sort_date;
    } catch (error) {
        data.rows = []; data.has_more = false;
        data.error = 'Submissions could not be loaded. Contact the CafeNow administrator.';
    }
})();
