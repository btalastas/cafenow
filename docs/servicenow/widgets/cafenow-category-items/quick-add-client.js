    $scope.quickAddInFlight = false;
    $scope.quickAddMessage = '';
    $scope.quickAddFailed = false;

    $scope.quickAdd = function($event, item) {
        $event.preventDefault();
        $event.stopPropagation();
        if ($scope.quickAddInFlight)
            return;
        var quantity = Number(item.cafenow_quantity);
        if (!isFinite(quantity) || quantity < 1 || quantity % 1 !== 0 || quantity > 2147483647) {
            $scope.quickAddFailed = true;
            $scope.quickAddMessage = 'Enter a positive whole-number quantity.';
            return;
        }
        $scope.quickAddInFlight = true;
        $scope.quickAddItemId = item.sys_id;
        $scope.quickAddMessage = '';
        // get() keeps the action response separate from the category list's data.
        $scope.server.get({
            action: 'cafenow_quick_add',
            item_id: item.sys_id,
            quantity: quantity
        }).then(function(response) {
            var result = response.data && response.data.quick_add;
            $scope.quickAddFailed = !result || result.success !== true;
            $scope.quickAddMessage = result && result.message ? result.message :
                'The cart update could not be confirmed. Check your cart before trying again.';
            if (result && result.success === true) {
                // Same native-cart refresh events used by the supplied Catalog Item widget.
                $rootScope.$broadcast('$sp.service_catalog.cart.add_item');
                $rootScope.$broadcast('$sp.service_catalog.cart.update');
            }
            spAriaUtil.sendLiveMessage($scope.quickAddMessage);
        }, function() {
            $scope.quickAddFailed = true;
            $scope.quickAddMessage = 'The cart update could not be confirmed. Check your cart before trying again.';
            spAriaUtil.sendLiveMessage($scope.quickAddMessage);
        }).finally(function() {
            $scope.quickAddInFlight = false;
            $scope.quickAddItemId = '';
        });
    };
