api.controller = function () {
    var c = this;
    c.search = ''; c.audience = ''; c.busy = false; c.selected = null;
    c.load = function (page) {
        if (c.busy) return;
        c.busy = true; c.selected = null; c.detailError = ''; c.transportError = '';
        c.server.get({page: page, search: c.search, audience: c.audience}).then(function (response) {
            c.data = response.data;
        }, function () { c.transportError = 'Submissions could not be refreshed. Please try again.'; })
            .finally(function () { c.busy = false; });
    };
    c.open = function (row) {
        if (c.busy) return;
        c.busy = true; c.selected = null; c.detailError = '';
        c.server.get({action: 'details', audience: row.audience, record_id: row.sys_id}).then(function (response) {
            c.selected = response.data.detail || null; c.detailError = response.data.error || '';
        }, function () { c.detailError = 'Submission details could not be loaded.'; })
            .finally(function () { c.busy = false; });
    };
};
