# CafeNow Vendor Open Orders

Updated November 9, 2026 for the shared CafeNow Vendors page in `/cafe`. One read-only widget serves all five vendors. No fixed vendor sys_id is required. The signed-in user needs both a CafeNow vendor role and a matching group membership. Open states are Submitted (-5), Confirmed (1) and Ready for Pickup (2). No status changes or batch actions are implemented.

## Install or update

1. In the existing non-public CafeNow Vendor Open Orders widget, paste the complete [Server Script](server.js) and [HTML template](template.html). Replace Option schema with [option-schema.json](option-schema.json), which is now `[]`. Keep existing [Client Script](client.js) and [CSS](style.css); no changes are needed in those two fields.
2. Remove any old vendor_sys_id from instance Additional options if convenient; it is ignored even if retained. Keep one instance on the shared page. No separate instance per vendor is needed.
3. Verify the two role constants at the top of Server Script: `x_1234_cafenow.vendor_admin` and `x_1234_cafenow.vendor_staff`. These names occur in the retained export; current live assignments remain unverified. Restrict page/widget access to the actual vendor roles and leave Public unchecked. The server independently checks exact assigned/inherited role names plus effective hasRole. Platform admin alone does not satisfy the role check.
4. Each Vendor.vendor_group must reference that vendor's parent sys_user_group. The user's immediate Admin/Staff child group must have Parent set to that vendor group. Names do not establish authorization. Parent-only membership plus a vendor role is also accepted; deeper descendants do not gain access automatically. Active groups, parent groups and vendors are required.
5. Authorization metadata (current-user sys_user_grmember, mapped sys_user_group and Vendor mapping) now uses fixed read-only server GlideRecord queries. Staff do not need administrative record/field read ACLs for this configuration. No membership payload is returned. Orders still use GlideRecordSecure and field ACLs; do not grant blanket Order access. Cross-scope application-access privileges still require verification. This distinction is deliberate: lookup authorization internally, then apply the user's read permissions to returned business data.
6. Test as vendor Staff and Admin accounts, not only as platform admin. A role without membership and membership without a vendor role both return no order data.

## Server authorization

On every load/refresh the server:

- Requires a vendor_admin or vendor_staff role using exact role names, including inherited/group-granted roles, and the effective role check.
- Queries direct membership records for the current user and rechecks the returned user value. Fixed internal metadata lookups use GlideRecord; no user/table/group is accepted from the browser.
- Resolves each active direct group and its active immediate parent, using sys_ids.
- Finds active Vendors whose vendor_group matches one of those authorized groups. Only authorized vendor names accompany readable Orders.
- Queries only those vendor sys_ids and open states with GlideRecordSecure, then rechecks each returned Order's vendor/state and required field access before returning data.

Browser input and instance vendor options cannot choose a vendor, group, user, role or query. No facility/platform admin all-vendor bypass exists in this widget. A user legitimately assigned to multiple vendors sees those vendors' queues, separated by vendor and window, without receiving other vendors' records. Membership changes are recalculated on the next request; an already displayed page is not pushed an immediate revocation event.

This widget does not replace table/record/field ACLs. Apply and independently test equivalent vendor isolation to direct forms, lists, APIs and aggregate reports. Vendor users must not edit Vendor.vendor_group, protected group hierarchy/membership or Order.vendor to grant themselves access.

## Pickup fields, dates and counts

The latest user report names Order.time_slot_v2 as the Pickup Window reference. The server prefers that field if it exists; otherwise it uses Order.pickup_window from the retained export. If both exist, only time_slot_v2 is used. Verify the dictionary and populated source field before installation; no records are migrated or combined. Both must reference the intended Pickup Window table when used.

Groups use vendor sys_id plus window sys_id; identical labels cannot merge distinct vendor/window records. The heading includes the authorized vendor name and the existing window display value. Missing references have a separate missing-window group. Ordering uses reference values and Order creation time, not verified chronological window-start sorting.

All dates are included. A time-slot reference is not a pickup date. Date-specific queue/capacity calculations remain deferred until the Order pickup date is verified. Fetches at most 201 candidate rows and returns at most 200 readable Orders, with a truncation notice when detected. Counts describe displayed Orders, not meal totals or capacity. More restrictive ACL filtering can underfill results.

## Verification

Run `node docs/servicenow/widgets/cafenow-vendor-orders/verify.cjs`. There are 32 mocked server checks covering Staff/Admin isolation, two vendors, role and membership gates, platform-admin denial, forged inputs/options, direct parent and duplicate memberships, inactive mappings, immediate-parent scope, Order field ACLs, metadata-ACL regression, mismatched mapping errors, missing configuration, post-query vendor/state checks, record denial, missing/legacy windows, multi-vendor separation, limit and membership revocation on reload. Client and option schema also parse. These mocks do not establish live ACLs, cross-scope access or rendering.

In the instance verify Pizza Hut Staff/Admin see only Pizza Hut open orders; repeat for another vendor and attempt direct access to each other's records. Test an employee, vendor role with no membership, membership with no vendor role, changed/revoked membership, guest and admin-only account. Test both populated pickup references as applicable, empty/loading/error views and narrow layout. Record evidence on V02/S04/T04/T07/T09 in the shared VTB.

Sources: [decisions](../../../../DECISIONS.md), [task guide](../../../planning/MVP-FEATURE-TASKS-AND-PROCESSES.md), retained unmodified application export, November 8 group clarification and November 9 authorization request. Platform references: [Scoped GlideUser role APIs](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_GlideUserScopedAPI.html), [widget security](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/configure-widget-security.html), [page security](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/configure-page-security.html). Target release/live configuration remain unverified.

## Membership lookup repair - November 9

User supplied a live "No authorized vendor membership" screenshot despite Pizza Hut Admin membership/vendor role and an Order list containing Pizza Hut Submitted/Confirmed records. The earlier secure metadata lookups could hide valid mapping rows/fields behind administrative ACLs; this is a plausible cause, not a verified diagnosis. Replaced only internal authorization metadata lookups with fixed read-only GlideRecord queries. Returned Order data remains secure. Distinct messages identify no active group versus no active matching Vendor. Check actual sys_ids: Pizza Hut Admin.Parent must equal Pizza Hut Vendor.vendor_group; similar group names are insufficient. The list filter does not establish that this complete reference chain or its earlier ACL reads worked. No live results or ACL changes are claimed.

Direct ordering compatibility: when Order.submission_status exists, the queue requires it to be readable and blank (legacy) or complete. Building/failed records are omitted. Use the [direct ordering setup](../cafenow-direct-ordering/README.md) to install the matching ACLs and ORD/Line details view; do not expose partially constructed orders.
