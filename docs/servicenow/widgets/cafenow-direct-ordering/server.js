(function () {
    try {
        var service = new CafeNowDirectOrdering();
        var result = service.handle(input || {}, options || {}, {
            vendor: String($sp.getParameter('vendor') || ''),
            order_id: String($sp.getParameter('order_id') || $sp.getParameter('sys_id') || '')
        });
        for (var key in result) {
            if (Object.prototype.hasOwnProperty.call(result, key)) data[key] = result[key];
        }
    } catch (error) {
        data.error = gs.getMessage('CafeNow could not be loaded. Contact the CafeNow team.');
        gs.error('CafeNow direct widget: verify same-scope service and application access.');
    }
})();
