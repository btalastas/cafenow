(function() {
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


	if (input && input.category_id)
		data.category_id = input.category_id;
	else
		data.category_id = $sp.getParameter("sys_id");

	data.error = '';
	data.catalog_id = $sp.getParameter("catalog_id") ? $sp.getParameter("catalog_id") + "" : "-1";
	var catalogsInPortal = ($sp.getCatalogs().value + "").split(",");
	var isCatalogAccessibleViaPortal = data.catalog_id == -1 ? true : false;
	catalogsInPortal.forEach(function(catalogSysId) {
		if (data.catalog_id == catalogSysId) {
			isCatalogAccessibleViaPortal = true;
		}
	});
	data.categorySelected = gs.getMessage('category selected');
	if(!isCatalogAccessibleViaPortal) {
		data.error = gs.getMessage("You do not have permission to see this catalog");
		return;
	}
	var catalogDisplayValue;
	if (data.catalog_id && data.catalog_id !== "-1") {
		var catalogObj = new sn_sc.Catalog(data.catalog_id);
		if (catalogObj) {
			if (!catalogObj.canView()) {
				data.error = gs.getMessage("You do not have permission to see this catalog");
				return;
			}
			catalogDisplayValue = catalogObj.getTitle();
		}
	}
	if (options && options.sys_id)
		data.category_id = options.sys_id;
	data.showPrices = $sp.showCatalogPrices();

	if (options.page) {
		var page = new GlideRecord('sp_page');
		if (page.get(options.page))
			data.page = page.id + '';
	}

	data.sc_category_page = data.page || "sc_category";
	catalogDisplayValue = catalogDisplayValue ? catalogDisplayValue : $sp.getCatalogs().displayValue + "";
	var catalogIDs = (data.catalog_id && data.catalog_id !== "-1") ? data.catalog_id : $sp.getCatalogs().value + "";
	var catalogArr = catalogDisplayValue.split(",");
	var catalogIDArr = catalogIDs.split(",");
	data.sc_catalog = catalogArr.length > 1 ? "" : catalogArr[0];

	data.show_more = false;

	if (gs.nil(data.category_id)) {
		if (options.use_popular_items_v2 == "true" && options.popular_items_created != 0)
			data.popularItemsWidget = $sp.getWidget("sc_popular_items_v2",{
				"popular_items_created": options.popular_items_created,
				"limit": 6,
				"catalogs": catalogIDArr,
				"show_no_data_message" : false,
				"isServiceWorkspace" : String(inServiceWorkspace()),
				"legacy_catalog" : options.legacy_catalog || false,
			});
		else
			data.items = getPopularItems();

		data.show_popular_item = true;
		data.all_catalog_msg = (($sp.getCatalogs().value + "").split(",")).length > 1 ? gs.getMessage("All Catalogs") : "";
		data.all_cat_msg = gs.getMessage("All Categories");
		data.category = {title: gs.getMessage("Popular Items"),
									 description: ''};
		return;
	}

	data.show_popular_item = false;
	// Does user have permission to see this category?
	var categoryId = '' + data.category_id;
	var categoryJS = new sn_sc.CatCategory(categoryId);
	if (!categoryJS.canView()) {
		data.error = gs.getMessage("You do not have permission to see this category");
		return;
	} else {
		var categoryCatalog = categoryJS.getCatalog();
		if (catalogsInPortal && categoryCatalog && catalogsInPortal.indexOf(categoryCatalog) === -1 && gs.getProperty('glide.sc.portal.honour_portal_catalogs', 'true') + '' === 'true') {
			data.error = gs.getMessage("You do not have permission to see this category");
			return;
		}
	}

	data.category = {title: categoryJS.getTitle(),
									 description: categoryJS.getDescription()};

	var catalog = $sp.getCatalogs().value;

	data.items = [];
	var itemsInPage = options.limit_item || 9;

	data.limit = itemsInPage;
	if (input && input.new_limit)
		data.limit = input.new_limit;
	if (input && input.items) {
		data.items = input.items.slice();//Copy the input array
	}

	if (input && input.startWindow) {
		data.endWindow = input.endWindow;
	}
	else {
		data.startWindow = 0;
		data.endWindow = 0;
	}

	var searchCatalog = GlideStringUtil.isEligibleSysID(categoryId)? '' : catalog;
	while (data.items.length < data.limit + 1) {
		data.startWindow = data.endWindow;
		data.endWindow = data.endWindow + itemsInPage;
		var itemGR = queryItems(searchCatalog, categoryId, data.startWindow, data.endWindow);
		if (!itemGR.hasNext())
			break;
		fetchItemDetails(itemGR, data.items);
	}

	if (data.items.length > data.limit)
			data.show_more = true;

	data.more_msg = gs.getMessage(" Showing {0} items", data.limit);

	data.categories = [];
	while(categoryJS && categoryJS.getParent()) {
		var parentId =  categoryJS.getParent();
		categoryJS = new sn_sc.CatCategory(parentId);
		var category = {
			label: categoryJS.getTitle(),
			url: '?id='+data.sc_category_page+'&sys_id=' + parentId
		};
		data.categories.unshift(category);
	}

	data.all_catalog_msg = (($sp.getCatalogs().value + "").split(",")).length > 1 ? gs.getMessage("All Catalogs") : "";

	function fetchItemDetails(itemRecord, items) {
		while (itemRecord.next()) {
				var catalogItemJS = new sn_sc.CatItem(itemRecord.getUniqueValue());
				if (!catalogItemJS.canView())
					continue;

				var catItemDetails = catalogItemJS.getItemSummary();
				var item = {};
				item.name = catItemDetails.name;
				item.short_description = catItemDetails.short_description;
				item.picture = catItemDetails.picture;
				item.price = catItemDetails.price;
				item.sys_id = catItemDetails.sys_id;
				item.hasPrice = catItemDetails.show_price;
				item.page = 'sc_cat_item';
				item.type = catItemDetails.type;
				item.order = catItemDetails.order;
				item.sys_class_name = catItemDetails.sys_class_name;
                item.cafenow_can_quick_add = itemRecord.getValue('sys_class_name') === 'sc_cat_item' &&
                    itemRecord.isValidField('u_cafenow_menu_item') &&
                    !!itemRecord.getValue('u_cafenow_menu_item');
				item.titleTag = catItemDetails.name;
				item.legacy = catItemDetails.legacy;
				if (item.type == 'order_guide') {
					item.page = 'sc_cat_item_guide';
				} else if (item.type == 'content_item') {
					item.content_type = catItemDetails.content_type;
					item.url = catItemDetails.url;
					if (item.content_type == 'kb') {
						item.kb_article = catItemDetails.kb_article;
						item.page = 'kb_article';
					} else if (item.content_type == 'external') {
						item.target = '_blank';
						item.titleTag = catItemDetails.name + " ➚";
					} else if (item.content_type == 'dynamic') {
						var dynamicContentItemConfig = catItemDetails.dynamic;
						item.dynamicPortalConfig = new global.DynamicCatalogContentUtil().getServicePortalConfig(dynamicContentItemConfig.model, dynamicContentItemConfig.content);
					}
				}
				items.push(item);
			}
	}

	function queryItems(catalog, categoryId, startWindow, endWindow) {
			var scRecord = new sn_sc.CatalogSearch().search(catalog, categoryId, '', false, options.show_items_from_child != 'true');
			scRecord.addQuery('sys_class_name', 'NOT IN', 'sc_cat_item_wizard');
            if (!inServiceWorkspace()) {
                scRecord.addEncodedQuery('hide_sp=false^ORhide_spISEMPTY');
            }
            scRecord.addQuery('visible_standalone', true);
			scRecord.chooseWindow(startWindow, endWindow);
			scRecord.orderBy('order');
			scRecord.orderBy('name');
			scRecord.query();
			return scRecord;
	}

	function getPopularItems() {
        return new SCPopularItems().useOptimisedQuery(gs.getProperty('glide.sc.portal.popular_items.optimize', true) + '' == 'true')
            .baseQuery(options.popular_items_created + '')
            .allowedItems(getAllowedCatalogItems())
            .visibleStandalone(true)
            .visibleServicePortal(!inServiceWorkspace())
            .itemsLimit(6)
            .restrictedItemTypes('sc_cat_item_guide,sc_cat_item_wizard,sc_cat_item_content,sc_cat_item_producer'.split(','))
            .itemValidator(function(item, itemDetails) {
                if (!item.canView() || (!item.isVisibleServicePortal() && !inServiceWorkspace()))
                    return false;

                return true;
            })
            .responseObjectFormatter(function(item, itemType, itemCount) {
                return {
                    order: 0 - itemCount,
                    name: item.name,
                    short_description: item.short_description,
                    picture: item.picture,
                    price: item.price,
                    sys_id: item.sys_id,
                    hasPrice: item.price != 0,
                    page: itemType == 'sc_cat_item_guide' ? 'sc_cat_item_guide' : 'sc_cat_item'
                };
            })
            .generate();
    }

	function getAllowedCatalogItems () {
		var allowedItems = [];
		catalogIDArr.forEach(function(catalogID) {
			var catalogObj = new sn_sc.Catalog(catalogID);
			var catItemIds = catalogObj.getCatalogItemIds();
			for(var i=0; i<catItemIds.length; i++) {
				if (allowedItems.indexOf(catItemIds[i]) === -1)
					 allowedItems.push(catItemIds[i]);
			}
		});
		return allowedItems;
	}

	function isAttrTrue(value) {
		return value === 'true' || value === true;
	}

	function inServiceWorkspace() {
		return isAttrTrue(options.isServiceWorkspace) && !isAttrTrue(options.legacy_catalog);
	}

})();
