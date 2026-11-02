# CafeNow first-week PM and team playbook

NowServing Solutions | November 2–6, 2026 | Monday–Friday, 9 AM–5 PM, America/New_York

This is a proposed working plan, not a confirmed team commitment. Five members are suggested by the proposal; confirm actual team size, attendance, class sessions, deadline, and instructor expectations Monday. Lunch and breaks are included. Do not treat eight hours of attendance as eight hours of delivery capacity.

## Your role as a first-time PM and Scrum Master

Your daily job is to make the goal clear, expose dependencies, remove blockers, and make completion visible. You do not need to be the technical expert or assign every action. Ask team members to help size and select work; establish one person who can make product-priority decisions. The instructor may approve class requirements without serving as a day-to-day product owner.

A practical division of responsibilities:

| Responsibility | Who should handle it |
| --- | --- |
| Facilitate meetings, track risks, chase blockers, keep the board current | You, as PM/facilitator |
| Decide value, scope tradeoffs, and acceptance priorities | Named product decision-maker, agreed Monday |
| Select technical approach and estimate implementation | Developers together, with a named design lead for coordination |
| Build, review, test, document, demonstrate | Shared team responsibility |
| Clarify assessment requirements and approve exceptions | Instructor or designated authority |

For this first week, use a lightweight weekly goal and daily coordination. If your class requires formal Scrum, confirm its expected roles, events, and artifacts; this playbook is a working adaptation, not a claim that a PM and Scrum Master are interchangeable roles.

## Proposed week-one goal

Agree a realistic MVP and demonstrate the smallest working order-to-fulfillment slice in the training instance. Prefer one seeded vendor, one menu item, one pickup window, one employee order, and one vendor status update with access checks. This is a learning slice; multi-vendor coverage and the full lifecycle remain MVP requirements for later increments.

Fallback if access or architecture remains blocked: a reviewed process model, data dictionary, access matrix, clickable or documented interface flow, and executable test steps. Report that as design progress, not a working application.

## Present the plan

Follow the [README reading/presentation order](../../README.md#reading-and-presentation-order): project purpose → planning gaps → requirements/checklist → processes/components/tasks → week-one selection → daily cadence. Walk through one order, then show its related tasks. Keep DECISIONS.md open to capture agreements; close with STATUS.md and next actions.

P01–P03 are reported on the shared MVP VTB. The next five foundation cards are D01, S01, U01, T01 and X01. Their dependencies/labels are in the [board guide](WEEK-ONE-BOARD.md#starting-eight-cards). Do not create a separate week-one VTB or duplicate W01–W12 delivery cards.

## Before Monday

- Read PROJECT.md, DECISIONS.md, BACKLOG.md, both proposal narratives as needed, and the class checklist image.
- Review the existing MVP VTB and verify P01–P03 title/body/reference consistency. Confirm teammates can access it and record its URL plus the shared document/evidence location in STATUS.md.
- Ask each member for availability, relevant strengths, and access problems. Do not assume workstream assignments are already agreed.
- Prepare Monday's decisions below. Bring questions to the instructor early.
- Identify where configuration work will be tracked, reviewed, and transferred in the actual ServiceNow environment. Confirm the supported update-set/application source-control approach before parallel configuration changes.

## Monday simulation from 9 to 5

| Time | What you facilitate or do | Talking point / action | Output |
| --- | --- | --- | --- |
| 9:00–9:15 | Welcome and purpose | “What must a person be able to do in our demo, and what does the instructor require?” | Shared objective; names confirmed as CafeNow / NowServing Solutions |
| 9:15–9:45 | Confirm delivery constraints | Ask deadline, team availability, grading evidence, demo duration, decision authority | Constraints and unresolved instructor questions |
| 9:45–10:15 | Walk through the user journey | Employee selects vendor/items/slot; vendor prepares; employee collects. Ask where it can fail | Process sketch with actors, inputs, outputs, exceptions |
| 10:15–10:30 | Break | Capture questions without extending the meeting | Ready for scope discussion |
| 10:30–11:15 | Agree scope and decisions | Review requirement IDs and checklist mapping; choose what is essential versus later | P01 scope outcome; P02 questions with owners |
| 11:15–12:00 | Check access and run bounded design investigations | Each member confirms instance access; pair on catalog/custom-table and UI feasibility | Evidence-based options; blocked people identified |
| 12:00–1:00 | Lunch | Protect the break | — |
| 1:00–1:30 | Decide or timebox remaining choices | Compare feasible options against class coverage and effort; park uncertain decisions with a deadline | P03 direction reconciled with P02, or a timeboxed investigation |
| 1:30–2:00 | Plan small tasks together | “What can we demonstrate by tomorrow? What input do you need first?” | Selected VTB cards with owners, reviewers, estimates and acceptance criteria |
| 2:00–3:15 | Protected work block | Facilitate one blocker at a time; avoid a running group call | Initial schema/flow sketch, sample records, test outline |
| 3:15–3:30 | Break | — | — |
| 3:30–4:15 | Pair review / integration | Compare table references, roles, and expected status values before dependent work expands | Consistent design; early defects found |
| 4:15–4:40 | Show actual progress | Ask for a screen, record, diagram, or test result instead of a percentage | Evidence, feedback, blocked/review tasks visible |
| 4:40–5:00 | Close the day | Confirm tomorrow's goal, owners, blockers, decisions to escalate | Board updated; short daily note and STATUS update |

Example facilitation: “Our employee screen depends on the order fields. Can the data-model pair publish a reviewed draft by 2 PM? Until then, the interface owner can sketch the journey and the tester can write acceptance examples.”

If the team cannot choose an architecture: allow a 30–60 minute investigation with explicit questions and a named owner. Review evidence at a fixed time. Continue independent process/test work while waiting.

## Tuesday through Friday

| Day | Main focus | Suggested allocation after daily coordination | End-of-day evidence |
| --- | --- | --- | --- |
| Tuesday Nov 3 | Establish the foundation | Review Monday decisions; agree schema/access matrix; configure minimal records and permissions; start ordering slice | Reviewed tables/fields/references, sample data, access-check results; agreed interface path |
| Wednesday Nov 4 | Connect the user journey | Submit an order through the chosen interface; expose vendor view; connect one status update; test failure cases | Employee-to-vendor walkthrough; first integrated test results; defects on board |
| Thursday Nov 5 | Stabilize and cover automation | Add or verify selected notifications, capacity behavior, and role restrictions; prepare required catalog/import/scheduled-work evidence as feasible | Demonstrable slice, generated email evidence, security/capacity checks; remaining checklist gaps explicit |
| Friday Nov 6 | Review, learn, replan | Stabilize and rehearse in morning; demo and review in afternoon; retrospective and next-week planning | Demonstration evidence, accepted/rejected work, updated backlog, two improvement actions |

These targets depend on Monday's findings. Preserve time for integration and testing rather than starting every proposed feature. A thin working slice is preferable to disconnected components described as nearly complete.

## A normal working day after kickoff

- 9:00–9:15: Team coordinates around the day's goal, task progress, dependencies, and blockers. Detailed debugging moves to a smaller follow-up.
- 9:15–9:30: You arrange blocker follow-ups; team members confirm the tasks they will pull.
- 9:30–12:00: Focused work, with a short break. Keep nonurgent questions in the board or shared notes.
- 12:00–1:00: Lunch.
- 1:00–3:15: Focused build/test/review; hold only necessary decision sessions.
- 3:15–3:30: Break.
- 3:30–4:30: Integration, peer review, test evidence, and defect resolution.
- 4:30–5:00: Short show-and-tell, board updates, next-day readiness. Use a written update when another meeting adds little value.

You should be doing useful project work between coordination tasks: clarify acceptance criteria, prepare test data, review evidence, maintain risks, help documentation, or pair on a bottleneck. Avoid checking on every person continuously.

## Kickoff decision agenda

Use these questions to complete P01–P03 and refine the foundation cards. Record agreements in DECISIONS.md; unresolved items need an owner and follow-up in the VTB. X01 reuses sufficient checklist answers already recorded during kickoff.

1. **Success and constraints:** What must the final demo prove? When is it due? Which checklist items are mandatory, and do slash-separated tools mean alternatives? What class sessions reduce available hours?
2. **Authority:** Which proposal becomes the governing specification? Who decides product priorities? Who confirms instructor acceptance? Who records decisions?
3. **MVP boundaries:** Confirm one building, multiple vendors, one vendor per order, simulated/non-payment checkout, vendor-provided dietary information and basic reporting. Record any changes to R01–R10 and explicit deferrals.
4. **Process:** Does Submitted mean validation already succeeded? Do we need Confirmed? Is delay a separate attribute? Who may cancel, until when, and when does capacity reopen? What happens to uncollected orders?
5. **Data and capacity:** Count orders, meals, or weighted preparation units? What fields are mandatory? How is price captured at order time? What prevents simultaneous submissions exceeding capacity?
6. **Platform:** Which release/modules and interfaces are available? Catalog requests or custom records? Where is the authoritative order? How do members avoid overwriting one another's configuration?
7. **Security:** How does a vendor user map to a vendor? Who can edit menus? What may management see? Which identities will be used for impersonation tests?
8. **Automation and integration:** Which events send email? Can email leave the training instance? What useful scheduled action and import/API demonstration satisfy the class checklist?
9. **Team agreement:** Availability, communication channel, work selection, reviewer rotation, response expectations, blocker escalation, and absence coverage.
10. **Evidence:** What counts as done? Where are screenshots/test results stored? Who runs Friday's demo, and who provides feedback?

Do not reopen naming: CafeNow and NowServing Solutions are confirmed. Record any new proposal edits separately from the preserved originals.

## Work selection and completion

[Requirements and checklist](REQUIREMENTS-AND-CHECKLIST.md) defines candidate acceptance coverage. [WEEK-ONE-BOARD.md](WEEK-ONE-BOARD.md) owns lanes, labels, readiness/Done rules and W01–W12 mappings. Use those shared conventions instead of maintaining a second status list here.

Start with one active delivery task per person; prioritize blocked work and review/test handoffs. Select Week 1 work only after dependencies and available hours are clear. The full 47-task backlog is not a one-week commitment.

As an initial capacity assumption, allow 4–5 delivery hours per person/day, then adjust for classes, meetings, learning and absences. Five fully available members would therefore suggest 20–25 delivery hours/day, not 40. Confirm actual people/hours; these are planning assumptions. Reserve time for integration, testing and review, and sequence changes touching the same configuration.

## Blocker and risk simulation

At 10:30 Tuesday the interface owner cannot access the expected module. Record the blocker immediately, identify who can resolve it, and ask the instructor/admin. Timebox a check of available alternatives; do not let the owner spend the entire day waiting. They can work on field mapping, the journey, and test examples while access is resolved.

At Wednesday's integration, a vendor can see another vendor's order. Create a high-priority defect with reproduction identities and expected restriction. Reassign effort to the ACL fix and review. Pause dependent demonstrations that would imply the feature is secure.

If a decision threatens the daily goal, raise it the same day. If the final deadline or week goal is at risk, explain the impact and offer options: reduce scope, sequence work differently, or ask for support. Do not hide the risk behind overtime assumptions.

## Friday review and retrospective

Suggested afternoon: 1:00–2:00 rehearse/fix; 2:00–2:45 demonstrate; 2:45–3:00 break; 3:00–3:30 review feedback and acceptance; 3:30–4:00 retrospective; 4:00–5:00 refine next week's work and handoff.

Review questions: What can we actually demonstrate? Which acceptance checks pass? What remains unsafe or incomplete? What feedback changes priority?

Retrospective questions: What helped? Where did we wait or redo work? What one or two changes will we try next week? Assign an owner and a way to check whether each helped.

## Daily PM note template

Copy into a dated team note and keep STATUS.md concise.

- Date and daily goal:
- Available people/hours and absences:
- Completed outcomes with evidence:
- Work in progress and next handoffs:
- Blockers: impact, owner, next action, follow-up time:
- Decisions made / needed:
- Risks to week goal and options:
- Tomorrow's top priorities:

Daily questions for yourself: Is the goal clear? Does everyone have ready work? What is blocked? What can be shown? What decision needs me? What should we stop starting?
