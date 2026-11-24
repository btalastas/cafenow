// BEFORE UPDATE on Pickup Window. Booked schedule definitions are immutable.
(function executeRule(current, previous) {
    var fields = ['vendor', 'start_time', 'end_time', 'time_slot_v2', 'max_order_capacity'], changed = false;
    for (var i = 0; i < fields.length; i++) if (current.getElement(fields[i]).changes()) changed = true;
    if (!changed) return;
    var order = new GlideRecord('x_1234_cafenow_order');
    if (!order.isValidField('booking_key')) return;
    order.addQuery('time_slot_v2', String(current.getUniqueValue()));
    order.addNotNullQuery('booking_key'); order.query();
    if (order.next()) {
        current.setAbortAction(true);
        gs.addErrorMessage('This window has bookings. Create a replacement to change its vendor, time or capacity.');
    }
})(current, previous);
