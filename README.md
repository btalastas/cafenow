# CafeNow final project

CafeNow by NowServing Solutions is a proposed ServiceNow cafeteria-ordering and vendor-fulfillment class pilot. Product/group names are confirmed. Scope approval, architecture and final delivery constraints remain open. The user reports P01–P03 on the shared Visual Task Board (VTB); application implementation and a live Codex connection have not been verified.

## Reading and presentation order

| Order | File | Use it to explain |
| --- | --- | --- |
| 1 | [PROJECT.md](PROJECT.md) | Purpose, users, proposed MVP and completion criteria |
| 2 | [Planning review](docs/planning/PLANNING-REVIEW.md) | Current gaps, risks and immediate priorities |
| 3 | [Requirements and checklist](docs/planning/REQUIREMENTS-AND-CHECKLIST.md) | R01–R10 and required class coverage to confirm |
| 4 | [MVP feature tasks and processes](docs/planning/MVP-FEATURE-TASKS-AND-PROCESSES.md) | Business processes, concrete component examples and 47 task definitions |
| 5 | [Week-one board guide](docs/planning/WEEK-ONE-BOARD.md) | VTB cards, lanes, labels, dependencies and W01–W12 work packages |
| 6 | [Week-one playbook](docs/planning/WEEK-ONE-PLAYBOOK.md) | Kickoff, daily coordination, review and demonstration |

Present one employee order journey and its related tasks instead of reading every task aloud. Keep [DECISIONS.md](DECISIONS.md) open to capture agreements; use [STATUS.md](STATUS.md) at the close for evidence, blockers and next actions.

## Where information belongs

| Information | Authoritative working location |
| --- | --- |
| Candidate requirements and class coverage | Requirements and checklist; approvals recorded in DECISIONS.md |
| Task definitions and acceptance outputs | MVP feature tasks and processes |
| Live owners, dates, lanes, blockers and evidence links | One shared CafeNow MVP VTB in ServiceNow |
| First-week selection and working conventions | Week-one board guide; actual selection recorded on VTB cards |
| Approved choices and unresolved decisions | DECISIONS.md |
| Project-level evidence and next action | STATUS.md |
| Backlog navigation | [BACKLOG.md](BACKLOG.md), using existing task IDs |
| Agent maintenance rules | [AGENTS.md](AGENTS.md) |

R IDs are requirements; BP IDs are business processes; P/D/S/C/U/V/B/F/N/X/I/A/T IDs identify pickup tasks. W01–W12 are weekly work packages, not additional delivery cards. Use the VTB for live status rather than maintaining a second Markdown status board.

Daily path: VTB card → detailed task → requirement/process → acceptance evidence. Share documents through a team-accessible location; local disk links work only for people with the same files. Record the actual board and shared-document links in STATUS.md once available.

Today's selection guide: [November 3 team to-do](docs/planning/TODO-2026-11-03.md), covering tables, role/module user stories and access/ACL work. This dated checklist supports the shared VTB; live assignments and progress remain on the board.

Current ordering direction: [Direct Vendor/Menu portal migration](docs/planning/DIRECT-MENU-PORTAL-MIGRATION.md), requested November 9 after the user created Order Line. New ordering work should use Vendor/Menu -> custom cart/pickup -> ORD and Order Lines. The [November 9 export review](docs/planning/DIRECT-MENU-EXPORT-REVIEW-2026-11-09.md) now identifies current pages/widgets/fields. [Individual direct-ordering source and setup](docs/servicenow/widgets/cafenow-direct-ordering/README.md) are prepared; no deployment XML or live cutover is verified.

Historical catalog sources: [November 5 ordering guide](docs/planning/MVP-FEATURE-TASKS-AND-PROCESSES.md#ordering-variables-and-menu-import---november-5-2026), [November 6 ordering/export review](docs/planning/ORDERING-REVIEW-2026-11-06.md) and [prepared catalog-based checkout](docs/servicenow/widgets/cafenow-cart-checkout/README.md). Preserve these artifacts; they describe the earlier Catalog Item/native-cart/Request/RITM route and must not be installed unchanged for direct Menu ordering.

Employee order display: [CafeNow employee order views](docs/servicenow/widgets/cafenow-order-views/README.md) supplies a new reusable widget for the recent My Orders list, paginated All My Orders table and read-only individual Order with Lines. Prepared November 10; install on the existing pages and verify own-record ACL behavior before cutover. No live deployment is claimed.

## Proposal and reference sources

Vendor menu maintenance: [CafeNow Vendor Menu widget](docs/servicenow/widgets/cafenow-vendor-menu/README.md) lists own-vendor items and supplies vendor-admin add/edit forms using existing Menu fields. Prepared November 11; install and verify Menu ACLs, currency and vendor isolation in development. No live deployment is claimed.

| Location | Purpose |
| --- | --- |
| [Detailed proposal](docs/proposals/ServiceNow_OMS_Project_Proposal.md) | Updated November 1 with weekend planning; not an approved final specification |
| [CafeNow proposal](docs/proposals/CafeNow_Solution_Proposal.docx) | CafeNow / NowServing Solutions narrative |
| [CafeFlow proposal](docs/proposals/CafeFlow_ServiceNow_Project_Proposal.docx) | Historical alternative concept and lifecycle |
| docs/proposals/exports | Retained exports; synchronization is not assumed |
| [Class checklist](docs/reference/project_checklist.png) | Instructor coverage to clarify |
| [Presentation background](assets/presentation/project_background.png) | CafeNow branded asset |
| logs | Existing diagnostic material, not project requirements |

The detailed Markdown proposal was updated at the user's request on November 1. Word proposals, retained exports and original assets remain unchanged; they are not synchronized with that revision. Proposed first week: November 2–6, 2026, 9 AM–5 PM America/New_York. These are planning assumptions, not the final-project deadline or confirmed team availability.
