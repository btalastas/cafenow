# CafeNow project brief

Product: **CafeNow**. Group/company: **NowServing Solutions**. Naming confirmed October 31, 2026.

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

The team selected ServiceNow Studio and a Service Catalog presence for each vendor's food items/pricing, plus an all-vendor admin portal/view. Exact catalog structure, record model, scoped application decision and interface implementation remain pending. Scheduled execution and a bounded menu import require P01/P03/X01 clarification. Keep one authoritative order record.

November 2 team direction: after employee submission, vendor confirmation acknowledges receipt and item availability; vendors progress Preparing → Ready for Pickup → Closed Complete after pickup. Employees may cancel subject to policy but cannot advance fulfillment status. Ordering closes 30 minutes before the pickup window starts; employee cancellation closes 20 minutes before it starts, with the cancellation rule shown in terms and conditions before submission. Exact confirmation labeling, cutoff boundary behavior, cancellation-eligible states, capacity threshold and no-show handling remain unresolved. EOB means end of business; its actual time and policy remain open. No-show direction includes terms and conditions and three notices, the last warning of disposal. See [the decision record](DECISIONS.md) for qualifications; these are team-reported choices, not verified implementation or blanket approval of all requirements.

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
