# CafeNow week-one board guide

Proposed week: November 2–6, 2026. Use **one shared CafeNow MVP Visual Task Board** for live work. This file explains first-week selection and board conventions; it is not a separate status tracker. All 47 task definitions remain in [MVP feature tasks and processes](MVP-FEATURE-TASKS-AND-PROCESSES.md).

## Starting eight cards

P01–P03 are reported on the VTB. Foundation card texts were supplied in chat; creation is unverified. The lanes below are recommendations when initially adding/refining cards, not current observed status. An existing card's actual progress takes precedence.

| Card | Feature label | Dependencies | Initial placement |
| --- | --- | --- | --- |
| P01 — Confirm scope, deadline, availability, authority and checklist obligations | Planning | None | Ready once owner/reviewer and acceptance criteria are confirmed |
| P02 — Define rules and business-process diagrams | Planning | P01 | Backlog until prerequisites are satisfied |
| P03 — Verify instance and choose architecture/interface | Architecture | P01 | Backlog until prerequisites are satisfied |
| D01 — Review dictionary and relationship diagram | Data | P02, P03 | Backlog |
| S01 — Define persona/action/access matrix | Security | P02, P03 | Backlog |
| U01 — Sketch browse/order/track journey | User Interface | P02, P03 | Backlog |
| T01 — Write cases and evidence template | Testing | P02, P03 | Backlog |
| X01 — Confirm exact scheduled/import checklist obligations | Planning | P01, P03 | Backlog; reuse earlier decisions if sufficient |

P01 defines commitments, P02 defines ordering/fulfillment rules, and P03 verifies feasibility/architecture. P02/P03 should coordinate and reconcile findings. Next prepare D02–D04 and S02, then seed data and the integrated ordering slice according to the detailed dependencies.

## Lanes and completion rules

| Lane | Entry/exit guidance |
| --- | --- |
| Backlog | Candidate work awaiting refinement, prerequisites or selection |
| Ready | Outcome, acceptance criteria, dependencies, owner and reviewer clear; required inputs available |
| In Progress | Owner actively working; start with one active delivery task per person |
| Review/Test | Artifact/configuration ready for peer review and applicable checks |
| Blocked | Work cannot proceed; record reason, unblock owner and follow-up date |
| Done | Acceptance checked, review complete, evidence linked and relevant documentation updated |

A design task can be Done when reviewed; its corresponding application feature still needs implementation/tests. A feature that works only as admin is not Done for employee/vendor use. Keep expected dependencies in Backlog; use Blocked for an actual impediment to planned/active work.

## Labels

Use the task ID in the title, one primary feature label, and **Week 1** only for work the team selects for this week. Use lanes for progress rather than duplicate status labels. Labels are an organization convention, not evidence of completion.

| Feature label | Task IDs |
| --- | --- |
| Planning | P01, P02, X01 |
| Architecture | P03 |
| Data | D01–D05 |
| Security | S01–S04 |
| User Interface | U01–U03, V01–V03 |
| Service Catalog | C01–C03 |
| Server Validation | B01–B05 |
| Automation | F01–F03, N01–N02, X02 |
| Integration | I01–I02 |
| Reporting | A01–A02 |
| Testing | T01–T10 |

If label customization is unavailable, retain the task prefix and put the feature in the description. Board membership, card assignment and CafeNow application roles serve different purposes; verify that teammates can access the shared board.

## Task card template

Copy the relevant task definition and acceptance output; preserve its ID when shortening the title. For the starting cards, use the paste-ready text already supplied in chat and reconcile it to the current breakdown.

```text
Title: [ID — task outcome]
Description: [business/operational purpose]
Requirements: [R IDs]
Process: [BP IDs where relevant]
Week-one package: [W ID]
Checklist: [coverage]
Feature label: [label]
Owner: [name]
Reviewer: [name]
Target date / remaining effort: [agreed values]
Dependencies: [task IDs]
Activities/components: [specific steps and relevant ServiceNow components]
Acceptance criteria: [observable outcomes]
Evidence: [shared artifact/configuration/test links]
Blocker / unblock owner / next follow-up: [if needed]
```

Keep the task definition in Description or another persistent accessible card field; record progress in comments/work notes. If pasting into a comment composer, submit/Post it before leaving. Verify title and body match: a P01 scope card must not contain P03 architecture activities or a dependency on itself. Use board fields for assignee and due date where available; leave unagreed values unset.

Evidence links must be accessible to the group. Local D: paths alone will not work on teammates' computers. Live card changes belong in the VTB; scope/design changes also update DECISIONS.md and affected definitions.

## W01–W12 work packages

W IDs group planning work; create cards for detailed task IDs, not duplicate cards for each W package. This mapping organizes discussion and does not override detailed task dependencies. Some work spans packages/days. Targets are forecasts after kickoff, not commitments to complete every mapped task during week one.

| Package | Outcome | Detailed task mapping | Proposed target |
| --- | --- | --- | --- |
| W01 | Delivery constraints and scope authority | P01 | Monday |
| W02 | Business rules and process diagrams | P02 | Monday, refine as needed |
| W03 | Instance access and architecture | P03 | Monday |
| W04 | Data/security design | D01, S01 | Tuesday |
| W05 | Data configuration, identities and seed records | D02–D05, S02 | Tuesday onward |
| W06 | Employee ordering and vendor visibility | U01–U03, V01–V03, C01–C03 if chosen, B01–B03 | First small slice Wednesday; remainder sequenced |
| W07 | Capacity, lifecycle and exceptions | B02–B05 | Wed–Thu as dependencies allow |
| W08 | Event orchestration and email | F01–F03, N01–N02 | Thursday onward |
| W09 | Access controls, testing and defect fixes | S03–S04, T01–T07, T09 | Design early; checks throughout |
| W10 | Reconciled reporting | A01–A02, T08 | Thu–Fri if data ready |
| W11 | Required scheduled/import/catalog coverage | X01–X02, I01–I02; catalog decision P03/C01–C03 | Clarify Monday; build by agreed scope |
| W12 | Demonstration, review and next plan | T10 plus team review/retrospective | Friday |

## Capacity and daily board use

Confirm actual delivery hours before selecting Week 1 cards. Subtract classes, meetings, learning, absences, review and integration; the playbook's 4–5 delivery hours/person/day is an initial assumption, not a measured commitment. Maintain names/hours and assignments in the shared board/team note.

Review Blocked first, then Review/Test, then active work and next Ready cards. Split work that cannot produce reviewable evidence in roughly half a day to a day. A supported architecture investigation is ready with a question, timebox and expected recommendation. Capture decisions in DECISIONS.md, and a short project summary in STATUS.md.

## ServiceNow UI reference

The board is a project delivery tool, separate from the CafeNow vendor order queue. For actual controls, consult documentation matching your instance:

- [Create a freeform VTB](https://www.servicenow.com/docs/r/platform-user-interface/visual-task-boards/t_CreateAFreeformBoard.html).
- [Manage board members](https://www.servicenow.com/docs/r/platform-user-interface/visual-task-boards/t_AddOrRemoveATaskBoardMember.html).
- [Configure labels](https://www.servicenow.com/docs/r/platform-user-interface/visual-task-boards/t_ConfigureLabels.html): a card-level label toggle removes that label from the card; board-level disabling/deletion serves a different purpose. Deletion is a board-owner action in the referenced documentation.
