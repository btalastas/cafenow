api.controller = function ($scope) {
    var c = this;
    c.busy = false;
    c.request = function (payload, saved) {
        if (c.busy) return;
        c.busy = true;
        c.transportError = '';
        return c.server.get(payload).then(function (response) {
            c.data = response.data;
            if (saved && c.data.saved) c.form = null;
        }, function () {
            c.transportError = 'Response unavailable. Refresh and check the menu before saving again.';
        }).finally(function () { c.busy = false; });
    };
    c.load = function (page) {
        c.form = null;
        return c.request({action: 'list', page: page || 1});
    };
    c.add = function () {
        c.form = {vendor: c.data.vendors[0].sys_id, item_name: '', description: '',
            price: '', active: false, in_stock: true};
    };
    c.edit = function (item) { c.form = angular.copy(item); };
    c.save = function () {
        return c.request({action: 'save', item: angular.copy(c.form), page: c.data.page}, true);
    };
};
