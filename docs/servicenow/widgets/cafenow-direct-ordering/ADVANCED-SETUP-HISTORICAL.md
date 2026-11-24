# CafeNow direct Vendor/Menu ordering - installation items

Start with the [short page-flow and setup guide](QUICK-START.md) for the Vendor -> Menu -> Cart/Pickup -> Order/Order Lines journey. This document holds the complete installation details. The exported menu page ID is `cafe_menu`.

Prepared against the user's [November 9 application export](../../../../exports/sys_remote_update_set_4cb09e8854e813107f44ff1829e40dc0.xml). These are **individual configuration items and complete source files**, not an importable update set. No instance changes were made. Capture your installation in a new CafeNow development update set; do not commit the supplied application snapshot over your current instance merely to install this package.

This implementation keeps the existing Vendor, Menu, Pickup Window, Order and Order Line tables. It creates **ORD + Order Lines directly**, not REQ/RITMs. It does not use CartJS, Catalog Items, variable sets, the earlier Checkout table or a separate reservation table. The cart is browser-local per signed-in user; only Menu sys_ids and quantities plus a retry token are stored. Server prices/vendor/availability always come from the tables.

## Confirmed from the current export

| Area | Observation |
| --- | --- |
| Menu | `x_1234_cafenow_menu`: item_name, description, vendor, price (Price), active, in_stock, item_image, number and older item_number |
| Vendor | `x_1234_cafenow_vendor`: name, active, accepting_orders, vendor_group, location; active/accepting_orders defaults are True, not proof of actual record values |
| Pickup | `x_1234_cafenow_pickup_window`: vendor, start_time/end_time (Time), time_slot_v2 (**Choice**, use display value), is_active, max_order_capacity |
| Order | `x_1234_cafenow_order` extends Task; both `time_slot_v2` and older `pickup_window` reference Pickup Window; source_request and duplicate `vendo0` also exist |
| Order Line | `x_1234_cafenow_order_line`: order->Order, menu_item->Menu, item_name, quantity, unit_price and **line_price** (Currency), number; Instructions absent |
| Cart page | `cafenow_cart` currently references an SC Shopping Cart definition |
| Vendor page | Actual ID is **cafenow_vendor**, singular |
| Order read | Exported employee/vendor-role read ACL has no ownership/group condition; live inherited/other constraints still need review |
| Line read | Currently only CafeNow admin role is granted read |
| State write | Exported condition uses duplicate **vendo0.vendor_group**, rather than authoritative vendor |
| Menu import | Menu import to Catalog Items is active in the saved export; order-creation flows in this export are inactive |

Vendor.menu_items/pickup_windows/orders are single-reference columns. Do not use them as lists of all child records. Query Menu.vendor, PickupWindow.vendor and Order.vendor instead.

No business Vendor/Menu/Window rows are supplied in this configuration export. Runtime price/time encodings and values still require instance checks. Do not use the old Catalog Item price records as a substitute for Menu price validation.

## Pickup dropdown display - November 9 refinement

Cart previews now list readable active Pickup Window records for the cart vendor, using time_slot_v2 display labels and record sys_ids. Preview does not filter by cutoff/capacity or require window_time_storage. Displaying a record does not guarantee booking eligibility: submission still runs the existing time/cutoff/capacity checks and requires full setup, including the previously deferred technical fields. Repaste the updated CafeNowDirectOrdering Script Include; widget files are unchanged.

## 1. Prepare source and fields in CafeNow

Create a dedicated CafeNow update set, for example **CafeNow - Direct Menu Ordering - Nov 9**, to capture the following edits. Verify actual release/modules and scope privileges before installing. Preserve the current export and all historical catalog/request/order records.

Add these six protected fields to **existing Order**, as detailed in [schema.json](schema.json):

| Column | Type | Purpose |
| --- | --- | --- |
| `pickup_date` | Date | Actual New York day, separate from the recurring time window |
| `submission_key` | String(64), UNIQUE index | Current-user submission retry identity |
| `booking_key` | String(160), UNIQUE index | Vendor/date/window/seat claim; at most 20 concurrent occupied keys |
| `submission_status` | Choice(String): building, complete, failed; default blank | Keep incomplete records hidden; this is not a fulfillment state |
| `terms_version` | String(80) | Which actual terms were accepted |
| `terms_accepted_at` | Date/Time | Server acceptance timestamp |

Verify populated values are database-unique for submission_key and booking_key, while blank legacy values are allowed. Test duplicate insert rejection in development. These indexes, not a UI count, arbitrate racing submissions. Do not reset Order state choices or change Task globally. Keep confirmed Submitted=-5, Confirmed=1, Ready=2, Complete=3, Canceled=4.

No Order Line additions are needed. The code uses line_price, not line_total, and does not require Instructions. Native Number Maintenance should generate ORD/OL values; verify the defaults without calling private Global NumberManager from the service. A missing/non-ORD parent number causes cleanup rather than a blank confirmation.

## 2. Install the same-scope service and security rules

Create Script Include **CafeNowDirectOrdering**, Application=CafeNow, Active=true, Client callable=false, Accessible from=this application scope only. Paste [CafeNowDirectOrdering.js](CafeNowDirectOrdering.js).

The service reads business records with GlideRecordSecure and field checks. Fixed internal Order/Line writes use GlideRecord after explicit signed-in identity, own submission, quantity, price, vendor, window, terms and capacity validation. No browser-supplied table/user/price/vendor/state is copied into records. This internal service boundary is intentional; do not make it client-callable or a general table editor.

Review **all matching ACL grants**, including inherited and wildcard rules:

1. Replace the broad CafeNow Order read grant with [order-read-acl.js](order-read-acl.js), retaining suitable app roles. It allows the actual owner (opened_by) or vendor Admin/Staff with the matching vendor group, while hiding building/failed records. An additional restrictive ACL does not necessarily undo another permissive allow ACL.
2. Replace the admin-only Order Line read ACL with [line-read-acl.js](line-read-acl.js) and suitable employee/vendor app roles. Access follows its parent Order, not who inserted the Line. Keep administrative access according to the agreed access matrix.
3. Keep direct Order/Line create/write/delete administrative/service-only, except separately authorized vendor state actions. The exported employee Order create grant must not allow arbitrary direct form/API inserts that bypass the service. The service itself does not require granting the employee blanket CRUD.
4. Keep prices, totals, ownership, vendor, pickup, parent references, keys, acceptance and submission_status write-protected. Allow submission_status read where the open-order widgets need it. UI read-only is not a substitute for ACLs.
5. Replace the state-write ACL's vendo0 group condition with [order-state-write-acl.js](order-state-write-acl.js), retaining vendor Admin/Staff role requirements. This checks the authoritative vendor independently of employee ownership. It does not replace lifecycle/cancellation validation; employees cannot advance fulfillment.
6. Keep the Line table scoped-private. This same-scope service/widget does not require Global cross-scope write access. Verify employee read access to active Menu/Vendor/Window records and the required price fields.

The portal can remain accessible to authenticated intended employee/vendor personas through existing roles/criteria. Do not make widgets/pages Public to resolve a read error. Facility-admin all-vendor UI/actions are not newly implemented here; retain or separately review existing authorized administration.

## 3. Configure properties, schedule protection and legacy bookings

Create properties from [schema.json](schema.json), with prefix `x_1234_cafenow.direct.`:

- `enabled=false` initially.
- `schema_verified=false` until fields, real indexes, ACLs, guards and legacy bookings pass checks.
- `building_location`: actual `cmn_location` sys_id for the pilot building. Order.Location is mandatory; Window.location in the export points to imp_location and is not used as a substitute.
- `terms_url`: an actual accessible same-portal terms page, e.g. `?id=cafenow_terms`; version it with `terms_version`. No invented terms text or auto-checked acceptance is supplied.
- `window_time_storage`: verify against a known 11:30 New York window using Show XML or a read-only getValue inspection. Use `wall_clock` when the stored time is 11:30:00 (possibly with epoch date); use `utc_1970` when it is 1970-01-01 16:30:00 for that local 11:30. Unsupported/empty configuration blocks selection. Do not infer booking times from the label.

Timezone is the user-confirmed America/New_York. The host/profile-independent Eastern clock supports contemporary post-2007 DST rules through 2030, with review required before expanding. Same-day daytime windows with start at/after 04:00 and end after start are supported. The screenshot's 11:00-14:00 schedule fits this scope. Overnight/future-day ordering is not implemented. Exact 30-minute ordering cutoff is treated as closed, an explicit conservative convention to verify with the team.

Create a BEFORE UPDATE Pickup Window rule using [protect-booked-window.js](protect-booked-window.js). Reserved windows' vendor/time/label/capacity cannot change. Create a replacement window and deactivate the old one when changing schedules; keep old Order references meaningful.

Create a BEFORE UPDATE Order rule using [release-canceled-booking.js](release-canceled-booking.js), condition State changes to Canceled (4). It clears only the booking key after an otherwise authorized cancellation. Enforce actor/state/cutoff policy separately; this rule does not grant cancellation rights or send notices. Completed pickups retain their consumed booking place.

Reconcile legacy Order pickup dates and window/vendor references before enabling submission. Open Orders with no date block new bookings for that vendor; same-day/window Orders without booking_key block that window. Never infer pickup date from Created or fabricate terms acceptance. For verified existing bookings, allocate unique seat keys in the same `vendor_sys_id:YYYY-MM-DD:window_sys_id:seat` format (seat 1-20, no duplicate keys), preserving all actual values/states. Review which of vendor/vendo0 and time_slot_v2/pickup_window older records populated. Do not silently merge them or delete historical orders to free capacity.

## 4. Create ONE reusable widget definition

Create **CafeNow Direct Ordering**, suggested ID `cafenow_direct_ordering`, in CafeNow. Public=false. Paste:

| Widget field | Complete file |
| --- | --- |
| Server Script | [server.js](server.js) |
| Client Script | [client.js](client.js) |
| Body HTML | [template.html](template.html) |
| CSS | [style.css](style.css) |
| Option schema | [option-schema.json](option-schema.json) |

There are no template/dependency/modal requirements. Instance option **view** chooses vendors, menu, sidebar, cart, orders or details. It changes presentation only; all server actions still enforce access. Examples for instance Additional options, preserving any other existing options:

```json
{"view":"vendors"}
```

```json
{"view":"cart"}
```

The browser cart is per-user localStorage. It is not the native catalog cart. All replacement browsing/sidebar/cart instances use this same contract and event. Keep the old native cart data intact but disconnect its CafeNow entry points; the older sidebar cannot be mixed into the new journey. Quantity bound 1-99 and 100 food lines are implementation bounds, not newly confirmed business limits. Two-decimal currencies are supported; unsupported nonzero sub-cent values fail rather than silently rounding. Item names/prices are copied into immutable transaction snapshots. Current Menu changes do not rewrite accepted lines.

## 5. Replace actual page instances

These IDs and placements are from the new export, not guessed from earlier screenshots:

| Page | Installation |
| --- | --- |
| `cafenow_home` | Keep existing Cafe Now main hero: its button already links to cafe_menu. Keep useful Quick Links/My Open Orders; optionally add a Direct Ordering instance with view=vendors |
| `cafe_menu` | Replace CafeNow Categories instance `f3b35ca3f9d813107f4416ad6814b9c1` with view=vendors; replace Category Items instance `aa1977c76dd453107f4484f0f2a4c612` with view=menu; replace native sidebar instance `9612a0a3f95c13107f4416ad6814b91a` with view=sidebar |
| `cafenow_cart` | Replace SC Shopping Cart instance `e825673f451c13107f440bdbe2f12b10` with view=cart |
| `cafenow_my_orders` | Replace Simple List instance `7b44cf4f6d9c13107f4484f0f2a4c6b9` with view=orders; its exported human-readable ownership filter is not proof of actual ACL isolation |
| `cafenow_order_details` | Replace Form instance `625507036ddc13107f4484f0f2a4c618` with view=details; this is a read-only ORD/Line display |
| `cafenow_vendor` | Keep own-vendor Open Orders widget, but paste the updated [queue Server Script](../cafenow-vendor-orders/server.js) to hide incomplete direct Orders. Use singular page ID |
| `cafe_faqs` | Keep KB Categories; update relevant help content to direct Menu/ORD language after cutover |

Replace **instances**, not Global widget definitions. Preserve old widget definitions for rollback. Existing home [My Open Orders server](../cafenow-my-open-orders/server.js) was also updated to skip incomplete direct submissions when submission_status exists; repaste it if retaining that widget. Its old details URLs with sys_id still work because the new details server accepts order_id or sys_id, with fixed Order table and server authorization.

New links: vendor -> `?id=cafe_menu&vendor=<Vendor sys_id>`; cart -> `?id=cafenow_cart`; confirmation/details -> `?id=cafenow_order_details&order_id=<ORD sys_id>`. No category/Catalog Item sys_id is reused as Menu/Vendor identity. Details lists actual Order Lines; older catalog Orders may have no Line records and are not automatically rewritten/backfilled from current Menu prices.

## 6. Header, navigation and old flows

The actual theme now uses **Cafenow Header**, `sp_header_footer` sys_id `05a00e40546813107f44ff1829e40dd9`, rather than the older retained header assumptions. In this CafeNow-owned copy only, use the derived files:

- [header/server.js](header/server.js): suppress native cart/wishlist models and legacy typeahead loading.
- [header/client.js](header/client.js): correct cart destination to cafenow_cart.
- [header/template.html](header/template.html): remove legacy typeahead embeds. Preserve the existing Header CSS/dependencies; do not replace the Global base header.

Header catalog search is intentionally removed in this derivative; Menu has a local food-name filter. Knowledge/FAQ pages remain. Live header rendering, mobile behavior and the shared Header Menu widget's option handling require verification; if a native cart remains visible, inspect that specific rendered embed rather than editing every Global widget.

In **CafeNow Main Menu** (instance `dc5f5efe5c5c13107f44ff8ed61d8e67`):

1. In the main-menu instance Additional options JSON, preserve existing settings and set `enable_cart` and `enable_wishlist` to false so the shared menu does not load its native cart embeds. Verify the actual instance option values in the target release; the Header derivatives also suppress returned cart models.
2. Change Menu entry `c0802eb25c9c13107f44ff8ed61d8e3d` from type sc_category to **Page**, target Cafe Menu/cafe_menu.
3. Add a normal **Cart** Page entry targeting CafeNow Shopping Cart/cafenow_cart. Keep Home, My Orders and FAQs.
4. Remove/disconnect only obsolete CafeNow-native catalog cart/item links and any old checkout/producer routes. This code does not require sc_cart/sc_category/sc_cat_item pages.

Disable **Menu import to Catalog Items**, flow `03c580aa185413107f44e367c73ecb43`, for the direct route after preserving the configuration. It is active in the exported saved configuration and reacts to Menu updates. Keep any actual Excel-to-Menu import separate. The exported Placing Order flows are inactive; review current active/global flows and in-flight executions before cutover so no duplicate fulfillment automation continues. Do not delete old Catalog Items, REQs/RITMs, variable sets, update sets or Order records.

If the earlier catalog-based checkout package was installed after this snapshot, disable its context-required Order insert guard before enabling this direct implementation. It expects a different model. No installation of that older package is established by this export.

## 7. Verify review mode, then enable

With enabled=false, browse vendors/menus, add quantities, open the shared sidebar/full cart and verify pickup choices. Confirm active/in_stock/accepting_orders actual values, Menu price API/code, raw time normalization, role/field ACLs, correct venue location and accessible terms page. No ORD is submitted in this mode.

After completing the fields/index/ACL/guard/legacy setup, set schema_verified=true. Enable only in the test environment first, then verify:

1. Two different Menu foods and quantities create one ORD with both Order Lines, correct snapshots/totals, vendor/date/window and explicit acceptance. Confirmation opens that ORD; no new REQ/RITM exists for this route.
2. Price/vendor/owner supplied by a forged browser payload is ignored; mixed-vendor, unavailable, inactive, wrong-window, missing terms, changed review/date/version and invalid quantities are rejected.
3. Employees A/B cannot read each other's Orders/Lines through the widgets, direct record/API URLs or reporting. Pizza Hut Staff/Admin see only Pizza Hut; role alone is not vendor identity. A vendor employee ordering personally from another vendor cannot manage that vendor's Order.
4. Duplicate clicks and response loss return the same ORD. A failed line/parent completion removes incomplete rows and frees the seat when cleanup succeeds. Failed cleanup leaves a hidden failed record/key for admin reconciliation, not a visible partial Order.
5. Two actual simultaneous users competing for the twentieth place result in only one winner. Verify real unique index behavior, not only a count. A cancel releases its key once; completion does not release it. Schedule changes after booking are blocked.
6. Winter/summer New York cutoff, exact 30-minute boundary, midnight date change, full windows and unsupported raw Time representations behave as documented.
7. All seven page routes, navigation, header, mobile layout, keyboard use and refresh work. Keep portal/instances non-public and remove remaining native cart entry points for this CafeNow journey.

Set enabled=true only after the development checks pass and the configuration is ready for the class pilot. This is not a live deployment performed by this workspace.

## Recovery and limits

The browser persists a submission token before sending. If a response is lost, it offers status rather than another purchase; same user/token resolves to the existing Order. If no result is visible or cleanup failed, reconcile in the instance before clearing uncertainty/retrying. Do not allocate another token blindly for an unconfirmed purchase. Browser-local cart changes from multiple tabs are last-write wins; accepted server payloads are independently validated and quoted.

Building/failed Orders are technical holds hidden by the new ACLs/widgets. They are not fulfillment states and must not trigger vendor notifications before completion. Inspect inherited Task Business Rules, notifications and other automation: the application export contains no custom sys_script rows, but does not include all inherited/platform rules. Normal inserts/updates/deletes are used; no setWorkflow suppression or email-delivery claim is made. Successful retry/notification/concurrency behavior must be verified in the instance.

The service provides read-only customer/vendor detail access, not new lifecycle/cancellation buttons, facility-wide management, no-show automation, payments, menu images, cross-device carts, arbitrary currencies/overnight dates or report redesign. Images remain available on the master tables for a later verified rendering pass. Historical catalogs are retained. No instruction field is required on Order Line for this version.

## Checks and sources

Run `node docs/servicenow/widgets/cafenow-direct-ordering/verify.cjs`: 52 mocked direct service/client checks, including all business queries rejecting sc_* table access, direct ORD/Line snapshots, role/owner/group isolation, capacity keys, cleanup, prices, DST/cutoff, token retry and response-loss recovery. Header derivatives/scripts/JSON parse. The vendor queue has 32 mocked checks including incomplete-submission hiding; employee open-order regression checks also pass. These do not establish real database concurrency, native default/currency API behavior, actual ACLs, inherited Task side effects or rendered UI.

Source: [new export](../../../../exports/sys_remote_update_set_4cb09e8854e813107f44ff1829e40dc0.xml), explicit user direct-ordering instruction and supplied Order Line screenshots; [migration map](../../../planning/DIRECT-MENU-PORTAL-MIGRATION.md), [decision record](../../../../DECISIONS.md). See [current export review](../../../planning/DIRECT-MENU-EXPORT-REVIEW-2026-11-09.md) for configuration findings. Existing D01-D04/S01-S04/U01-U03/V02-V03/B01-B04/T02-T04/T07/T09 own live evidence on the shared VTB.

## Menu quantities and Order form setup - November 9 refinement

Menu now has minus/plus buttons and a numeric quantity input. Add to Cart adds that quantity to an existing line, bounded at 99 total per food. Repaste client.js, template.html and style.css. Vendor browsing already queries active=true and checks readable active records server-side.

The server submission implementation creates Order first and links each Order Line through order; menu_item points to Menu. It sets opened_by to the signed-in user, vendor, time_slot_v2, date and totals. It now also sets requested_for to the current user if that exact column exists; the supplied export did not establish such a column. A relabeled Opened by field is still opened_by. Leave sys_created_by to platform audit handling; do not add a custom created_by field merely to duplicate it.

On the platform Order form, configure Related Lists and add the Order Line list using its order reference. Suggested list columns: number, menu_item, item_name, quantity, unit_price, line_price. This is form configuration, not a Flow or a Related Link. The portal details view separately renders Lines from the same reference. Confirm live labels, permissions and form view.

Architecture recommendation: keep parent/line creation in the existing synchronous Script Include, returning the saved ORD to checkout. Use a separately reviewed Flow for subsequent notifications/fulfillment if needed; do not duplicate Order creation in both places. Submission still depends on deferred metadata, properties and eligibility setup. These edits do not enable a simplified submission path or claim successful live creation.

Official references: [related lists](https://www.servicenow.com/docs/r/platform-user-interface/c_RelatedLists.html), [reference-based relationships](https://www.servicenow.com/docs/r/platform-user-interface/t_CreateDefinedRelatedLists.html), [Created by system field](https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0684481).
