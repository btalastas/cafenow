api.controller = function ($scope, $rootScope, $window) {
    var c = this, key = 'cafenow.direct.cart.' + c.data.user_id, stopped = false;
    c.busy = false; c.uncertain = false; c.localError = ''; c.cart = [];
    c.choice = {window_id: '', accept_terms: false};
    c.menuQuantities = {};
    c.stepQuantity = function (food, step) {
        if (c.busy || c.uncertain || !food.available) return;
        var current = Number(c.menuQuantities[food.sys_id] || 1);
        if (!isFinite(current) || current % 1) current = 1;
        c.menuQuantities[food.sys_id] = Math.max(1, Math.min(99, current + step));
    };
    var token = '', source = 'direct-' + $scope.$id, queued = false;
    function restore() {
        try {
            var value = JSON.parse($window.localStorage.getItem(key) || '{}');
            c.cart = Array.isArray(value.items) ? value.items : [];
            token = String(value.token || '');
            c.uncertain = value.uncertain === true;
        } catch (e) { c.localError = 'Your saved cart could not be read. Clear it to start again.'; }
    }
    function save() {
        try { $window.localStorage.setItem(key, JSON.stringify({items: c.cart, token: token, uncertain: c.uncertain})); }
        catch (e) { c.localError = 'Cart storage is unavailable in this browser.'; return false; }
        return true;
    }
    function accept(data) {
        var old = c.data.snapshot;
        c.data = data;
        if (old && old !== data.snapshot) { c.choice.window_id = ''; c.choice.accept_terms = false; }
        (data.items || []).forEach(function (item) { item.edit_quantity = item.quantity; });
        if (data.pending) { c.uncertain = true; save(); }
        if (data.submitted) { c.cart = []; token = ''; c.uncertain = false; save(); }
        else if (data.token && !token) { token = data.token; save(); }
    }
    function request(action) {
        if (c.busy) { queued = action === 'preview'; return; }
        c.busy = true; c.localError = '';
        var payload = {action: action, items: c.cart, token: token,
            vendor_id: c.data.selected_vendor, window_id: c.choice.window_id,
            accept_terms: c.choice.accept_terms, snapshot: c.data.snapshot,
            pickup_date: c.data.pickup_date, terms_version: c.data.terms_version};
        if (action === 'submit') { c.uncertain = true; if (!save()) { c.busy = false; return; } }
        return c.server.get(payload).then(function (response) {
            var result = response.data;
            // A positive rejection is retryable; transport uncertainty is not.
            if (action === 'submit' && !result.pending && !result.submitted) { c.uncertain = false; token = ''; save(); }
            accept(result);
        }, function () {
            c.localError = action === 'submit' ? 'Submission response was lost. Check My Orders or contact an administrator before ordering again.' : 'CafeNow could not be refreshed.';
        }).finally(function () {
            c.busy = false;
            if (queued && !stopped && !c.uncertain && !c.data.submitted) { queued = false; restore(); request('preview'); }
        });
    }
    c.refresh = function () {
        if (c.uncertain) { c.localError = 'Check My Orders or contact an administrator before ordering again.'; return; }
        return request('preview');
    };
    function changed() {
        token = ''; c.choice.window_id = ''; c.choice.accept_terms = false;
        if (!save()) return;
        $rootScope.$broadcast('cafenow.direct.cart.changed', source);
        return request('preview');
    }
    c.add = function (food) {
        if (c.busy || c.uncertain || !food.available) return;
        if (c.data.cart_vendor && c.data.cart_vendor !== food.vendor_id) {
            c.localError = 'Your cart belongs to another vendor. Clear it before switching vendors.'; return;
        }
        var found = c.cart.filter(function (item) { return item.menu_id === food.sys_id; })[0];
        var quantity = c.menuQuantities[food.sys_id] === undefined ? 1 : Number(c.menuQuantities[food.sys_id]);
        if (!isFinite(quantity) || quantity % 1 || quantity < 1 || quantity > 99) {
            c.localError = 'Choose a whole-number quantity from 1 to 99.'; return;
        }
        var combined = (found ? Number(found.quantity) : 0) + quantity;
        if (combined > 99) { c.localError = 'Cart quantity for one food cannot exceed 99.'; return; }
        if (found) found.quantity = combined;
        else c.cart.push({menu_id: food.sys_id, quantity: quantity});
        return changed();
    };
    c.update = function (item) {
        if (c.busy || c.uncertain) return;
        var quantity = Number(item.edit_quantity);
        if (!isFinite(quantity) || quantity % 1 || quantity < 1 || quantity > 99) { c.localError = 'Choose a whole-number quantity from 1 to 99.'; return; }
        c.cart.forEach(function (line) { if (line.menu_id === item.menu_id) line.quantity = quantity; });
        return changed();
    };
    c.remove = function (item) {
        if (c.busy || c.uncertain) return;
        c.cart = c.cart.filter(function (line) { return line.menu_id !== item.menu_id; });
        return changed();
    };
    c.clear = function () {
        if (c.busy || c.uncertain || !c.confirmClear) return;
        c.cart = []; c.confirmClear = false; return changed();
    };
    c.submit = function () {
        if (c.busy || c.uncertain || !c.data.can_submit || !c.choice.window_id || c.choice.accept_terms !== true) return;
        return request('submit');
    };
    var unbind = $scope.$on('cafenow.direct.cart.changed', function (event, origin) {
        if (origin !== source && !c.uncertain) {
            if (c.busy) queued = true;
            else { restore(); c.refresh(); }
        }
    });
    function storage(event) {
        if (event.key === key && !c.busy) $scope.$evalAsync(function () { restore(); c.refresh(); });
    }
    $window.addEventListener('storage', storage);
    $scope.$on('$destroy', function () { stopped = true; unbind(); $window.removeEventListener('storage', storage); });
    if (c.data.signed_in && ['orders', 'details'].indexOf(c.data.view) < 0) { restore(); c.refresh(); }
};
