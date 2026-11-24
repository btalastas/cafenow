    // CafeNow quick-add action. Inserted inside the supplied server IIFE.
    // Uses the current user's DEFAULT native catalog cart, not cafeCart.
    if (input && input.action === 'cafenow_quick_add') {
        data.quick_add = {success: false, message: ''};
        try {
            cafeNowQuickAdd();
        } catch (quickAddError) {
            gs.error('CafeNow quick-add failed: ' + String(quickAddError.message || quickAddError));
            data.quick_add.message = gs.getMessage('The cart update could not be confirmed. Check your cart before trying again.');
        }
        return;
    }

    function cafeNowQuickAdd() {
        if (gs.getUserName() === 'guest') {
            cafeNowReject('Sign in before adding food to your cart.');
            return;
        }

        var itemId = String(input.item_id || '');
        var quantity = Number(input.quantity);
        if ((typeof input.quantity !== 'number' && typeof input.quantity !== 'string') ||
                !/^[0-9a-f]{32}$/i.test(itemId) || !isFinite(quantity) ||
                quantity < 1 || quantity % 1 !== 0 || quantity > 2147483647) {
            cafeNowReject('Choose a food and a positive whole-number quantity.');
            return;
        }

        var food = cafeNowGetFood(itemId);
        if (!food) {
            cafeNowReject('This food is unavailable or its Menu/Vendor mapping is missing. Use View Details or contact the CafeNow team.');
            return;
        }

        // Evaluate configured variables on the server, not values supplied by the browser.
        var model = $sp.getCatalogItem(itemId);
        if (!model || !model._fields || model.can_order === false || model.can_order === 'false') {
            cafeNowReject('Quick add cannot inspect this food\'s options. Use View Details.');
            return;
        }
        var variables = cafeNowGetDefaults(model._fields, food, quantity);
        if (variables === null)
            return;

        var cart = new sn_sc.CartJS();
        var cartItems = cart.getCartItems();
        while (cartItems.next()) {
            var existingFood = cafeNowGetFood(String(cartItems.getValue('cat_item')));
            if (!existingFood || existingFood.vendor !== food.vendor) {
                cafeNowReject('Your cart contains another vendor or an unrelated item. Finish that checkout or remove those items before adding this food.');
                return;
            }
        }

        var previousQuantity = cafeNowCartQuantity(cart, itemId);
        if (previousQuantity + quantity > 2147483647) {
            cafeNowReject('The combined quantity is too large. Update the quantity in your cart.');
            return;
        }

        // Native catalog logic supplies pricing; the browser supplies no price or vendor.
        var result = cart.addToCart({
            sysparm_id: itemId,
            sysparm_quantity: String(quantity),
            variables: variables
        });
        if (typeof result === 'string')
            result = JSON.parse(result);
        if (!result || result.error || result.errMsg || result.errCode || result.error_message ||
                cafeNowCartQuantity(cart, itemId) < previousQuantity + quantity) {
            cafeNowReject('The cart update could not be confirmed. Check your cart before trying again.');
            return;
        }

        data.quick_add.success = true;
        data.quick_add.item_name = food.name;
        data.quick_add.quantity = quantity;
        data.quick_add.message = gs.getMessage('Added {0} x {1} to your cart.', [String(quantity), food.name]);
    }

    function cafeNowGetFood(itemId) {
        var item = new GlideRecordSecure('sc_cat_item');
        if (!item.get(itemId) || item.getValue('sys_class_name') !== 'sc_cat_item' ||
                item.getValue('active') !== '1' || !item.isValidField('u_cafenow_menu_item'))
            return null;
        if ((item.isValidField('no_cart') && item.getValue('no_cart') === '1') ||
                (item.isValidField('hide_sp') && item.getValue('hide_sp') === '1') ||
                (item.isValidField('visible_standalone') && item.getValue('visible_standalone') === '0') ||
                (item.isValidField('request_method') && item.getValue('request_method') === 'submit'))
            return null;

        var nativeItem = new sn_sc.CatItem(itemId);
        if (!nativeItem.canView())
            return null;

        // Membership in an accessible catalog associated with this portal is required.
        var portalCatalogs = String($sp.getCatalogs().value || '').split(',');
        var membership = new GlideRecordSecure('sc_cat_item_catalog');
        membership.addQuery('sc_cat_item', itemId);
        membership.addQuery('sc_catalog', 'IN', portalCatalogs.join(','));
        membership.query();
        var catalogAllowed = false;
        while (membership.next()) {
            if (new sn_sc.Catalog(String(membership.getValue('sc_catalog'))).canView()) {
                catalogAllowed = true;
                break;
            }
        }
        if (!catalogAllowed)
            return null;

        var menuId = item.getValue('u_cafenow_menu_item');
        var menu = new GlideRecordSecure('x_1234_cafenow_menu');
        if (!menuId || !menu.get(menuId))
            return null;
        // Respect availability flags if they are later added to Menu.
        var flags = ['active', 'available', 'published'];
        for (var i = 0; i < flags.length; i++) {
            if (menu.isValidField(flags[i]) && menu.getValue(flags[i]) !== '1')
                return null;
        }
        var vendorId = menu.getValue('vendor');
        var vendor = new GlideRecordSecure('x_1234_cafenow_vendor');
        if (!vendorId || !vendor.get(vendorId) || vendor.getValue('active') !== '1')
            return null;
        return {vendor: vendorId, menu: menuId, name: item.getValue('name')};
    }

    function cafeNowGetDefaults(fields, food, quantity) {
        var values = {};
        for (var key in fields) {
            if (!Object.prototype.hasOwnProperty.call(fields, key))
                continue;
            var field = fields[key];
            if (!field)
                continue;
            var name = field.name || key;
            var value = field.value;
            if (name === 'vendor_ref')
                value = food.vendor;
            else if (name === 'meal_option')
                value = food.menu;
            else if (name === 'quantity')
                value = String(quantity);
            else if (name === 'accept_terms')
                value = 'false'; // Quick add never provides consent.
            else if (name === 'pickup_window' || name === 'pickup_window_ref' ||
                    name === 'pickup_date' || name === 'cutoff_datetime')
                value = ''; // These are selected/derived by checkout, not by adding a food.

            var scalar = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
            var valueText = scalar ? String(value) : '';
            var fieldType = String(field.type || '').toLowerCase();
            var checkbox = fieldType === 'boolean' || fieldType === 'checkbox' || fieldType === '7' || name === 'accept_terms';
            var empty = !scalar || valueText.replace(/^\s+|\s+$/g, '') === '' ||
                (checkbox && valueText !== 'true' && valueText !== '1');
            if ((field.mandatory === true || field.mandatory === 1 || field.mandatory === 'true' || field.mandatory === '1') && empty) {
                data.quick_add.message = gs.getMessage('Complete the required option "{0}" using View Details. Checkout-only questions must first be configured as optional on the food form.', [String(field.label || name)]);
                return null;
            }
            if (scalar)
                values[name] = valueText;
        }
        return values;
    }

    function cafeNowCartQuantity(cart, itemId) {
        var total = 0;
        var rows = cart.getCartItems();
        while (rows.next()) {
            if (String(rows.getValue('cat_item')) === itemId)
                total += Number(rows.getValue('quantity')) || 0;
        }
        return total;
    }

    function cafeNowReject(message) {
        data.quick_add.message = gs.getMessage(message);
    }
