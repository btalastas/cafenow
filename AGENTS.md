# Agent guidance

## Confirmed identity

Use CafeNow as the product name and NowServing Solutions as the group/company name, confirmed by the user on October 31, 2026. CafeFlow in retained proposals is historical naming. Use the confirmed names in new work; actual ServiceNow scope identifiers remain unconfirmed.

## Context and sources

Read README.md, PROJECT.md, STATUS.md, and relevant BACKLOG.md tasks before substantial work. Read DECISIONS.md before selecting architecture or resolving conflicting requirements.

- Explicit user instructions and recorded instructor decisions govern proposal assumptions.
- docs/proposals/ServiceNow_OMS_Project_Proposal.md is the detailed working requirements reference, not an approved implementation specification.
- docs/proposals/CafeNow_Solution_Proposal.docx contains the CafeNow / NowServing Solutions narrative.
- docs/proposals/CafeFlow_ServiceNow_Project_Proposal.docx preserves an alternative concept and lifecycle.
- docs/proposals/exports contains retained HTML/text versions; do not assume synchronization.
- docs/reference/project_checklist.png supplies class development expectations. Confirm required coverage with the instructor.
- Preserve original proposals/assets unless asked to edit them. Place derivative documents in docs/ and cite sources.

## Scope

Proposed ServiceNow class pilot: one building, multiple vendors, one vendor per order. Core scope is menus/availability, pickup windows, capacity validation, vendor queue/batch summaries, My Orders, lifecycle/cancellation/delay handling, notifications, roles/ACLs, and basic reports.

Payments, subscription billing/entitlements, advanced AI/forecasting, multi-building expansion, QR, and external inventory integrations are future work unless explicitly promoted. Inventory, waste, and supplier reporting need reliable data and are later-phase candidates.

The detailed Markdown proposes Submitted -> Preparing -> Ready for Pickup -> Completed, with Cancelled terminal and delay tracked separately. The CafeFlow Word proposal includes Confirmed and Delayed states. Confirm the lifecycle before implementing it. Proposed employee cancellation is limited to own Submitted orders before cut-off; vendor cancellation requires a reason.

## Design and verification

- Keep one authoritative order record. Catalog request tables versus custom tables, interface technology, actual scoped names/roles, release, and entitlements are unconfirmed. x_cafeflow names in the proposal are examples.
- Validate capacity, availability, transitions, and cancellation server-side. Test simultaneous booking; hiding UI controls is insufficient.
- Employees access only their own orders; vendor staff access their vendor's records. Test record/field ACLs and aggregate reporting by role.
- Verify notification recipients, duplicate prevention, transition/delay triggers, and protected record links. Inspect generated email records; claim delivery only if verified.
- Vendor-provided allergen information is not independent food-safety verification. Improvements in waiting, waste, or forecasting require measurements and appropriate baselines.
- This folder contains planning artifacts. No build/lint/deploy/test commands or live instance were verified. Do not invent commands or claim execution.
- Before instance work, establish target environment, connection, release, and supported modules. Use current official ServiceNow documentation for uncertain platform details.
- Separate proposed behavior, observed implementation, and verified results. Proposal checkboxes do not prove implementation.
- Check document links and factual consistency. When delivering Word/PDF/slides, verify rendered layout. For future code/configuration, run relevant checks and disclose verification limits.
- Keep credentials and sensitive instance/person data out of project files.
- Record approved choices in DECISIONS.md; update STATUS.md after substantial tasks with results, checks, blockers and next action. Keep live task status in the shared MVP VTB, not in BACKLOG.md.

## Planning document maintenance

- Preserve UTF-8 when editing Markdown. When piping Python through PowerShell, use ASCII-only script text with Unicode escapes for non-ASCII output characters, or explicitly configure UTF-8 transport. Re-read saved bytes and inspect suspicious question marks in ID/date ranges, headings and arrows; a valid UTF-8 decode alone does not detect characters already replaced with ASCII question marks.
- README.md owns reading/presentation order and file responsibilities. PROJECT.md owns the brief; REQUIREMENTS-AND-CHECKLIST.md owns candidate requirements/class coverage; MVP-FEATURE-TASKS-AND-PROCESSES.md owns detailed tasks, component examples and business-process mappings.
- WEEK-ONE-BOARD.md is the VTB/weekly selection guide, not a second board. WEEK-ONE-PLAYBOOK.md owns meeting/cadence guidance. BACKLOG.md is a sequence/index; PLANNING-REVIEW.md summarizes gaps/risks.
- Preserve R01–R10, BP01–BP10, the 47 detailed task IDs and W01–W12 when editing. W IDs are work packages, not duplicate delivery cards. Keep task dependencies acyclic and requirement coverage traceable.
- Use consistent lanes: Backlog, Ready, In Progress, Review/Test, Blocked, Done. Label mappings and readiness rules live in WEEK-ONE-BOARD.md. Week 1 is a selected subset, not a promise to complete all tasks.
- User reports P01–P03 on the VTB; foundation card texts were prepared, but creation/completion is unverified. Do not reset existing cards to unassigned or infer task completion from chat/screenshots. Distinguish user reports, document checks and live verification.
- Do not reinstate the removed component-comparison section. Preserve the detailed component guide and one-authoritative-order note.
- The November 1 consolidation preserved docs/proposals/**. A subsequent explicit user request authorized updating docs/proposals/ServiceNow_OMS_Project_Proposal.md with weekend planning. That Markdown is now revised; Word proposals and retained exports remain historical and unsynchronized. Preserve other proposal files and original images/logs unless asked. Do not treat working conventions or illustrative examples as instructor-approved requirements.
- Keep credentials out of files; no ServiceNow/Codex connection has been established. Record board/shared-document URLs when supplied, without inventing access details.
