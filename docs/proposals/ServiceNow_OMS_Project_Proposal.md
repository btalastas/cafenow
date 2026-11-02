# ServiceNow Team 7 Final Project Proposal

Members

- Colleen Gildea
- Margaret Idika
- Subha Suresh Kumar
- Nayeemur Rahaman Basha Mohammed
- Bjorn Talastas

## CafeNow: Corporate Cafeteria Order Management System

**Group/company:** NowServing Solutions  
**Updated:** November 1, 2026 (October 31–November 1 planning work)  
**Project phase:** Define Process and MVP planning  
**Project type:** Proposed ServiceNow application; native catalog versus custom order model pending P03  
**Pilot scope:** One corporate building and its on-site cafeteria vendors  
**Business model concept:** Business-to-business (B2B) subscription service for companies or building operators  
**Future expansion:** Educational institutions, subject to pilot results  
**Purpose:** Instructor review, group discussion, and project scope approval  
**Status:** Working proposal; naming confirmed, scope and technical approach pending team/instructor decisions

This revision incorporates the weekend's requirements, component/process mapping, task breakdown and delivery planning. It is not an approved implementation specification. No application build or executed acceptance tests are claimed. The retained Word proposals and HTML/text exports are historical versions and have not been synchronized with this Markdown revision. Approved choices belong in [DECISIONS.md](../../DECISIONS.md); current evidence is summarized in [STATUS.md](../../STATUS.md).

---

## 1. Executive Summary

CafeNow is a proposed ServiceNow-based order management system for employees and food vendors in a corporate building. Employees place orders before or during their break, choose a vendor and pickup window, and receive order status updates. Vendors use a centralized, role-restricted queue to organize incoming orders by vendor, pickup window, and preparation status. This gives vendor staff a clearer view of the lunch rush and helps them coordinate preparation and handoff.

The project focuses on the time employees lose across the lunch process: walking to the cafeteria, waiting in line, placing an order, waiting for food, and eating within a limited break. Preordering and organized pickup aim to reduce avoidable ordering and pickup delays. Operational dashboards can help vendors understand demand and plan inventory. With additional data and vendor participation, reports could also support waste-reduction efforts, dietary and allergen transparency, and relationships with local food suppliers.

CafeNow is also envisioned as a B2B subscription service sold to companies or building operators that manage corporate cafeterias. The subscribing organization would select a service tier, while its employees and participating food vendors use the ordering and operations features. Higher tiers could add dashboards, inventory tools, and proposed forecasting or AI-assisted capabilities. These tiers are a future commercial concept; the class pilot should establish the core workflow and demonstrate selected reporting without depending on a live subscription or payment system.

## 2. Define Process

### 2.1 Business Problem

Employees may have a short, fixed break and spend much of it getting lunch. The process can include walking from their work area to the cafeteria, waiting in a line, deciding and ordering, waiting for food to be prepared, and then eating before returning to work. Long or unpredictable queues reduce the time available to eat and rest.

Food vendors face a matching operational problem. Many employees arrive during the same lunch period, creating a rush of individual orders. Staff may have limited advance visibility into the number and type of meals to prepare, making it harder to prioritize orders, coordinate staff, estimate ingredients, and communicate delays.

**Problem statement:** Employees in the pilot building lack a convenient way to order ahead and collect lunch predictably within a limited break, while cafeteria vendors lack one shared, timely view of incoming lunch demand and order status.

### 2.2 Proposed Business Solution

Build CafeNow on ServiceNow as both an employee ordering workflow and a proposed B2B service for organizations operating corporate cafeterias. A company or building operator would subscribe to CafeNow and choose a tier based on the operational features it needs. The organization administers the service for its building; employees order from participating vendors; vendor staff manage their own menus and order queues.

The ServiceNow application would let employees:

- Browse participating vendors, menus, prices, availability, and dietary/allergen information supplied by vendors.
- Select meals, quantities, and any permitted customizations.
- Choose an available pickup window and submit an order.
- Review order status and receive confirmation, ready-for-pickup, or delay notifications.

Authorized vendor staff would use a centralized operational queue to:

- View orders assigned to their vendor, organized by pickup window and preparation status.
- See order details and batch totals for similar menu items while retaining access to each individual order.
- Coordinate work during peak lunch periods, update availability, and mark orders as preparing, ready, or completed.
- Review demand and, where inventory data is collected, compare planned demand with stock and actual usage.

The B2B subscription model would package additional capabilities into Basic, Professional, and Enterprise tiers. The tier table in Section 6 describes the proposed feature differences. Subscription billing, pricing, and production entitlement enforcement are future business-model work; they are not dependencies for the class MVP.

**Queue design:** Group orders primarily by vendor, pickup window, and status. Batch totals can help staff organize preparation; employee details and special instructions remain available on the individual order to reduce fulfillment mistakes.

### 2.3 Expected Outcomes and Measures

| Intended outcome | How the system can support it | Suggested measure / data source |
| --- | --- | --- |
| Reduce ordering and pickup delays | Preordering, pickup windows, capacity checks, and status updates | Time from order submission to handoff; compare with a baseline where available |
| Help employees use breaks effectively | Make pickup timing more predictable | Percent of orders handed off within the selected window; employee feedback on whether they had time to eat |
| Organize vendor lunch rushes | Central queue, slot-based grouping, batch totals, and status tracking | Orders by vendor and 15-minute slot; queue backlog; on-time-ready rate; preparation time |
| Improve inventory planning | Compare order demand with inventory levels, purchases, and actual usage | Forecast-versus-actual demand; stockouts; unused or expired inventory; inventory cost, if recorded |
| Identify opportunities to reduce food waste | Track leftover and discarded quantities with a consistent reason and measurement method | Quantity and estimated cost of leftovers/discards by item and day; trend over time against a baseline |
| Support dietary and allergen transparency | Display vendor-provided ingredient, allergen, and dietary labels at menu and order time | Menu items with complete information; dietary request volume; reported order corrections or incidents |
| Encourage local community sourcing | Record supplier and sourcing information for eligible menu items | Share of tracked purchases from local suppliers; number of participating local suppliers; spend or quantity by supplier, if provided |
| Improve employee satisfaction | Provide clearer menus, pickup expectations, and notifications | Employee survey or feedback score; order issue and cancellation rates |

*The MVP can report on orders, demand, and fulfillment if those fields are implemented. Reliable waste, inventory-cost, dietary-safety, and local-sourcing measures require accurate data entry or supplier integration and agreed definitions. Dashboard trends alone do not prove that the system caused a change.*

### 2.4 Users and Stakeholders

| Role | Needs and responsibilities |
| --- | --- |
| Corporate Employee | Browse menus, place or cancel eligible orders, choose pickup, review status, and provide feedback |
| Vendor Staff | Review assigned orders, coordinate preparation, update availability and statuses, and confirm handoff |
| Vendor Manager | Manage menu information, operating hours, pickup capacity, staff access, and available inventory data |
| Cafeteria / Building Administrator | Coordinate participating vendors, resolve operational issues, and review building-level aggregate reports |
| Company Management / Subscriber | Select service tier, review aggregate service and performance trends, and manage organizational participation |
| Application Administrator | Maintain application configuration, access controls, data quality, workflows, and reporting |
| Local Food Supplier (future participant) | Supply product and sourcing information through the vendor or an agreed data process |

### 2.5 Inputs and Outputs

| Inputs | Outputs |
| --- | --- |
| Employee identity and authorized access | Employee-specific ordering view and protected order history |
| Organization/building subscription tier (future commercial service) | Feature access associated with the subscribed tier, if implemented |
| Vendor, menu item, quantity, and customization | Order record and itemized preparation details |
| Requested pickup window | Validated slot and vendor preparation queue |
| Vendor capacity and item availability | Available choices or a prompt to select another item/window |
| Vendor status updates and timestamps | Confirmation, ready, delay, and completion updates |
| Menu ingredient, allergen, and dietary labels supplied by vendor | Menu details visible before order submission |
| Inventory on hand, purchases, and usage (optional/phase 2) | Inventory summaries, low-stock alerts, and demand comparisons |
| Leftover/discard quantities and reason (optional/phase 2) | Waste and cost trend reports, if measurements are consistently recorded |
| Supplier and sourcing details (optional/phase 2) | Local sourcing and supplier participation reports |
| Completed order and fulfillment history | Operational dashboards and trend reports according to available features |

**Scope assumption:** Use a non-payment or simulated checkout for the MVP. Real payment processing and storage of payment-card information are outside the project scope. Subscription billing is also outside the class MVP.

### 2.6 Proposed End-to-End Process

1. **Open the portal:** An authenticated employee opens the corporate cafeteria ordering experience.
2. **Browse:** The employee reviews participating vendors, menus, prices, availability, and vendor-provided dietary/allergen details.
3. **Build the order:** The employee chooses one vendor, menu items, quantities, and permitted customizations.
4. **Choose pickup:** The employee selects an available pickup window that fits their break.
5. **Validate and submit:** ServiceNow checks required fields, item availability, and remaining slot capacity, then creates an order.
6. **Organize the rush:** The order appears in the correct vendor's centralized queue, grouped by pickup window and status. Batch totals help staff plan similar items.
7. **Prepare:** Vendor staff review individual order details, coordinate preparation, and update the order status.
8. **Notify:** The employee receives confirmation and a ready-for-pickup or delay notice.
9. **Hand off:** Vendor staff verify the order number and mark the order picked up/completed.
10. **Review:** Order, timing, and optional inventory/waste/sourcing data feed the appropriate dashboard or report. The organization's subscription tier could determine access to additional reporting in a future commercial release.

**Example scenario:** A vendor sees 25 orders for the 12:00–12:15 PM window before the lunch rush, including 15 sandwiches, 7 salads, and 3 hot meals. Staff can organize preparation around the known workload and review the individual orders for customizations before handoff.

### 2.7 Order Status and Notifications

The lifecycle below remains proposed. P02 must resolve differences with the historical Word proposal, including whether Confirmed is needed, delay representation, permitted cancellation states, no-show handling and notification thresholds.

Employees should be able to open **My Orders** to see the current status, order number, vendor, pickup location, selected pickup window, and latest update. The order record is the source of truth; email notifications direct the employee back to that record.

| Order status | Meaning / trigger | Employee notification |
| --- | --- | --- |
| Submitted | The order passes validation and is created in the vendor queue | Confirmation with order number, vendor, pickup location, and pickup window |
| Preparing | Vendor staff begin preparing the order | Status visible in My Orders; no separate email required for the MVP |
| Ready for Pickup | Vendor staff confirm that the order is ready for handoff | Ready-for-pickup email with order number and pickup instructions |
| Completed | Vendor staff verify handoff and mark the order picked up | Completion visible in My Orders and order history |
| Cancelled | The employee cancels before preparation begins, or authorized vendor staff cancel an unfulfillable order with a reason | Cancellation email with the order number and reason |

**Normal progression:** Submitted → Preparing → Ready for Pickup → Completed. An eligible order can move to Cancelled; Completed and Cancelled are final states. Employees can cancel only their own Submitted orders before the configured cut-off. Vendor cancellations require a reason; application administrators handle exceptional corrections.

**Delay handling:** Track a delay separately from the lifecycle status so an order can remain Preparing while delayed. Vendor staff enter a delay reason and revised estimated ready time. Show both in My Orders and send a delay email when the delay is first recorded or the estimate changes materially. Retain the originally selected pickup window for performance reporting.

**Proposed automation:** Use Flow Designer and email notifications to send confirmation after successful order creation and ready/cancellation notices on the corresponding status transition. Trigger delay notices from changes to the delay fields. Send messages to the employee associated with the order, avoid duplicate notices on unrelated record edits, and record status-change timestamps for reporting. Notification content should include essential pickup details and a link to the protected order view.

**Acceptance checks:** Verify the normal lifecycle, permitted cancellations, delay updates, and recipient access. Confirm that each qualifying event generates one intended notification, unrelated edits do not resend it, invalid status transitions are rejected server-side, and employees can view only their own orders. In the training instance, inspect generated email records and demonstrate delivery only if outbound email is enabled.

### 2.8 Key Assumptions and Open Requirements

- The pilot is limited to **one corporate building** and a manageable number of cafeteria vendors.
- Employees and vendor staff can be identified and assigned appropriate roles.
- Each order is associated with one vendor for the MVP.
- Vendors maintain menu availability and provide accurate ingredient/allergen information; the application displays the information but does not independently verify it.
- Pickup windows need configurable capacity and order cut-off rules.
- Inventory, waste, supplier sourcing, and food-cost reports depend on reliable input data and may be staged after the core ordering workflow.
- Employee arrival and eating duration may be difficult to measure directly. The pilot should avoid collecting unnecessary location or personal data; use order timestamps, opt-in feedback, and an agreed baseline where possible.
- The B2B subscription model and tier packaging are future business design; implementing billing or tier enforcement is not required to demonstrate the workflow.
- Payment processing, advanced forecasting and external inventory integrations are deferred. A bounded menu import may be required to satisfy the class integration checklist; confirm via P01/P03/X01.
- Capacity units, cut-off boundaries, time zone, cancellation release and failed-submission recovery must be agreed. A concurrency-safe design must prevent two requests from consuming the last available unit.
- Captured order-line prices must remain stable when menu prices change. Define how availability changes affect accepted orders.
- Scheduled execution and Service Catalog coverage require explicit instructor clarification; optional proposal wording does not override class requirements.

### 2.9 Business processes and automation responsibilities

Use one request-to-fulfillment overview and detailed exception diagrams. Suggested swimlanes: Employee, CafeNow system, Vendor staff/manager; add Admin for setup/exceptional correction. Human activities and system activities should appear separately.

| Process                       | Diagram path                                                                                                         | Decisions/exceptions to show                                                     | Automation to implement                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| BP01 Maintain menu            | Manager edits → validates → publishes/changes availability → employee browses                                        | Wrong vendor, missing/invalid data, changes after order placed                   | Human-led; server validation/ACLs (D02, V01). No separate Flow Designer flow needed                  |
| BP02 Configure pickup windows | Manager/admin defines window/capacity/cut-off → validates → offers window                                            | Invalid dates/units, overlap policy, edits with existing orders                  | Human-led setup with server rules (D04). Recurring generation deferred unless required               |
| BP03 Submit and accept order  | Employee selects → server validates → reserves capacity/commits order and lines → routes → confirms                  | Full/late/unavailable, mixed vendor, repeat submission, partial failure/recovery | Server validation/booking B01–B02; **F01** accepted-order routing/confirmation                       |
| BP04 Prepare and hand off     | Vendor reviews queue → starts preparing → marks ready → employee collects → vendor verifies order number → completes | Invalid transition, delay, unable to fulfill, no-show                            | Human status decisions; server guards/timestamps B03; **F01** ready notice; completion feeds reports |
| BP05 Employee cancellation    | Requests cancellation → checks actor/state/cut-off → cancels/releases → notifies                                     | Too late, preparing/terminal, repeated request                                   | Server B04; **F02** accepted-cancellation notice                                                     |
| BP06 Vendor cancellation      | Vendor enters reason → validates authorization/state → cancels/releases per policy → notifies                        | Wrong vendor, missing reason, disallowed state                                   | Server B04; reuse **F02**, preserve initiator/reason                                                 |
| BP07 Delay handling           | Vendor records reason/estimate → validates → retains original window → updates My Orders → conditionally notifies    | Invalid estimate, immaterial change, retry, clearing delay                       | Server B05; **F03** first/material-change notice; never auto-mark ready                              |
| BP08 Upcoming-order summary   | Schedule fires → selects vendor/window/orders → produces summary → records run                                       | No orders, duplicate run, time zone boundary, wrong audience                     | **X02 Scheduled Script Execution**, if required                                                      |
| BP09 Menu import              | Authorized user supplies CSV → maps/validates → imports good rows → reviews rejects                                  | Wrong vendor, missing key, bad price, repeated import                            | **I01–I02 import process**, if required; no additional flow by default                               |
| BP10 Review operations        | Authorized viewer selects period/vendor → reports aggregate data → reviews findings                                  | No data, inconsistent units, cross-vendor access                                 | A01–A02 reports; no separate flow required                                                           |

Process IDs BP01–BP10 and the linked task IDs are maintained in the [MVP task/process guide](../planning/MVP-FEATURE-TASKS-AND-PROCESSES.md). Draw Employee, CafeNow System and Vendor swimlanes, with separate cancellation/delay exception paths. Validate and commit an accepted order before orchestration; food preparation/readiness/handoff remain human decisions.

## 3. ServiceNow Feature and Checklist Alignment

| Application checklist | ServiceNow features to explore | Proposed CafeNow use |
| --- | --- | --- |
| Define Process | Requirements, process mapping | Employee break journey, vendor rush, personas, outcomes, and exceptions |
| Design & Build Data Model | App Engine Studio, custom tables, reference fields | Minimal building configuration, vendors, menu items, authoritative orders/lines and pickup windows; inventory/supplier entities deferred |
| Design & Create User Interface | Service Portal, UI Builder, lists and forms | Employee menu/order experience and vendor queue |
| Apply Security | Users, groups, roles, ACLs | Employees see their own orders; vendor staff see their vendor's queue; managers see approved aggregate reports |
| Automate | Workflow Studio / Flow Designer | Route accepted orders and orchestrate qualifying status/notification events; server rules enforce validity before follow-up |
| Automate | Scheduled Script Execution | Vendor-specific upcoming-order summary if required; confirm schedule, time zone and duplicate prevention |
| Automate | Email Notifications | Confirmation, ready, cancellation and qualifying delay alerts |
| Integrate | REST APIs, import sets, CSV/Excel | Bounded menu CSV import with validation/repeat-import checks if accepted; inventory/supplier integration deferred |
| Enhance User Interface | Service Catalog, catalog items, order guides | Guided menu ordering, if appropriate for the training instance |
| Test | Automated Test Framework, impersonation | Order lifecycle, capacity, access, and exception testing |
| Analyze | Reports, dashboards, Platform Analytics | Basic order volume, slot utilization and fulfillment reports; advanced analytics and inventory/waste/sourcing reporting deferred |
| Optional Advanced | Available AI / Now Assist capabilities | Future demand summaries or recommendations, subject to availability and instructor approval |

*Confirm module availability, entitlements, and the expected interface technology with instructors before committing to a particular implementation.*

### 3.1 Employee-Facing Interface

The employee view should make it easy to compare vendors and menus, understand item availability and vendor-provided dietary/allergen labels, choose a pickup window, and track an order. Keep the initial experience focused on the one corporate building and its participating vendors.

### 3.2 Vendor-Facing Interface

The vendor view should prioritize the next pickup windows and show order number, items, quantities, pickup time, permitted special instructions, and status. It should summarize quantities for batch preparation while preserving individual order details. Vendor staff should be able to mark an item unavailable and update order progress.

### 3.3 Dashboards and Reports

The MVP baseline is order volume, slot utilization and fulfillment counts (R09). The broader report catalogue below includes later-phase ideas; it does not add inventory, waste, sourcing or survey work to the MVP. Define units, included states and time boundaries before configuring reports. For example, 15 reserved meals in a 20-meal window means 75% utilization only if meals are the agreed capacity unit; meal counts and order counts must remain distinct.

Dashboards should be designed for operational decisions, with separate views for vendors and building management. Vendor reports can show near-term workload, item demand, slot capacity, and—if the vendor records it—stock levels, purchases, usage, and leftovers. Building-level reports can show aggregate order volume, pickup performance, service issues, and participation by vendor. In a future B2B release, tier entitlements could determine which reporting and inventory features are available to each subscribing organization.

| Dashboard/report | Example measures | Data needed | Primary user |
| --- | --- | --- | --- |
| Lunch operations | Orders by vendor/time slot; queue backlog; slot capacity; ready-on-time rate; average preparation and handoff time | Order, vendor, pickup slot, and status timestamps | Vendor staff / vendor manager |
| Inventory planning | Demand by item; inventory on hand; purchases; usage; stockouts; estimated cost | Menu item and consistent inventory/purchasing records | Vendor manager |
| Waste tracking | Leftover/discard quantity, item, reason, date, and estimated cost | Consistent end-of-day waste entry and agreed unit/cost definitions | Vendor manager / building administrator |
| Dietary information | Menu coverage for allergen/ingredient labels; dietary request counts; order correction or issue counts | Vendor-maintained menu attributes and carefully categorized issue records | Vendor manager / administrator |
| Community sourcing | Local supplier count; tracked local purchase share or spend; items linked to suppliers | Supplier records and sourcing/purchase information | Vendor manager / building administrator |
| Employee experience | Pickup-window completion; cancellations; delays; feedback score | Order timestamps, status, cancellation reason, optional survey | Building administrator / management |

**Measurement guidance:** In the MVP, implement only the metrics supported by the available fields and time. Mark missing or estimated values clearly. A waste-reduction claim requires a comparable baseline and recorded waste measurements; local-sourcing results require supplier and purchase data. Dietary labels should be sourced from vendors and paired with a process for corrections; the dashboard is an information aid, not a food-safety certification.

### 3.4 Implementation components and concrete examples

These are proposed implementation choices subject to P03, linked to existing tasks rather than new business features. Full examples and verification expectations are in the [component guide](../planning/MVP-FEATURE-TASKS-AND-PROCESSES.md#servicenow-component-guide-with-concrete-cafenow-examples).

| Components | CafeNow example | Tasks |
| --- | --- | --- |
| Users, roles and groups | Separate employees A/B and vendor staff A/B; map a vendor fulfillment group explicitly to its vendor | S01–S02 |
| Tables, fields and references | An order links employee, vendor and window; two $8 sandwiches and one $7 salad retain a $23 captured total | D01–D05 |
| ACLs | Employee A cannot read B's order/lines; Vendor A cannot update Vendor B's menu or protected prices | S03–S04, T07 |
| Portal, lists/forms and actions | Employee uses My Orders/Cancel; vendor groups its queue by window and uses a validated Mark Ready action | U01–U03, V01–V03 |
| Catalog, item variables and request records | A Place Meal Order entry captures vendor/items/window; if native requests are chosen, define which Requested Item owns fulfillment | C01–C03 |
| UI/Catalog UI Policies and reference qualifiers | Show delay fields when relevant and filter item/window choices to the selected vendor; server checks still apply | C02, U02, V02, B05 |
| Business Rules and Script Includes | Reject quantity zero and invalid transitions; reuse cancellation eligibility/release logic across supported server entry points | B01–B05 |
| Flow Designer and email | Accepted order routes to the vendor; a ready transition sends one intended employee notice with a protected link | F01–F03, N01–N02 |
| Scheduled Script Execution | Produce an upcoming-order summary per vendor on an agreed schedule, without repeated output for the same run | X01–X02, if required |
| Import Sets and Transform Maps | Stage menu CSV rows, map an agreed vendor/item key, reject invalid prices and avoid unintended duplicates on reimport | I01–I02, if required |
| Reports/dashboard | Reconcile known orders by status and window utilization; vendor access remains isolated | A01–A02, T08 |
| Automated Test Framework | Automate supported valid/invalid order cases selectively; retain separate evidence for concurrency and unsupported UI cases | T01–T10 |
| Visual Task Board | Track B04 cancellation implementation and review evidence as a development card; vendor food fulfillment uses the application queue | Shared MVP delivery board |

A component name does not prove correctness. B02 must demonstrate concurrent last-unit reservation and failed-submission recovery; B04 must demonstrate capacity release exactly once. UI visibility and reference filters do not replace ACLs or server validation. Generated emails do not establish delivery without separate evidence.

## 4. Preliminary Data Model

Entities below are logical candidates, not approved custom tables. P03 selects native/custom record ownership; D01 defines actual scoped names and relationships. Use minimal configuration for the single building; future data entities do not need to be created for the MVP.

| Table | Possible columns | Relationship / purpose |
| --- | --- | --- |
| Organization / Building | Organization Name, Building Name, Location, Status, Subscription Tier (future) | Represents the B2B customer and pilot location |
| Cafeteria Vendor | Name, Building, Location, Status, Manager, Operating Hours | One vendor has many menu items and orders |
| Menu Item | Name, Description, Price, Category, Available, Vendor, Ingredient/Allergen Labels, Dietary Tags | References Vendor; labels maintained by vendor |
| Food Order | Number, Employee, Vendor, Pickup Window, Status, Submitted/Preparing/Ready/Completed/Cancelled Timestamps, Delay Flag, Delay Reason, Estimated Ready Time, Cancellation Reason | References employee, Vendor, and Pickup Window; supports status tracking and notification triggers |
| Order Line Item | Food Order, Menu Item, Quantity, Captured Unit Price, Instructions | One order has one or more line items |
| Pickup Window | Vendor, Start, End, Capacity, Cut-off Time | Capacity consumption uses the agreed order/meal/preparation unit; define reservation and release behavior |
| Inventory (optional / phase 2) | Vendor, Menu Item, Quantity on Hand, Unit, Reorder Threshold, Updated At | Supports stock visibility when maintained consistently |
| Waste Entry (optional / phase 2) | Vendor, Menu Item, Quantity, Unit, Reason, Estimated Cost, Date | Tracks leftovers or discarded food using agreed definitions |
| Supplier (optional / phase 2) | Supplier Name, Location/Local Status, Contact, Product Categories | Supports local-sourcing reports where purchase data is available |
| Purchase Record (optional / phase 2) | Supplier, Menu Item/Product, Quantity, Unit Cost, Purchase Date | Connects vendor purchasing to inventory and sourcing reports |
| Subscription / Tier Entitlement (future) | Organization, Tier, Status, Start Date, Enabled Features | Represents a future commercial subscription, not required for the class MVP |

**Architecture decision for review:**

- **Catalog-centered option:** Use catalog items, order guides, and native request records such as `sc_request` and `sc_req_item`, with variables representing pickup details.
- **Custom application option:** Use custom Food Order and Order Line Item tables for precise queue, pickup, and reporting behavior.

**P03 investigation:** Compare native catalog and custom-record options against the agreed rules, available modules and class coverage. Demonstrate feasibility with one vendor/item/window/order before committing. Maintain one authoritative order record and lifecycle owner; document the relationship of any request container, line records and fulfillment tasks. Neither approach is approved yet.

## 5. Security and Data Governance

The role names below describe personas; actual scoped identifiers remain pending S01/D01. Building/management permissions require an explicit inclusion or deferral decision. Organization subscription administration is future scope.

| Proposed application role | Authorized actions |
| --- | --- |
| Employee | Browse published menus; create/read own orders; cancel own Submitted orders before the cut-off through a validated action |
| Vendor staff | Read/update orders assigned to their vendor; update preparation and handoff status |
| Vendor manager | Maintain their vendor's menu, availability, and optional operational data; view vendor reports |
| Building administrator (confirm scope) | Coordinate pilot configuration and view approved building-level aggregate reporting |
| Organization administrator (future) | Manage organization/building configuration and future subscription-tier settings, if implemented |
| Application administrator | Administer application data, workflows, access, and configurations |

**Security and data-quality tests:** An employee cannot read another employee's order; Vendor A staff cannot access Vendor B's queue or private records; only authorized managers can change menu/allergen and inventory data; aggregate reports avoid exposing unnecessary employee details. Apply server-side validation and table/record/field ACLs, then test by impersonating each role.

Menu ingredient and allergen information must have a named vendor owner and an update process. Reports should identify incomplete menu information and data freshness. Do not imply that ServiceNow has independently validated vendor-supplied food information.

## 6. B2B Subscription Model and Service Tiers (Future Commercial Model)

CafeNow could be offered to companies or building operators as a subscription service. The subscribing organization would select a tier based on the capabilities it needs for its corporate cafeteria operation. Employees and vendor teams would access the service through the subscribing organization. The proposed tiers describe feature packaging only; pricing, contract terms, and licensing are not defined in this project.

| Feature | Basic | Professional | Enterprise |
| --- | :---: | :---: | :---: |
| Employee ordering and notifications | Yes | Yes | Yes |
| Vendor fulfillment queue | Yes | Yes | Yes |
| Operational dashboards and reports | — | Yes | Yes |
| Inventory management tools | — | Yes | Yes |
| Forecasting and demand recommendations | — | — | Proposed |
| AI-assisted menu guidance | — | — | Proposed |

The Basic tier covers the core ordering and vendor queue. Professional adds operational visibility and inventory tools. Enterprise may add forecasting and AI-assisted guidance if sufficient data, suitable ServiceNow capabilities, and applicable licensing are available. The commercial tier table does not determine class scope: basic operational reports are included in the proposed MVP regardless of future packaging. Inventory, forecasting and AI remain deferred.

## 7. Recommended Delivery Scope

### Phase 1 — Minimum Viable Product

The weekend planning work expresses the candidate MVP as R01–R10. This is a proposal snapshot; the [requirements/checklist](../planning/REQUIREMENTS-AND-CHECKLIST.md) maintains acceptance wording and the [task guide](../planning/MVP-FEATURE-TASKS-AND-PROCESSES.md#requirement-to-task-traceability) maps requirements to implementation/testing. None is marked implemented or accepted here.

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

**Conditional class coverage:** Confirm Service Catalog expectations through P01/P03 and scheduled execution/menu import through X01. If required, include X02 and I01/I02 in the agreed delivery scope. These obligations must not be silently postponed to a later phase.

### Phase 2 — Operational and Measurement Enhancements

- [ ] Richer vendor demand/preparation analytics beyond the basic MVP queue and reports
- [ ] Optional inventory counts and low-stock indicators
- [ ] Consistent waste/leftover recording and cost estimates
- [ ] Supplier and purchase records to report local sourcing where data is available
- [ ] Employee feedback and baseline/post-pilot comparison
- [ ] Expanded inventory/supplier import; a bounded menu import may already be required for the class MVP

### Phase 3 — Future Commercial Product and Expansion

- [ ] Basic, Professional, and Enterprise tier packaging
- [ ] Subscription status and feature entitlements for subscribing organizations
- [ ] Expand to additional corporate buildings
- [ ] Explore an educational-institution adaptation
- [ ] Demand forecasting or AI-assisted recommendations
- [ ] Payment, QR, mobile, or external inventory integrations

## 8. Suggested Team Workstreams (Five Members)

These are proposed responsibility areas, not confirmed assignments to the listed members. Record real owners/reviewers and available hours on VTB cards at kickoff; share testing and review across workstreams.

| Workstream | Ownership | Expected outputs |
| --- | --- | --- |
| Business analysis and project coordination | Member 1 | Requirements, scope, employee/vendor personas, process map, decision log |
| Data model and security | Member 2 | Tables, references, field definitions, roles, ACLs, data-quality rules |
| Employee interface and ordering | Member 3 | Portal/catalog experience, menus, order submission, employee order view |
| Vendor operations and automation | Member 4 | Vendor queue, pickup capacity, Flow Designer routing/status/notifications |
| Reporting, testing, and demonstration | Member 5 | Dashboard definitions, test cases, role-based validation, demo flow and findings |

All five members should review the process and data model, participate in integration testing, and contribute to the final presentation. Workstream assignments can be adjusted to match each member's experience and the instructors' expectations.

## 9. Questions for Instructor Feedback

1. Is the one-building corporate pilot appropriately scoped for the final project and available time?
2. Should we build around native Service Catalog request tables or custom Food Order tables?
3. Should the employee and vendor experiences use Service Portal, UI Builder, Workspace, or a combination?
4. Which five workstreams best fit the team's skills and expected deliverables?
5. Which application, reporting, and automation capabilities are available in the training instance?
6. Is simulated checkout acceptable for the MVP?
7. Which operational dashboard measures should be implemented in the MVP, and which should remain future-phase concepts?
8. Should the B2B tier model remain a future business concept, or should we demonstrate a simple tier/entitlement record in the project?
9. What level of testing, ACL validation, and documentation is expected?
10. What is the final deadline, submission package and demo duration, and who approves scope/acceptance?
11. Is Scheduled Script Execution mandatory, and which implementation mechanism is accepted?
12. Are SOAP/REST/CSV/Excel alternatives, and would a validated menu CSV import satisfy integration coverage?
13. Is Service Catalog mandatory if the authoritative order uses custom records?
14. Which proposal governs requirements, and how should conflicts be resolved?

## 10. Sample Final Demonstration

**Scenario:** An employee in the pilot building has a limited lunch break and wants a 12:15 PM pickup.

1. Impersonate the employee and open the CafeNow portal.
2. Review vendor menus, availability, and supplied dietary/allergen information.
3. Select a vendor, meal, quantity, and pickup window; submit the order.
4. Show the order record and capacity validation.
5. Impersonate vendor staff and locate the order in the centralized queue grouped by pickup time.
6. Show how the vendor view summarizes batch quantities while preserving each order's instructions.
7. Advance the order through *Preparing* and *Ready for Pickup*; show the employee notification.
8. Mark the order picked up and show the update to operational reporting.
9. Impersonate another employee and another vendor to demonstrate record/field restrictions.
10. Use separate seed cases to show an unavailable/full/late rejection, eligible cancellation with release-once evidence, and a delay retaining the original window.
11. Present recorded simultaneous-capacity and notification-duplicate test results; show required import/scheduled evidence if included in approved scope.

Rehearse within the confirmed demo duration. Capture environment, persona, inputs, expected/actual result and evidence links. Tests remain Not Run until executed; claims in this scenario are demonstration goals.

## 11. Define Process Completion Checklist

- [x] Business problem drafted for the corporate-building pilot
- [x] Proposed solution drafted
- [x] B2B subscription concept and feature tiers proposed for future commercial service
- [x] Expected outcomes, dashboard concepts, and KPIs proposed
- [x] Inputs and outputs drafted
- [x] Employee, vendor, and building stakeholder roles identified
- [x] Five team workstreams proposed
- [x] CafeNow / NowServing Solutions naming confirmed
- [x] Candidate R01–R10 baseline and class checklist map prepared
- [x] 47 task definitions, component examples and BP01–BP10 process guidance prepared
- [x] Proposed first-week playbook and VTB conventions prepared
- [ ] Confirm process steps and exception handling
- [ ] Confirm MVP versus phase 2 reporting/data requirements
- [ ] Confirm ordering architecture and payment assumptions
- [ ] Review subscription tiers with instructors as future scope
- [ ] Review with instructors and incorporate feedback

---

**Immediate next step:** Complete P01 scope/delivery decisions, reconcile P02 rules with P03 platform findings, then refine D01/S01/U01/T01/X01. Checkmarks above indicate drafted planning artifacts or confirmed naming, not instructor approval or a built application.

## 12. Weekend Planning Update and Execution Approach

### 12.1 Work completed October 31–November 1, 2026

- Confirmed CafeNow as product and NowServing Solutions as group/company.
- Organized proposal/reference materials and created consistent project, decision, status and planning documents.
- Developed R01–R10, class coverage mapping, 47 detailed tasks, concrete component examples, and BP01–BP10 process/automation guidance.
- Prepared a proposed November 2–6 kickoff and daily work plan, VTB conventions and paste-ready starting cards.
- The user reports P01–P03 created on the shared VTB. Text for five foundation cards has been prepared; their creation/completion is not verified.

No application configuration, executed acceptance tests, finalized architecture or live Codex connection has been verified. Board preparation is delivery planning progress. Final deadline, instructor decisions and real team commitments remain pending.

### 12.2 Initial cards and expected outputs

| Task | Purpose / output | Dependencies |
| --- | --- | --- |
| P01 | Governing source, MVP/deferrals, deadline/demo expectations, team capacity and decision authority | None |
| P02 | Process diagrams and rule/transition matrix covering capacity, cut-offs, cancellation, delays and no-shows | P01 |
| P03 | Verified access/modules, authoritative order and interface choices, configuration review/transfer method | P01; reconcile findings with P02 |
| D01 | Data dictionary and relationship diagram | P02, P03 |
| S01 | Persona/action/record/field/report access matrix | P02, P03 |
| U01 | Desktop/tablet employee journey sketches | P02, P03 |
| T01 | R01–R10 test cases and evidence template | P02, P03 |
| X01 | Instructor decision on scheduled/import mechanisms and required evidence; reuse sufficient earlier findings | P01, P03 |

Task IDs and acceptance outputs are maintained in the [MVP breakdown](../planning/MVP-FEATURE-TASKS-AND-PROCESSES.md). The [backlog index](../../BACKLOG.md) sequences later data/identity configuration, access/validation, ordering/vendor fulfillment, exceptions, notices, reports and tests.

### 12.3 One shared MVP Visual Task Board

Use one card per detailed task ID. W01–W12 are work packages, not duplicate delivery cards. WEEK-ONE-BOARD.md is the planning/board guide; select a Week 1 subset on the shared MVP VTB.

Proposed lanes: Backlog, Ready, In Progress, Review/Test, Blocked, Done. Feature labels group related work; the Week 1 label marks selected work. Each card carries an owner, reviewer, dependencies, target date/effort, acceptance criteria and shared evidence links. A Done card has reviewed evidence; future-dependent work stays in Backlog, and actual impediments receive an unblock owner/follow-up.

P01/P02 use Planning, P03 Architecture, D01 Data, S01 Security, U01 User Interface, T01 Testing and X01 Planning. Full mappings and the card template are in the [board guide](../planning/WEEK-ONE-BOARD.md). VTB progress is not duplicated in Markdown; approved choices go in DECISIONS.md and project-level evidence in STATUS.md.

### 12.4 Proposed first-week goal

November 2–6, 2026, with a proposed 9 AM–5 PM America/New_York cadence, subject to actual availability. Agree scope/design and demonstrate a small slice: one seeded vendor/item/window, one employee order and one vendor status update with access checks. This is an intermediate milestone; the full multi-vendor MVP and 47 tasks are not a one-week commitment.

Monday focuses on P01–P03 and selecting ready work; Tuesday on foundation/data/access; Wednesday on integration; Thursday on stabilization and selected automation; Friday on evidence, demo, review and replanning. If access/design is blocked, present reviewed design/test artifacts as planning progress. Details are in the [playbook](../planning/WEEK-ONE-PLAYBOOK.md).

### 12.5 Review materials

Present [project purpose](../../PROJECT.md), [planning gaps](../planning/PLANNING-REVIEW.md), [requirements/checklist](../planning/REQUIREMENTS-AND-CHECKLIST.md), [processes/components/tasks](../planning/MVP-FEATURE-TASKS-AND-PROCESSES.md), [week-one selection](../planning/WEEK-ONE-BOARD.md), then the [daily playbook](../planning/WEEK-ONE-PLAYBOOK.md). Walk one order journey rather than reading every card. Shared board/document URLs still need to be recorded in STATUS.md.

## Instructor Feedback

Retained notes from the earlier proposal follow; they do not establish approval of the weekend's scope or technical choices. Naming is now confirmed, while business/process and assessment decisions remain tracked through P01–P03/X01.


- Group Name
- App Name
- Business Problem
- Business Solution

### Presentation

- Introduce members within ~2 mins of presentation
- Clearly indicate DEMO run
- Request/Fulfillment project