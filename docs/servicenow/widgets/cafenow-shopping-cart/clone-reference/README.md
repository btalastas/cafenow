# CafeNow Shopping Cart repair

Prepared November 7, 2026 from the user's attached SC Shopping Cart server/client scripts and pasted HTML. Preserves original attachments and the native catalog cart. These files are a targeted local derivative, not verified instance configuration.

## Install

In **CafeNow Shopping Cart** Widget Editor replace Server Script with [server.js](server.js), Client Script with [client.js](client.js), and optionally Body HTML with [template.html](template.html) (same behavior as supplied HTML). Preserve cloned CSS, dependencies, Angular ng-templates and option schema. Do not use Categories or My Open Orders scripts/schema here.

In the page instance, copy the original SC Shopping Cart's `cartTemplate` value exactly. The supplied HTML renders an external Angular template using `ng-include`; it contains no cart rows itself. Verify that the named ng-template is available to the clone, including associated dependencies/template records. If `cartTemplate` is absent the explicit error appears; if its referenced template is unavailable the include can remain blank. No template name is guessed in this patch. Compare the original instance's other options, especially auto update and redirect settings.

## Changes and limits

- The reported scoped choice list has numeric `size`, whereas the pasted loop invokes `size()`. The derivative accepts either numeric size or callable size. Choice `.get()`/value/label behavior remains inherited and must be tested live; no official choice-list scope contract was established by the documentation search.
- Injects `$rootScope`, which the supplied client uses without declaring it. Replaces two jQuery `.size()` uses with `.length` and fixes one `scope` typo in native clear-cart handling.
- Uses current user's `DEFAULT` CartJS cart, aligning with CafeNow quick add. Ignores browser-supplied alternate cart names. Named-cart browsing is outside this derivative.
- Quantity changes require a valid item id, positive integer no larger than 2147483647, record/quantity write permissions and membership in that cart. Calls documented [CartJS updateItem](https://www.servicenow.com/docs/r/xanadu/api-reference/server-api-reference/c_CartJSScoped.html) instead of the supplied raw record update guarded only by read permission. Cart pricing remains native. This is not checkout capacity or availability validation.
- The pasted legacy `save_cart` branch used `SPCart` and an undefined `cart` variable. It now explicitly rejects that action as not configured. The existing `sc_save_bundle` modal path remains inherited and requires testing; no save/restore capability is claimed.

Checkout still embeds **`sc-checkout`**, and native full-cart/request/item links remain inherited. This repair does not implement pickup selection, change checkout to `cafenow-checkout`, enforce one-vendor checkout, or create an authoritative CafeNow Order. Establish the actual checkout clone before changing routing. Shared helpers including GlobalServiceCatalogUtil, CatalogExceptionUtils, CartJS extended methods and embedded widgets still require target-release and cross-scope validation. Do not grant broad table access to hide errors.

## Checks

Run `node docs/servicenow/widgets/cafenow-shopping-cart/verify.cjs` from project root. Local mock checks cover numeric/callable choice sizes, reproduction of the original size exception, default-cart binding, quantity validation, foreign-cart/record/field denial and explicit legacy save rejection. Both scripts parse; client source assertions check dependency injection/jQuery fixes. No Angular template, actual API, native mobile or checkout integration was executed.

In the instance, verify initial rendering with the original cartTemplate; quick-add refresh; quantity change; removal/empty-cart behavior; employee isolation and foreign cart ids; then checkout with test data only after its pickup/order flow is ready. Validate the two-step validation-failure path and helper scope errors separately. Confirm `$scope.setFocusEmptyCartHeading` is supplied by the retained template/dependencies. Any further runtime error should be captured with widget name and line number.

Sources: user-pasted scripts/HTML, prior runtime screenshot, [CartJS documentation](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_CartJSScoped.html), and [ordering review](../../../planning/ORDERING-REVIEW-2026-11-06.md). C02/U02/S04/T07/T09 retain live status on the shared VTB.
