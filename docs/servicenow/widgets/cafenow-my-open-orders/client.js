api.controller = function() {
    var c = this;
    c.loading = false;
    c.refreshError = false;
    c.refresh = function() {
        if (c.loading)
            return;
        c.loading = true;
        c.refreshError = false;
        return c.server.get({}).then(function(response) {
            c.data = response.data;
        }, function() {
            c.refreshError = true;
        }).finally(function() {
            c.loading = false;
        });
    };
};
