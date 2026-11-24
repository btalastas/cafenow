# CafeNow project brief

Product: **CafeNow**. Group/company: **NowServing Solutions**. Naming confirmed October 31, 2026.

## Current ordering direction - direct Menu, November 9, 2026

User now requests /cafe ordering through existing Vendor/Menu/Pickup Window tables and one CafeNow Order with Order Lines, replacing catalog-item ordering for the new route. The user reports Order Line created except Instructions; actual price-total column is line_price. Keep the current Task-based Order. The [direct Menu migration map](docs/planning/DIRECT-MENU-PORTAL-MIGRATION.md) records affected pages/components, preserved records and current-export requirements. Earlier catalog/Request/RITM sections below are historical direction; the catalog-based prepared checkout must not be installed unchanged. The fresh November 9 export has now been reviewed and [individual direct-ordering installation items](docs/servicenow/widgets/cafenow-direct-ordering/README.md) are prepared, with submission disabled pending setup. No portal migration or live end-to-end result is verified.

## Purpose and users

Build a ServiceNow class pilot for employees to preorder cafeteria meals and vendors to coordinate preparation by pickup window. Faster pickup and better operational visibility are intended outcomes, not measured results.

Core personas are employees, vendor staff, vendor managers and application administrators. Building/management reporting permissions must be explicitly included or deferred in S01.

## Proposed MVP

One building, **five vendors** (team-reported November 2), one vendor per order, with simulated/non-payment checkout. Candidate requirements are defined in [R01–R10](docs/planning/REQUIREMENTS-AND-CHECKLIST.md):

- Published menus, availability and vendor-provided dietary/allergen information.
- Ordering and pickup-window selection with server-side input, cut-off and capacity enforcement.
- Vendor queues, batch totals and individual instructions.
- My Orders, validated lifecycle, cancellation and delay handling.
- Event notifications, role/record/field access controls and basic operational reports.
- Repeatable setup, testing, evidence and demonstration.

The team selected ServiceNow Studio and a Service Catalog presence for each vendor's food items/pricing, plus an all-vendor admin portal/view. On November 2, the user reported creating the Studio app and five roles and associated groups for user, sys admin, vendor, vendor admin and facility admin. Menu-item import into Catalog Items for Service Portal is planned; table creation has begun and the vendor/order/line dictionary is being finalized. Initial ideas were sketched for two Service Portal views (user and vendor) and an admin workspace. Configuration and permissions have not been inspected. Exact catalog structure, record model, scoped application decision and interface implementation remain pending. Scheduled execution and a bounded menu import require P01/P03/X01 clarification. Keep one authoritative order record.

November 2 team direction: after employee submission, vendor confirmation acknowledges receipt and item availability; vendors progress Preparing → Ready for Pickup → Closed Complete after pickup. Employees may cancel subject to policy but cannot advance fulfillment status. Ordering closes 30 minutes before the pickup window starts; employee cancellation closes 20 minutes before it starts, with the cancellation rule shown in terms and conditions before submission. Exact confirmation labeling, cutoff boundary behavior, cancellation-eligible states, capacity reservation/release behavior and no-show handling remain unresolved. EOB means end of business; its actual time and policy remain open. No-show direction includes terms and conditions and three notices, the last warning of disposal. See [the decision record](DECISIONS.md) for qualifications; these are team-reported choices, not verified implementation or blanket approval of all requirements.

Team clarification: members have access (user-reported). Vendors view Submitted orders by pickup window in their service portal and confirm individually or batch-confirm eligible orders. Capacity is 20 orders per vendor/window. No-show notices have 30-minute intervals, with the final disposal warning one hour before vendor closing; initial trigger and scheduling conflicts remain open. Pickup-window duration is not yet defined.

## Current ordering direction - November 5, 2026

User clarified same-day ordering of multiple foods/quantities for one employee and vendor, creating one CafeNow Order. Proposed implementation uses individual food Catalog Items, cart Request/RITMs, and one linked CafeNow Order as fulfillment authority. RITMs supply food/quantity details; a separate Order Line table is not required under this proposal. Shared variables, pickup consistency, checkout orchestration, import associations, price authority and security still require instance validation. This updates earlier open-ended record-model examples, not instructor approval or implementation evidence. See the [detailed ordering guide](docs/planning/MVP-FEATURE-TASKS-AND-PROCESSES.md#ordering-variables-and-menu-import---november-5-2026).

## Checkout refinement - November 6, 2026

User-confirmed journey: browse the CafeNow catalog/vendor categories, add multiple food Catalog Items from one vendor, and choose one vendor-specific pickup window when proceeding to checkout. Catalog Item -> `u_cafenow_menu_item` -> Menu -> Vendor supplies the vendor identity. Pickup Window records already reference Vendor; Order already has a Pickup Window reference. The exported Menu import flow populates the item/Menu mapping and associates CafeNow Ordering. These export observations supersede earlier statements that this mapping had not been found, without establishing successful live execution.

Collect pickup once for the order rather than repeat it on every food. A shared item variable set alone does not provide a checkout-level question; inspect and extend the actual cart/checkout path. The [November 6 review](docs/planning/ORDERING-REVIEW-2026-11-06.md) records the proposed minimal boundary, existing flow gaps and separate custom-cart prototype. Checkout integration is recommended and still needs feasibility/testing; no new implementation is claimed.

## Custom cart implementation preparation - November 9, 2026

User requested a CafeNow-owned full cart/checkout on `cafenow_cart` while retaining food Catalog Items, the native cart, Request/RITMs and authoritative Order. Pickup and terms are collected once using existing vendor-specific Pickup Window records; America/New_York is user-confirmed. The [prepared widget/service and staged setup guide](docs/servicenow/widgets/cafenow-cart-checkout/README.md) use a technical Checkout context for the Request-to-Order handoff and a unique-key capacity ledger, replacing the earlier proposed per-food variable transport for this implementation. Additional tables/fields/indexes and Flow/ACL integration require instance setup and verification. Source preparation and mocked checks do not establish live behavior; submission defaults disabled.

## Deferred scope

Payment, commercial subscription billing/entitlements, inventory/waste/supplier reporting, advanced AI/forecasting, QR, multi-building expansion and external inventory integrations remain deferred unless explicitly promoted. A menu CSV import may still be required for class integration coverage.

## Current milestone

Complete P01 (scope/delivery), P02 (rules/process diagrams) and P03 (environment/architecture). Then prepare D01, S01, U01, T01 and X01, following their dependencies in the [task breakdown](docs/planning/MVP-FEATURE-TASKS-AND-PROCESSES.md).

The proposed week-one goal is a small employee-to-vendor slice. It is an intermediate milestone; the full multi-vendor MVP also needs exception, security, reporting and test coverage.

## Completion criteria

- Scope, governing source and design choices approved and recorded.
- Employee ordering through vendor preparation and pickup demonstrated.
- Capacity/concurrency, lifecycle, cancellation, delays, notifications and access restrictions tested with evidence.
- Reports reconciled to actual recorded fields and sample data.
- Required class coverage demonstrated; deferrals documented.
- Configuration handoff, setup and demo instructions reviewed.

Final deadline, team commitments and instance capabilities remain unconfirmed. Live task ownership/status belongs in the shared MVP VTB; see [STATUS.md](STATUS.md) for reported evidence.
