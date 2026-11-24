// BEFORE UPDATE on Order, condition State changes to Canceled (4).
// Enforce actor/state/cutoff cancellation policy independently before accepting that change.
(function executeRule(current, previous) {
    if (current.state.changesTo('4') && current.isValidField('booking_key'))
        current.setValue('booking_key', '');
})(current, previous);
