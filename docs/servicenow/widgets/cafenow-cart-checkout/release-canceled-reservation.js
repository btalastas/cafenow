// After UPDATE Business Rule on CafeNow Order, condition: State changes to Canceled (4).
// Cancellation authorization/cutoff must already have been enforced before the save.
(function executeRule(current, previous) {
    if (!current.state.changesTo('4')) return;
    var contextId = String(current.getValue('checkout_context') || '');
    if (!/^[a-f0-9]{32}$/.test(contextId)) return;
    var reservation = new GlideRecord('x_1234_cafenow_pickup_reservation');
    reservation.addQuery('checkout', contextId);
    reservation.query();
    while (reservation.next()) {
        if (String(reservation.getValue('checkout')) === contextId && !reservation.deleteRecord())
            gs.error('CafeNow cancellation capacity release needs administrator review.');
    }
})(current, previous);
