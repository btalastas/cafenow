(function() {
    // Server-owned configuration only. Never accept a table/filter/user from input.
    var TABLE = 'x_1234_cafenow_order';
    var OWNER = 'opened_by'; // Confirm recipient field; see README before installation.
    var configuredLimit = Number((options || {}).max_orders);
    var LIMIT = isFinite(configuredLimit) && configuredLimit >= 1 ?
        Math.min(50, Math.floor(configuredLimit)) : 5;
    var STATES = {'-5': 'Submitted', '1': 'Confirmed', '2': 'Ready for Pickup'};
    data.orders = [];
    data.error = '';
    data.has_more = false;
    data.limit = LIMIT;
    data.all_orders_url = '?id=cafenow_my_orders';
    data.more_message = gs.getMessage('Showing your {0} newest open orders.', [String(LIMIT)]);
    data.signed_in = gs.getUserName() !== 'guest';
    if (!data.signed_in)
        return;

    try {
        var orders = new GlideRecordSecure(TABLE);
        if (!orders.isValid() || !orders.isValidField(OWNER) ||
                !orders.isValidField('state') || !orders.isValidField('number')) {
            data.error = gs.getMessage('My Open Orders needs configuration. Contact the CafeNow team.');
            return;
        }
        // Explicit state filter: inherited Task.active behavior is not assumed.
        orders.addQuery(OWNER, gs.getUserID());
        orders.addQuery('state', 'IN', '-5,1,2');
        orders.orderByDesc('sys_created_on');
        orders.orderByDesc('sys_id');
        orders.setLimit(LIMIT + 1);
        orders.query();
        while (orders.next()) {
            if (orders.isValidField('submission_status')) {
                if (!readable(orders, 'submission_status')) continue;
                var submissionStatus = String(orders.getValue('submission_status') || '');
                if (submissionStatus && submissionStatus !== 'complete') continue;
            }
            if (!orders.canRead() || !readable(orders, OWNER) ||
                    String(orders.getValue(OWNER)) !== String(gs.getUserID()) ||
                    !readable(orders, 'state') || !readable(orders, 'number'))
                continue;
            var state = String(orders.getValue('state'));
            if (!Object.prototype.hasOwnProperty.call(STATES, state))
                continue;
            if (data.orders.length === LIMIT) {
                data.has_more = true;
                break;
            }
            data.orders.push({
                sys_id: String(orders.getUniqueValue()),
                number: display(orders, 'number'),
                url: '?id=cafenow_order_details&table=' + encodeURIComponent(TABLE) +
                    '&sys_id=' + encodeURIComponent(String(orders.getUniqueValue())),
                state: state,
                state_label: gs.getMessage(STATES[state]),
                vendor: display(orders, 'vendor'),
                pickup_window: display(orders, 'pickup_window'),
                created: display(orders, 'sys_created_on')
            });
        }
    } catch (error) {
        data.orders = [];
        data.has_more = false;
        data.error = gs.getMessage('Orders could not be loaded. Try refreshing or contact the CafeNow team.');
        gs.error('CafeNow My Open Orders query failed. Check table ACLs and application access.');
    }

    function readable(record, field) {
        return record.isValidField(field) && record.getElement(field).canRead();
    }
    function display(record, field) {
        return readable(record, field) ? String(record.getDisplayValue(field) || '') : '';
    }
})();
