# CafeNow session context - November 12, 2026

This is a continuity note, not a second task board. Shared MVP VTB owns live task status. Distinguish user screenshots/reports from local checks and live verification. No instance connection established.

## Roles and home

Retained source roles: x_1234_cafenow.user (requester), x_1234_cafenow.vendor_admin, x_1234_cafenow.vendor_staff. User screenshot also confirms x_1234_cafenow.facility_manager and x_1234_cafenow.admin. Home hero uses server-derived role flags and ng-if. Users with multiple roles see multiple sections; admin hasRole behavior differs from exact assigned-role checks. My Open Orders is a separate widget needing its own requester gate. Menu navigation visibility is separate from page/data authorization. Facility dashboard route/widgets remain unverified; suggested KPIs are orders today, active orders, on-time readiness, delayed orders, vendor breakdown and window utilization. Metrics need reliable timestamps/data.

## Vendor menu

Local cafenow-vendor-menu already supports vendor-admin add/edit of Menu records, staff read-only, group/vendor scope, images display only. 31 mocked checks passed; no live deployment verified. Missing Add was linked to Menu.vendor write ACL granting only CafeNow admin. Suggested separate new-record vendor-admin grant still needs ownership validation for direct paths. November 9 export has broad table write grants without ownership script and duplicate table ACLs; reconcile rather than assume descriptions enforce policy. Current user group structure screenshot: Pizza Hut Admin parent Pizza Hut; user inherited vendor_admin/staff. Widget later reported no matching active Vendor; user subsequently said fixed. Exact fix not supplied. Do not continue treating that mapping as unfixed. No vendor/group business records in retained export.

## Cart

Direct-ordering cart has inline Terms & Conditions, user-requested 20-minute ordering cutoff (supersedes earlier 30-minute policy), pickup reminders as text and My Orders link. Simplified service still does not enforce cutoff/capacity or send scheduled reminders. Price display labels unit price, item subtotal for quantity above one, and order total. Changes local only.

## Knowledge

Use role-based Knowledge User Criteria at article or base level, not category permissions. KB Categories visibility can depend on at least one readable article via instance option. User shown proposed categories for role-specific articles; configuration not verified.

## Complaints and requests - current active task

Package: docs/servicenow/widgets/cafenow-support. User wants requester/vendor submission; currently requester-only testing: CONFIGURED=true, canVendor=false. Existing tables assumed by user naming convention: x_1234_cafenow_user_complaints / x_1234_cafenow_vendor_complaints; vendor dictionary still unconfirmed. Screenshot confirms requester table name through ACL list.

Current mapping: Reporter=submitted_by; Submission Type=complaint_type; Category=category; Summary=short_description; Details=description; Vendor=vendor; Order ID=order_id. complaint_type explicitly confirmed by user. Vendor ACL screenshot has a truncated complaint... name despite Vendor description: actual vendor element must still be checked if failure reaches it. Labels alone do not verify elements. Choice stored values complaint/request; categories order_issue, food_quality, pickup_delay, menu_issue, portal_issue, other. User reports adjusting requester choices; vendor not ready.

Widget sets submitter from session, validates optional order opened_by and derives vendor, uses fixed allowlist and GlideRecordSecure. It does not expose handling/refund fields. Number Maintenance suggested per-table auto numbering, not client counter; setup not verified. Order ID must be optional for general requests. Summary/Details mandatory recommended. Internal resolution/refund/severity fields handler-only. No complaint list dashboard yet. Facility manager viewing all requester complaints authorized by user; no handling write authorized.

ACL progression: table create and requester read use user role + Reporter is dynamic Me. Separate facility_manager table read has no record condition for single-building pilot. Earlier field WRITE guidance caused canWrite failure and was corrected: current server uses field canCreate. User last asked whether to change the seven submission-field ACL operations from write to create; answered YES only for Reporter, Submission Type, Category, Summary, Details, Vendor, Order ID. Keep role user and Reporter is dynamic Me; leave table create/read, facility read and Menu ACLs unchanged. Latest screenshot still had Reporter WRITE; user has not yet reported successful create after changing operations. Next: save seven CREATE ACLs, retry requester submission; debug exact denial if persists. Do not grant table write as workaround. Check inherited/wildcard grants, prevent requester updates/deletes and validate direct inserts server-side. 12 mocked checks passed; no live insert verified.

## Notifications

Submitted screenshot had insert+update and State is Submitted. Suggested insert-only for create-in-Submitted journey, and transition conditions for Confirmed/Ready/Closed. Duplicate source not conclusively traced. Generated email records do not prove delivery.

Final reminder notification event x_1234_cafenow.PickUp Reminder, active+Ready, parm1='3'. User scheduler runs each minute, uses pickup_date + referenced window end_time, then stage thresholds overdue 30/60/120 minutes; highest-stage calculation jumps directly to 3 for old windows. End-time storage/execution timezone not verified. Proposed next-stage-only scheduler needs ready_for_pickup_at and last_reminder_at to avoid minute-apart catch-up. Proposal (not approved): first 30 minutes after later of Ready or pickup end, then minimum 30-minute gaps. Earlier final one-hour-before-vendor-close rule remains unresolved with late-window timing. Do not run Flow and scheduled job as duplicate schedulers. No notification script changed locally in this discussion.
