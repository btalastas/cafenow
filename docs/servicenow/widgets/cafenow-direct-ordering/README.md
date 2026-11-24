## Menu and cart pictures - November 10, 2026

Repaste CafeNowDirectOrdering.js into the existing Script Include, template.html into HTML Template and style.css into CSS. Menu cards and cart/sidebar lines now show the existing Menu item_image image when its field is readable and contains an image sys_id. Upload pictures through Item Image on the Menu records; no new widget option or field is needed. Missing, denied or malformed image values omit the picture. The image route and attachment access still need live employee/browser verification. Local suite: 58 mocked service/client checks passed; scripts and JSON parsed.

# CafeNow direct ordering - simplified checkout

Current user-authorized implementation, November 9, 2026: Vendor -> Menu -> cart -> select an active Pickup Window and accept terms -> one Order and its Order Lines. This uses the existing five application tables. No Flow, Catalog Item, REQ/RITM, new technical table, or submission_key/booking_key/submission_status setup is required.

The [previous advanced setup](ADVANCED-SETUP-HISTORICAL.md) is historical. Its six-field/index/property prerequisites, booking/cancellation rules, capacity guarantees and automatic retry lookup do not describe the current service. Do not install those guards for this simplified path. Original application exports and catalog packages remain preserved.

## Repaste these items

1. Replace the complete Script of the CafeNow-scoped **CafeNowDirectOrdering** Script Include with [CafeNowDirectOrdering.js](CafeNowDirectOrdering.js). Active=true, Client callable=false, same scope as the widget.
2. In the existing **cafenow** widget replace [server.js](server.js), [client.js](client.js), [template.html](template.html), [style.css](style.css) and [option-schema.json](option-schema.json) in their corresponding fields. All page instances share this definition.
3. Keep per-instance views: cafe_menu uses vendors/menu/sidebar; cafenow_cart uses cart; cafenow_my_orders uses orders; cafenow_order_details uses details. The actual exported menu page is cafe_menu.
4. Set a valid **Vendor.location** reference to the building in cmn_location. Order inherits a mandatory Location. The existing x_1234_cafenow.direct.building_location property is an optional fallback; no enabled/schema_verified/time-storage property is required.
5. Keep authenticated page access, the prepared owner/vendor-group read ACLs and protected direct Order/Line create/write/delete. Review all existing grants; do not grant blanket writes to make the portal work. The service validates fixed fields internally. Repasting the service also updates the predicate called by [order-read-acl.js](order-read-acl.js) and [line-read-acl.js](line-read-acl.js).

If an earlier Order insert guard requiring Checkout context or advanced metadata was actually installed, reconcile/disable that conflicting guard before testing. Keep a single creation path and inspect active flows, inherited Task rules and notifications. No live installation is established here.

## What Place Order saves

| Record | Values |
| --- | --- |
| Order | opened_by=current user; requested_for=current user only if that exact column exists; vendor from validated Menu; time_slot_v2=selected Pickup Window sys_id; location from Vendor/fallback; state Submitted (-5); server-calculated order_total; assignment_group from Vendor |
| Order Line | order=inserted Order sys_id; menu_item=Menu sys_id; item_name snapshot; quantity; unit_price; line_price |

ServiceNow manages sys_created_by; no browser-supplied owner/vendor/price/state is trusted. Existing pickup_date/terms_version/terms_accepted_at fields are populated only if present. None must be added for this version. Without pickup_date, the selected recurring window reference does not independently preserve a service date; this remains a limitation.

Terms acceptance is still explicit and checked server-side. A configured terms_url/terms_version can be retained but is not an enablement prerequisite. The full cart now includes inline Terms & Conditions with the user-requested 20-minute ordering cutoff and pickup reminders. A separate terms URL is optional; inline text does not establish a versioned acceptance record. The cutoff is policy text only: this simplified service still does not enforce it or send scheduled reminders.

The button becomes available when the cart contains valid foods and the vendor has readable active windows; the user must select a window and check acceptance. Submission rechecks current prices, availability, one vendor, whole quantities, review snapshot/date and the window's active vendor association. It deliberately does not enforce time cutoff or capacity in this simplified version. That deferral is not MVP completion.

## Order Lines on the Order form

Open a CafeNow Order in the platform form. Use **Configure -> Related Lists**, select the Order Line list through its **order** reference and save for the intended form view. Include number, menu_item, item_name, quantity, unit_price and line_price. This is a related list, not a Related Link, and needs no Flow. The portal details view separately queries the same child records. Live list labels and ACLs still require verification.

## Test in development

- Two foods with different quantities: one ORD, two Lines, matching parent references and correct totals.
- Correct opened_by, optional requested_for, Vendor, Pickup Window and Location; sys_created_by remains platform-managed.
- Empty/mixed-vendor carts, unavailable food, invalid quantities and another vendor's/inactive window fail before inserts.
- Price changes require another review. Employees cannot read another employee's Order/Lines; vendor staff remain vendor-isolated.
- Successful submission clears the local cart and links to the ORD; My Orders and the vendor queue show the accepted Order.
- Check Order/Line insert failures, cleanup permissions, inherited automation and browser rendering on the actual instance.

The parent is active Submitted (-5) from insertion through completion. Checkout explicitly saves Submitted again after creating Lines and verifies the persisted state/active flag. It does not advance vendor fulfillment states. If automation overrides the saved state, checkout reports an administrator-review condition without deleting the saved Order or inviting another submission. If saving Lines fails, cleanup attempts to delete Lines and the parent. Failed cleanup requires administrator review. This is compensation, not a verified database transaction; inherited notifications/other automation may run before completion. Test those effects. The parent may be visible while its Lines are being created, or if cleanup fails. This simplified version has no technical completion field; do not assume partial-order isolation. Inspect notification/queue behavior during setup. Existing inactive Submitted legacy records remain hidden by the retained read predicate.

The browser blocks repeated clicks while a request is running. There is no durable submission identity or simultaneous-booking protection. If the response is lost, the cart stays locked and directs the user to My Orders/administrator review; it does not automatically retry. Separate tabs or independent repeated requests can create duplicates. Do not treat this version as capacity-safe or retry-safe.

Source checks are mocked; no live deployment, ACL execution, database behavior, email delivery or end-to-end acceptance is claimed. [schema.json](schema.json) describes the current minimal requirements.

## Submitted state correction

Repaste the complete updated Script Include after the reported live Closed Complete result. Intended lifecycle remains Submitted=-5 -> Confirmed=1 -> Ready for Pickup=2 -> Closed Complete=3; only vendor fulfillment should advance these stages. The service previously inserted inactive Submitted, which could interact with Task automation; the actual live cause is unverified. It now inserts and finalizes active Submitted. If the state still changes, inspect Order history (if auditing is enabled), actual state choice values, Order/Task Business Rules and active Flows. Do not change global Task choices or disable all workflow to hide the cause. Later asynchronous changes are not detected by the immediate saved-state check. The state-write ACL snippet grants vendor record authorization only and does not itself enforce transition order.
