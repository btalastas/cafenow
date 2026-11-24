(function () {
    // One widget definition, four instance views. No record writes.
    data.view = ['recent', 'open', 'all', 'details'].indexOf(String(options.view)) >= 0 ? String(options.view) : 'all';
    data.orders = []; data.lines = []; data.has_more = false; data.error = '';
    data.all_url = '?id=cafenow_my_orders';
    data.signed_in = gs.getUserName() !== 'guest';
    if (!data.signed_in) { data.error = 'Sign in to view your orders.'; return; }
    var userId = String(gs.getUserID());
    var request = input || {};

    function readable(record, field) {
        return record.isValidField(field) && record.getElement(field).canRead();
    }
    function display(record, field) {
        return readable(record, field) ? String(record.getDisplayValue(field) || '') : '';
    }
    function own(record) {
        if (!record.canRead() || !readable(record, 'opened_by') ||
            String(record.getValue('opened_by')) !== userId) return false;
        if (!readable(record, 'number') || !readable(record, 'state')) return false;
        if (String(record.getValue('state')) === '-5' && String(record.getValue('active')) === '0') return false;
        if (record.isValidField('submission_status')) {
            if (!readable(record, 'submission_status')) return false;
            var status = String(record.getValue('submission_status') || '');
            if (status && status !== 'complete') return false;
        }
        return true;
    }
    function summary(record) {
        return {sys_id: String(record.getUniqueValue()), number: display(record, 'number'),
            state: display(record, 'state'), vendor: display(record, 'vendor'),
            pickup_date: display(record, 'pickup_date'), pickup: display(record, 'time_slot_v2'),
            total: display(record, 'order_total'), placed: display(record, 'sys_created_on'),
            url: '?id=cafenow_order_details&order_id=' + String(record.getUniqueValue())};
    }
    try {
        var orders = new GlideRecordSecure('x_1234_cafenow_order');
        if (data.view === 'details') {
            var id = String(request.order_id || $sp.getParameter('order_id') || '');
            if (!/^[a-f0-9]{32}$/.test(id) || !orders.get(id) || !own(orders)) {
                data.error = 'This order is not available to your account.'; return;
            }
            data.order = summary(orders);
            data.order.location = display(orders, 'location');
            data.order.employee = display(orders, 'opened_by');
            var lines = new GlideRecordSecure('x_1234_cafenow_order_line');
            lines.addQuery('order', id); lines.orderBy('sys_created_on'); lines.orderBy('sys_id'); lines.query();
            while (lines.next()) {
                if (!lines.canRead() || !readable(lines, 'order') || String(lines.getValue('order')) !== id) continue;
                var fields = ['item_name', 'quantity', 'unit_price', 'line_price'];
                var allowed = true;
                for (var f = 0; f < fields.length; f++) if (!readable(lines, fields[f])) allowed = false;
                if (!allowed) continue;
                data.lines.push({sys_id: String(lines.getUniqueValue()), name: display(lines, 'item_name'),
                    quantity: display(lines, 'quantity'), unit_price: display(lines, 'unit_price'),
                    line_price: display(lines, 'line_price')});
            }
            return;
        }
        var page = Number(request.page || 1);
        if (!isFinite(page) || page < 1 || page !== Math.floor(page) || page > 1000) page = 1;
        data.page = data.view === 'recent' || data.view === 'open' ? 1 : page;
        data.page_size = data.view === 'recent' || data.view === 'open' ? 5 : 20;
        data.search = data.view === 'all' ? String(request.search || '').trim().substring(0, 40) : '';
        // Number search uses a query argument, never a browser-supplied encoded query.
        orders.addQuery('opened_by', userId);
        if (data.view === 'open') {
            orders.addQuery('active', true);
            orders.addQuery('state', 'IN', '-5,1,2');
        }
        if (data.search) orders.addQuery('number', 'CONTAINS', data.search);
        orders.orderByDesc('sys_created_on'); orders.orderByDesc('sys_id'); orders.query();
        var skip = (data.page - 1) * data.page_size, seen = 0;
        // Page only records actually readable by this user. No aggregate counts leak records.
        while (orders.next()) {
            if (!own(orders)) continue;
            if (seen++ < skip) continue;
            if (data.orders.length === data.page_size) { data.has_more = true; break; }
            data.orders.push(summary(orders));
        }
    } catch (e) {
        data.orders = []; data.lines = []; delete data.order;
        data.error = 'Orders could not be loaded. Please try again or contact CafeNow support.';
        gs.error('CafeNow order views: read failed; inspect dictionary, scope access and ACLs.');
    }
})();
