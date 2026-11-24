## Submission references and personal history - November 13, 2026

User confirmed number on both complaint tables. Updated success receipt to securely re-read the saved own record and show number plus a link to ?id=cafenow_my_support. Receipt-read failure never changes saved=true or invites resubmission. New personal list/setup lives in ../cafenow-my-support; create its page and header menu item before exposing the link. Repaste this server.js/template.html. Twenty-six submission checks pass, including both receipt paths and receipt failure handling. No live number display or installation claimed.

## Vendor table name corrected - November 13, 2026

User confirms actual table x_1234_cafenow_cafenow_vendor_compliants (including spelling). Replaced the earlier assumed vendor table in server, mocks and this guide. Use this exact table for vendor submission/read ACLs too; ACLs on the earlier assumed name will not protect/grant access to this table. User observed Missing submission field: submitted_by before correction; no successful live insert yet. Repaste full server.js and test again. Do not create duplicate tables/Reporter fields.

## Vendor admin only - November 13, 2026

User clarified only vendor admins may submit vendor complaints/requests. Server gate now requires x_1234_cafenow.vendor_admin; vendor_staff alone is denied. Support-link gate matches. Preserve employee requester access independently; staff who also have employee role may submit only as requester. Restrict vendor table/field create ACLs to vendor_admin and reconcile any prior vendor_staff grants. Repaste both server scripts. Existing page/widget/instance requester-only restrictions may still hide the form and need inspection; no live cause confirmed. Twenty mocked checks pass. Older staff-allowed notes below are superseded.

## Vendor testing enabled in prepared source - November 13, 2026

At the user's request to configure the widget next, enabled vendor_admin/vendor_staff submission in the local server and extended the support-link role gate. Confirmed mappings, capitalized choice values and 40/250 limits are in place. Repaste all four support widget fields and the support-link server script. Keep /cafe?id=cafenow_support non-public and extend any requester-only page/widget/instance role or user-criteria restrictions to vendor_admin/vendor_staff with OR semantics. Facility read ACLs do not make this submission widget a facility complaint viewer. No option schema is required. Verify vendor table name, ACLs and shared insert validation before production use. Twenty mocked tests pass, including both vendor roles, mapped inserts, category/vendor rejection and length boundaries; no live insert or rendering verified. Older disabled-gate notes below describe prior stages.

## Vendor Submission Type and lengths confirmed - November 13, 2026

User confirms Submission Type element submission_type. Screenshot stored values are Complaint and Request (capitalized). Updated vendor mapping and server conversion from the shared form's complaint/request values; requester values remain lowercase. Vendor Summary is String 40 and Description String 250, mandatory; both server validation and client limits now match. No dictionary length changes required. Use submission_type for the vendor field create ACL. Vendor route remains disabled until vendor ACL setup is confirmed; older pending-dictionary notes below are historical. Repaste server.js and template.html after setup. Twelve requester mock regressions pass; vendor insert/ACL execution remains unverified.

## Vendor dictionary and categories confirmed - November 13, 2026

User confirmed vendor number=number, reporter=submitted_by, vendor=vendor, summary=complaint_summary, description=complaint_description, Created=sys_created_on. Screenshot confirms category=complaint_category. Active stored category values: Asset & Maintenance; HVAC/Ventilation; Internet/Network; Power/Utilities; Safety; Billing; Service (label Services). Vendor form now has its own server-validated category choices and field mapping. Audience changes clear category/order/vendor selections. Original requester mapping remains intact.

Vendor submission remains disabled: Submission Type exists visually, but its technical element and complaint/request stored values need confirmation. FIELDS.vendor.kind is deliberately blank. Once confirmed, map it and review vendor create ACLs before enabling the role gate. Vendor Order reference is omitted because none has been confirmed; requester optional order remains. number and sys_created_on are system-managed and not written by the widget. No new field is currently required except verifying the existing Submission Type mapping. Summary/description field types and limits (currently 160/4000) still need verification.

Native form: Number/Created read-only; Reporter/Submission Type/Vendor/Category mandatory; Summary mandatory text; Description mandatory multi-line text. Severity and any assignment/state/resolution/follow-up fields belong to handlers, not portal input. The 2008 timestamp shown in Form Designer is not enough to prove a real system-field default; verify sys_created_on on a newly saved record before changing system fields. Number auto-generation must also be tested on insert.

Local requester regression: 12 mocked checks pass after mapping/category separation. No live vendor insert or create ACL verification.

# CafeNow complaints and requests

November 12 requester test update: CONFIGURED is now true at user request following ACL setup; canVendor is false until vendor dictionary/ACL setup is verified. Repaste server.js and template.html. Creation checks use field canCreate(), not canWrite(); configure field create ACLs. Current mapping: Reporter=submitted_by, Submission Type=complaint_type, Category=category, Summary=short_description, Details=description, Vendor=vendor, Order ID=order_id. Labels do not establish dictionary names; the vendor field mapping still needs live confirmation if it differs. Server errors identify missing/denied columns. No live insert verified.

Prepared November 12, 2026 at user request. Source only; no live deployment, table creation or ACL installation. Complaints/requests are an explicit addition to the earlier proposed scope, not instructor approval. Existing 47 task IDs remain unchanged; track delivery on the shared VTB.

## Install

1. Verify the existing User Complaints and Vendor Complaints technical table names in System Definition > Tables. User says they follow existing app conventions; source assumes `x_1234_cafenow_user_complaints` and `x_1234_cafenow_cafenow_vendor_compliants`. These names, dictionary elements, inheritance and choice values are NOT verified in retained exports or screenshots.
2. Reuse existing fields where semantics/types match the mapping below. Add only missing fields. Configure actual names in the server `F` map and `TABLES`. Requester and vendor now have separate FIELDS mappings; do not rename or duplicate existing vendor columns to match the employee table. Do not create duplicate tables.
3. Create a non-public widget **CafeNow Complaints and Requests**, suggested ID `cafenow_support`, in CafeNow scope. Paste template.html, client.js, server.js, style.css into corresponding fields. No Script Include or option schema required. Add one instance to an authenticated page, suggested ID `cafenow_support`; link it from requester and vendor navigation.
4. Reconcile record/field ACLs, inherited defaults, mandatory fields, numbering and active automation. Set `CONFIGURED = true` only after mappings and permissions are verified in development. No live connection/release is established.
5. Test requester A/B, vendor A/B staff/admin and dual-role users. Platform admin alone is not an implicit widget grant. Both vendor roles can submit. Verify direct form/API access as well as the widget.

## Tables used

| Table | Purpose |
| --- | --- |
| User Complaints (assumed `x_1234_cafenow_user_complaints`) | Requester complaints AND requests |
| Vendor Complaints (assumed `x_1234_cafenow_cafenow_vendor_compliants`) | Vendor complaints AND requests |
| `x_1234_cafenow_order` | Optional order lookup; number, opened_by, vendor |
| `x_1234_cafenow_vendor` | Authorized active vendor selection; name, vendor_group, active |
| `sys_user_grmember`, `sys_user_group` | Fixed internal authorization lookup: direct active groups and one active parent hop |
| `sys_user` | Reference target for submitter/assignment; no browser-selected submitter |

No Order Lines, REQ/RITM, refund transaction or new technical table is created. Complaint details are not returned to a shared vendor list. Vendor submission means the vendor reports an issue to CafeNow, not vendor access to employee complaints.

## Required shared submission fields

Names below are proposed mapping defaults, not observations of the screenshot dictionary. Reuse the displayed Complaint Summary/Complaint Description/Category/Order ID/Vendor fields if compatible and remap `F`. Increase lengths if needed. Do not blindly duplicate existing fields.

| Proposed element | Type/configuration | Submission behavior |
| --- | --- | --- |
| `submitted_by` | Reference sys_user, mandatory | Set from session; never accept client identity |
| `complaint_type` | Choice: complaint / request, mandatory | Required selector; these are stored values |
| `category` | Choice, mandatory | Stored values: order_issue, food_quality, pickup_delay, menu_issue, portal_issue, other |
| `short_description` | String 160, mandatory | Summary |
| `description` | Multi-line string 4000, mandatory | Description; plain text, never HTML rendering |
| `vendor` | Reference CafeNow Vendor | Mandatory for vendor submissions; requester derives it from optional owned order; otherwise blank |
| `order_id` | Reference CafeNow Order, optional | Server verifies own requester order or selected vendor's order |

If Order ID is currently dictionary-mandatory on User Complaints, make it optional to support general requests; add server validation if a later policy requires it for specific categories. Customer Name should be derived from submitted_by, not editable free text. Do not collect Product, Affected Quantity or Customer Impact just because they appear on the vendor screenshot; those manufacturing fields are optional later extensions, not required by this widget.

## Suggested handling fields and native form

Reuse inherited Task fields if present; inheritance is unverified. Otherwise add compatible equivalents. Widget does not write these fields.

| Field | Suggested configuration |
| --- | --- |
| Number / Complaint Number | Auto-number, read-only, distinct user/vendor prefixes; never client supplied |
| State | Proposed choices New, In Review, Waiting for Information, Resolved, Closed; default New; confirm stored values/workflow |
| Assignment group / Assigned to | References sys_user_group / sys_user; handler-only |
| Severity | Handler-controlled choice; default Low if agreed; do not infer urgency from description |
| Resolution notes | Multi-line or journal, handler-only write |
| Work notes | Journal, internal handlers only; deny requester/vendor reads |
| Resolved at / Resolved by | Server-managed date/time and sys_user |
| Date received | Use sys_created_on if possible; remove arbitrary form defaults such as the screenshot's 2008 date |

Native form sections: **Submission** (number, submitted_by, complaint_type, created date, summary, description); **Context** (category, vendor, optional order); **Handling** (state, assignment, severity, resolution); **Internal** (work notes, audit). Require resolution notes when resolving via server rule, not only a UI Policy. Verification of Effectiveness/Customer Acceptance should be handler follow-up, not mandatory on initial submission. Hide Refund Amount from submission and leave refund processing deferred; no payment/refund workflow is added.

Configure reference qualifiers for usability: requester Order.opened_by=current user; vendor orders limited to authorized vendor. These do not replace record ACLs/server validation. UI Policies can control native form display, but this custom portal form explicitly renders its own fields and does not automatically run native form policies.

## Access controls and limitations

- Create: exact requester role for User Complaints, vendor_admin or vendor_staff for Vendor Complaints. Enforce submitted_by=current user. Validate optional order ownership/vendor and group mapping on direct form/API inserts too, using a before-insert Business Rule with server session identity; do not rely solely on this widget. Reject user-forged state/assignment/resolution/refund values and enforce initial defaults in that shared rule.
- Read: submitter's own records plus confirmed support-handler roles. Do not grant every vendor employee read access to every complaint; sensitive complaints about vendors may need facility/support-only handling. Handler role technical name and routing are not confirmed.
- Update/delete: default deny submitters; allow approved handler roles with state/field restrictions. Broad inherited ACL grants must be reconciled; adding a restrictive ACL does not undo another allow.
- Fields: submitters need create access to mapped submission fields; handler/internal fields need separate restrictions. Validate dictionary mandatory fields and evaluate field canCreate after setting server ownership.
- Fixed authorization metadata uses GlideRecord, but business data reads/inserts use GlideRecordSecure plus explicit field/record checks. Vendor lookup also needs appropriate read ACLs for vendor_group/name/active; do not expose group metadata through the portal.
- No attachments, complaint history view, notification delivery, SLA, escalation, refunds or automatic assignment implemented. Existing rules/flows may still run; inspect them.
- Button blocks double clicks. There is no durable deduplication key. Lost-response client locks further submissions; refresh or a new tab can still duplicate. Check records with support before retrying. This is not a concurrency/deduplication guarantee.

## Verify

Run `node docs/servicenow/widgets/cafenow-support/verify.cjs` for local mocked security/input checks. These do not establish live ACL/API compatibility or browser rendering.

In development, verify inserts in the correct table for each role; dual-role selector; blank-order general requests; requester A cannot link requester B's order; vendor A cannot link vendor B's order or select its vendor; inactive groups/vendors rejected; forged submitter/state/refund fields ignored by widget and rejected by shared direct-insert rules; ACL denial, missing fields, mandatory fields and Business Rule-aborted inserts; transport failure and duplicate-click behavior. Inspect created records/numbering/defaults and keyboard/mobile/error rendering. Notifications require separate implementation and generated-email verification.

Sources: supplied screenshots and user request; existing vendor authorization pattern; [GlideRecordSecure guidance](https://developer.servicenow.com/blog.do?p=%2Fpost%2Fgliderecord-vs-gliderecordsecure%2F), [scoped GlideRecord API](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_GlideRecordScopedAPI.html), [portal client APIs](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/client-script-reference.html).
