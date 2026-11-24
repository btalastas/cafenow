(function() {
    // CafeNow standalone sidebar. Current user's native DEFAULT cart only.
    data.items = [];
    data.item_count = 0;
    data.quantity_count = 0;
    data.error = '';
    data.notice = '';
    data.ok = false;
    data.signed_in = gs.getUserName() !== 'guest';
    data.cart_url = '?id=cafenow_cart'; // Review in the CafeNow full cart; no order is submitted here.
    data.menu_url = '?id=cafe_menu';
    if (!data.signed_in)
        return;

    try {
        var cart = new sn_sc.CartJS();
        var cartId = String(cart.getCartID());
        var owner = new GlideRecordSecure('sc_cart');
        if (!owner.get(cartId) || !owner.canRead() || !readable(owner, 'user') ||
                !readable(owner, 'name') || String(owner.getValue('user')) !== String(gs.getUserID()) ||
                String(owner.getValue('name')) !== 'DEFAULT') {
            data.error = gs.getMessage('Your cart could not be accessed. Contact the CafeNow team.');
            return;
        }

        var action = input && String(input.action || '');
        if (action && action !== 'refresh') {
            if (action !== 'update_quantity' && action !== 'remove_item') {
                data.error = gs.getMessage('This cart action is not supported.');
            } else {
                changeItem(action, cart, cartId);
            }
        }
        loadItems(cartId);
    } catch (error) {
        data.items = [];
        data.item_count = 0;
        data.quantity_count = 0;
        data.ok = false;
        data.error = gs.getMessage('The cart update could not be confirmed. Refresh your cart before trying again.');
        gs.error('CafeNow standalone cart failed. Check cart ACLs and scoped API access.');
    }

    function changeItem(action, cart, cartId) {
        var itemId = String(input.item_id || '');
        var row = new GlideRecordSecure('sc_cart_item');
        if (!/^[0-9a-f]{32}$/i.test(itemId) || !row.get(itemId) || !row.canRead() ||
                !readable(row, 'cart') || String(row.getValue('cart')) !== cartId) {
            data.error = gs.getMessage('This item is not available in your cart. Refresh and try again.');
            return;
        }
        if (action === 'remove_item') {
            if (!row.canDelete() || !row.deleteRecord()) {
                data.error = gs.getMessage('This item could not be removed. Refresh or contact the CafeNow team.');
                return;
            }
            data.ok = true;
            data.notice = gs.getMessage('Item removed from your cart.');
            return;
        }
        var quantity = Number(input.quantity);
        if ((typeof input.quantity !== 'number' && typeof input.quantity !== 'string') ||
                !isFinite(quantity) || quantity < 1 || quantity % 1 !== 0 || quantity > 2147483647) {
            data.error = gs.getMessage('Enter a positive whole-number quantity.');
            return;
        }
        if (!row.canWrite() || !row.getElement('quantity').canWrite()) {
            data.error = gs.getMessage('You cannot change this quantity. Contact the CafeNow team.');
            return;
        }
        cart.updateItem({sysparm_quantity: String(quantity)}, itemId);
        var check = new GlideRecordSecure('sc_cart_item');
        if (!check.get(itemId) || !readable(check, 'quantity') || !readable(check, 'cart') ||
                String(check.getValue('cart')) !== cartId || Number(check.getValue('quantity')) !== quantity) {
            data.error = gs.getMessage('The quantity update could not be confirmed. Refresh before trying again.');
            return;
        }
        data.ok = true;
        data.notice = gs.getMessage('Cart quantity updated.');
    }

    function loadItems(cartId) {
        var rows = new GlideRecordSecure('sc_cart_item');
        rows.addQuery('cart', cartId);
        rows.orderBy('sys_created_on');
        rows.orderBy('sys_id');
        rows.query();
        while (rows.next()) {
            if (!rows.canRead() || !readable(rows, 'cart') || String(rows.getValue('cart')) !== cartId ||
                    !readable(rows, 'quantity') || !readable(rows, 'cat_item'))
                continue;
            var quantity = Number(rows.getValue('quantity')) || 0;
            data.items.push({
                sys_id: String(rows.getUniqueValue()),
                name: String(rows.getDisplayValue('cat_item') || gs.getMessage('Catalog item')),
                quantity: quantity,
                can_update: rows.canWrite() && rows.getElement('quantity').canWrite(),
                can_remove: rows.canDelete()
            });
            data.item_count++;
            data.quantity_count += quantity;
        }
        data.summary = gs.getMessage('{0} items in your cart', [String(data.quantity_count)]);
    }

    function readable(record, field) {
        return record.isValidField(field) && record.getElement(field).canRead();
    }
})();
