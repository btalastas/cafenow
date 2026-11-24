api.controller = function () {
    var c = this;
    c.search = c.data.search || '';
    c.load = function (page) {
        if (c.busy) return;
        c.busy = true; c.failed = false;
        return c.server.get({page: page, search: c.search}).then(function (response) {
            c.data = response.data;
        }, function () { c.failed = true; }).finally(function () { c.busy = false; });
    };
};
