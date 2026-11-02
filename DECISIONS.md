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

## Pending product and delivery decisions

November 2 documentation request: added the table reuse/extension recommendations, proposed field dictionary, relationships and catalog mapping investigation to the [detailed task guide](docs/planning/MVP-FEATURE-TASKS-AND-PROCESSES.md#proposed-table-design-for-team-review--november-2). Inclusion in planning does not approve Task extension, custom order ownership, vendor membership implementation or catalog structure. Resolve these in P03/D01/S01; preserve one authoritative order record.

| Topic | Decision needed | Task |
| --- | --- | --- |
| Authority | Select governing requirements source and priority/acceptance authority | P01 |
| Scope and delivery | Approve R01–R10, simulated checkout, deferrals, deadline/demo requirements, team capacity | P01 |
| Lifecycle and exceptions | Finalize state labels for submission/vendor confirmation and Preparing; cutoff boundary inclusivity and cancellation-eligible states; vendor cancellation/delay rules; end-of-business time/policy, three reminder intervals and no-show closure/disposal | P02 |
| Capacity/time | 20-order/window capacity confirmed; window duration, concurrency-safe reservation/recovery, release rules, time zone and boundary behavior | P02, B02 |
| Architecture | Scoped application decision; catalog structure for five vendors; catalog/native versus custom authoritative order source; vendor identity/membership model | P03, D01 |
| Interface/environment | Release/modules/access, employee/vendor interfaces and configuration transfer/review | P03 |
| Class checklist | Required catalog, scheduled execution and integration mechanisms; accepted demonstrations/deferrals | P01, P03, X01 |
| Data/security | Scoped names, fields/relationships, vendor membership and building/management permissions | D01, S01 |

The detailed Markdown is a candidate working reference; no proposal has been approved as the final specification. Lifecycle/capacity values and technical names in examples remain illustrative.

## Recording an agreement

For each agreement capture date, task/topic, decision, reason, source/approver, evidence link, consequences and revisit trigger. For unresolved items record an owner and follow-up date in the VTB. Then update the affected requirements/task definitions and summarize material changes in STATUS.md.
