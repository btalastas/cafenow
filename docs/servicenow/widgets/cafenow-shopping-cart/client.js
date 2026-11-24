api.controller = function($scope, $rootScope, $timeout) {
    var c = this;
    var refreshTimer;
    var refreshQueued = false;
    var destroyed = false;
    var source = 'cafenow-cart-' + $scope.$id;
    c.busy = false;
    c.transportError = false;
    c.confirmRemove = null;

    function accept(data) {
        c.data = data;
        c.data.items.forEach(function(item) { item.edit_quantity = item.quantity; });
        $scope.$emit('$sp.service_catalog.cart.count', c.data.quantity_count);
    }
    accept(c.data);

    function request(payload) {
        c.busy = true;
        c.transportError = false;
        return c.server.get(payload).then(function(response) {
            accept(response.data);
            if (payload.action !== 'refresh' && c.data.ok) {
                $rootScope.$broadcast('$sp.service_catalog.cart.update', {cafenow_source: source});
            }
        }, function() {
            c.transportError = true;
        }).finally(function() {
            c.busy = false;
            if (refreshQueued && !destroyed) {
                refreshQueued = false;
                scheduleRefresh();
            }
        });
    }

    c.refresh = function() {
        if (c.busy) {
            refreshQueued = true;
            return;
        }
        c.confirmRemove = null;
        return request({action: 'refresh'});
    };
    c.updateQuantity = function(item) {
        if (c.busy || !item.can_update)
            return;
        c.confirmRemove = null;
        return request({action: 'update_quantity', item_id: item.sys_id, quantity: item.edit_quantity});
    };
    c.askRemove = function(item) {
        if (!c.busy && item.can_remove)
            c.confirmRemove = item.sys_id;
    };
    c.removeItem = function(item) {
        if (c.busy || !item.can_remove || c.confirmRemove !== item.sys_id)
            return;
        c.confirmRemove = null;
        return request({action: 'remove_item', item_id: item.sys_id});
    };
    function scheduleRefresh() {
        if (refreshTimer || destroyed)
            return;
        refreshTimer = $timeout(function() {
            refreshTimer = null;
            c.refresh();
        }, 100);
    }
    var unbindUpdate = $scope.$on('$sp.service_catalog.cart.update', function(event, payload) {
        if (!payload || payload.cafenow_source !== source)
            scheduleRefresh();
    });
    var unbindAdd = $scope.$on('$sp.service_catalog.cart.add_item', scheduleRefresh);
    $scope.$on('$destroy', function() {
        destroyed = true;
        unbindUpdate();
        unbindAdd();
        if (refreshTimer)
            $timeout.cancel(refreshTimer);
    });
};
