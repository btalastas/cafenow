api.controller = function () {
    var c = this;
    c.loading = false;
    c.refreshError = false;
    c.refresh = function () {
        if (c.loading) return;
        c.loading = true;
        c.refreshError = false;
        c.server.refresh().then(function () {
            c.loading = false;
        }, function () {
            // Hide stale orders after a failed permission/data refresh.
            c.data.groups = [];
            c.data.count = 0;
            c.refreshError = true;
            c.loading = false;
        });
    };
};
