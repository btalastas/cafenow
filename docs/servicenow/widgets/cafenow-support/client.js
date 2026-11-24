api.controller = function () {
    var c = this;
    c.form = {audience: c.data.canRequester ? 'requester' : 'vendor', kind: 'complaint',
        category: c.data.canRequester ? 'other' : '', summary: '', details: '', order_number: '', vendor: ''};
    c.changeAudience = function () {
        c.form.category = c.form.audience === 'requester' ? 'other' : '';
        c.form.order_number = '';
        c.form.vendor = '';
    };
    c.busy = false;
    c.locked = false;
    c.submit = function () {
        if (c.busy || c.locked || c.data.saved) return;
        c.busy = true;
        c.server.get({action: 'submit', form: angular.copy(c.form)}).then(function (response) {
            c.data = response.data;
        }, function () {
            c.locked = true;
            c.transportError = 'Submission status is uncertain. Contact the CafeNow team before submitting again.';
        }).finally(function () { c.busy = false; });
    };
};
