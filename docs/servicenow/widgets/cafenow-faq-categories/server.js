(function () {
    // Persona/category visibility confirmed by the user November 13, 2026.
    var RULES = [
        {label: 'Administration', audiences: ['facility']},
        {label: 'Employee Help', audiences: ['employee']},
        {label: 'Menu Management', audiences: ['vendor']},
        {label: 'Ordering and Payments', audiences: ['employee']},
        {label: 'Troubleshooting', audiences: ['employee', 'vendor', 'facility']},
        {label: 'Vendor Operations', audiences: ['vendor']}
    ];
    var ROLES = {
        employee: ['x_1234_cafenow.user'],
        vendor: ['x_1234_cafenow.vendor_admin', 'x_1234_cafenow.vendor_staff'],
        facility: ['x_1234_cafenow.facility_manager'],
        admin: ['x_1234_cafenow.admin']
    };
    data.authorized = false;
    data.ready = false;
    data.categories = [];
    data.message = '';
    if (gs.getUserName() === 'guest') return;
    var user = gs.getUser();
    var assigned = ',' + String(user.getRoles()).replace(/\s/g, '') + ',';
    function hasAny(roles) {
        for (var i = 0; i < roles.length; i++) {
            if (assigned.indexOf(',' + roles[i] + ',') !== -1 && user.hasRole(roles[i])) return true;
        }
        return false;
    }
    var audience = {};
    for (var key in ROLES) {
        if (Object.prototype.hasOwnProperty.call(ROLES, key)) audience[key] = hasAny(ROLES[key]);
    }
    data.authorized = audience.employee || audience.vendor || audience.facility || audience.admin;
    if (!data.authorized) return;

    // Trusted widget-instance configuration, never a client-supplied KB/role filter.
    var baseId = String(options.kb_knowledge_base || '');
    var pageId = String(options.category_page || 'kb_category');
    if (!/^[a-f0-9]{32}$/.test(baseId) || !/^[a-zA-Z0-9_]+$/.test(pageId)) {
        data.message = 'FAQ category setup is pending. Contact the CafeNow administrator.';
        return;
    }
    function readable(record, field) {
        var element = record.getElement(field);
        return element && element.canRead();
    }
    try {
        for (var r = 0; r < RULES.length; r++) {
            var rule = RULES[r];
            var allowed = audience.admin;
            for (var a = 0; a < rule.audiences.length; a++) allowed = allowed || audience[rule.audiences[a]];
            if (!allowed) continue;
            // Only active top-level categories in the explicitly selected base.
            var category = new GlideRecordSecure('kb_category');
            category.addQuery('parent_id', baseId);
            category.addQuery('parent_table', 'kb_knowledge_base');
            category.addQuery('active', true);
            category.addQuery('label', rule.label);
            category.setLimit(2);
            category.query();
            var matches = [];
            while (category.next()) {
                if (!category.canRead() || !readable(category, 'label') ||
                    !readable(category, 'parent_id') || !readable(category, 'parent_table') ||
                    !readable(category, 'active')) continue;
                var categoryId = String(category.getUniqueValue());
                if (!/^[a-f0-9]{32}$/.test(categoryId)) continue;
                if (String(category.getValue('parent_id')) !== baseId ||
                    String(category.getValue('parent_table')) !== 'kb_knowledge_base' ||
                    String(category.getValue('label')) !== rule.label ||
                    ['1', 'true'].indexOf(String(category.getValue('active'))) === -1) continue;
                matches.push({
                    sys_id: categoryId,
                    label: rule.label,
                    url: '?id=' + encodeURIComponent(pageId) + '&kb_category=' + categoryId +
                        '&kb_knowledge_base=' + baseId
                });
            }
            // Duplicate labels are ambiguous: do not choose an arbitrary category.
            if (matches.length === 1) data.categories.push(matches[0]);
        }
        data.ready = true;
    } catch (error) {
        data.categories = [];
        data.message = 'FAQ categories are unavailable. Contact the CafeNow administrator.';
    }
})();
