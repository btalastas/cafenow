api.controller = function ($scope, $rootScope) {
    var c = this;
    c.busy = false;
    c.reviewing = false;
    c.transportError = false;
    c.uncertain = false;
    c.choice = {window_id: '', accept_terms: false, instructions: ''};
    c.confirmRemove = '';
    var source = 'cafenow-checkout-' + $scope.$id;
    var queued = false;

    function accept(data) {
        var old = c.data && c.data.snapshot;
        var oldDate = c.data && c.data.pickup_date;
        var oldTerms = c.data && c.data.terms_version;
        c.data = data;
        if (data.pending) c.uncertain = true;
        (data.items || []).forEach(function (item) { item.edit_quantity = item.quantity; });
        if (old && (old !== data.snapshot || oldDate !== data.pickup_date || oldTerms !== data.terms_version)) {
            c.choice.window_id = '';
            c.choice.accept_terms = false;
            c.reviewing = false;
        }
        if (!(data.windows || []).some(function (w) { return w.sys_id === c.choice.window_id; }))
            c.choice.window_id = '';
        $scope.$emit('$sp.service_catalog.cart.count', data.quantity_count || 0);
    }
    accept(c.data);
    function request(payload, changed) {
        if (c.busy) return;
        c.busy = true;
        c.transportError = false;
        return c.server.get(payload).then(function (response) {
            accept(response.data);
            if (changed && response.data.ok)
                $rootScope.$broadcast('$sp.service_catalog.cart.update', {cafenow_source: source});
        }, function () {
            c.transportError = true;
            // Never repeat a purchase automatically after a lost response.
            if (payload.action === 'submit') c.uncertain = true;
        }).finally(function () {
            c.busy = false;
            if (queued && !c.uncertain && !c.data.submitted) {
                queued = false;
                c.refresh();
            }
        });
    }
    c.refresh = function () {
        if (c.busy) { queued = true; return; }
        return request({action: 'refresh'});
    };
    c.proceed = function () {
        if (c.busy || !c.data.can_checkout || c.uncertain) return;
        c.reviewing = true;
    };
    c.update = function (item) {
        if (!item.can_update || c.uncertain) return;
        return request({action: 'quantity', item_id: item.sys_id, quantity: item.edit_quantity}, true);
    };
    c.remove = function (item) {
        if (!item.can_remove || c.confirmRemove !== item.sys_id || c.uncertain) return;
        c.confirmRemove = '';
        return request({action: 'remove', item_id: item.sys_id}, true);
    };
    c.submit = function () {
        if (c.busy || c.uncertain || !c.reviewing || !c.data.can_submit ||
                !c.choice.window_id || c.choice.accept_terms !== true) return;
        return request({action: 'submit', snapshot: c.data.snapshot, token: c.data.token,
            pickup_date: c.data.pickup_date, terms_version: c.data.terms_version,
            window_id: c.choice.window_id, accept_terms: c.choice.accept_terms,
            instructions: c.choice.instructions}, true);
    };
    // A status read can recover a successful Request even when its response was lost.
    c.checkStatus = function () {
        if (c.busy) return;
        return request({action: 'status', token: c.data.token}).then(function () {
            if (c.data.submitted) c.uncertain = false;
        });
    };
    var unbind = $scope.$on('$sp.service_catalog.cart.update', function (event, payload) {
        if (payload && payload.cafenow_source === source) return;
        if (!c.uncertain && !c.data.submitted) c.refresh();
    });
    $scope.$on('$destroy', unbind);
};
