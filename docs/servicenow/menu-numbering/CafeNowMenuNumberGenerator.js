// NEW Script Include in Global. Name: CafeNowMenuNumberGenerator.
// Accessible from: All application scopes. Client callable: false. Active: true.
// Admin-only, fixed table; never accepts a table/counter from a caller.
var CafeNowMenuNumberGenerator = Class.create();
CafeNowMenuNumberGenerator.prototype = {
    initialize: function () {},
    next: function () {
        if (!gs.hasRole('admin'))
            throw new Error('CafeNow Menu number maintenance requires an administrator.');
        return String(new NumberManager('x_1234_cafenow_menu').getNextObjNumberPadded() || '');
    },
    type: 'CafeNowMenuNumberGenerator'
};
