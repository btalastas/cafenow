# CafeNow Category Items: direct Add to Cart

Prepared November 6, 2026 from the three user-pasted SC Category Page components. Target widget name: **CafeNow Category Items**. Target ID shown by the user: **`cafenow_category_items`**. Verify Application = CafeNow in the instance. No instance has been changed from this workspace.

## Install the three complete components

In your CafeNow widget copy, replace the entire contents of the matching fields:

| Widget field | Complete replacement file |
| --- | --- |
| HTML Template | [template.html](template.html) |
| Client Script / Client Controller | [client.js](client.js) |
| Server Script | [server.js](server.js) |

Keep the original copied CSS, Link function, option schema, dependencies and template relationships. The supplied Client Script uses `api.controller = function(...) { ... };` and the existing dependency list. It uses the existing `$scope` bindings. Keep the widget's current controllerAs configuration.

Replace the **SC Category Page instance on `cafe_menu`** with **CafeNow Category Items**. Preserve its instance options, including item count, click event, catalog breadcrumb page and child-category behavior; a widget clone does not guarantee instance settings are copied. Keep SC Categories on the left and the native shopping cart below. Do not add a second duplicate category-item widget.

The `quick-add-*` files are implementation excerpts already incorporated into the full components. Do not paste them a second time. [changes.patch](changes.patch) shows the source differences.

## Behavior

- Quantity and Add to Cart controls are added in both category card and table views, outside the item links. View Details remains available.
- Controls appear for ordinary Catalog Items with a populated `u_cafenow_menu_item`. Producers, order guides, content items and unmapped foods keep their existing details path.
- The server reads the selected Catalog Item, checks native visibility and accessible portal catalog membership, then resolves Menu -> Vendor with read-ACL-aware queries. It rejects disabled items/vendors and any Menu availability flags present in the actual schema.
- Quantity must be a positive integer within the native signed-integer range. That technical range is not a product meal limit or the 20-order window capacity.
- The server inspects the current user's DEFAULT native catalog cart. A different vendor, unrelated item or invalid mapping blocks the add without clearing the cart. Client-supplied vendor/price are ignored; native catalog pricing is used.
- A confirmed add broadcasts the same cart refresh events seen in the user-supplied Catalog Item source. The browser disables quick-add controls while one request is outstanding. Network failures do not automatically retry; check the cart before trying again.
- The action response stays separate from category-list data. Original category selection, view switching, pagination and details links remain in the supplied code.

## Reported preview error corrected

The user reported `Cannot find function nil in object function GlideStringUtil()` at server line 232. That call was retained from the supplied original. The replacement now uses `gs.nil(data.category_id)`, the documented scoped empty-value check. `GlideStringUtil.isEligibleSysID` remains because it is documented for scoped/global use. The original non-V2 `SCPopularItems` helper is still an unverified inherited dependency; this fix does not claim that every legacy path is scope-compatible. No source dependency was moved into Global or granted new access.

Repaste the corrected Server Script or replace that single call on the instance, then retest category selection. HTML and Client Script do not change for this fix. Live resolution of the screenshot error has not been verified from this workspace.

## Required variables: configure the journey before enabling quick checkout

Your current variable set contains required questions. Quick add does not silently bypass them:

- Pickup Window, Pickup Date and terms are to be asked/enforced by the intended checkout implementation. While mandatory on the food form, they deliberately prevent quick add. Configure them as optional storage variables/hidden on foods only when the checkout replacement actually captures and validates them. Checkout pickup/terms functionality is not part of this change.
- Required food-specific questions without defaults, such as Allergies, return a message directing the employee to View Details. Keep that path or explicitly design those inputs on the food card. Do not assume an allergy answer for the customer.
- Quick add never accepts terms on the customer's behalf, even if a checkbox default was configured as true. An optional terms storage variable is written as false at add time.
- Existing `vendor_ref` and `meal_option`, if retained, receive the trusted Vendor and Menu references; they do not prompt the employee again.
- A retained legacy `quantity` variable receives the selected quantity on add only. Use native cart/RITM quantity as authoritative, including after cart edits; remove the redundant custom quantity input and stop relying on its stale answer before acceptance.
- Other primitive configured defaults are preserved. Dynamic client scripts/UI policies and complex variables are not a substitute for server validation; test applicable item requirements before enabling quick add for those foods.

Begin with an active, mapped food with no unanswered required questions. This proves the native cart connection without weakening existing submission requirements.

## Boundaries and instance verification

This code is prepared configuration, not a deployed or accepted application feature. It uses `sn_sc.CartJS`, `sn_sc.CatItem`, `sn_sc.Catalog`, `$sp.getCatalogItem` and `GlideRecordSecure`. Cross-scope access, catalog-variable metadata and role ACL behavior must be verified in the actual CafeNow application. Do not broaden access just to suppress a scope error.

The action targets the logged-in user's default cart. Confirm that the embedded shopping cart uses that same cart. Named/Order Now carts need explicit separate integration. The code does not use the older browser-session `cafeCart` prototype.

The guard rejects sequential mixed-vendor adds but is not an atomic lock across concurrent browser sessions. Revalidate all item vendors during final checkout and before accepting an Order. Selecting another vendor category is still possible; locking or filtering the separate SC Categories widget is not implemented here.

Pickup cutoff/capacity reservation and one-parent Order creation are final-checkout/acceptance responsibilities; adding food does not reserve a window. This feature creates cart items, not CafeNow Orders. It does not implement checkout pickup capture or duplicate-Order prevention.

Quick-add controls are added to this widget's category list. If the separate embedded Popular Items V2 widget renders instead, its cards are unchanged; choose a vendor category for this implementation. Its original code and other inherited dependencies still need scoped-widget smoke testing.

## Checks and test handoff

Local command executed:

```text
node docs/servicenow/widgets/cafenow-category-items/verify-quick-add.cjs
```

Result: **34 local contract checks passed**, including JavaScript parsing, positive adds, same-vendor preservation, invalid quantities/IDs, visibility/read/catalog restrictions, missing mappings, inactive/unavailable records, mixed vendors, required options/consent, native errors and no-confirmed-mutation behavior. A client check verifies in-flight double-click suppression and native cart refresh events. Additional rendering regressions cover a selected category and the Popular Items V2 landing branch, and reproduce the reported failure when the old call is restored. APIs were stubbed: these do not prove the real ServiceNow APIs, cross-scope access, rendered layout or cart refresh work.

Execute in the instance using an employee identity:

1. Select a vendor category; inspect quantity/button in card and table views and check mobile sizing.
2. Add quantity 2 of a simple eligible food; confirm exactly the expected food/quantity/price appears in the native cart below without opening the item.
3. Add another food from the same vendor, then try another vendor. Verify denial leaves the cart unchanged; test after removing the last cart item.
4. Verify invalid quantities, missing mappings, unavailable foods and protected data cannot be bypassed through a direct action request.
5. Try a food with a required unanswered option and mandatory terms; verify quick add directs to View Details and does not assert acceptance.
6. Check repeated adds, a rapid double click and network/error recovery by inspecting actual cart contents. Test multiple tabs and revalidation at checkout.
7. Check category navigation, pagination, details links, cart editing and checkout still behave correctly; record results on existing C02/U02/B01/T02/T07/T09 VTB cards.

## Official reference

[CartJS scoped API](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_CartJSScoped.html) documents `addToCart` and `getCartItems`. Validate documentation against the target instance release. The native refresh event names are taken from the Catalog Item Client Script supplied by the user in this conversation.
