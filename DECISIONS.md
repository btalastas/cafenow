# Decisions and open questions

## Confirmed records

### October 31, 2026 — Workspace organization

Original proposals, exports, reference images, presentation assets and logs were organized; working documents were added. Organization does not approve a product design.

### October 31, 2026 — Product and group naming

- Decision: product is CafeNow; group/company is NowServing Solutions.
- Source: explicit user confirmation.
- Consequence: use these names in new work; preserve historical names in proposals. Actual ServiceNow scope identifiers remain pending.
- Revisit: explicit naming change.

### November 1, 2026 — Documentation and board conventions

- Source: today's planning/VTB discussion and user request to consolidate working files while excluding the proposal directory.
- Documentation convention: task definitions live in the MVP breakdown; live owners, dates, lanes and evidence belong in one shared MVP VTB. WEEK-ONE-BOARD.md supplies first-week selection and board guidance.
- R01–R10 identify requirements; BP01–BP10 identify processes; the 47 detailed task IDs identify pickup work; W01–W12 identify work packages. Avoid duplicate delivery cards for work packages or individual component records.
- Observed/reported status: the user reports P01–P03 on the VTB; five foundation card texts were prepared. This is not approval or completion of those tasks.
- Board labels, lane conventions and dates are documented working guidance to review with the team, not instructor-approved product decisions.
- Consequence: preserve proposals and task IDs; remove duplicate trackers and stale commentary. Revisit when the team changes its working agreement.

### November 1, 2026 - Detailed proposal revision

The user explicitly requested updating docs/proposals/ServiceNow_OMS_Project_Proposal.md with the weekend's work, superseding the earlier preservation instruction for that file only. Incorporated confirmed naming, candidate requirements/process/component mappings and delivery planning. This revision does not approve scope or architecture. Word proposals and exports remain historical, unchanged and unsynchronized.

### November 2, 2026 — Team-reported MVP choices

- Source/approver: user reporting the team's current decisions in chat on November 2; instructor approval and implementation have not been verified.
- Scope: five vendors in the MVP. Each vendor has a Service Catalog presence containing its food items and pricing; exact catalog/category/item structure remains to be designed. Retain one authoritative order record.
- Vendor acknowledgement: after the employee submits an order, the vendor can confirm receipt and necessary menu-item availability using a confirmation button. Submission precedes vendor confirmation; the exact state label and transition from confirmation to Preparing remain to be finalized.
- Fulfillment: vendors advance Preparing → Ready for Pickup → Closed Complete. Closed Complete means actually picked up. Employees cannot advance fulfillment status; their only status-changing action is permitted cancellation.
- Cutoffs (clarified by the user November 2): ordering closes 30 minutes before the pickup window starts; employee cancellation closes 20 minutes before the pickup window starts. Display the cancellation rule in terms and conditions before order submission. Exact-boundary inclusivity and cancellation eligibility by state remain to be agreed; enforce both cutoffs server-side.
- No-shows: the team considers pickup the user's responsibility, with terms and conditions, three notices at different intervals and a final notice that food will be discarded. EOB means end of business (user clarification November 2); the actual closing time and its role in no-show handling remain to be defined. Timing, disposal authority and final record outcome remain open; do not mark an uncollected order Closed Complete as though picked up.
- Administration: an admin portal/view must cover all five vendors; record/field permissions and allowed actions still need definition.
- Development: ServiceNow Studio selected by the team; target release, availability and permissions still require P03 verification. Scoped application is a question, not an approved choice.
- Planning: user stories requested. Extending user tables for vendors is an unresolved design question, not an approved data model. Capacity was subsequently clarified as 20 orders per vendor pickup window; reservation/release behavior remains undecided.
- Consequences: refine R01–R10 and existing task acceptance outputs around these choices. No task is marked complete. Existing examples in detailed guides/proposals do not override this record.
- Revisit trigger: team clarification, instructor requirements or verified platform constraints. Record remaining owners/follow-up dates in the VTB.

### November 2, 2026 — Access, vendor queue and no-show clarification

- Source: explicit user report and follow-up clarification in chat; no live instance verification performed.
- Team members have access (user-reported). Do not retain account setup as a reported blocker; release/modules/development permissions still require P03 verification.
- Vendors see multiple Submitted orders grouped by their allotted pickup window in their service portal. Vendors can confirm individually or batch-confirm all eligible Submitted orders in that window. This is a requirement, not evidence of an implemented portal.
- Employees can cancel their own orders until 20 minutes before pickup-window start. Exact-boundary inclusivity and interaction with confirmation/preparation still need definition; confirmation alone must not be assumed to remove the stated cancellation right.
- Capacity is 20 orders per vendor pickup window, measured in orders rather than meals. Pickup-window duration remains undecided: the clarified 30-minute interval applies to no-show notifications, not window length.
- Retain three no-show notices with 30-minute intervals; the final disposal warning is sent one hour before the vendor's closing time. Initial trigger, scheduling precedence and treatment of late pickup windows remain open; do not infer an absolute schedule for all three notices or a disposal time from the warning time.
- Batch acceptance checks: authorize vendor/window, recheck each order's current state, avoid duplicate effects, and report confirmed/skipped/failed results. A concurrently cancelled order must not be confirmed or resurrected. Whether a batch is atomic or permits partial success remains a design choice.
- Consequence: these clarifications supersede earlier unknown capacity and access statements. No task completion, email delivery or automatic disposal is claimed. Record actual owners/evidence in the VTB.

### November 3, 2026 - Food Order State labels and values

- Source/approver: explicit user instruction to retain these values for later use, following clarification that Confirmed replaces Preparing.
- Decision: use the following State mapping for CafeNow Food Order. This records the application's chosen values, not verified instance configuration or platform-wide Task defaults.

| State label | Stored value |
| --- | --- |
| Submitted | -5 |
| Confirmed | 1 |
| Ready for Pickup | 2 |
| Closed Complete | 3 |
| Canceled | 4 |

- Normal lifecycle: Submitted -> Confirmed -> Ready for Pickup -> Closed Complete. Closed Complete means actual pickup. Canceled is the cancellation outcome; timing, eligible source states and no-show rules require separate validation.
- Consequence: these labels/values supersede earlier Preparing examples and unresolved label statements in the working documents. Use this mapping when planning conditions, ACL/action validation, flows, notifications, reports and tests. Apply choices to the CafeNow table; this does not authorize changing global Task choices.
- Verification/next action: inspect the actual State choices, default, inherited behavior and active/terminal-state handling in the target instance. Numeric values alone do not prove any of those behaviors. Final catalog/order ownership and exact table scope remain pending P03/D01.
- Revisit: explicit user/team change or a verified platform constraint. Record any approved remapping and treatment of existing records before changing values.

### November 5, 2026 - Same-day multi-food catalog ordering

Source: explicit user clarification and request to consolidate planning. Confirmed intent: one employee orders multiple foods in varying quantities from one vendor, same-day only; automation captures user/vendor/items and creates one CafeNow Order. User reports Order Time Slot references Pickup Window. Screenshot shows Vendor table `x_1234_cafenow_vendor`; other actual technical identifiers still require dictionary confirmation.

Current proposed implementation: one food Catalog Item per Menu item, cart Request/RITMs linked to one CafeNow Order, using RITMs as line details instead of a separate custom Order Line table. This supersedes the generic single-ordering-item recommendation as the working direction, not instructor approval or verified configuration. Complete-checkout coordination, uniqueness/retry handling, native status mapping, recipient/window consistency, price authority and catalog associations remain to be validated. Same-day date bucketing and concurrency-safe capacity are required by the proposed design.

User plans Requested for in place of Opened by; retain submitter attribution and review a distinct recipient field rather than assume a label change is sufficient. Plus/minus quantity widget and automated Excel-to-Menu/Catalog setup are suggestions, not completed work. See [detailed ordering, variables and import guide](docs/planning/MVP-FEATURE-TASKS-AND-PROCESSES.md#ordering-variables-and-menu-import---november-5-2026). Existing P03/D01/S01/C01-C03/I01-I02 and applicable validation/testing tasks own follow-up on the shared VTB.

### November 6, 2026 - Order-process work requests

Source: explicit user request. Selecting a menu item should restrict subsequent item selection to that vendor. Remove the separate Vendor variable/variable set because the user reports item categories already identify vendors; derive Vendor from a validated item/category-to-Vendor mapping. Keep shared pickup-window, instructions and terms inputs. Pickup-window times also need work; no exact times or duration were supplied. Confirm vendor schedules, timezone, and cart reset/vendor-switch behavior before implementing those details. Preserve one-vendor validation server-side. These are requested changes, not verified configuration or completed tasks. See the November 6 follow-up in the detailed task guide; existing task IDs and VTB remain authoritative for delivery tracking.

### November 6, 2026 - One vendor cart and pickup once at checkout

Source: explicit user clarification after requesting review of all planning files and the application export. Required journey: CafeNow catalog -> vendor category -> food Catalog Items linked through `u_cafenow_menu_item` to Menu/Vendor -> multiple foods from one vendor -> one pickup-window selection when proceeding to checkout -> one CafeNow Order. Each Pickup Window record represents one vendor's time interval. Category supports browsing; Menu.`vendor` identifies the vendor used for validation. Do not equate category and Vendor sys_ids or ask employees to reselect the known food/vendor.

Consequence: the November 5 per-food pickup/terms variable proposal is superseded for the intended checkout experience. Reuse Order.`pickup_window` and keep a single pickup-selection source and quantity source. The export shows the Menu import mapping already exists and the Order creation step is already outside item loops; Vendor/Pickup Window inputs are blank in the inspected flow/snapshot. Saved configuration is not an executed test.

Review recommendation, not implementation approval: retain the catalog/native-cart direction and add one checkout integration for vendor validation, one pickup selector and its submission handoff. Do not add more per-item hidden context variables or a second cart just to filter the times. Exact checkout extension, storage, date field and handoff require instance feasibility checks. The custom session-storage cart in the export is a separate prototype; do not delete it or claim it enforces native-cart vendor restrictions. See [ordering review](docs/planning/ORDERING-REVIEW-2026-11-06.md) and the detailed guide. Existing task IDs/VTB own follow-up; no runtime behavior is verified.

### November 6, 2026 - Direct add from vendor category lists

Source: explicit user request to add foods to cart without opening each Catalog Item, followed by supplying the SC Category Page HTML, Client Script and Server Script. Desired UX: quantity and Add to Cart on food cards, retaining one-vendor cart and one pickup choice at checkout. Prepared a CafeNow-owned widget derivative using the native cart; required food answers retain a details path and must not be bypassed. This is a requested interface refinement and local code preparation, not verified instance configuration, instructor approval, checkout completion or an atomic cross-session vendor restriction. See the detailed task guide and STATUS.md for checks and remaining work. Existing C02/U02/B01/T02/T07/T09 own delivery on the shared VTB.

### November 8, 2026 - Vendor group hierarchy clarification

Source: explicit user clarification while requesting the vendor page. Vendor has a group field referring to a parent group with two child groups named for the vendor's Admin and Staff. The retained export identifies Vendor.vendor_group; current live dictionary remains unverified. The read-only queue starter checks membership in that parent or its immediate children, without assuming parent membership inheritance. Exact role identifiers, ACL behavior and configuration remain subject to instance checks; this does not establish verified access or task completion.

### November 9, 2026 - Shared vendor queue authorization

Source: explicit user request to update the vendor widget so vendor Admin/Staff see only open orders belonging to their own vendor/group. Replace the fixed per-instance vendor selection with server-side current-user role and membership resolution through Vendor.vendor_group and its immediate Admin/Staff child groups. No all-vendor facility/platform-admin bypass is authorized for this widget. Multiple legitimate vendor memberships are kept separate by vendor/window in the prepared implementation. Retained export contains x_1234_cafenow.vendor_admin and x_1234_cafenow.vendor_staff; current live names/assignments/ACL behavior remain unverified. The latest user report identifies Order.time_slot_v2 as the window reference; prepared server prefers it when present, otherwise retaining exported pickup_window. This is a local implementation update, not deployment or evidence of successful access tests. V02/S04/T04/T07/T09 retain follow-up on the shared VTB.

### November 9, 2026 - Vendor lookup implementation refinement

Within the authorized own-vendor queue implementation, internal membership/group/Vendor mapping reads now use fixed read-only server GlideRecord queries; only the current user's memberships and linked active groups/vendors establish authorization. This removes the unintended requirement for vendor users to read administrative authorization fields. Returned business Orders retain GlideRecordSecure/field ACL enforcement. This is an implementation choice following a reported membership failure, not a verified root cause or approval to broaden table ACLs. No role requirement or own-vendor restriction is removed.

### November 9, 2026 - Custom catalog-cart checkout and building timezone

Source: explicit user request to create a custom shopping-cart/checkout experience using existing vendor-specific Pickup Window records, collecting pickup and terms once rather than repeating a variable set for every food. User explicitly confirmed America/New_York. Retain Catalog Items, Menu/Vendor mapping, native cart/Request/RITMs and one authoritative CafeNow Order. Dropdown labels are Pickup Window time_slot_v2; selection/reference values are the Pickup Window sys_ids. Keep a separate actual pickup date.

Implementation prepared locally: own widget plus a same-scope service; one technical Checkout context carries the shared answers and native Request reference, while a capacity reservation ledger and database unique keys arbitrate 20-order/vendor/date/window bookings and duplicate submissions. This supersedes the earlier hidden-per-food-variable carrier recommendation for this prepared implementation. Technical tables/indexes, field additions, guard rules and migration are agent implementation choices for the requested behavior, not separately confirmed instructor requirements or verified instance configuration. Submission is initially disabled. The service treats ordering at the exact 30-minute cutoff as closed, an explicit conservative convention still to verify with the team. Existing lifecycle/cancellation eligibility decisions are unchanged. Full setup/limits and existing-task traceability are in the package guide; no live fulfillment, notification delivery or concurrency result is claimed.

### November 9, 2026 - Menu numbering label

Source: explicit user report/screenshots. User created MENU Number Maintenance configuration for Menu and renamed the Number form label to Item Number. Screenshot shows number and a separate older item_number column. Prepared maintenance targets number; relabeling is not a technical-column rename. Preserve the older column/data and existing nonblank numbers. Actual dictionary/default, sequence behavior and live backfill remain unverified; no numbering or record update was performed from this workspace.

### November 9, 2026 - Direct Vendor/Menu portal ordering selected

Source: explicit user request to change /cafe ordering pages from Catalog Items to existing Vendor/Menu records, following creation of Order Line except Instructions. User screenshot confirms Order Line columns order, menu_item, item_name, quantity, unit_price, line_price and number; earlier suggested line_total is not the actual field. Current references/ACLs and table creation are user reports/screenshots, not live inspection.

This changes the direction for new ordering implementation: direct Menu cart -> one CafeNow Order with Order Lines, using existing vendor-specific Pickup Windows and one terms/pickup step. Keep the existing Task-based Order and confirmed lifecycle. Do not use native catalog checkout to create new REQ/RITMs through that replacement journey. Preserve historical catalog records/configuration and earlier prepared packages; they are not compatible replacements without revision. Exact page/widget/header/flow cutover and smallest reliable capacity/retry mechanism await a current application export. Additional technical tables from the earlier catalog package are not approved requirements of this direction. See docs/planning/DIRECT-MENU-PORTAL-MIGRATION.md. No instructor approval or deployed migration is claimed.

### November 9, 2026 - Direct ordering export review and installation format

The supplied new application export confirms the existing Vendor/Menu/Pickup Window/Task-based Order and new Order Line references, including actual line_price and absent Instructions, plus singular cafenow_vendor page ID. The direct-table direction remains the explicit user instruction. Prepared source reuses those five tables and proposes protected Order metadata/unique keys for capacity and retries, rather than assuming extra technical tables. These field/index/security details are implementation choices requiring instance setup/review, not instructor-approved requirements. Source is individual configuration items with full scripts and an installation map; no importable update set or live deployment was generated. Original exports/catalog artifacts remain preserved. See docs/planning/DIRECT-MENU-EXPORT-REVIEW-2026-11-09.md and the direct-ordering package for evidence/limits.

## Pending product and delivery decisions

November 2 implementation progress (explicit user report): CafeNow app created in ServiceNow Studio; five roles and associated groups created for user, sys admin, vendor, vendor admin and facility admin. Exact identifiers, scope, role inheritance/assignments and access enforcement remain unverified. Do not assume the reported sys admin label means the platform `admin` role or that facility admin has unrestricted technical administration.

The user reports beginning table creation and plans to import menu items into Catalog Items for Service Portal and is finalizing tables/fields named `u_cafeteria_vendor`, `u_cafeteria_order` and `u_order_line_item`. Preserve these as reported working names, not approved scoped identifiers or verified tables. User subsequently confirmed the vendor table name as `u_cafeteria_vendor`; live dictionary inspection remains pending. P03/D01 must still settle catalog request mapping, one authoritative order/lifecycle owner, line-to-order/item references, vendor membership and pickup-window representation. S01 must reconcile the created personas with allowed actions and record/field ACLs; role/group creation alone does not establish permissions. No import execution, table completion or task completion is inferred.

November 2 interface sketches (clarified by the user November 3): initial ideas were sketched for two Service Portal views, for user and vendor, and an admin workspace. Earlier Employee Portal, Vendor Dashboard, CafeNow Management and ServiceNow Admin Workspace responsibility notes remain input in the detailed task guide for P01/P03/S01 review; they do not establish four separate deployments. These are sketches, not implemented interfaces or approval of expanded scope. Search/cart/nutrition details, registration approvals and complaints need include/defer and acceptance decisions. Refunds remain deferred with payments; sales summaries require a recorded-order-value definition. Technical admin tools and business-admin permissions remain distinct and unverified.

November 2 documentation request: added the table reuse/extension recommendations, proposed field dictionary, relationships and catalog mapping investigation to the [detailed task guide](docs/planning/MVP-FEATURE-TASKS-AND-PROCESSES.md#proposed-table-design-for-team-review--november-2). Inclusion in planning does not approve Task extension, custom order ownership, vendor membership implementation or catalog structure. Resolve these in P03/D01/S01; preserve one authoritative order record.

| Topic | Decision needed | Task |
| --- | --- | --- |
| Authority | Select governing requirements source and priority/acceptance authority | P01 |
| Scope and delivery | Approve R01–R10, simulated checkout, deferrals, deadline/demo requirements, team capacity | P01 |
| Lifecycle and exceptions | State labels/values recorded November 3; resolve cutoff boundary inclusivity and cancellation-eligible states; vendor cancellation/delay rules; end-of-business time/policy, three reminder intervals and no-show closure/disposal | P02 |
| Capacity/time | 20-order/window capacity confirmed; window duration, concurrency-safe reservation/recovery, release rules, time zone and boundary behavior | P02, B02 |
| Architecture | Scoped application decision; catalog structure for five vendors; catalog/native versus custom authoritative order source; vendor identity/membership model | P03, D01 |
| Interface/environment | Release/modules/access, employee/vendor interfaces and configuration transfer/review | P03 |
| Class checklist | Required catalog, scheduled execution and integration mechanisms; accepted demonstrations/deferrals | P01, P03, X01 |
| Data/security | Scoped names, fields/relationships, vendor membership and building/management permissions | D01, S01 |

The detailed Markdown is a candidate working reference; no proposal has been approved as the final specification. Explicitly recorded user choices, including the November 3 State mapping, govern older examples; other technical names and unresolved behavior remain illustrative or pending.

## Recording an agreement

For each agreement capture date, task/topic, decision, reason, source/approver, evidence link, consequences and revisit trigger. For unresolved items record an owner and follow-up date in the VTB. Then update the affected requirements/task definitions and summarize material changes in STATUS.md.

### November 9, 2026 - Simplified direct checkout authorized

Source: user explicitly deferred submission_key/booking_key/submission_status, then accepted the next steps to remove those dependencies and setup gates and create Order/Lines directly. Implemented locally in the existing Script Include; no Flow creates a second parent. One signed-in employee, one Vendor, one active vendor-specific Pickup Window and Menu-backed Lines remain required. opened_by is the confirmed owner; requested_for is set only if that exact column exists. Created-by audit fields remain platform-managed.

This temporary path removes advanced metadata/index/property prerequisites, capacity/cutoff enforcement and automatic retry lookup. Optional pickup date/terms columns are used only if present. Vendor Location supplies the mandatory Order Location, with the existing building property as an optional fallback. Partial insert failures attempt cleanup; failed cleanup or response loss requires manual review. These are acknowledged implementation limits, not instructor approval or completion of capacity/retry/notification requirements. Prior advanced source setup is retained as historical documentation. Revisit before declaring the MVP ready or restoring concurrency/retry guarantees. Current setup: docs/servicenow/widgets/cafenow-direct-ordering/README.md. No live changes verified.

### November 12, 2026 - Cart terms and ordering cutoff text

Source: explicit user request to add bottom-of-cart Terms & Conditions, a 20-minute cutoff for placing orders for a selected pickup window, and pickup reminders. This supersedes the earlier 30-minute ordering cutoff as the requested policy; it does not change the separately recorded cancellation policy. Added inline terms to the current direct-ordering full-cart view only, including an 11:30 AM / 11:10 AM example and reminders to check My Orders, collect when Ready during the selected window, and have the order number ready. No automated notification delivery is promised. The simplified service still does not enforce cutoff times or send scheduled reminders. Boundary enforcement and automated reminder scheduling remain future implementation/verification work. Historical catalog checkout source is preserved.

### November 12, 2026 - Complaint/request widget preparation

User explicitly requested a widget for requester and vendor roles to submit complaints/requests using existing User Complaints and Vendor Complaints, plus suggested fields/form configuration. User says table names follow existing conventions; exact table/field names remain unverified. Prepared a setup-gated widget with assumed table names, existing requester/vendor roles and optional authorized order context. Suggested fields/workflow and handler permissions remain recommendations, not instructor-approved requirements or installed schema. No refund processing, automated notifications or complaint-reader dashboard authorized by this implementation. Confirm dictionary and access safeguards before enabling.

### November 13, 2026 - Footer information destinations

User requested About Us, Meet Our Team and Nutrition & Allergen as links to separate pages. Prepared cafenow_about, cafenow_team and cafenow_nutrition page IDs with one reusable CafeNow Information widget and a compact shared theme footer. These are prepared installation identifiers, not verified live pages. User asked whether the footer can stay visible like the header; documented the optional Theme Fixed footer setting, but enabling it has not been confirmed or performed. Actual theme bottom clearance must be checked in the instance.

### November 13, 2026 - Consolidated About navigation

User superseded the separate information-page direction with one About tab/page containing collapsed About Us, Meet Our Team and Nutrition & Allergen sections. Footer retains the supplied group image and section-specific links to the same page. Prepared cafenow_about with optional allowlisted section=about/team/nutrition; bare header link collapses all sections. Source/configuration guidance only; no live menu/page change claimed.

### November 13, 2026 - FAQ audience confirmation and article revision preparation

User confirmed employees use CafeNow user, vendors use vendor admin/staff, facility managers use facility manager, and CafeNow admins see all categories, in reply to the proposed category mapping. Retain employee=Employee Help/Ordering and Payments/Troubleshooting; vendor=Menu Management/Vendor Operations/Troubleshooting; facility=Administration/Troubleshooting; admin=all six; multi-role union. Technical x_1234_cafenow identifiers remain retained-source observations requiring live verification. User authorized reviewing exported XML and updating KB content using available prior-chat/project context. Both exports contain menu references to 15 articles but no article bodies; prepared separate replacement HTML and traceable installation guidance rather than altering historical exports or claiming live publication. Proposed article category assignments and new copy still need current-record/UI review; this authorization does not make unverified features implemented.

### November 13, 2026 - NowServing Solutions company positioning

User describes NowServing Solutions as a startup IT solutions company delivering B2B services through ServiceNow applications. Updated About Us positioning, mission, vision, approach and commitment accordingly, with CafeNow presented as its workplace cafeteria-ordering application. This is user-supplied narrative, not independent verification of corporate registration, customers or ServiceNow partner status.

### November 13, 2026 - Vendor complaint submission role

User restricts vendor complaint/request submission to vendor_admin, superseding earlier staff-inclusive submission guidance. Vendor staff alone must not submit as vendor; employee requester access remains independent. This does not change vendor staff order/menu/FAQ permissions. Prepared source gates updated; live ACL/page configuration unverified.

### November 13, 2026 - Actual vendor complaints table

User confirms technical table name x_1234_cafenow_cafenow_vendor_compliants. Preserve exact spelling; supersedes assumed x_1234_cafenow_vendor_complaints in the prepared widget and ACL instructions. No schema rename or duplicate table authorized/needed.

### November 13, 2026 - Complaint reference receipt and personal history

User requests complaint number display after employee/vendor submission and a header tab listing own complaints/requests similar to My Orders. User confirms both number columns are number. Prepared cafenow_my_support page/widget and top-level My Requests & Complaints menu setup, with own-only combined employee/vendor views and read-only details. Status mapping not supplied, so no status column or new schema introduced. Source/setup only; no live installation or access result claimed.
