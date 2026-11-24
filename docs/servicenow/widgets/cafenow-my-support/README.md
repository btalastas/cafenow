# CafeNow My Requests & Complaints

Prepared November 13, 2026. New read-only own-submission list with 20 rows per page, number search, manual refresh and inline details. Uses existing employee/vendor complaint tables and mappings. Both number fields explicitly confirmed as number by the user. Status omitted because no status-field mapping has been confirmed.

## Install

1. In Service Portal > Widgets create **CafeNow My Requests & Complaints**, ID **cafenow_my_support**. Public unchecked, controller alias c. Paste template.html, client.js, server.js and style.css into matching fields. No option schema/Script Include/new table is required.
2. Reuse/create one page: **Title: My Requests & Complaints; ID: cafenow_my_support**. Keep non-public. Allow CafeNow user OR vendor_admin through the existing page/widget/instance access mechanism. Do not require both roles. In Designer add one container, one row, one full-width 12-column column and this widget once.
3. In Service Portal > Portals open /cafe and its actual **Main menu**. In Menu Items add a top-level **My Requests & Complaints** item, Type **Page**, Page **cafenow_my_support**, parent empty, appropriate order after My Orders. Match existing menu visibility for user OR vendor_admin. Alternatively use URL ?id=cafenow_my_support if required by the actual custom header, not both entries. Header source need not be replaced. No live header menu record has been created.
4. Repaste the updated existing complaints submission widget server.js and template.html from ../cafenow-support. After a successful insert it securely re-reads the saved record and displays number, with a history link. If receipt access fails, success remains true and the user is told not to resubmit. Number generation remains the table's responsibility.
5. Test both personas and the actual header desktop/mobile menu. Roll back by removing the new menu/page widget instance and restoring previous submission source if necessary; preserve complaint records.

## Access and fields

Employee source: x_1234_cafenow_user_complaints, role x_1234_cafenow.user; submitted_by, number, complaint_type, category, short_description, description, vendor, sys_created_on. Employee table name remains the existing requester source mapping; test against the actual instance.

Vendor source: x_1234_cafenow_cafenow_vendor_compliants, role x_1234_cafenow.vendor_admin; submitted_by, number, submission_type, complaint_category, complaint_summary, complaint_description, vendor, sys_created_on. Vendor staff alone has no access. Multi-role users see both own sources, merged newest first, with an optional Submitted as filter. Facility manager/admin alone has no own-list bypass; all-complaint handling remains separate.

Every table query is fixed/allowlisted and constrained to submitted_by=current user. Every result and direct detail lookup independently checks ownership, record ACL and field ACLs, even if a facility manager role grants broader read rights. Details are plain text. Internal notes, resolution fields, severity and handling controls are not returned. No edit/delete actions or aggregate counts are added.

Reuse existing table own-record READ and field READ ACLs. Do not create duplicates or broaden record access. Numbers and Created must be readable to list a row. Denied optional fields are blank; denied details are not leaked. Previous vendor ACL exports showed category CREATE absent and Reporter CREATE still conditioned, but the latest live corrections remain unverified; those concern submitting, not this read-only list. No new ACLs installed.

Paging fetches up to page*20+1 authorized rows per source and merges deterministically. It supports up to 100 pages (2,000 matching submissions); use number search to narrow larger histories. ACL-denied rows can require additional scanning. Check submitted_by/sys_created_on indexes and actual volume before scaling. No refresh polling or real-time update promise.

## Verify

Run node docs/servicenow/widgets/cafenow-my-support/verify.cjs. Test own-only employee/vendor/dual-role results, other-user IDs, unauthorized source/prototype keys, ACL-denied fields, more than 20 records, number search, receipt number after both kinds of submission, read-denied receipt behavior, keyboard/mobile and header visibility. Reconcile displayed numbers with actual records. Local mocks do not verify live insertion, numbering, ACL execution, rendering or performance.

Official references: [Header menu](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/configure-header-menu.html), [Scoped GlideRecord](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_GlideRecordScopedAPI.html). Target release and live header bindings remain unverified.
