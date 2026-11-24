# CafeNow direct Menu ordering migration - November 9, 2026

## Current user direction

The user explicitly requests that `/cafe` and its ordering pages use Vendor and Menu records directly instead of Catalog Items. The user reports creating Order Line, except Instructions for now. This supersedes the catalog/native-cart direction for new ordering work. It does not mean the portal has already been changed or that the existing prepared widgets are compatible with the new route.

Intended journey:

```text
Vendor records -> vendor-filtered Menu records -> custom cart
    -> one vendor-specific Pickup Window choice + terms
    -> one CafeNow Order (ORD) + its Order Lines
    -> ORD confirmation/details -> vendor queue and My Orders
```

Keep existing Vendor/Menu/Pickup Window/Order tables and the existing Task-based Order lifecycle. For this new route, do not call CartJS/native catalog checkout or create Request/RITMs. Preserve historical catalog requests, Catalog Items, variable sets, imports and widget definitions; retire or disconnect their ordering routes only after the replacement is tested. Catalog usage/class coverage is not reclassified as instructor-approved or fulfilled by this change.

## Latest Order Line evidence

User-supplied field screenshot shows:

| Label | Column | Type | Evidence limit |
| --- | --- | --- | --- |
| Order | `order` | Reference, display label Order | Target technical table must be inspected in fresh dictionary |
| Menu Item | `menu_item` | Reference, display label Menu | Target technical table must be inspected in fresh dictionary |
| Item Name | `item_name` | String(160) | Snapshot when ordered |
| Quantity | `quantity` | Integer | Server validates positive whole numbers |
| Unit Price | `unit_price` | Currency | Snapshot with currency, not browser authority |
| Line Price | `line_price` | Currency | Actual column name; do not generate scripts using earlier suggested line_total |
| Number | `number` | String(40), numbered default shown | Default execution/scope behavior remains unverified |

The previously shown creation form named the table `x_1234_cafenow_order_line`. Creation and columns are user-reported/screenshot evidence; no live dictionary, saves or ACL execution verified. Instructions is intentionally absent and must not be required by prepared code. System fields remain platform-managed.

## Current export reviewed

The user supplied a [fresh November 9 application export](../../exports/sys_remote_update_set_4cb09e8854e813107f44ff1829e40dc0.xml). The [current review](DIRECT-MENU-EXPORT-REVIEW-2026-11-09.md) confirms Order Line reference targets/columns and the seven active page IDs, including singular cafenow_vendor. It identifies the current owned header, native cart/category instances and active Menu-to-Catalog import. Original export files are preserved.

[Direct ordering source and individual installation items](../servicenow/widgets/cafenow-direct-ordering/README.md) are now prepared against that configuration. No deployment XML or live instance modifications were made. The new package uses six protected additions on existing Order and two unique indexes rather than the prior Checkout/Reservation tables. Actual master-data price/time encodings, inherited Task behavior, live ACLs, DB concurrency and rendering still need instance verification; the export contains configuration rather than the business rows needed to establish those runtime values.

## Page and component map

These are known or user-reported page IDs, not a newly verified inventory. Reuse existing page IDs where possible; final placement/callers depend on the fresh export.

| Area | Direct-table behavior | Items to inspect/change |
| --- | --- | --- |
| Portal `/cafe`, theme/header/menu | Keep branding, login, navigation shell | Actual theme header, embedded native cart/search, menu links, route maps and role/criteria access |
| `cafenow_home` | Vendor cards/links and own ORD summary | Replace catalog browsing/content instances where present; retain unrelated useful widgets |
| Vendor browsing page, current ID to verify | Query authorized published/active Vendor records | Vendor display/name/image/location fields, employee read ACLs; public browsing must not depend on vendor staff membership |
| `cafe_menu` and any `cafenow_catalog` page | Menu items filtered by selected Vendor reference | Replace SC Categories/SC Category Page/data queries and category sys_id links; verify availability/image/price and validated vendor URL parameter |
| Food details page, if retained | Display Menu record details | Replace sc_cat_item links/data sources with Menu reference and relevant access checks; no variable set is required for shared pickup/terms |
| Cart sidebar and `cafenow_cart` | Custom cart contains Menu sys_ids/quantities, one vendor | Replace native CartJS/sc_cart_item source; all browsing/cart components must use the same custom cart contract |
| Checkout | Load active Pickup Windows by derived vendor; collect date/terms once | Server rechecks availability/prices/vendor/window, cutoff, currency, capacity and duplicate submission identity |
| `cafenow_my_orders`, home open-orders widget | Read authoritative ORD records | Verify employee/recipient field and ACLs; show only fully accepted orders; no REQ/RITM filter |
| `cafenow_order_details` and submission confirmation | Show ORD number and its Order Lines | Own/vendor record authorization; line quantities/prices; use line_price; replace request-ticket confirmation redirects |
| `cafenow_vendor` | Own vendor ORD queue grouped by pickup window | Keep role/group isolation; verify Order window field and complete-submission visibility; detail/food totals use Order Lines |
| Admin/vendor management pages | Existing master-data management | Preserve intended permissions; inspect catalog-oriented links and dependencies before replacing |

Standard Catalog Content, SC Categories, SC Category Page, SC Catalog Item, SC Shopping Cart and SC Checkout are built around catalog data. They do not become Menu widgets by changing a table option. Prepare CafeNow-owned replacements for affected behavior; do not edit shared Global definitions indiscriminately.

## Server submission design to settle from the current model

- Browser cart carries only Menu references and requested quantities; server derives Vendor and obtains trusted prices/availability. Recompute totals and snapshot item_name/unit_price/line_price with consistent currency.
- One employee, one vendor, one pickup date/window, one accepted ORD. Pickup and terms belong to the parent Order, not every line. Pickup sys_id is the reference; label is display only. Timezone remains America/New_York.
- Use one central server service for validation, duplicate suppression, order/line creation and failure recovery. A retry must not produce another ORD or duplicate lines.
- Do not expose a Submitted ORD to the vendor while its lines are incomplete. Plan transaction/compensation or protected technical-completion fields without inventing another fulfillment lifecycle. Exact fields/approach are pending current dictionary inspection.
- Capacity stays 20 orders/vendor/date/window. Prevent simultaneous last-place oversubscription; a client-side/full-count check is insufficient. Additional technical reservation/checkout tables are not automatically required by this direction; choose the smallest reliable mechanism after reviewing existing fields and instance capabilities.
- Order Line security must follow the parent Order's actual employee/vendor relationship. Employees do not directly set prices, vendor, state or parent references. Vendors cannot switch lines between vendors/orders.
- Existing catalog-triggered Order flows, Menu-to-Catalog synchronization, old cart routes and native header embeds must not continue submitting/creating duplicate fulfillment records through the new journey. Reconcile and disable the specific conflicting paths during cutover; preserve existing records/source definitions.

## Prepared artifacts affected

| Existing local package | Treatment for this direction |
| --- | --- |
| `widgets/cafenow-cart-checkout` | Catalog-based implementation. Preserve as reference; do not install unchanged. Its two technical tables are not approved requirements of direct Menu ordering |
| `widgets/cafenow-shopping-cart` | Native catalog sidebar. Needs replacement/custom-cart integration, not just a link change |
| `widgets/cafenow-categories`, `cafenow-category-items`, `cafenow-catalog-item` | Catalog-specific derivatives; replace active placements with direct Vendor/Menu components after inventory |
| `widgets/cafenow-full-shopping-cart` and clone-reference | Preserve earlier clone repairs; not the new cart implementation |
| `widgets/cafenow-vendor-orders`, `cafenow-my-open-orders` | Already read Order; retain useful authorization/grouping, then verify current references, date and complete-submission behavior |
| `menu-numbering` | Separate Menu numbering maintenance; no Catalog Item dependency is required for Menu.number |

## Cutover and evidence

1. Inspect fresh export and publish an exact active page/widget/header/flow inventory.
2. Verify Order/Line/Vendor/Menu/Window dictionary, price/time encodings, ownership and access model.
3. Build direct vendor/menu browsing and one shared custom cart; preserve the current portal/page structure.
4. Build tested direct ORD/Line submission and the confirmation/detail views.
5. Update My Orders/vendor views and server ACLs; replace conflicting catalog entry points/flows.
6. Verify multi-food quantities, one vendor, correct window/date, terms, historical snapshots, duplicate/failure recovery, simultaneous capacity, ACL/direct-link isolation, mobile/keyboard layout and absence of new REQ/RITM creation through the direct route.

Existing D01-D04/S01-S04/U01-U03/V02-V03/B01-B04/T02-T04/T07/T09 tasks own implementation/security evidence. Keep all task IDs and existing dependencies; update live status/owners in the shared VTB. No code deployment, source migration, table creation or end-to-end execution is claimed by this map.
