// Before INSERT Business Rule on CafeNow Order. Advanced=true, Order=50.
// Applies only after checkout.enforce_order_guard=true; no existing records are changed.
(function executeRule(current, previous) {
    if (gs.getProperty('x_1234_cafenow.checkout.enforce_order_guard', 'false') !== 'true') return;
    var service = new CafeNowCheckout();
    var field = String(gs.getProperty(service.P + 'order_window_field', 'time_slot_v2'));
    var userField = String(gs.getProperty(service.P + 'order_user_field', 'opened_by'));
    var context = new GlideRecord(service.T.checkout);
    var valid = current.isValidField('checkout_context') && context.get(String(current.getValue('checkout_context') || ''));
    if (valid) {
        var state = String(context.getValue('state'));
        valid = (state === 'submitted' || state === 'fulfilled') &&
            String(current.getValue('vendor')) === String(context.getValue('vendor')) &&
            String(current.getValue(field)) === String(context.getValue('pickup_window')) &&
            String(current.getValue('pickup_date')) === String(context.getValue('pickup_date')) &&
            String(current.getValue(userField)) === String(context.getValue('user')) &&
            String(current.getValue('source_request')) === String(context.getValue('request')) &&
            String(current.getValue('state')) === '-5' && !!context.getValue('accepted_at');
    }
    if (valid) {
        var reservation = new GlideRecord(service.T.reservation);
        reservation.addQuery('checkout', String(context.getUniqueValue()));
        reservation.query();
        valid = reservation.next() &&
            String(reservation.getValue('vendor')) === String(context.getValue('vendor')) &&
            String(reservation.getValue('pickup_window')) === String(context.getValue('pickup_window')) &&
            String(reservation.getValue('pickup_date')) === String(context.getValue('pickup_date'));
    }
    if (!valid) {
        current.setAbortAction(true);
        gs.addErrorMessage('CafeNow Orders require a validated checkout.');
    }
})(current, previous);
