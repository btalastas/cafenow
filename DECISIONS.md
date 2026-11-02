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

## Pending product and delivery decisions

| Topic | Decision needed | Task |
| --- | --- | --- |
| Authority | Select governing requirements source and priority/acceptance authority | P01 |
| Scope and delivery | Approve R01–R10, simulated checkout, deferrals, deadline/demo requirements, team capacity | P01 |
| Lifecycle and exceptions | Resolve Submitted/Confirmed differences, transition actors, cancellation cut-offs/reasons, delays and no-shows | P02 |
| Capacity/time | Units, concurrency-safe reservation/recovery, release rules, time zone and boundary behavior | P02, B02 |
| Architecture | Catalog/native versus custom records and one authoritative order source | P03 |
| Interface/environment | Release/modules/access, employee/vendor interfaces and configuration transfer/review | P03 |
| Class checklist | Required catalog, scheduled execution and integration mechanisms; accepted demonstrations/deferrals | P01, P03, X01 |
| Data/security | Scoped names, fields/relationships, vendor membership and building/management permissions | D01, S01 |

The detailed Markdown is a candidate working reference; no proposal has been approved as the final specification. Lifecycle/capacity values and technical names in examples remain illustrative.

## Recording an agreement

For each agreement capture date, task/topic, decision, reason, source/approver, evidence link, consequences and revisit trigger. For unresolved items record an owner and follow-up date in the VTB. Then update the affected requirements/task definitions and summarize material changes in STATUS.md.
