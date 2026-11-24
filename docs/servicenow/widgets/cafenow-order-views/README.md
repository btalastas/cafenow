# CafeNow employee order views

Prepared November 10, 2026 for the user's requested simple list, data table and individual order form. One new reusable Service Portal widget supplies three instance views. These are custom read-only views, not wrappers around the editable native Form or generic Data Table widgets. No new tables, fields, Script Includes or write operations are required. Existing direct-order checkout is unchanged.

## Home open-order tracker update

November 10 navigation simplification: My Orders should open the full history table directly at `/cafe?id=cafenow_my_orders`. Set that page's widget instance to `{"view":"all"}`. The option schema and server fallback now default to `all`; changing the schema does not replace an already saved `recent` instance option. Repaste server.js and option-schema.json, then update any existing My Orders instance explicitly. Keep `open` on home and `details` on the detail page when those views are used. The recent list remains optional.

The widget now has four modes. Repaste server.js, template.html and option-schema.json for the new `open` mode; client.js and style.css are unchanged. On the existing employee home page add another instance (or replace the recent instance) and set Additional options JSON to `{"view":"open"}`. It shows the five newest own active Submitted/Confirmed/Ready orders, their current status, a detail link, View all and a Refresh status button. Completed/Canceled orders are excluded. Refresh is manual, not polling. Existing recent/all/details modes remain available.

No separate page is needed for each home block. Reuse existing `cafenow_my_orders` and `cafenow_order_details`; create those pages only if absent. The all page must contain an instance with `{"view":"all"}`, and the details page an instance with `{"view":"details"}`. The open block links to full history via View all. Correct Active/state lifecycle values remain prerequisites; the widget does not repair records.

Local suite now has 19 checks, including open-state filtering and removal after completion. Live rendering/deployment remains unverified.

## Create the widget

1. In CafeNow scope open Service Portal > Widgets. Create **CafeNow Employee Order Views**, ID **cafenow_employee_order_views**. Leave Public unchecked. Restrict pages to authenticated users and follow the existing employee role access policy; actual role identifiers/instance access need verification.
2. Paste [template.html](template.html) into HTML Template, [server.js](server.js) into Server Script, [client.js](client.js) into Client Script and [style.css](style.css) into CSS. Paste [option-schema.json](option-schema.json) into Option schema. Keep controller alias `c`.
3. Save. In Service Portal Designer add this widget to each location below. Use the widget instance options to choose **Order view**. If the option editor is unavailable, configure the instance's Additional options JSON with the shown value.

| Location | Instance option | Result |
| --- | --- | --- |
| Existing CafeNow employee home page | `{"view":"recent"}` | Five most recent readable own orders, with View all |
| Existing `cafenow_my_orders` page | `{"view":"all"}` | Own order history, number search and Previous/Next pages of 20 |
| Existing `cafenow_order_details` page | `{"view":"details"}` | Read-only order summary and its Order Lines |

4. Replace the old Simple List on home, generic Data Table on All My Orders, and editable Form on the details page with these new instances. Preserve the old widget definitions; remove only the obsolete page instances after reviewing placement. Do not leave an editable Form underneath the new detail widget.
5. Links use `?id=cafenow_my_orders` and `?id=cafenow_order_details&order_id=<sys_id>`. Existing direct checkout already links to that details route. Set the menu's My Orders link to `/cafe?id=cafenow_my_orders`. For bookmarks that currently use `sys_id`/generic form routes, update links explicitly; this widget accepts `order_id` only. Confirm the actual page IDs in the instance before cutover.
6. All views include readable completed/canceled history. No Active=true filter is applied. Inactive Submitted parents and non-complete technical submission statuses remain hidden. All My Orders searches Order number only and uses newest-first ordering; no exact total count is shown. At most 1,000 pages can be requested. Paging scans readable records up to the requested page; assess performance with actual volumes and an opened_by/sys_created_on index before scaling.

## Fields and security

Retained schema: `x_1234_cafenow_order`, `x_1234_cafenow_order_line`. Parent owner is `opened_by`; pickup reference is `time_slot_v2`. The detail displays number, vendor, opened_by, pickup_date (if present), pickup window, location, created date, state and order_total. Child rows display item_name, quantity, unit_price and line_price. Currency/date strings use platform display values; created date follows the user's display timezone. No reminder-stage, payment, task type, priority or editable status fields are presented.

The server uses fixed GlideRecordSecure tables and independently checks current-user ownership for every record, including direct detail links. Browser-supplied owner/table/filter/view values cannot expand access. Field ACLs are checked before returning display values. Lines require an authorized parent plus readable child fields. Errors do not reveal whether another employee's order exists. No vendor/admin bypass is included in these employee-only views.

Keep Order/Line table, record and field ACLs in place: widget filtering does not secure native lists/forms, APIs or other widgets. The existing vendor-authorized read ACLs can remain for vendor tools, while these employee views further require own orders. Do not grant new blanket reads/writes to make empty views populate. Resolve the observed `vendo0.vendor_group` invalid-query warning in its actual ACL/automation separately; this package does not reference that field. No new ACL configuration is claimed.

## Verification

Local command: `node docs/servicenow/widgets/cafenow-order-views/verify.cjs`. Covers cross-owner ID tampering, guest denial, record/field ACL mocks, child-parent isolation, completed history, paging and number search. It parses client source and option JSON. Mocks do not establish live ACL behavior, related-reference display access, Service Portal rendering or performance.

Before acceptance, impersonate employee A and B with different orders. Verify home shows five newest own orders; View all and search work across more than 20 records; completed/canceled orders remain visible; direct links to B's order deny A; lines and currency values match the platform record. Test guest access, denied optional fields, empty history, keyboard controls, narrow screens and refresh after a vendor state update. The widgets refresh on page load/search/paging, not automatically in real time. Check native form/API ACL denial independently. No Save/New/fulfillment controls should be present. No cancellation action is implemented; policy validation remains a separate task.

Traceability: U03, S03/S04 and T04/T07/T09; shared VTB retains live task status. Source preparation only; no instance deployment or end-to-end result verified.

Official platform references consulted: [custom widgets](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/widget-dev-guide.html), [widget options](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/c_WidgetInstanceOptions.html), [widget API](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/widget-api-reference.html).
