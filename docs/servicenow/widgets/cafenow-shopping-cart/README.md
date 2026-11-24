# CafeNow Shopping Cart - standalone widget

Prepared November 7, 2026 at the user's request for an own widget similar to SC Shopping Cart after cloning failed. The current four components are independent of cloned SC Shopping Cart UI code. Earlier local clone derivatives are retained in `clone-reference/`; original user attachments and application exports remain untouched.

## Create in ServiceNow

1. Select the **CafeNow** application. Open Service Portal Configuration > Widget Editor > **Create a new widget** (do not Clone).
2. Name it **CafeNow Shopping Cart Custom**. Use an unused ID such as `cafenow_cart_custom`. Keep **Public unchecked**. Verify the Application is CafeNow and apply the actual employee role if needed; its technical name is not established here.
3. Paste [template.html](template.html) into Body HTML template, [server.js](server.js) into Server Script, [client.js](client.js) into Client Script, and [style.css](style.css) into CSS. Save. No option schema, cartTemplate, Angular ng-template, dependency records, mobile helpers or embedded checkout widgets are required by these files.
4. In Cafe Menu (`cafe_menu`) Designer add exactly **one** new widget instance in the right column. Remove only obsolete cart page instances; retain widget definitions. Suggested row widths: 3 Categories / 6 Category Items / 3 Cart.
5. Test as an employee. A cart-access error requires checking the specific sc_cart/sc_cart_item ACL or cross-scope issue; do not grant broad table access just to suppress it.

## Behavior

Own markup approximates the SC cart sidebar: Your Cart heading and unit count, item list, numeric quantity with Update, Remove confirmation, empty state, Refresh, Continue ordering and Review cart and checkout. It reads the current user's existing native DEFAULT cart, the same cart used by CafeNow category quick add. It creates no parallel cart, food/order table, request or order. The whole native default cart is shown, including any unrelated item already in it; no rows are secretly discarded or mixed-vendor enforcement claimed.

The full-cart link is `?id=cafenow_cart`, set near the top of Server Script and updated November 8 after the user supplied the cloned page configuration. It navigates to the CafeNow full cart and does not submit an order. Continue ordering uses `?id=cafe_menu`. Verify both pages work in this portal and do not put this sidebar alone on cafenow_cart in place of the full checkout UI. Existing checkout still needs one vendor/pickup/terms/capacity validation and one authoritative CafeNow Order; this sidebar does not implement that boundary.

Pricing is deliberately reviewed in the full cart. This version has no price/subtotal UI because variable-adjusted, localized cart pricing data was not supplied or verified. It does not multiply catalog base prices or claim a final total. No checkout modal, save bundle, Clear all or native-mobile controls are included. These are explicit differences from the full SC Shopping Cart.

## Server access and operations

- Only a signed-in user reaches CartJS. The server resolves cart ID itself using `new sn_sc.CartJS()` and verifies sc_cart.user is the current user and sc_cart.name is DEFAULT with GlideRecordSecure and field-read checks. Browser cart/user/table/price values are never used.
- The item list is queried from sc_cart_item with that fixed cart ID and record/field read checks. Native cart reference display names supply names. Fields are not editable merely because the template shows them.
- Quantity requires a current-cart record, record/field write permissions and a positive whole number no larger than 2147483647. Calls CartJS.updateItem and re-reads to confirm the saved quantity.
- Removal requires current-cart membership, read/delete permissions and GlideRecordSecure.deleteRecord success. Normal record deletion/business rules apply; no raw SQL or workflow suppression is used. This path needs live comparison with native cart removal behavior.
- Unknown actions, including checkout, are rejected. Server failures return a visible message. Mutations in concurrent sessions are not atomic across ownership checks and writes; final checkout must revalidate current cart and vendor/window constraints. No multi-session lock is claimed.
- The client listens for category quick-add cart events, debounces refreshes, queues refresh during an active mutation, ignores its own update broadcast, blocks duplicate submissions and cleans listeners/timers on destruction. No automatic record watch or cross-session refresh is included; manual Refresh reads current data.

## Verification

Executed `node docs/servicenow/widgets/cafenow-shopping-cart/verify.cjs`: 34 mocked server/client checks passed. Covers own/foreign/default/named carts, guest, record/field ACL denial, invalid quantities, update confirmation, removal permissions/failure, unsupported actions, API errors, repeated clicks, removal confirmation, queued refresh, self-event suppression and cleanup. Both scripts parse. These are local checks; they do not establish target-release API availability, live ACLs, business-rule effects, checkout integration or rendered appearance.

Instance checklist:

- Empty employee cart is visible in Designer/portal without cartTemplate. Guest receives no cart data. Employee A cannot query/change/delete B's line by submitting its sys_id, even if A has broad administrative permissions.
- Add food through CafeNow Category Items; confirm the sidebar refreshes. Update quantity, reject decimal/zero/negative quantities, remove with confirmation, keep item, remove last item and refresh after a network/server error.
- Verify existing cart variables remain intact after quantity update and removal behaves like native cart removal. Test denied field/write/delete ACLs without expanding rights blindly.
- Verify compact 3-column width, mobile stacking, labels, keyboard focus and confirmation buttons. Confirm full-cart link and native checkout path; no pickup/capacity/fulfillment claim follows merely from navigation.

Sources: user's request/pasted native cart components, [CartJS scoped API](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_CartJSScoped.html), [ordering review](../../../planning/ORDERING-REVIEW-2026-11-06.md), and C02/U02/S04/T07/T09 in the detailed task guide. Target instance/release/connection remain unverified. Live status stays on the shared VTB.
