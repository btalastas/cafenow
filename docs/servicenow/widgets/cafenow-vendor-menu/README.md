# CafeNow vendor menu

## Existing item images - November 11, 2026

User selected display of existing images only. Repaste server.js, template.html and style.css into the existing widget. Client Script is unchanged. List rows now show 80 by 64 pixel thumbnails; the edit form shows a 220 by 150 pixel preview. Both use object-fit: contain to preserve the whole image. No upload or image editing is added.

Images reuse Menu.item_image with a readable field and a valid image sys_id, using the same `/<image_sys_id>.iix` route as direct ordering. Missing, denied or malformed image values omit the image without hiding the item. The editor shows a no-image message when no image URL is available. Image URLs from the browser are ignored on save. Actual attachment/image-route authorization and rendering must be checked as vendor A, vendor B and an employee; the field check alone does not establish image endpoint authorization.

Checks: 31 local mocked checks passed, including valid/absent/denied/malformed images and rejection of image field changes through the save payload; client syntax parsed. No live image rendering verified. Populate/change pictures using Item Image on the existing authorized Menu form, then refresh this widget.

Prepared November 11, 2026 for the user's request to list a vendor's menu and add/edit items. This is individual Service Portal widget source, not an importable update set or deployed widget. Traceability: V01/BP01/R01, with S04 and role-isolation testing. Live task status remains on the shared MVP VTB.

## Install in development

1. Create a widget named **CafeNow Vendor Menu**, ID `cafenow_vendor_menu`, in the same CafeNow application scope as the Menu table. Leave **Public** unchecked. No option schema, Script Include or new table is required.
2. Paste [template.html](template.html) into HTML Template, [client.js](client.js) into Client Script, [server.js](server.js) into Server Script and [style.css](style.css) into CSS. Do not paste verify.cjs into ServiceNow.
3. Add the widget to the existing **My Menu** page using Designer. The current page ID for My Menu has not been verified: open its menu entry and inspect its Page reference. Alternatively create an authenticated page `cafenow_vendor_menu` and point My Menu to it. Keep the existing `cafenow_vendor` order dashboard/queue.
4. Confirm the exported identifiers still match your instance: `x_1234_cafenow_menu`, `x_1234_cafenow_vendor`, `x_1234_cafenow.vendor_admin` and `x_1234_cafenow.vendor_staff`. These come from retained application sources, not live inspection. Confirm `vendor_group` on Vendor, direct active group membership or one active parent-group hop, and the expected field ACLs.
5. Confirm `NEW_CURRENCY = 'USD'` at the top of server.js before using Add. This is an installation default, not a newly approved business requirement. Existing items retain their stored currency. Price uses the existing currency API and `CODE;amount` write format; verify storage/display in the actual release.

## Behavior and permissions

- Lists every readable item belonging to the user's authorized active vendors, including unpublished and out-of-stock items, 25 per page. Multiple authorized vendors appear together, with a vendor selector when adding. There is no public vendor-ID option.
- Vendor staff can view. Vendor admins can add/edit subject to Menu record and field ACLs. The exact role must be assigned/inherited; platform admin alone is not an implicit widget grant. This follows the existing V01 manager-maintenance plan. Do not broaden staff permissions just to make buttons appear.
- Edits name (100 characters), description (500 characters), non-negative two-decimal price, active and in_stock. The lengths match the November 9 dictionary export. New items start unpublished. Existing category, dietary tag, preparation time and image fields remain unchanged; manage those through the existing authorized Menu form for this version. No image uploader or delete operation is included.
- Existing item Vendor cannot be changed. Numbers/audit fields remain platform-managed. No Order, Order Line, Catalog Item or historical price snapshot is modified by this code. Inspect active Menu import/sync automation before rollout because Business Rules and Flows may still run.
- Internal fixed read-only group/Vendor lookups reuse the authorization pattern in the existing vendor queue; they are not returned as administrative metadata. Menu reads/writes use GlideRecordSecure, explicit record/field checks, a fixed field allowlist, and server-side membership checks on every request. Hidden required fields omit the entire list row instead of exposing partial protected data.

### Required instance access review

The widget does not install or replace ACLs. Vendor admins need table create/write and field write access for item_name, description, price, active and in_stock; creation also needs permission to set vendor. Listing needs read access to those fields plus vendor and sys_mod_count. Number is optional for display. Retain appropriate employee reads used by direct ordering.

Audit all matching/inherited Menu ACLs and direct form/API paths: restrict vendor writes to their own records, creation to their own vendor, and prevent vendor reassignment. If those grants or server-side ownership guards are absent, implement/reconcile them before enabling vendor maintenance. A restrictive widget cannot repair broad direct API/table grants, and adding another restrictive ACL alongside a broad allow does not remove that allow. No blanket table CRUD grants are supplied.

The sys_mod_count comparison catches edits already changed before save; it is not an atomic concurrency lock. Simultaneous saves may still overwrite each other. Buttons lock during a request, but new inserts have no durable deduplication key: after a lost response, refresh/check the menu before attempting Add again. For larger menus, profile the authorized-row pagination loop; it scans preceding readable rows and is intended for this bounded class pilot.

## Verification

Local check: `node docs/servicenow/widgets/cafenow-vendor-menu/verify.cjs` from the project root. Twenty-five mocked server checks pass for guests, roles, memberships, cross-vendor record/create/reassignment attempts, field/record denials, stale edits, input validation, aborted writes and pagination. Client syntax is parsed. Mocks do not prove real platform API behavior, ACL enforcement or rendering.

Before rollout in the target development instance:

1. Use separate vendor A admin, vendor A staff, vendor B admin, employee and guest sessions. Confirm authorized menu visibility, admin-only editing, and no cross-vendor items. Test tampered widget payloads and direct form/API access.
2. Add an unpublished item, save, refresh and verify the stored vendor, currency, amount and automatic number. Publish it and confirm it appears under that vendor in employee browsing. Mark out of stock and confirm checkout rejects it.
3. Edit an existing item; confirm category/image/dietary/preparation fields and old Order Lines are unchanged. Try invalid/negative prices, long text, a stale revision and a Business Rule-aborted save.
4. Verify 26+ items across pages; check small screens, keyboard navigation, labels, error messages and status announcements. Check that dictionary-mandatory fields or active automation do not introduce additional creation requirements.
5. Inspect actual ACL and application-access failures as vendor users. No live installation, release validation, browser rendering, API authorization or concurrency behavior is claimed.

Sources: existing [vendor queue](../cafenow-vendor-orders/server.js), [direct Menu export review](../../../planning/DIRECT-MENU-EXPORT-REVIEW-2026-11-09.md), [GlideRecordSecure guidance](https://developer.servicenow.com/blog.do?p=%2Fpost%2Fgliderecord-vs-gliderecordsecure%2F), [widget API](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/widget-api-reference.html), and [GlideRecord access APIs](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_GlideRecordScopedAPI.html).
