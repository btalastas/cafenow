// Administrator-only Fix Script in the CafeNow scope. Run with checkout disabled.
// Explicitly list only Orders whose actual pickup_date/window/vendor were verified.
// No dates, terms acceptance or Request links are invented. Originals are not deleted.
(function () {
    var ORDER_IDS = []; // Fill with reviewed CafeNow Order sys_ids; empty does nothing.
    var service = new CafeNowCheckout();
    var windowField = String(gs.getProperty(service.P + 'order_window_field', 'time_slot_v2'));
    var userField = String(gs.getProperty(service.P + 'order_user_field', 'opened_by'));
    if (gs.getProperty(service.P + 'enabled', 'false') === 'true') throw new Error('Disable checkout before capacity migration');
    for (var i = 0; i < ORDER_IDS.length; i++) {
        service.id(ORDER_IDS[i]);
        var order = new GlideRecord(service.T.order);
        if (!order.get(ORDER_IDS[i])) throw new Error('Legacy Order missing');
        if (order.getValue('checkout_context')) continue; // already linked: inspect existing hold separately
        if (String(order.getValue('state')) === '4') continue;
        var date = String(order.getValue('pickup_date') || '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Set verified pickup date before migration');
        var window = new GlideRecord(service.T.window);
        if (!window.get(String(order.getValue(windowField))) ||
                String(window.getValue('vendor')) !== String(order.getValue('vendor')))
            throw new Error('Legacy Vendor/Window mapping mismatch');
        var capacity = Number(window.getValue('max_order_capacity'));
        if (capacity < 1 || capacity > 20 || capacity % 1) throw new Error('Invalid capacity');
        var userId = String(order.getValue(userField) || '');
        service.id(userId);
        var context = new GlideRecord(service.T.checkout);
        context.initialize();
        var token = gs.generateGUID();
        context.setValue('token', token);
        context.setValue('cart_key', 'legacy:' + token);
        context.setValue('user', userId);
        context.setValue('vendor', String(order.getValue('vendor')));
        context.setValue('pickup_window', String(window.getUniqueValue()));
        context.setValue('pickup_date', date);
        context.setValue('window_label', String(window.getValue('time_slot_v2') || ''));
        context.setValue('terms_version', 'legacy-not-recorded');
        context.setValue('state', 'fulfilled');
        context.setValue('order', String(order.getUniqueValue()));
        var contextId = service.insert(context);
        if (!contextId) throw new Error('Legacy checkout context insert failed');
        var hold = service.reserve(contextId, String(order.getValue('vendor')),
            {sys_id: String(window.getUniqueValue()), capacity: capacity}, date);
        if (!hold) throw new Error('Legacy orders exceed window capacity. Review before enabling checkout');
        order.setValue('checkout_context', contextId);
        if (!order.update()) throw new Error('Legacy Order linking failed; inspect the created context/hold before retry');
    }
})();
