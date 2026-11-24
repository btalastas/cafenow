// Flow Designer custom action Script step. Inputs: checkout_id (String).
// Outputs: order_id (String). Run in the CafeNow scope as the system user.
// Trigger flow from Checkout state=submitted, NOT Request/RITM insertion.
(function execute(inputs, outputs) {
    var service = new CafeNowCheckout();
    service.id(inputs.checkout_id);
    var context = new GlideRecord(service.T.checkout);
    if (!context.get(String(inputs.checkout_id))) throw new Error('Checkout context missing');
    var state = String(context.getValue('state'));
    if (state !== 'submitted' && state !== 'fulfilled') throw new Error('Checkout has no confirmed Request');
    var requestId = String(context.getValue('request') || '');
    service.id(requestId);
    var request = new GlideRecord('sc_request');
    if (!request.get(requestId) || String(request.getValue('requested_for')) !== String(context.getValue('user')))
        throw new Error('Request recipient mismatch');
    var reservation = new GlideRecord(service.T.reservation);
    reservation.addQuery('checkout', String(inputs.checkout_id));
    reservation.query();
    if (!reservation.next() || String(reservation.getValue('vendor')) !== String(context.getValue('vendor')) ||
            String(reservation.getValue('pickup_window')) !== String(context.getValue('pickup_window')) ||
            String(reservation.getValue('pickup_date')) !== String(context.getValue('pickup_date')))
        throw new Error('Capacity reservation missing or mismatched');

    var windowField = String(gs.getProperty(service.P + 'order_window_field', 'time_slot_v2'));
    var userField = String(gs.getProperty(service.P + 'order_user_field', 'opened_by'));
    var order = new GlideRecord(service.T.order);
    service.fields(order, ['checkout_context', 'source_request', 'vendor', windowField, userField,
        'pickup_date', 'location', 'state', 'assignment_group']);
    var existing = new GlideRecord(service.T.order);
    existing.addQuery('checkout_context', String(inputs.checkout_id));
    existing.query();
    if (existing.next()) {
        if (String(existing.getValue('source_request')) !== requestId ||
                String(existing.getValue('vendor')) !== String(context.getValue('vendor')))
            throw new Error('Existing Order has conflicting checkout mapping');
        outputs.order_id = String(existing.getUniqueValue());
    } else {
        // Compare complete RITM contents, including quantities, to the locked cart snapshot.
        var expected = JSON.parse(String(context.getValue('items_json'))), expectedTotals = {}, actualTotals = {};
        for (var e = 0; e < expected.length; e++)
            expectedTotals[expected[e].cat_item] = (expectedTotals[expected[e].cat_item] || 0) + expected[e].quantity;
        var ritms = new GlideRecord('sc_req_item');
        ritms.addQuery('request', requestId);
        ritms.query();
        while (ritms.next()) {
            var itemId = String(ritms.getValue('cat_item'));
            var quantity = Number(ritms.getValue('quantity'));
            if (!isFinite(quantity) || quantity < 1 || quantity % 1) throw new Error('Invalid RITM quantity');
            var item = new GlideRecord('sc_cat_item');
            if (!item.get(itemId)) throw new Error('Catalog Item missing');
            var menu = new GlideRecord(service.T.menu);
            if (!menu.get(String(item.getValue('u_cafenow_menu_item'))) ||
                    String(menu.getValue('vendor')) !== String(context.getValue('vendor')))
                throw new Error('RITM vendor mismatch');
            actualTotals[itemId] = (actualTotals[itemId] || 0) + quantity;
        }
        var keys = Object.keys(expectedTotals).sort(), actualKeys = Object.keys(actualTotals).sort();
        if (JSON.stringify(keys) !== JSON.stringify(actualKeys)) throw new Error('RITMs are incomplete or cart changed during submission');
        for (var k = 0; k < keys.length; k++) {
            if (expectedTotals[keys[k]] !== actualTotals[keys[k]]) throw new Error('RITM quantities differ from checkout');
        }
        var duplicate = new GlideRecord(service.T.order);
        duplicate.addQuery('source_request', requestId);
        duplicate.query();
        if (duplicate.next()) throw new Error('Another Order already uses this Request; disable conflicting order flows');
        var locationId = String(gs.getProperty(service.P + 'building_location', ''));
        service.id(locationId);
        var location = new GlideRecord('cmn_location');
        if (!location.get(locationId)) throw new Error('Building location missing');
        var vendor = new GlideRecord(service.T.vendor);
        if (!vendor.get(String(context.getValue('vendor')))) throw new Error('Vendor missing');
        service.id(vendor.getValue('vendor_group'));
        order.initialize();
        order.setValue('checkout_context', String(inputs.checkout_id));
        order.setValue('source_request', requestId);
        order.setValue('vendor', String(context.getValue('vendor')));
        order.setValue(windowField, String(context.getValue('pickup_window')));
        order.setValue('pickup_date', String(context.getValue('pickup_date')));
        order.setValue(userField, String(context.getValue('user')));
        order.setValue('location', locationId);
        order.setValue('assignment_group', String(vendor.getValue('vendor_group')));
        order.setValue('state', '-5');
        order.setValue('short_description', 'CafeNow order for ' + String(context.getValue('request_number')));
        order.setValue('description', String(context.getValue('instructions') || ''));
        if (order.isValidField('active')) order.setValue('active', true);
        // Currency validation belongs to instance setup. Do not parse localized total strings.
        if (order.isValidField('order_total') && request.isValidField('price')) {
            var price = request.getElement('price');
            if (typeof price.getCurrencyValue !== 'function' || typeof price.getCurrencyCode !== 'function')
                throw new Error('Verify native Request price currency API before enabling fulfillment');
            order.setValue('order_total', String(price.getCurrencyCode()) + ';' + String(price.getCurrencyValue()));
        }
        var orderId = service.insert(order);
        if (!orderId) {
            // A UNIQUE checkout_context index chooses the winner if two action executions race.
            var winner = new GlideRecord(service.T.order);
            winner.addQuery('checkout_context', String(inputs.checkout_id));
            winner.query();
            if (!winner.next() || String(winner.getValue('source_request')) !== requestId)
                throw new Error('Order insert could not be confirmed');
            orderId = String(winner.getUniqueValue());
        }
        outputs.order_id = orderId;
    }
    // Linking can be retried independently if a child update fails after Order creation.
    var lines = new GlideRecord('sc_req_item');
    service.fields(lines, ['request', 'x_1234_cafenow_cafenow']);
    lines.addQuery('request', requestId);
    lines.query();
    while (lines.next()) {
        var prior = String(lines.getValue('x_1234_cafenow_cafenow') || '');
        if (prior && prior !== outputs.order_id) throw new Error('RITM already belongs to another Order');
        lines.setValue('x_1234_cafenow_cafenow', outputs.order_id);
        if (!lines.update()) throw new Error('RITM link failed; retry this action after review');
    }
    context.setValue('order', outputs.order_id);
    context.setValue('state', 'fulfilled');
    if (!context.update()) throw new Error('Order created but checkout finalization needs retry');
})(inputs, outputs);
