# CafeNow requirements and class checklist

Candidate acceptance baseline as of November 1, 2026, for the proposed November 2 kickoff. Approval remains pending P01. Sources: [detailed proposal](../proposals/ServiceNow_OMS_Project_Proposal.md), retained Word proposals and [checklist image](../reference/project_checklist.png).

This file owns requirement meanings and class coverage. The [MVP breakdown](MVP-FEATURE-TASKS-AND-PROCESSES.md) owns task definitions, component examples and process guidance; the shared VTB owns live progress. Record approvals/deferrals in [DECISIONS.md](../../DECISIONS.md).

## November 2 team direction

The [team decision record](../../DECISIONS.md) narrows the candidate baseline: five vendors; vendor-specific Service Catalog food items/pricing; vendor receipt/availability confirmation; vendor-controlled Preparing → Ready for Pickup → Closed Complete after actual pickup; employee cancellation only; all-vendor admin portal/view; ServiceNow Studio. This is user-reported team agreement, not instructor sign-off or implemented behavior.

Apply these refinements when reviewing existing requirements:

| Requirements | Acceptance refinement / unresolved detail |
| --- | --- |
| R01, R02, R10 | Cover five vendors with distinct food items/prices and one vendor per order; exact catalog structure and authoritative order mapping remain open |
| R03, R06 | Ordering closes 30 minutes before pickup-window start; employee cancellation closes 20 minutes before start. Show cancellation terms before submission; test server-side enforcement. Exact-boundary inclusivity, eligible cancellation states, capacity is 20 orders per vendor/window; reservation/release rules and window duration remain open |
| R04, R05, R08 | Vendor service portal groups Submitted orders by window; vendor confirms individually or batch-confirms eligible orders and controls fulfillment; employees cannot advance status; define initial/confirmation states and authorized admin actions |
| R05, R06, R07 | Three no-show notices at 30-minute intervals; final disposal warning one hour before vendor closing. Define initial trigger, scheduling conflicts, actual disposal and terminal outcome; uncollected food must not be reported as picked up |
| R08, R09 | Admin view spans all vendors; vendor users remain restricted to their own vendor; define report/view permissions explicitly |

## MVP candidate requirements

November 2 portal proposal: see the [detailed portal responsibilities](MVP-FEATURE-TASKS-AND-PROCESSES.md#proposed-portal-responsibilities--november-2) for Employee, Vendor, business Admin and technical administration experiences. Search/filter, ingredients/calories and cart behavior refine candidate R01/R02; vendor confirmation/rejection and history map to R04–R08; role-restricted sales-value/operational reports map to R09. Vendor registration approval and complaints require P01 include/defer decisions. Refunds remain deferred with payments unless explicitly promoted; simulated order value is not verified revenue. Four experiences do not imply four approved portal deployments.

| ID | Requirement | Example acceptance evidence |
| --- | --- | --- |
| R01 | Employee browses published vendor menus and availability; authorized vendor managers maintain them | Employee sees eligible items, price, and vendor-provided dietary/allergen labels; unavailable items cannot be ordered |
| R02 | Order contains one vendor, items/quantities, employee, and pickup window | Valid order is recorded once; mixed vendors, invalid quantities, and missing required inputs rejected |
| R03 | Capacity, availability, and cut-off enforced server-side | At the last capacity unit, competing submissions cannot both exceed capacity; late/unavailable orders rejected |
| R04 | Vendor queue groups orders by pickup window/status | Vendor sees own queue and batch totals; individual instructions remain accessible |
| R05 | Employee tracks own order and permitted lifecycle transitions | Normal journey succeeds; invalid transitions rejected; another employee's order cannot be read |
| R06 | Cancellation and delay behavior follow agreed policy | Eligible cancellation succeeds, late cancellation fails, vendor reason retained; original pickup window preserved when delayed |
| R07 | Confirmation, ready, cancellation, and delay notifications | Intended event creates one intended email record; unrelated edits do not resend; recipient and protected link checked |
| R08 | Role/record/field permissions protect data | Employee A denied employee B's order; Vendor A denied Vendor B's records; unauthorized menu edits denied |
| R09 | Operational reporting uses supported fields | Order volume, slot utilization, and fulfillment counts reconcile with sample records; missing metrics labelled |
| R10 | End-to-end demonstration is repeatable | Seed/setup steps, personas, demo steps, test results, and known limitations documented |

Resolve exact lifecycle, capacity units/release, no-show policy, UI, and record architecture before committing detailed implementation tasks. Keep requirements linked to board tasks and test evidence.

Task-to-requirement mapping is in the [MVP breakdown](MVP-FEATURE-TASKS-AND-PROCESSES.md#requirement-to-task-traceability). Refer to it when creating VTB cards; do not treat a component or card as completion of an entire requirement.

## Checklist coverage map

The supplied image contains the categories and subitems below. Suggested examples are proposals for discussion, not commitments.

| Image category and subitems | CafeNow deliverable candidate | Week-one evidence or action |
| --- | --- | --- |
| Define process: Business Problem, Outcomes, Inputs, Outputs, User personas/stakeholders, Process steps | Process map with normal and exception journeys, measurable outcomes, stakeholders | P01/P02: reviewed process and scope |
| Design and Build Data Model: Tables, Columns, Relationships | Reviewed dictionary and relationship diagram for vendor, item, order/lines, pickup window or chosen native records | D01–D05: reviewed schema and repeatable sample data |
| Design and Create User Interface: Desktop/Tablet | Employee ordering and vendor queue in chosen supported interface | U01–U03, V01–V03, T09: sketches, integrated journeys and desktop/tablet checks |
| Apply Security: Roles, Access Control | Role matrix, ACL implementation, impersonation tests | S01–S04, T07: define permissions and repeat access checks during build |
| Automate: Flow Designer | Order-triggered routing/status/notification flow | F01–F03: demonstrate accepted-order/event orchestration |
| Automate: Scheduled Script Execution | Vendor-specific periodic upcoming-order summary | X01/X02: confirm obligation; define time zone, frequency, duplicate prevention and evidence |
| Automate: Email | Event-based order notices | N01/N02, T06: generated email evidence; delivery only if enabled and verified |
| Integrate: SOAP/REST/CSV/Microsoft Excel | A bounded menu CSV import, with validation and error report, if accepted | P01/P03/X01, I01/I02: confirm accepted mechanism, then validate/reconcile import |
| Enhance User Interface: Service Catalog | Catalog ordering if chosen; otherwise agree how catalog coverage fits architecture | P03, C01–C03: resolve catalog coverage and authoritative order relationship |
| Test | Positive/negative, access, capacity, lifecycle, notification, interface, and reporting checks | T01–T10: plan early, capture evidence throughout, review for demonstration |

If the instructor requires an item currently treated as optional in the proposal, make the scope conflict visible and agree a minimal useful demonstration. Record approved deferrals rather than silently dropping checklist items.

Reporting is required by R09 even though it is not a separate row in the supplied checklist map. Use basic reports supported by actual fields; advanced analytics is not implied. Menu imports and scheduled summaries remain conditional until the instructor decision is recorded.

## First test set

1. Valid employee order appears once in the correct vendor queue.
2. Missing fields, invalid quantities, unavailable items, and mixed-vendor input rejected.
3. Full slot, cutoff boundary, and concurrent last-capacity requests handled correctly.
4. Normal lifecycle and disallowed transitions tested by the appropriate role.
5. Cancellation permissions/cutoff/reason/capacity release match recorded policy.
6. Delay fields and revised estimate retain original pickup window and trigger intended notice only.
7. Cross-employee, cross-vendor, unauthorized field changes denied beyond UI visibility.
8. Notification event/recipient/duplicate behavior checked in generated email records.
9. Reports reconcile to known sample orders and timestamps.
10. Chosen employee and vendor journeys reviewed at desktop and tablet sizes.

For each result record requirement ID, environment, tester/date, role, inputs, expected result, actual result, pass/fail, and evidence link. Do not store credentials or real employee data in evidence.

Use Not Run until a case is executed. Link actual results to the relevant VTB card; preserve requirement IDs when refining acceptance examples. The proposed week-one demo is an intermediate slice and does not imply all R01–R10 pass.
