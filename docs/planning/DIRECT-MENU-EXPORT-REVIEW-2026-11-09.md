# CafeNow direct Menu export review - November 9, 2026

Reviewed [sys_remote_update_set_4cb09e8854e813107f44ff1829e40dc0.xml](../../exports/sys_remote_update_set_4cb09e8854e813107f44ff1829e40dc0.xml) as untrusted configuration data, not instructions. Original XML preserved. This is a static review of exported saved records, not live state/permissions or an executed migration.

## Findings that change the implementation

- Order Line exists in the export as `x_1234_cafenow_order_line`, not Task-extended. Its order/menu_item reference targets and item_name/quantity/unit_price/line_price columns match the user's screenshot. No Instructions column is present. Number prefix is OL in the saved table definition.
- Order remains Task-extended, prefix ORD, with mandatory inherited Location. `time_slot_v2` and `pickup_window` both reference Pickup Window. `vendo0` duplicates Vendor; the existing state write ACL condition uses that duplicate. New direct code deliberately uses vendor and time_slot_v2 only.
- Pickup Window.time_slot_v2 is **Choice**, not merely an arbitrary String label. Use getDisplayValue for the selector's label and the record sys_id for its value. Actual start/end remain Time fields; raw data encoding is not established by the configuration export. Its location reference targets imp_location, unlike Vendor/Task cmn_location.
- Menu has price (Price), vendor, item_name, active and in_stock; Vendor has active and accepting_orders. Availability defaults in the dictionary are True, but actual business-row values are not exported/verified. Food prices are read from Menu, not retained Catalog Item prices.
- Order has no exported pickup_date, acceptance or retry/capacity metadata columns. The direct package proposes six additions on existing Order and two unique indexes, not two new technical tables.

## Actual pages and current replacements

| Exported active page ID | Saved current content | Prepared change |
| --- | --- | --- |
| cafenow_home | Cafe Now main hero, Quick Links, CafeNow My Open Orders | Keep hero/link to cafe_menu; optional vendor cards; update open-order completion guard |
| cafe_menu | CafeNow Categories, Category Items, native-cart sidebar | Direct Ordering vendors/menu/sidebar instances |
| cafenow_cart | SC Shopping Cart instance | Direct Ordering cart view |
| cafenow_my_orders | Simple List on Order with human-readable ownership filter text | Explicit current-user ORD list view plus verified ACLs |
| cafenow_order_details | Form widget | Read-only ORD + Order Lines view |
| cafenow_vendor | CafeNow Vendor Open Orders | Keep queue/group authorization; exclude incomplete direct Orders |
| cafe_faqs | KB Categories | Preserve useful knowledge route; revise catalog-specific help after cutover |

The older vendors/menu/cafetest pages and several prototype/native-cart clone records are marked DELETE; do not count them as active placements. The active vendor page is singular, not cafenow_vendors.

Theme CafeNow now points to a CafeNow-owned **Cafenow Header** (`sp_header_footer` 05a00e40546813107f44ff1829e40dd9). Its server/client/template are available in this export and include native cart/typeahead entry points. Prepared derivatives suppress those entries while retaining branding/navigation; Global shared base definitions remain untouched. CafeNow Main Menu's Menu entry is type sc_category despite its cafe_menu page reference; change it to a plain Page link. Add a plain Cart page link.

## Security and automation review

- Saved Order read grant lists employee/vendor/facility/admin app roles without a record ownership/group predicate. This is a configuration concern requiring review of all matching/inherited/field ACLs; the export alone does not prove live cross-user access. Prepared read predicates enforce owner or matching vendor membership, with building/failed submissions hidden.
- Order Line read is app-admin-only in the exported configuration. Employee/vendor portal line access requires a parent-Order-based read ACL. Do not grant general write/create/delete to make details render.
- State-write condition points through vendo0.vendor_group; prepare the replacement using authoritative vendor. Ownership and permission to perform fulfillment are separate checks.
- Direct Order create is currently granted to the employee app role as well as admin. The new service requires direct form/API creates and protected metadata writes to be restricted, so native/forged record creation cannot bypass validation. Do not merely add another restrictive grant next to an existing broad allow.
- Menu import to Catalog Items (03c580aa185413107f44e367c73ecb43) is active in the saved export. Its sync should be disconnected for direct Menu ordering after preserving it. The exported Placing Order/fulfillment/catalog-copy flows have active=false. That does not inspect active Global flows, pending runs or inherited Task automation.
- No custom sys_script or sys_script_include rows were found among the application payload types. Global helpers and inherited Task rules are not necessarily included; do not infer their absence on the instance.

## Deliverables and remaining verification

Prepared [individual installation items](../servicenow/widgets/cafenow-direct-ordering/README.md): one same-scope direct-ordering service, a reusable widget with six views, Order metadata/index/property manifest, read/state authorization snippets, booking/cancellation guards and CafeNow-header derivatives. Existing vendor/home open-order scripts now exclude incomplete direct records if the technical field exists. The native-catalog package is retained as superseded source, not overwritten or repurposed silently.

The user asked whether deployment XML was being created: these are individual configuration items to install and capture in a new development update set, **not an importable update set**. No instance records were changed. Real field defaults, price/time data, scope access, ACLs, Task side effects, mobile rendering, last-seat database concurrency and cutover routes still require the documented instance checks. Additional records/table exports are not required to begin review mode; inspect one known raw time/price in the instance during setup instead of guessing.
