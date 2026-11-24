(function () {
    // Same-scope Script Include; no browser-supplied table, user, vendor or price.
    var result;
    try {
        result = new CafeNowCheckout().handle(input || {});
    } catch (error) {
        gs.error('CafeNow cart service unavailable. Verify Script Include and application access.');
        result = {items: [], windows: [], signed_in: gs.getUserName() !== 'guest',
            error: gs.getMessage('Checkout could not be loaded. Contact the CafeNow team.')};
    }
    for (var key in result) {
        if (Object.prototype.hasOwnProperty.call(result, key)) data[key] = result[key];
    }
})();
