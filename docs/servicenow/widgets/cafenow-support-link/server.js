(function () {
    data.show = false;
    data.url = '?id=cafenow_support';
    if (gs.getUserName() === 'guest') return;
    var user = gs.getUser();
    var roles = ',' + String(user.getRoles()).replace(/[\[\]\s]/g, '') + ',';
    var allowedRoles = ['x_1234_cafenow.user', 'x_1234_cafenow.vendor_admin'];
    for (var i = 0; i < allowedRoles.length; i++) {
        if (roles.indexOf(',' + allowedRoles[i] + ',') !== -1 && user.hasRole(allowedRoles[i])) data.show = true;
    }
})();
