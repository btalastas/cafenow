# CafeNow custom cart and pickup checkout

> Superseded for new ordering work: the user selected direct Vendor/Menu ordering with Order Lines on November 9. This package still uses Catalog Items/CartJS/Request/RITMs. Preserve it as historical source; do not install unchanged for the new route. Follow the [direct Menu migration map](../../../planning/DIRECT-MENU-PORTAL-MIGRATION.md). Its additional technical tables are implementation choices of the older route, not new-route requirements.

Prepared November 9, 2026 for the user's existing `cafenow_cart` page. This is a new standalone widget, not another patch to SC Shopping Cart. It uses the existing native DEFAULT catalog cart, Catalog Items, Menu/Vendor mapping, Pickup Window records and authoritative CafeNow Order. The sidebar continues to work with that same cart. Original clones/exports remain unchanged.

The user confirmed **America/New_York** for building pickup times. No ServiceNow connection, release or live deployment was verified. Source is ready for installation and instance testing; local mocked checks are not evidence of live compatibility or concurrency.

## What the user sees

1. Browse CafeNow food Catalog Items and add multiple foods/quantities from one vendor.
2. Open `/cafe?id=cafenow_cart`: food names, quantities, Update/Remove, native unit-price strings and native subtotal.
3. Click **Proceed to checkout**. Choose one of that vendor's active, eligible Pickup Window records, enter optional order instructions and accept terms once.
4. Submit. The server reserves one order place, submits the native cart as the current employee and saves the resulting Request reference.
5. A Flow action verifies all food RITMs, creates one CafeNow Order and links the RITMs. Confirmation says **Request submitted** while that processing completes; it does not claim vendor confirmation or email delivery.

```text
Catalog Item.u_cafenow_menu_item -> Menu.vendor -> Vendor
                                                     |
                                Pickup Window.vendor-+

Checkout.pickup_window -> selected Pickup Window.sys_id
Checkout.request       -> native Request -> food RITMs
Order.checkout_context -> Checkout
Order's window field   -> SAME selected Pickup Window.sys_id
Order.pickup_date      -> building-local service date
```

`time_slot_v2` on Pickup Window is the readable label. The checkout dropdown value is always that row's sys_id. The same label at Pizza Hut and Firehouse Subs represents distinct vendor-specific records. Never use a category sys_id as a Vendor sys_id or a time string as a record reference.

## Files to paste

| Destination | File |
| --- | --- |
| New same-scope Script Include `CafeNowCheckout` | [CafeNowCheckout.js](CafeNowCheckout.js) |
| Widget Server Script | [server.js](server.js) |
| Widget Client Script | [client.js](client.js) |
| Widget Body HTML template | [template.html](template.html) |
| Widget CSS | [style.css](style.css) |
| Widget Option schema | [option-schema.json](option-schema.json), containing `[]` |
| Field/index/property setup reference | [schema.json](schema.json) |
| Flow Designer action Script step | [create-order-action.js](create-order-action.js) |
| Before-insert Order Business Rule | [order-insert-guard.js](order-insert-guard.js) |
| After-update cancellation capacity release | [release-canceled-reservation.js](release-canceled-reservation.js) |
| Before-update booked-window protection | [protect-booked-window.js](protect-booked-window.js) |
| Explicit-list legacy capacity migration Fix Script | [backfill-legacy-reservations.js](backfill-legacy-reservations.js) |

No cartTemplate, Angular ng-template, cloned checkout modal, GlobalServiceCatalogUtil, SPCart or GlideChoiceList is used. The Script Include is not client-callable; the authorized widget server is its entry point. Do not paste the long Script Include into the short widget Server Script field.

## Step 1 - Verify existing references

Use the CafeNow application and an isolated development/test instance. Verify its actual release, CartJS availability, scope privileges and ability to create the two technical tables before instance work. Existing identifiers below come from the retained export/user reports; generated names in a different application scope will differ.

| Table | Required existing fields |
| --- | --- |
| `sc_cat_item` | `u_cafenow_menu_item` referencing `x_1234_cafenow_menu`; food is active, visible, orderable and in CafeNow catalog |
| `x_1234_cafenow_menu` | `vendor` referencing `x_1234_cafenow_vendor`; availability flags are honored if present |
| `x_1234_cafenow_vendor` | `name`, `active`, `vendor_group` referencing the vendor's protected parent group |
| `x_1234_cafenow_pickup_window` | `vendor`, `is_active`, `start_time`, `end_time`, `time_slot_v2`, `max_order_capacity` |
| `x_1234_cafenow_order` | `vendor`, actual Pickup Window reference, `source_request`, employee/recipient reference, `location`, `assignment_group`, `state` |
| `sc_req_item` | `x_1234_cafenow_cafenow` referencing CafeNow Order (retained export name; verify) |

Your latest Order field report is `time_slot_v2`. The older export used `pickup_window`. Configure ONE actual Order reference with `checkout.order_window_field`; this package does not add a second window reference or silently choose between both. Verify it points to Pickup Window. Do not reuse the older reference to Operations.

## Step 2 - Add the technical storage and Order date

Create **CafeNow Checkout** and **CafeNow Pickup Reservation** as ordinary scoped tables, with no Task extension, using every field and type in [schema.json](schema.json). These are checkout metadata and capacity holds, not another fulfillment/order table. Keep the existing Task-based CafeNow Order.

Create/verify these Order fields:

- `pickup_date`: Date, representing the actual day of pickup. `time_slot_v2` is not a date. Do not fill historical dates from Created unless independently confirmed.
- `checkout_context`: Reference to CafeNow Checkout, with a real UNIQUE database index for populated values. Verify that existing blank legacy references remain permissible in the target release/database.

Create these real database UNIQUE indexes:

1. Checkout.`token`: duplicate submission identity.
2. Checkout.`cart_key`: only one in-flight checkout for the same native cart.
3. Reservation.`slot_key`: one claimant per vendor/date/window/seat number.
4. Reservation.`checkout`: at most one capacity seat for an attempt.
5. Order.`checkout_context`: at most one authoritative Order for the checkout.

The manifest also lists query indexes. Field labels are not indexes. In development, explicitly attempt duplicate nonblank values and confirm database rejection before marking storage verified. Restore/remove only the disposable records used by your test. Never drop an index or remove existing records merely to make this package install.

Restrict direct CRUD on both new technical tables to trusted application administrators/system operations. Employees and vendors must not create/edit tokens, acceptance timestamps, states or seat claims through forms/APIs. Service methods use fixed internal GlideRecord writes after their own authorization checks. Review this intentional service boundary and application-access privileges.

## Step 3 - Configure properties and time storage

Create the application system properties listed in [schema.json](schema.json). All start with `x_1234_cafenow.checkout.`:

| Suffix | Value |
| --- | --- |
| `catalog_id` | Actual CafeNow Catalog record sys_id |
| `timezone` | `America/New_York`, confirmed by user |
| `window_time_storage` | Verified `wall_clock` or `utc_1970`; see below |
| `terms_url` | Actual same-portal page such as `?id=cafenow_terms`; publish/review the page first |
| `terms_version` | Version of the actual displayed terms; change whenever the terms change |
| `building_location` | Actual `cmn_location` record sys_id; the Order form shows Location mandatory |
| `order_window_field` | Actual Order reference technical name, e.g. `time_slot_v2` |
| `order_user_field` | Verified recipient reference; default `opened_by` supports self ordering, not on-behalf ordering |
| `enabled` | **false** initially |
| `storage_verified` | **false** initially |
| `enforce_order_guard` | **false** during setup; true before employee submission is enabled |

Verify time storage using one known 11:30 AM New York window. As an administrator in the CafeNow scope, inspect the **raw** values (not only the list display):

```javascript
var window = new GlideRecord('x_1234_cafenow_pickup_window');
if (window.get('PASTE_KNOWN_WINDOW_SYS_ID')) {
    gs.info('start=' + window.getValue('start_time'));
    gs.info('end=' + window.getValue('end_time'));
    gs.info('label=' + window.getValue('time_slot_v2'));
}
```

- Raw `11:30:00` or `1970-01-01 11:30:00`, intended as local 11:30: use `wall_clock`.
- Raw `1970-01-01 16:30:00`, intended as local 11:30 Eastern on the epoch date: use `utc_1970`. Both start/end must use that representation.
- If neither matches, stop at review mode and inspect the actual dictionary/data encoding. Do not guess an offset or parse the label to authorize a booking. This package blocks unsupported/unconfigured encoding.

The building clock uses a small, host/profile-independent implementation of contemporary New York DST rules, limited to 2007-2030. It deliberately supports only the confirmed New York timezone; review it if timezone law changes or the pilot expands. It is not a general-purpose timezone library. Recurring same-day daytime windows are supported; starts before 04:00 and overnight windows are excluded. The shown 11:00-14:00 windows fit this pilot. Verify label/start/end agreement during setup and both winter/summer cutoffs.

Ordering is closed **at or after** 30 minutes before start. Exact-boundary inclusion had not been finalized in earlier planning; this is a conservative implementation convention to verify with the team, not a newly claimed instructor decision. The interface states the existing 20-minute cancellation cutoff; cancellation authorization/eligible states remain a separate server policy.

## Step 4 - Create the service and widget

1. Go to **System Definition > Script Includes**, create `CafeNowCheckout` in the CafeNow scope, paste [CafeNowCheckout.js](CafeNowCheckout.js). Active=true; Client callable=false; Accessible from=this application scope only.
2. Create a NEW widget: **CafeNow Cart Checkout**, suggested ID `cafenow_cart_checkout`. Public=false. Set the actual CafeNow employee role/criteria if required; do not invent a role identifier from the display name.
3. Paste the four widget components and Option schema from the file table. No dependencies or Angular ng-templates are required.
4. In **CafeNow Shopping Cart (`cafenow_cart`) > Designer**, replace the failing SC Shopping Cart clone instance with CafeNow Cart Checkout. Remove duplicate cart/checkout instances from this copied page; keep original widget definitions intact.
5. Remove the Saved Carts instance from this dedicated page if it offers paths outside this checkout. This widget intentionally supports DEFAULT cart/self ordering only. Keep Scroll to top if desired.
6. Open `/cafe?id=cafenow_cart` directly as an employee. With catalog/time properties configured, cart and pickup review work while submission remains disabled.

Existing sidebar `cart_url` already points to `?id=cafenow_cart`; no further sidebar change is needed. Update any other CafeNow-owned full-cart links to that destination. Keep Global base widgets untouched. An Order Now/named-cart route is not implemented by this widget.

## Step 5 - Remove repeated order-level questions

Preserve the existing CafeNow Ordering variable-set record and historical answers. Once review mode is working, detach the generic order-level set from food Catalog Items, or remove its ordering questions from the food journey, after checking other uses. The new checkout does not need hidden pickup/vendor/terms variables on every food.

| Existing question | New source |
| --- | --- |
| Custom quantity | Native cart quantity only |
| Vendor / meal selection | Catalog Item -> Menu -> Vendor; selected food already identifies the meal |
| Pickup date/window | One checkout selection; date is building-local today |
| Terms | One explicit checkbox; version and acceptance time saved in Checkout |
| Cutoff text/date | Server computation, not an employee answer |
| General special instructions | One checkout textarea, stored in Checkout and native Request instructions |
| Actual food-specific options/allergy instructions | Retain appropriate per-food questions and their native RITM answers; required food options must still be answered |

The retained **Menu import to Catalog Items** flow adds the CafeNow Ordering variable-set association. Update that association step for the new design too, otherwise an import may reattach the removed questions. Keep Menu->Catalog mapping and pricing work intact. Test direct category quick-add again: it should add ordinary foods, while genuine unanswered mandatory food options retain their details path.

Do not blanket-disable mandatory food options to force native submission. The service rechecks cart validation when that native method is available, and uses native submitOrder. Verify actual mandatory validation in your release.

## Step 6 - Create the Order flow and guard rules

1. Preserve and disable/confine the old CafeNow Order-creation flows that trigger for each Request/RITM. Your supplied screenshot includes Orders described as one per RITM; this package requires ONE Order for the complete checkout. Do not delete historical Orders or reset their states.
2. Create a custom Flow Designer action in CafeNow, **Create CafeNow Order from Checkout**. Add String input `checkout_id`, String output `order_id`, and a Script step using [create-order-action.js](create-order-action.js). Map action input to step input and step output back to action output.
3. Create a record-triggered flow on **CafeNow Checkout**, when state changes to `submitted` (created or updated with that condition). Run as system in the CafeNow scope. Call the custom action with the triggering Checkout sys_id. Updating it to `fulfilled` must not trigger another execution.
4. The action verifies recipient, capacity reservation and complete RITM vendor/quantity totals against the locked cart snapshot. It sets Order's vendor, pickup reference/date, recipient, building location, assignment group, Submitted=-5, source Request and checkout context, then links all RITMs. Existing matching Orders are reused on retry. It uses native Request price currency APIs for Order Total; verify field types/currency behavior in the instance.
5. Configure flow failure monitoring: if RITMs are incomplete or linkage fails, inspect the execution, wait for verified completeness/correct configuration, then retry the action. Do not submit a second Request or create a second Order to repair a linking failure. Reservations remain held. This package does not claim a fully automatic reconciliation workflow.
6. Create a **before insert** Business Rule on CafeNow Order with [order-insert-guard.js](order-insert-guard.js), Advanced=true, Order=50. It is controlled by `enforce_order_guard`. It prevents alternate native checkout paths from creating fulfillable CafeNow Orders without a validated context/reservation. Native direct catalog calls may still create Requests; this guard protects CafeNow fulfillment, not every platform catalog endpoint.
7. Create an **after update** Order rule with [release-canceled-reservation.js](release-canceled-reservation.js), condition State changes to Canceled (4). This releases a seat only after an already-authorized cancellation. It does not authorize cancellation, change lifecycle rules, cancel RITMs or send notifications.
8. Create a **before update** Pickup Window rule with [protect-booked-window.js](protect-booked-window.js), Advanced=true, Order=50. Once a window has reservations, its vendor/time/label/capacity cannot change; create a replacement window instead. Active may still be turned off to stop new bookings.

Enforce employee-own-order and vendor-own-vendor ACLs independently across forms, APIs, lists and reporting. Protect Order vendor/window/date/context/source Request/total from employee changes; vendor staff only perform independently authorized lifecycle actions. The widget is not a general table editor.

## Step 7 - Account for existing bookings

The new reservation table is the capacity ledger. Before enabling submission, reconcile existing same-day orders and allocate their capacity too. Twenty means **orders**, not meals. Closed Complete orders have consumed a booking place; canceled orders do not retain a reservation under the prepared release behavior.

Do not manufacture missing dates/window references from list labels or creation timestamps. For reviewed legacy Orders, set the actual date/window/recipient through authorized administration, then use the explicit-list [backfill Fix Script](backfill-legacy-reservations.js) in development with checkout disabled. Empty ORDER_IDS does nothing. Each selected Order receives an internal legacy context and reservation; no terms acceptance is invented and no new Order is created. Review partial failures before rerunning, especially a context/hold created before an Order-link failure.

The submit service blocks a selected vendor with undated open Orders, and blocks a selected vendor/date/window with legacy Orders lacking checkout_context. This prevents known legacy records from being silently ignored by capacity checks. A context with a missing/deleted reservation also requires administrative reconciliation; do not remove holds manually to make room. Verify ledger reconciliation before setting storage_verified.

## Step 8 - Verify and enable

Keep `enabled=false` until the following are verified in the actual instance:

1. Two Pizza Hut foods with different quantities load once, show native prices and only Pizza Hut windows. Repeat for another vendor. Changing vendor empties/resets pickup and terms review appropriately. Mixed/unmapped/inactive foods are rejected server-side.
2. A chosen window sys_id reaches Checkout, then the SAME sys_id/date/vendor reach ONE CafeNow Order with all RITMs linked. No duplicate Order flow executes. Check the vendor widget uses this same authoritative Order window field.
3. Wrong-vendor/inactive/full/late windows, forged vendor/user/price inputs, modified cart snapshots, missing terms and changed terms version cannot submit. Test mandatory food options and native pricing/currency.
4. Test 10:59:59 versus 11:00:00 for an 11:30 New York start, summer and winter, midnight review expiration, different employee profile timezones and the chosen raw Time encoding. Booking/cutoff never uses the label as authority.
5. Test real database unique-index rejection, two simultaneous users competing for the last place, duplicate clicks and two tabs on the same cart. No more than 20 ledger claims and accepted Orders may exist for the vendor/date/window. Mock tests do not prove database isolation.
6. Test a definitely pre-submit failure releases its hold and unlocks its cart. Test a timeout/unknown outcome retains its hold/lock and the UI offers status instead of automatic purchase retry. Known successful token retries return the same Request.
7. Verify legacy bookings, cancellation release exactly once, booked-window protection, employee/vendor direct-record ACL denial, technical-table CRUD denial, terms page accessibility, mobile layout and keyboard navigation.

After unique indexes/schema/legacy ledger tests pass, set `storage_verified=true`. Activate the new flow and guard rules, set `enforce_order_guard=true`, then enable only the dedicated test route with `enabled=true`. Run the successful end-to-end test before promoting it for the employee class demo. Verify role/page visibility as the employee, not only admin.

## Recovery and verification limits

- Checkout `processing`/`unknown` blocks another attempt by the same user until reviewed; a reload/status check returns the pending token. A successful known Request is returned without another native submission.
- If native submitOrder throws or returns an unconfirmed result, it may already have committed. The service retains capacity and cart lock. An administrator must reconcile native Requests/RITMs and logs, then repair the context or release a definitely unused hold. Never auto-expire unknown holds or blindly retry purchases. Status/submit retries return only the context belonging to the current user.
- The custom widget serializes its own cart writes through the checkout lock, and validates a native-details snapshot twice. Other unmodified native cart APIs/widgets do not honor this custom lock. A mutation in the final gap before native submission cannot be made transactional by widget code alone. The Order action compares submitted RITMs to the snapshot and holds mismatches for review instead of creating a fulfillable Order. Test alternate paths; fully atomic cart snapshot submission across all platform endpoints remains an instance integration limitation.
- Seat allocation depends on the real unique indexes, protected schedule metadata and every accepted CafeNow route using this ledger. A property flag is an administrator assertion after verification, not an automated database proof. Do not accept Orders from bypass flows.
- Ledger holds for completed bookings are retained; authorized cancellation deletes its hold. Failed/unknown submission recovery is conservative. Native Request/RITM cancellation synchronization, notifications/delivery, no-show scheduling, on-behalf ordering, named/saved carts, recurring charges and cross-day/overnight windows are not implemented here.
- No instructor approval, live deployment, release compatibility, real simultaneous booking or rendered UI verification is claimed.

## Local checks and sources

Run `node docs/servicenow/widgets/cafenow-cart-checkout/verify.cjs`. 75 checks cover service, Flow and client behavior with mocks, including native cart ownership, permissions, vendor filtering, pickup references, terms/version/date, DST/cutoff, capacity uniqueness, duplicate/unknown outcomes, RITM mapping and retry behavior. Real rendering, ACLs, DB concurrency and scope/API integration require the instance checks above.

Sources: user November 9 request/screenshots/timezone confirmation; [decision record](../../../../DECISIONS.md), [ordering review](../../../planning/ORDERING-REVIEW-2026-11-06.md), [task guide](../../../planning/MVP-FEATURE-TASKS-AND-PROCESSES.md), retained unmodified application export and the existing standalone cart. Existing C02/C03/U02/B01/B02/D04/S04/T02/T03/T07/T09 own delivery evidence on the shared VTB; this guide is not a second task board.

Primary references: [CartJS native cart/details/submitOrder](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_CartJSScoped.html), [scoped digest](https://www.servicenow.com/docs/r/zurich/api-reference/server-api-reference/c_GlideDigestScopedAPI.html), [scoped system/GUID APIs](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_GlideSystemScopedAPI.html), [unique fields](https://www.servicenow.com/docs/r/platform-administration/t_RequiringUniqueValuesForAField.html), [database indexes](https://support.servicenow.com/kb/kb?id=kb_article_view&sysparm_article=KB0870445), [reference display values](https://www.servicenow.com/docs/r/platform-administration/c_DisplayValues.html), [currency value APIs](https://www.servicenow.com/docs/r/platform-administration/currency-administration/currency-values-scripts.html), [North American DST rules](https://nrc.canada.ca/en/certifications-evaluations-standards/canadas-official-time/time-zones-daylight-saving-time). Review corresponding documentation for the actual target release.
