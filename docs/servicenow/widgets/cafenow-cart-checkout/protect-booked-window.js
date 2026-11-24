// Before UPDATE Business Rule on Pickup Window. Advanced=true, Order=50.
// Booked windows retain their meaning. Create a replacement record to change times.
(function executeRule(current, previous) {
    var fields = ['vendor', 'start_time', 'end_time', 'time_slot_v2', 'max_order_capacity'];
    var changed = false;
    for (var i = 0; i < fields.length; i++) {
        if (current.isValidField(fields[i]) && current.getElement(fields[i]).changes()) changed = true;
    }
    if (!changed) return;
    var reservations = new GlideRecord('x_1234_cafenow_pickup_reservation');
    if (!reservations.isValid()) return;
    reservations.addQuery('pickup_window', String(current.getUniqueValue()));
    reservations.query();
    if (reservations.next()) {
        current.setAbortAction(true);
        gs.addErrorMessage('This pickup window has bookings. Create a replacement window to change its vendor, time or capacity.');
    }
})(current, previous);
