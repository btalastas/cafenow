# CafeNow My Open Orders

Prepared November 7, 2026 for the CafeNow Home page. Read-only list of the signed-in employee's authoritative CafeNow Orders, with vendor, pickup-window display value, submission time and status. Refresh reloads the list. Order numbers link to the existing `cafenow_order_details` page with the fixed Order table and record sys_id. The footer links to `cafenow_my_orders`. No cancellation, edits or automatic polling is included.

## Install

1. Create a new widget in the **CafeNow** application. Name: **CafeNow My Open Orders**. ID: **cafenow_my_open_orders**. Leave **Public unchecked**. Apply the actual employee role if required; its technical name has not been verified.
2. Paste [template.html](template.html) into Body HTML template, [server.js](server.js) into Server Script, [client.js](client.js) into Client Script and [style.css](style.css) into CSS. Paste [option-schema.json](option-schema.json) into the widget Option schema field. No dependencies are required. In the home widget instance options, set Maximum orders displayed (1-50); default is 5. If editing instance Additional options JSON directly, use `{"max_orders":"5"}` and preserve other existing options. The server clamps the maximum to 50; invalid or less-than-one values use 5.
3. Before use, verify the Order table and ownership field. The retained export has `x_1234_cafenow_order`, `vendor` and `pickup_window`. Server `OWNER = 'opened_by'` means orders submitted by the current user. If the application uses a distinct Requested for reference, set OWNER to that verified technical field and test on-behalf ordering. Do not add an OR for Opened by: that could show another recipient's order. Missing table/required fields produce a configuration message, not an unfiltered query.
4. In CafeNow Home Designer, replace the **My Requests** instance shown in the screenshot with this new widget in Row 2 / Column 1. Keep the shared Global My Requests widget intact. Save and test as an employee, not only as admin.
5. Verify table/record/field read ACLs and cross-scope access. Employees must only read their own orders through every access path. The widget's ownership query is additional protection; it does not replace ACLs. Keep the widget non-public.

## Meaning of open

Uses the November 3 decision: Submitted `-5`, Confirmed `1`, Ready for Pickup `2`. Closed Complete `3` and Canceled `4` are excluded. Does not rely on inherited `active` behavior. Displays the configured number of newest open orders (default 5), with a truncation notice and View all orders link. Uses one CafeNow Order, not Request/RITM rows, to avoid duplicate fulfillment statuses. Orders waiting for creation by a flow will not appear yet. No fallback to unrelated catalog requests is made.

Pickup window is its existing reference display value, not a derived pickup date. Confirm its display label is useful. No price, food lines, delay or pickup-date fields are guessed. The retained portal review identifies `cafenow_order_details` with a Form widget. Verify that its current Form instance consumes `table` and `sys_id` and displays this Order table. Both destination pages must enforce record/field ACLs; a generated URL does not authorize access. Confirm the My Orders list is also restricted to the employee. Verify details are read-only for employees or that every offered action has independent server authorization.

## Verify in the instance

- Employee A sees A's three open states, excluding completed/canceled orders. Employee B sees only B's orders. Admin impersonation must not broaden the widget ownership filter.
- Verify actual ownership population, including on-behalf requests, and negative direct-record/API ACL tests. A blank owner must not become visible to everyone.
- Guest sees a sign-in message and receives no order data. An employee lacking read permission receives no protected fields or rows. Restricted vendor/window fields stay absent.
- Confirm newest-first order, empty list, configured-limit truncation, Refresh, repeated-click handling, failed refresh and server query failure.
- Verify narrow/mobile layout, keyboard Refresh, readable status labels and real reference display labels. Test order-number navigation, View all orders, another employee's direct detail URL and a missing/deleted record. Move an order to Ready and then Closed Complete; refresh to verify update/removal.

Local mocked verification does not establish instance ACLs, cross-scope access, rendering or live behavior. Sources: [DECISIONS.md](../../../../DECISIONS.md), [ordering review](../../../planning/ORDERING-REVIEW-2026-11-06.md), retained application export (unmodified), and U03/S04/T07/T09 in the detailed task guide. ServiceNow references: [GlideRecordSecure](https://developer.servicenow.com/blog.do?p=%2Fpost%2Fgliderecord-vs-gliderecordsecure%2F), [widget security](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/configure-widget-security.html). Target release remains unverified.

Direct ordering compatibility: when Order.submission_status exists, only readable blank legacy or complete submissions are displayed. Building/failed submissions are omitted; direct ordering ACLs remain required. The new details widget accepts the existing sys_id links with a fixed Order table.
