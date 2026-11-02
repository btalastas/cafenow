# CafeNow planning review - November 1, 2026

## Assessment

CafeNow has a candidate requirements baseline, 47 pickup tasks, component examples, business-process guidance and a proposed first-week cadence. The user reports P01–P03 on the VTB. Approval, final deadline, actual capacity and architecture remain unresolved; no application implementation or executed acceptance evidence is established here.

This review uses the working documents linked from [README](../../README.md), the preserved proposal context and today's discussion. It does not independently verify the live instance or reapprove the original proposals.

## Immediate priorities

| Priority | Work                            | Evidence needed                                                                                        |
| -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1        | P01: scope and delivery         | Governing source, MVP/deferrals, deadline, instructor coverage, team capacity and authority            |
| 2        | P02/P03: process and platform   | Rule/transition matrix, process diagrams, instance findings, authoritative order and interface choices |
| 3        | D01/S01/U01/T01/X01: foundation | Dictionary/relationships, access matrix, sketches, executable tests and scheduled/import decisions     |
| 4        | Incremental implementation      | Seed data, validated ordering, vendor visibility and role-based checks; then remaining MVP behaviors   |

Use [BACKLOG](../../BACKLOG.md) for the sequence and the [MVP breakdown](MVP-FEATURE-TASKS-AND-PROCESSES.md) for exact dependencies. The VTB holds live status. Reviewed planning artifacts do not mark application requirements complete.

## Gaps and risks to resolve

| Risk / gap                                     | Impact                                               | Next action / tracking task                                       |
| ---------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| Final deadline and actual availability unknown | Week-one targets may exceed capacity                 | P01: record constraints and assign real owners/reviewers          |
| Architecture/module access unresolved          | Dependent UI/data work may need rework               | P03: timebox feasibility check and record evidence                |
| Capacity/concurrency and exceptions undefined  | Overbooking or inconsistent cancellation             | P02/B02: specify rules and test last-unit competition/recovery    |
| Checklist obligations unclear                  | Required demonstration could be missed               | P01/P03/X01: confirm exact mechanisms and evidence                |
| Concurrent configuration changes               | Team members may overwrite work                      | P03: agree ownership, review and transfer approach                |
| Card/document consistency                      | Wrong title/body or duplicate trackers obscures work | Review P01–P03; use canonical task definitions and one shared VTB |
| Shared URLs and evidence location absent       | Teammates cannot follow local links                  | Record accessible board/document links in STATUS.md               |

Assign risk owners and follow-up dates in the relevant VTB cards at kickoff. The detailed breakdown already separates lifecycle, capacity, cancellation, delay, reports and tests; review task size rather than recreate those tasks.

## Next milestone

Close kickoff with P01 decisions recorded, P02/P03 agreed or timeboxed with follow-up owners, and foundation cards ready to refine. Aim for a small employee-to-vendor demonstration during the proposed November 2–6 week if dependencies permit. The full 47-task backlog is not a one-week commitment.

Scheduled/import work is conditional on instructor requirements; payment, commercial tiers, AI, inventory/waste/sourcing and expansion remain deferred as described in [PROJECT.md](../../PROJECT.md).
