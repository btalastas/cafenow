# CafeNow PDI export reviewed - November 24, 2026

Inspected the [November 24 update-set XML](exports/sys_remote_update_set_d3c214053c7013107f446ede2ba4162c.xml). It contains CafeNow 1.0.0 in scope `x_1234_cafenow` and 2,251 update entries, including the portal, catalog configuration, flows, notifications and ACLs. No CafeNow business rows or user/group membership rows were found in the update payloads. The export includes deletion entries for the Nutrition and Team pages and both a deletion and an insert/update for Pickup Window. The separate knowledge XML contains 15 articles referencing CafeNow KB, with no knowledge base record.

Next: preview on the PDI and resolve collisions or dependencies before committing. Export demo Vendor and Menu rows separately, create fresh pickup windows, and configure test users and vendor access. Verify CafeNow KB and article references if the FAQ page is part of the demo. PDI import and end-to-end behavior remain unverified.

# Complaint reference receipt and My Requests & Complaints prepared - November 13, 2026

User requested complaint numbers for employee/vendor submissions and a header tab/page similar to My Orders; confirmed both fields number. Updated support receipt with secure own-record reread and history link, preserving saved success on receipt failure. Prepared cafenow-my-support widget/page ID cafenow_my_support with merged own-submission list, 20-row paging, number search, persona filter and inline read-only details. No status fields assumed; vendor staff/facility/admin alone have no persona bypass. Guide specifies one full-width Designer widget and existing Main menu Page item My Requests & Complaints, not a replacement header. Checks: 26 submission and 17 history mocks, scripts, HTML balance, links and whitespace pass. No live page/header creation, numbering, rendering or ACL execution verified. Next: install widget/page/menu, repaste support receipt changes, test both personas and cross-owner direct detail denial. Shared MVP VTB retains live task status.

# Vendor ACL role associations reviewed - November 13, 2026

Joined 18 exported sys_security_acl_role rows to all 18 ACL definitions with no unmatched IDs. Export confirms correct vendor-admin own-reporter table READ, facility-manager unrestricted table READ, vendor-admin unconditional table CREATE, and CafeNow-admin-only DELETE. Two Reporter READ ACLs serve distinct roles; no need to remove/duplicate them. Seven existing field READ ACLs grant facility_manager only (submission_type/vendor/complaint_category/complaint_summary/complaint_description/number/sys_created_on); vendor_admin missing in supplied role export, consistent with submission_type failure. Add vendor_admin to those existing field READ grants rather than creating new ACLs. submitted_by CREATE still has own-reporter condition in definition export; complaint_category CREATE absent. User requested one-by-one workflow; next action is update existing submission_type READ role list first. No live changes or access results claimed; originals unchanged.

# Vendor complaint ACL JSON reviewed - November 13, 2026

Reviewed exports/sys_security_acl.json: 18 active Allow If record ACL definitions on the actual vendor table. All eight expected field READ targets exist; Reporter READ duplicated (roles cannot be compared). Table CREATE has no condition; two table READ definitions have own-reporter versus empty conditions as intended, but Requires role associations are absent from this JSON and cannot be verified from descriptions. Specific corrections: submitted_by CREATE still has Reporter dynamic Me condition; complaint_category CREATE absent from supplied export. Table DELETE present with admin-oriented description, actual role not exported/unverified. No edits to export or live ACLs. No need to recreate existing READ ACLs or remove duplicate Reporter rules without role comparison. Next: fix only those specific create gaps if not already changed after export; verify role associations on existing records before claiming full access isolation.

# Vendor field-check exception instrumentation - November 13, 2026

Supplied log contains only our caught-error stage message, not root exception. Added null-element/method-availability guards and bounded administrative exception detail with submitted values/reference IDs redacted. Permission enforcement retained; no canWrite fallback or ACL changes. Twenty-two existing regression mocks pass; exact live cause remains unconfirmed. Next: repaste server and reproduce once; inspect specific unavailable-method portal message or CafeNow support technical exception log.

# Vendor support generic exception diagnostic - November 13, 2026

After table correction user reports generic Submission could not be confirmed message, not explicit create-denial text. Added fixed diagnostic stage labels for initialization, field setting, table/field create checks and insert, surfaced for unexpected exceptions and logged without submission content. Root cause remains unknown; no ACL weakening or live success claimed. Twenty-two regression mocks and whitespace pass. Next: check whether test record exists, repaste server, reproduce once only if absent, then inspect stage and corresponding platform errors.

# Actual vendor complaints table confirmed - November 13, 2026

User confirms x_1234_cafenow_cafenow_vendor_compliants after live Missing submission field: submitted_by. Replaced assumed table name in support source/tests/guide. Live screenshot establishes form authorization and Pizza Hut selection, not successful insert. Next: repaste support server, verify ACLs target actual table, retry; diagnose any next exact field/ACL error.

# Vendor support role-gate diagnosis - November 13, 2026

User screenshots show support widget rendered with unauthorized message and Pizza Hut Admin group membership/assigned vendor_admin role. This isolates the displayed failure to the server authorization result, not an invisible page widget or insert ACL. Updated support/link role-list normalization to handle bracketed Java-list-style output as well as comma-separated strings while retaining exact roles/effective hasRole. Twenty-two mocks pass including bracketed vendor-admin acceptance and staff-only denial. Actual session role representation and deployed code remain unverified; this is a candidate fix, not confirmed root cause. Next: repaste full support/link scripts, restart impersonation and retry; if unchanged inspect actual user role inheritance and deployed role constants.

# Vendor submission restricted to vendor admins - November 13, 2026

User clarified vendor admin only and reports missing widget. Updated support and support-link vendor role gates; retained requester path. Twenty mocks pass including staff-only denial. Actual page/widget/instance access and live cause remain unverified. Next: repaste both server scripts, inspect direct support URL and requester-only page/widget/instance restrictions; restrict vendor create ACLs to vendor_admin.

# Vendor support widget prepared for testing - November 13, 2026

Enabled local vendor role route and support-link visibility for vendor admin/staff, retaining requester path. Confirmed vendor field mapping, capitalized submission values and 40/250 limits. User asks widget setup after ACL guidance; actual ACL creation still unverified. Expanded mocked suite to 20 checks covering vendor inserts/ownership mapping, category/vendor denial and length boundaries. Scripts/whitespace pass. No live insert or page access verified. Next: repaste widgets, allow vendor roles on the support page, test vendor group selection and records, verify direct-insert safeguards. Facility complaint viewing remains separate.

# Vendor submission type confirmed - November 13, 2026

Mapped vendor submission_type with stored Complaint/Request, kept requester choice values unchanged, and aligned vendor server/client text limits to confirmed 40/250. Vendor submission gate remains disabled pending create ACL setup. Twelve requester mock regressions, script parsing and whitespace passed; no vendor live insert verified. Next: configure vendor table/six submission-field create ACLs and confirm setup before enabling vendor roles.

# Vendor support dictionary/category alignment - November 13, 2026

User supplied vendor technical field names and category choice values. Prepared separate requester/vendor FIELDS mappings and dynamic audience-specific category choices; Services correctly stores Service. Vendor order linking omitted pending any real field requirement; system number/Created untouched. Vendor Submission Type technical element and stored values remain unconfirmed, so kind mapping blank and vendor submission gate remains disabled. Corrected guidance: Form Designer 2008 sample alone does not establish an actual sys_created_on default. 12 requester mock regressions and script parsing passed; no live vendor insert/ACL verification. Next: confirm existing Submission Type element/values and vendor field types/lengths, configure create ACLs, then enable/test vendor route.

# NowServing Solutions B2B positioning - November 13, 2026

Updated the About Us widget copy using the user-confirmed startup IT solutions company/B2B ServiceNow application positioning. Revised introduction, mission, vision, approach, product description and commitment. Diff whitespace passed; no live deployment/rendering verified. Next: repaste information template in the instance.

# About Us shifted to NowServing Solutions - November 13, 2026

User requested company-focused About Us instead of About CafeNow. Updated the information widget page heading/introduction and About Us body with the five-developer group, mission, vision, approach, values and CafeNow as its product. Preserved section keys, page ID and team/nutrition content. Updated installation title guidance; original Word files unchanged. Checked replacement scope, UTF-8 and diff whitespace. No live deployment/rendered verification. Next: repaste information template and rename page title if desired, then verify existing header/footer links and sections.

# Direct knowledge article body export reviewed - November 13, 2026

Received exports/kb_knowledge (kb_knowledge_base=5602e4aa189813107f44e367c73ecbb6).xml: 15 matching kb_knowledge records with nonempty bodies, numbers, category labels/IDs and published state in the export. This supersedes the prior no-bodies limitation for article review. Reviewed all visible text and matched references by sys_id. Updated revision builder/manifest/inventory, retained actual categories (including tracking under Ordering and Payments), improved replacement bodies to retain sign-in security/urgent vendor contact/allergen guidance, and added BODY-REVIEW.md and BODY-CHANGES.diff. Corrected stale status/notification/support-placeholder/cart-overview content. Article read-criteria fields are empty in this export; full base/contributor/criteria behavior still needs live review. Checks: 15 exact ID/number/category/body-hash matches, original source hashes unchanged, HTML balance, clean replacement text, local links, diff generation and whitespace passed. No XML import, publication, live access or rendered UI verified. Next: review changes and update actual editable article versions through Knowledge workflow; verify all personas and reader steps. Shared MVP VTB remains the task board.

# Knowledge export review and replacement article bodies - November 13, 2026

User confirmed employee=user, vendor=vendor_admin/vendor_staff, facility=facility_manager and CafeNow admin=all FAQ categories, then requested exported XML/article updates using prior context. Reviewed both retained exports: 15 unique article references from menu records, zero kb_knowledge bodies. Prepared docs/servicenow/knowledge/cafenow-faq-revision with 15 replacement HTML bodies, proposed article categories, reference/source-hash manifest, inventory, reproducible builder and installation/access-review guide. No body-by-body comparison or live article update is possible from these exports alone. Content reflects direct Menu/Order Lines, recorded lifecycle, 20-minute ordering/cancellation policies, My Orders, support/About and known implementation limits. Retained KB reference 5602e4aa189813107f44e367c73ecbb6 needs live validation; observed broad read/contribution associations require access review. FAQ category documentation now marks the persona mapping confirmed. Checks: 15 unique reference IDs/HTML files, HTML balance, source SHA-256 identity, JSON/UTF-8/local links, existing mocked category role suite and diff whitespace passed. Original XML unchanged; no live article update, publication, criteria change or rendered verification. Next: locate actual current articles/versions, review replacement copy and role criteria, install through normal Knowledge editing workflow and verify as each persona. Live task status remains on the shared MVP VTB.

# Role-filtered FAQ category widget prepared - November 13, 2026

Prepared docs/servicenow/widgets/cafenow-faq-categories for the existing cafe_faqs KB Categories instance. Server-side proposed role/category map combines assigned/inherited CafeNow personas and queries only active, ACL-readable top-level categories in a configured KB; duplicates omitted. Role map is a recommendation pending user confirmation, not an approved requirement. Retained role identifiers used; live assignments/KB ID/destination unverified. Option schema requires actual knowledge-base sys_id and allows category article page configuration. Guide covers Column 1 replacement, separate article Can Read/Cannot Read criteria, rollback and role/direct-link tests. Mocked role matrix, payload filtering, setup/ACL/field/base/root/active/duplicate checks, script parsing, option JSON and diff whitespace passed. No live installation, knowledge authorization or rendering verified. Next: approve mapping, configure actual KB/destination, install and perform role/article-access tests. Shared MVP VTB retains live task status.

# Consolidated About navigation prepared - November 13, 2026

User requested one header About tab leading to three collapsed sections, and footer links/group image with the matching section expanded. Prepared single cafenow_about page widget with accessible disclosure buttons, allowlisted section query, and same-page query/Back/Forward handling. Footer now links to cafenow_about with section=about/team/nutrition, preserving the logo. Setup guide covers the existing header Main menu About item and one Designer page; previous three-page setup is superseded. Local syntax, source structure and mocked expansion/navigation checks passed. No live header menu record, page installation or rendered accessibility verification. Next: repaste all information-widget fields and footer HTML, configure the top-level About menu item, and test actual portal navigation. Shared MVP VTB remains authoritative for task status.

# CafeNow footer links and separate information pages - November 13, 2026

User requested separate About Us, Meet Our Team and Nutrition & Allergen destinations and asked about a footer that stays visible like the header. Replaced disclosures with links to cafenow_about, cafenow_team and cafenow_nutrition; moved retained content into reusable cafenow-information page widget, selected by allowlisted page ID. Added Designer setup and optional Theme Fixed footer guidance. Compact CSS leaves positioning to the platform; fixed behavior/content clearance remains unverified. Updated standalone footer preview. Local HTML structure, destination/page mapping and JavaScript checks performed; no live deployment or rendered browser verification. Next: create the three pages, install the content widget, repaste footer HTML/CSS and verify actual theme spacing before enabling Fixed footer. Shared MVP VTB remains the task board.

# CafeNow portal footer prepared - November 13, 2026

Prepared docs/servicenow/widgets/cafenow-footer with theme-footer HTML/CSS/client/server source, standalone preview, identical copy of the supplied NowServing Solutions PNG, and installation/rollback guidance. Three expandable sections adapt docs/About Us - Cafenow.docx, docs/Meet Our Team.docx and docs/Nutrition & Allergen.docx; original documents/assets remain unchanged. Preserved five team profiles/LinkedIn URLs, normalized CafeNow naming, removed unverified Published metadata and automatic-notification promises, and clarified vendor-provided allergen information. Checks: balanced HTML, three disclosures, five HTTPS profile links, PNG byte identity, UTF-8, JavaScript syntax and diff whitespace. No live installation, image upload, rendered browser/accessibility verification or profile-link verification. Next: upload logo, create CafeNow theme footer, assign to /cafe's theme and perform documented desktop/mobile/keyboard/role checks. Live task status remains in the shared MVP VTB.

# Dedicated complaint submission page and link widget - November 12, 2026

Prepared docs/servicenow/widgets/cafenow-support-link with requester-gated home card linking to proposed /cafe?id=cafenow_support. Setup guide specifies non-public page, full-width column and existing support form widget; no duplicate submission implementation. Vendor submissions remain disabled pending configuration. Checks: source syntax and mocked role visibility; no live page creation/navigation/rendering verified. Next: create/reuse page, paste/add widgets and test as requester; facility complaint viewing remains a separate dashboard/list.

# Session continuity saved - November 12, 2026

At user request, saved docs/planning/SESSION-CONTEXT-2026-11-12.md with role names, local widget changes, screenshot findings, corrected requester field-create ACL guidance, and unresolved reminder scheduling. Current next action: change only seven User Complaints submission-field ACLs from write to create, retain own-reporter condition, then retry and verify live insert. No successful live submission reported yet. Continuity note is not a task board.

# Requester complaint submission ACL alignment - November 12, 2026

User reports creating submission ACLs and requests widget update. Enabled requester testing, kept vendor submissions disabled, retained Reporter/submitted_by and confirmed Submission Type/complaint_type mappings, aligned portal labels to Submission Type and Details, and replaced field canWrite checks with canCreate. Errors identify exact missing/denied field. Updated mocks to fail if update checks are used during submission and assert mapped values. Checks: 12 mocked checks plus server/client parsing and diff whitespace. No live insert/ACL/rendering verification; remaining dictionary names must match target. Next: repaste server/template and test as requester; confirm any differing vendor-reference element before changing mapping.

# Support submission type mapping - November 12, 2026

User confirmed complaint_type is the Submission type element. Updated support server mapping and setup guide. Category screenshot supplies labels only; actual stored category values and per-table field compatibility remain unverified. Checks: existing mocked suite and diff whitespace. Next: confirm category choice values and remaining dictionary mappings before live submission testing.

# Complaints and requests widget prepared - November 12, 2026

Prepared docs/servicenow/widgets/cafenow-support with requester/vendor submission routing, optional ownership-validated order context, vendor group checks, fixed field allowlist and secure insert checks. User says complaint tables follow prior naming conventions; assumed names and proposed dictionary mappings are explicitly gated pending verification. Guide includes table use, suggested additions, native form layout, ACL/direct-insert requirements and deferred refund/notification work. No live changes. Checks: local mocked input/ACL checks and script parsing; no live ACL, vendor/order authorization or rendered UI verification. Next: confirm dictionary, configure shared record safeguards and mappings, enable in development, then perform documented role tests. Shared MVP VTB owns delivery status.

# Cart price labels - November 12, 2026

Clarified direct cart/sidebar price display: label unit price, show labeled item subtotal only for quantities above one, and label the order total. No price calculations changed. Checks: replacement assertions, saved UTF-8 and diff whitespace checked. No live deployment/rendering verified. Next: repaste the widget HTML and check quantities one and two in the portal.

# Cart terms and pickup reminders - November 12, 2026

Added inline Terms & Conditions at the bottom of the direct-ordering full cart, with the requested 20-minute ordering cutoff, time example, My Orders link and pickup reminders. Limited display to signed-in full-cart users; sidebar and other views omit it. Recorded the policy change in DECISIONS.md. Existing terms checkbox remains. Cutoff enforcement and scheduled notifications remain unimplemented in the simplified service. Checks: source placement/visibility and diff whitespace reviewed; no live deployment or rendered portal verification. Next: repaste widget HTML/CSS, verify the full cart and sidebar in the instance, and implement/test server cutoff separately. Live task status remains on the shared MVP VTB.

# Vendor menu images prepared - November 11, 2026

User requested images and explicitly selected display of existing images only. Updated vendor menu server/template/CSS to reuse ACL-readable Menu.item_image, show list thumbnails and an edit-form preview, and omit absent/denied/malformed image references. No upload/image mutation or schema change. Checks: 31 mocked checks passed including image cases and ignored forged image writes; client syntax parsed. No live rendering or image endpoint authorization verified. Next: repaste the three changed fields and verify images/access in vendor sessions. Shared MVP VTB retains live task status.

# Vendor menu widget prepared - November 11, 2026

User requested a new vendor-side widget listing all own menu items with add/edit functionality. Prepared [CafeNow Vendor Menu](docs/servicenow/widgets/cafenow-vendor-menu/README.md) with authenticated group-based vendor resolution, paginated active/inactive items, vendor-admin add/edit forms, existing name/description/currency-price/active/in_stock fields, explicit field/record ACL checks and server-side validation. Vendor staff retain read access under the existing manager-maintenance plan. Uses user-supplied mint/green branding. No new table or live configuration change.

Checks: 25 local mocked server checks passed for authorization, vendor tampering, field/record denial, validation, stale edits, aborted saves and pagination; client syntax parsed. Existing November 9 Menu dictionary lengths inspected and official widget/access API guidance consulted. No live ACL, currency storage, browser rendering or deployment verified. Next: install source on the My Menu page, confirm USD creation default and current identifiers, reconcile Menu ACLs/direct API restrictions, then run documented multi-vendor tests. V01/S04 and acceptance evidence retain live status on the shared MVP VTB. Concurrent-update and duplicate-insert limits are documented.

# Menu quantity controls simplified - November 10, 2026

User requested one quantity adjustment option on menu cards. CSS now hides native number-input spinner arrows within cn-menu-quantity, retaining existing minus/plus buttons and editable numeric input. Cart inputs are unchanged. Checked selector scope and saved CSS; no live browser rendering verified. Next: repaste widget CSS and refresh menu in the target browser. Live task status remains on the shared VTB.

# Menu and cart pictures prepared - November 10, 2026

User requested pictures in direct-ordering menu and cart. Prepared optional ACL-checked Menu.item_image URLs, menu-card pictures and smaller cart/sidebar pictures. Existing images are reused; no new assets or schema. Checks: 58 mocked checks passed including image propagation, denied field and absent/malformed values; scripts/JSON parsed. No live image rendering, attachment authorization or deployment verified. Next: repaste Script Include, HTML and CSS and test populated Item Image records as an employee. Live task status remains on the shared VTB.

# My Orders defaults to full history - November 10, 2026

User chose to open all orders directly from My Orders. Changed employee order-view option default and server fallback to all; explicit recent/open/details options remain available. Installation notes require setting any existing cafenow_my_orders instance to view=all because saved recent options are not overwritten by schema defaults. Checks: 21 mocked checks passed, including missing/invalid instance defaults; client syntax and option JSON parsed. No live deployment or navigation verified. Next: repaste server/option schema, set the existing page instance to all and verify the My Orders menu route. Live task status remains on the shared VTB.

# Home open-order tracker prepared - November 10, 2026

Added user-requested open mode to the employee order-view widget: five newest own active Submitted/Confirmed/Ready orders, detail links and manual Refresh status. Existing all-history and detail pages are reused; no new page required for the home block. Updated server/template/option schema and installation notes. Checks: 19 mocked checks passed, including open-state exclusions and removal on completion; client/JSON parsed. No live installation or browser validation. Next: repaste three changed fields and set home instance view=open; retain all/details instances on their existing pages. Live task status stays on the shared VTB.

# Employee order view widgets prepared - November 10, 2026

User requested new simple-list, data-table and individual-order widgets. Prepared [CafeNow employee order views](docs/servicenow/widgets/cafenow-order-views/README.md): one reusable widget with recent/all/details instance modes, five recent own orders, number search and paged history including completed/canceled records, plus read-only parent and food Lines. Server uses fixed secure queries, current-user opened_by checks and field ACL guards, with no vendor/admin ownership bypass or record writes. Existing checkout and original widgets are preserved; supplied guide maps replacements onto existing cafenow_my_orders/cafenow_order_details pages.

Checks: 17 local mocked checks passed for ownership tampering, guests, record/field denial, parent/child isolation, history, pagination and search. Client syntax and option JSON parsed. Official Service Portal widget/API documentation consulted. No browser rendering, live ACL/related-reference behavior, deployment or performance verified. Next: create widget/instances in development and run documented two-employee, guest, direct-link and mobile checks. U03/S03/S04/T04/T07/T09 retain live status on the shared VTB.

# Pickup reminder PDF guide - November 10, 2026

Prepared [CafeNow pickup reminder guide](docs/servicenow/notifications/CafeNow-Pickup-Reminder-Guide.pdf) at the user's request. Includes proposed Date pickup_date and Integer reminder_stage fields, referenced Pickup Window end-time handling, an illustrative scheduled script, event registration, three Notification form configurations and email copy. The 30/60/120-minute schedule remains an assumption; final-warning versus disposal timing, vendor closing source, live Time encoding and late/stale-order policy remain unresolved. No implementation choice is recorded as approved by this artifact.

Checks: all five PDF pages rendered and visually inspected; page count and text bounds checked. Official ServiceNow notification and Date/Time documentation consulted. No instance configuration, script execution, outbound email or delivery verified. Next: confirm reminder timing and live dictionary/time semantics, then configure and test in the development instance. Shared VTB retains live task status.

# Checkout Submitted-state correction - November 9, 2026

User reports placed Orders become Closed Complete and reaffirms Submitted -> Confirmed -> Ready for Pickup -> Closed Complete. Changed direct checkout from inactive Submitted insertion to active Submitted; explicitly reapplies state=-5 on finalization and verifies persisted state/active. Unexpected synchronous overrides produce pending/manual-review feedback without deleting the saved parent/Lines. Prior inactive Task interaction is a possible cause, not a verified live diagnosis. With technical completion status deferred, active partial parents can be visible; cleanup still attempts removal on line/save failure. README updated with this tradeoff and live investigation steps.

Checks: 55 mocked checks passed, including inactive-Task closure simulation and forced final-state override handling; source/JSON parsing and diff whitespace checked. No live rule/Flow inspection, deployment or vendor transitions verified. Next: repaste Script Include and test a new Order; if still closed, inspect actual choices and Order/Task automation rather than changing global Task definitions. Live task status remains on the shared VTB.

# Simplified direct Place Order prepared - November 9, 2026

User authorized removing deferred submission metadata/setup gates and proceeding with direct Order/Line creation. Updated service/client/template and minimal manifest/docs. Submission uses active vendor-matched Window records without time-storage/cutoff/capacity filtering; validates sign-in, one vendor, quantities, current prices/review, acceptance and Window membership. Creates one inactive Submitted parent, its Lines, then activates parent. Vendor.location (or optional building property) supplies mandatory Location. opened_by remains owner; requested_for and date/acceptance columns are conditional on actual existence. Prepared read predicate hides inactive Submitted parents; cleanup failure and response loss require manual review. Retained previous advanced setup documentation as historical.

Checks: 53 mocked service/client checks passed, including no deferred fields/properties, multi-food parent/Lines/totals, location fallback, wrong/inactive windows, parent/line authorization, cleanup and locked lost-response behavior; source/header/JSON parsing and diff whitespace checked. No live record creation, ACL/form behavior, inherited automation, concurrency or browser rendering verified. Duplicate/capacity/cutoff guarantees are deferred, not passed. Next: repaste Script Include/widget files, configure Vendor Location and actual related list/ACLs, then run the documented development checkout checks. Existing task IDs and shared VTB retain delivery status.

# Menu quantities and Order creation review - November 9, 2026

User reports pickup windows now populate. Added menu minus/plus and quantity selection with additive cart bounds; existing active-vendor filtering retained. Submission now optionally populates requested_for when that exact column exists, retaining opened_by ownership. Documented Order Line related-list setup and recommended existing synchronous parent/line creation rather than duplicate Flow creation. Actual requested_for dictionary remains unconfirmed; sys_created_by remains platform-managed. Deferred submission metadata still blocks the current unconfigured submission path; no simplified path or live creation is claimed.

Checks: direct service/client mocked suite and syntax checks run; diff whitespace checked. No browser rendering, live field/ACL/form configuration or Order insertion verified. Next: repaste updated widget/client/template/style and service, verify quantity UI; settle deferred submission setup before enabling Place Order. Live task status remains on the shared VTB.

# Pickup Window dropdown display refinement - November 9, 2026

User requests the cart populate directly from Pickup Window records for now. Updated the direct service preview to list readable active vendor-matched records using time_slot_v2 display labels and sys_id values, without time-storage, cutoff or capacity filtering. Submission retains existing eligibility checks; deferred submission metadata is still required by that path. Package README records the distinction. No live deployment performed.

Checks: 52 mocked direct service/client checks passed, including preview without time-storage configuration and retained submission rejection; script/header/JSON parsing passed. Diff whitespace checked. Next: repaste the updated Script Include and verify the cart dropdown in the instance. Live task status remains in the shared VTB.

# Direct ordering simplified page guide - November 9, 2026

User restated the direct Vendor/Menu journey with pickup selected at checkout and one Order plus Order Lines. Added a [short setup guide](docs/servicenow/widgets/cafenow-direct-ordering/QUICK-START.md) linked from the package README, covering page instance views, table references and the existing installation sequence. Clarified that the supplied export uses cafe_menu, while the request calls it cafenow_menu; no page rename or source behavior change was made. Based on the retained direct Menu export review; original exports and catalog packages preserved.

Checks: local guide links and field/page mapping reviewed against the existing package and export review; UTF-8 and diff whitespace checked. Documentation only; no live instance changes, deployment or end-to-end verification. Next: install the existing direct package in development using the full setup prerequisites, then verify browsing through ORD/Lines creation. Live task status remains on the shared VTB.

# Direct ordering export review and source preparation - November 9, 2026

Reviewed the user-supplied [new application XML](exports/sys_remote_update_set_4cb09e8854e813107f44ff1829e40dc0.xml) as configuration data; preserved originals. [Export review](docs/planning/DIRECT-MENU-EXPORT-REVIEW-2026-11-09.md) confirms Order Line refs/line_price/no Instructions; active cafenow_vendor (singular), cafe_menu/cart/home/orders/details/FAQs placement; current owned Header; active Menu import and inactive exported Order flows. Flagged broad exported Order read grants, admin-only Line read, duplicate vendo0 state-write reference and missing pickup date/technical fields. These are static observations, not live security-test results.

Prepared [direct ordering individual configuration items](docs/servicenow/widgets/cafenow-direct-ordering/README.md): same-scope service, reusable widget views (vendors/menu/sidebar/cart/orders/details), header derivatives, ACL predicates, booking/cancellation rules, and manifest proposing six fields on existing Order with two unique indexes. No additional technical tables and no REQ/RITM creation through this service. Incomplete Orders remain hidden; failed submissions use cleanup and retained holds when cleanup fails. Existing vendor/home open-order scripts now filter technical completion status when present. User asked packaging: these are manual installation items to capture in a development update set, not generated importable XML. Submission defaults disabled.

Checks: 52 mocked direct service/client checks passed, including no sc_* business queries, pricing/availability/terms, cutoff/DST, capacity, token response-loss recovery, cleanup and Order/Line authorization. Vendor queue's 32 mocked checks and existing employee open-order regression checks passed. Header/source/JSON syntax, local documentation links, template balance and UTF-8 checked; git diff --check passed. No live APIs/defaults/currency/time data, actual ACLs, inherited Task side effects, last-seat database concurrency or browser rendering verified. Next: install review-mode service/widget, configure actual time/terms/location, then add/index/protect Order metadata and reconcile legacy dates/bookings before controlled end-to-end cutover. Existing D01-D04/S01-S04/U01-U03/V02-V03/B01-B04/T02-T04/T07/T09 retain VTB evidence.

# Direct Vendor/Menu portal migration requested - November 9, 2026

User requests all relevant /cafe ordering pages use existing Vendor/Menu records instead of Catalog Items, and reports Order Line created except Instructions. Screenshot confirms item_name, line_price, menu_item, number, order, quantity and unit_price. Prepared [page/component migration map](docs/planning/DIRECT-MENU-PORTAL-MIGRATION.md); recorded new direction in decisions/project/README and marked the earlier catalog-checkout package as superseded for new ordering work. Preserve existing Task-based Order, legacy records and source packages; no new technical tables are preselected for direct ordering.

The only local export predates current pages and Order Line. Current table references, header embeds, widget placements, active flows and ACLs must be inspected in a fresh application export before source replacements can be completed. User asked how to export; official application-to-update-set/XML guidance was checked. No live instance, page/script changes, deployment or data migration performed. Checks limited to documentation consistency/links/UTF-8 and diff whitespace. Next: receive current CafeNow application/update-set XML, resolve active inventory, then build direct Vendor/Menu/cart/ORD-Line replacements and test. Existing D01-D04/S01-S04/U01-U03/V02-V03/B01-B04/T02-T04/T07/T09 own live VTB evidence.

# Menu numbering split-scope helper - November 9, 2026

User screenshot confirms Global-to-x_1234_cafenow_menu write refusal (updated=0, skipped=0, failed=1) after the earlier Global-private NumberManager error from CafeNow. Prepared new Global CafeNowMenuNumberGenerator Script Include: admin-only, non-client-callable, fixed Menu table, returns next number only. Backfill now runs in CafeNow scope, invokes that helper and writes Menu in its owning scope. No base Script Include or table cross-scope protections are changed. Updated setup guide; previous single-scope maintenance guidance is superseded. A number may have been allocated before the denied write; do not reset the sequence.

Checks: 12 mocked backfill/helper checks passed and both scripts parsed; git diff --check passed. No real helper installation, execution privilege, scoped update or successful live backfill verified. Next: create the custom helper in Global (Accessible from all scopes, Client callable false), run updated dry run in CafeNow, then reviewed apply. D02/V01/I01/S04 evidence remains on VTB.

# Menu numbering Global-scope correction - November 9, 2026

User screenshot shows live NumberManager package-private access failure from CafeNow scope. Corrected the earlier scope instruction: updated backfill now runs in Scripts - Background with Global scope and uses new NumberManager(TABLE), still explicitly targeting x_1234_cafenow_menu.number. Updated setup notes and removed the unsupported CafeNow-scoped NumberManager dictionary-default suggestion. Do not change the base Script Include accessibility. The constructor precedes this script's update loop; no successful numbering is inferred from the error.

Checks: 10 mocked backfill checks passed with the Global constructor; syntax/diff whitespace checked. No live rerun, Global-to-scoped table access or new-record default behavior verified. Next: run updated dry run in Global, then reviewed apply; investigate any distinct scoped-table/default error separately. D02/V01/I01/S04 evidence remains on VTB.

# Menu Item Number preparation - November 9, 2026

User reports creating MENU numbering via Number Maintenance and relabeling Number to Item Number on the Menu form. Screenshot contains separate number and item_number columns. Prepared [numbering setup/backfill](docs/servicenow/menu-numbering/README.md), targeting exported Menu table x_1234_cafenow_menu and number (not the older item_number or sample u_number). Script defaults to a counter-preserving dry run, validates MENU configuration, fills blanks only, preserves existing values and stops on collisions/failures. Existing form/table technical names and defaults still require instance verification. Normal updates can trigger the existing Menu import automation.

Checks: node docs/servicenow/menu-numbering/verify.cjs passed 10 mocked backfill checks; script parsed and git diff --check passed. No live script, records, numbering counter, form layout or automation effects were executed/verified. Next: confirm dictionary number/default, preview blank count, then run one reviewed maintenance backfill and verify new/existing Menu records. D02/V01/I01/S04 evidence remains on VTB.

# Custom catalog cart and pickup checkout - November 9, 2026

Created [CafeNow Cart Checkout package and installation guide](docs/servicenow/widgets/cafenow-cart-checkout/README.md) at the user's request. Own widget replaces the failing full-cart clone while retaining the native DEFAULT cart, food Catalog Items, Menu/Vendor mapping, Request/RITMs and authoritative Order. It derives vendor, loads vendor-specific active Pickup Windows by label/sys_id, collects pickup and terms once, and submits through CartJS. User confirmed America/New_York. No per-food hidden transport variables are required in this implementation.

Prepared a same-scope service, two proposed technical-table schemas (Checkout context and capacity reservation), required unique indexes, properties, Order date/context additions, Flow action, Order insert guard, cancellation release, booked-window protection and explicit-list legacy migration. These are local implementation choices and setup artifacts, not installed tables, approved instructor requirements or another authoritative fulfillment table. Submission defaults disabled until storage/terms/flow/legacy capacity setup is verified. Existing clones and original exports are preserved.

Checks: `node docs/servicenow/widgets/cafenow-cart-checkout/verify.cjs` passed 75 mocked service/flow/client checks; eight scripts and both JSON files parsed. Diff whitespace, local Markdown links, template tag balance and UTF-8 were checked. No browser rendering, real ServiceNow APIs/ACLs/cross-scope calls, actual unique indexes or simultaneous database bookings were verified. Native cart edits through other endpoints can race final submission; the action verifies RITM vendor/quantity totals and holds mismatches for review. Unknown native submission outcomes retain holds and need reconciliation. Time-field encoding must be verified against a known New York window before use; the explicit Eastern clock is limited to 2007-2030 daytime same-day windows.

Next: follow the staged guide, first configure catalog/time properties and preview the new widget on cafenow_cart with submission disabled; then create/verify technical storage and Flow/guards, reconcile existing dates/bookings, and run employee end-to-end/security/concurrency checks before enabling. Live C02/C03/U02/B01/B02/D04/S04/T02/T03/T07/T09 evidence remains on the shared VTB.

# Vendor membership lookup repair - November 9, 2026

User reported Pizza Hut Admin membership/vendor Admin role, live membership-denial message and Pizza Hut open orders in a list. Updated vendor widget authorization metadata to fixed read-only server GlideRecord lookups for current-user membership, group hierarchy and Vendor mapping, avoiding dependence on administrative metadata read ACLs. Orders remain GlideRecordSecure with per-row vendor/state/field checks. Added distinct missing-group and missing-vendor mapping messages. No table ACLs or live instance changed; actual cause remains unverified.

Checks: vendor verification passed 30 mocked checks, including hidden administrative-metadata regression, exact group-reference matching, role/vendor isolation, business Order ACLs and constructor checks that Orders use secure queries. Client/schema parsed; diff whitespace checked. Next: repaste vendor Server Script, refresh impersonated account and verify Admin.Parent matches Vendor.vendor_group by sys_id if the new mapping error persists. V02/S04/T04/T07/T09 evidence stays on the shared VTB.

# Vendor queue automatic authorization - November 9, 2026

Updated [CafeNow Vendor Open Orders](docs/servicenow/widgets/cafenow-vendor-orders/README.md) to resolve vendors automatically from the current user's exact vendor Admin/Staff roles and secure direct membership/immediate-parent mapping to Vendor.vendor_group. Removed fixed vendor option; old options/browser vendor values are ignored. Queries authorized vendor IDs only and rechecks vendor/state/field access; multi-vendor users get separate vendor/window buckets. User-reported Order.time_slot_v2 is preferred when available, with older exported pickup_window fallback. HTML includes vendor headings; client/CSS unchanged.

Checks: `node docs/servicenow/widgets/cafenow-vendor-orders/verify.cjs` passed 31 mocked server checks; client/schema parsed. `git diff --check` passed. No deployment, live ACL, cross-scope or rendered verification. Next: paste Server Script/HTML/schema, verify role/dictionary names and least-privilege membership/group reads, then impersonate each vendor's Staff/Admin and test cross-vendor/direct-record denial. All dates still included; no transitions or facility-admin overview implemented. Evidence belongs on V02/S04/T04/T07/T09 in the shared VTB.

# Full-cart choice accessor follow-up - November 8, 2026

User preview exposed missing ScopedChoiceList.get after size repair. Updated full-cart derivative to prefer getChoice(i), retaining get(i) only when available. Executed actual quantity-block mocks with numeric size/getChoice and callable size/get; both produced expected choices, and complete server parsed. This extends the prior size-only verification, which did not exercise the accessor. Live scoped accessor/choice objects and rendering remain unverified. Next: repaste full Server Script and preview. Existing inherited mutation/security limitations remain documented.

# Full-cart clone preview repair - November 8, 2026

Prepared complete [full-cart clone scripts](docs/servicenow/widgets/cafenow-full-shopping-cart/README.md) from supplied attachments after screenshot showed ScopedChoiceList.size numeric/function mismatch. Corrected size handling, missing client $rootScope, jQuery size calls, native scope typo and cart-page routing. Scripts parsed; numeric/callable size checks and git diff --check passed. Live rendering, APIs and checkout unverified. This is a preview repair: inherited quantity authorization and undefined save_cart cart reference remain unresolved, documented in README. Next: verify preview, inspect checkout source and harden inherited mutations before delivery. No instance changes or task completion claimed.

# Sidebar full-cart navigation - November 8, 2026

Updated CafeNow Shopping Cart sidebar server cart_url to `?id=cafenow_cart` following the user's cloned-page screenshot and report that Review cart and checkout still opens sc_cart. Updated setup notes. Ran the sidebar verification: 34 mocked checks passed; git diff --check passed. Live paste/navigation and full checkout remain unverified. Next: update the sidebar Server Script in the instance and verify the employee link opens the CafeNow full cart; checkout integration still awaits checkout source.

# Vendor open-orders starter - November 8, 2026

Prepared [CafeNow Vendor Open Orders](docs/servicenow/widgets/cafenow-vendor-orders/README.md) for the user's CafeNow Vendors page in `/cafe`. Read-only authoritative orders in states -5/1/2 grouped by pickup-window identity, with Refresh, counts and a 200-row bound. Trusted instance option selects one vendor; exported Vendor.vendor_group plus immediate child-group membership gates access before the secure order query. User confirmed parent group with vendor Admin/Staff children. Page ID and current dictionary/permissions require live verification. All dates are included explicitly; daily bucketing awaits a verified Order date field. No actions, deployment or live behavior claimed.

Checks: ran `node docs/servicenow/widgets/cafenow-vendor-orders/verify.cjs`: nine mocked server checks passed; client and schema parsed. `git diff --check` passed. Rendering, real ACLs, child-group reads and cross-scope access remain unverified. Next: install non-public widget, configure vendor sys_id and test A/B Staff/Admin isolation, grouping and refresh. V02/S04/T04/T07/T09 evidence belongs on the shared VTB.

# Status as of November 7, 2026

## Standalone CafeNow Shopping Cart - November 7, 2026

User requested an own widget similar to SC Shopping Cart after cloning problems. Replaced current [cart components](docs/servicenow/widgets/cafenow-shopping-cart/README.md) with independent HTML/CSS/client/server using the same native default cart; preserved earlier local clone derivatives in clone-reference and original attachments/exports. Includes item/unit count, quantities, Update, Remove confirmation, empty/error states and quick-add refresh. No cartTemplate, choice-list API or cloned UI helper is required. Quantity uses CartJS with ownership/ACL checks and readback; removal uses secure record deletion with ownership/delete checks. Full-cart link goes to sc_cart; prices/subtotal and checkout/pickup submission are not implemented by this sidebar.

Checks: executed `node docs/servicenow/widgets/cafenow-shopping-cart/verify.cjs`; 34 mocked server/client checks passed for ownership/permissions, validation/mutations, queued event refresh, duplicate clicks, confirmation and cleanup. Scripts parsed; no live or rendered browser test, cross-scope/API validation or native deletion comparison performed. Next action: create a NEW non-public CafeNow widget, paste all four components, add one instance, verify native quick add/cart operations and full-cart navigation as an employee. C02/U02/S04/T07/T09 retain live evidence on the VTB. Earlier clone notes below are historical.

## CafeNow Shopping Cart repair preparation - November 7, 2026

Prepared [Shopping Cart derivative components](docs/servicenow/widgets/cafenow-shopping-cart/README.md) from the user-pasted scripts/HTML. Accepts numeric/callable choice-list size, injects missing client $rootScope, corrects jQuery size uses/native scope typo, binds the native default cart and validates quantity writes against current-cart membership and record/field permissions before CartJS updateItem. Broken legacy save_cart branch now rejects explicitly; inherited save-bundle modal is not verified. Original attachments unchanged. Checkout remains sc-checkout; pickup/one-vendor final validation is not implemented here.

Checks: executed `node docs/servicenow/widgets/cafenow-shopping-cart/verify.cjs`; mocked rendering setup, choice-size regression and quantity/security cases passed; both scripts parsed. No live rendering, cartTemplate/dependency presence, API/cross-scope access, save-bundle or checkout execution verified. Next action: paste scripts into CafeNow Shopping Cart, retain templates/dependencies/options and original cartTemplate value, then test initial cart load and employee operations. Follow-up remains on C02/U02/S04/T07/T09 in the shared VTB.

## CafeNow Categories rendering repair - November 7, 2026

Prepared [CafeNow Categories replacement scripts/template](docs/servicenow/widgets/cafenow-categories/README.md) from the user's attached server/client scripts and pasted HTML, focusing on Categories as requested. Corrected unavailable JSUtil usage, short-result loop overrun and malformed repeated-list tag. Added numeric pagination handling, explicit catalog IN query, initialized early-return lists, empty-state message and Cafe Menu default routing. Preserved original attachments, exports, cloned dependencies/options and item/category visibility logic; no Shopping Cart fix is included.

Checks: executed `node docs/servicenow/widgets/cafenow-categories/verify.cjs`; mocked empty/short/full/paged results, numeric limits, inaccessible catalog rejection and original-defect regression checks passed; scripts parsed and corrected tag checked. No live installation, Angular rendering, actual API compatibility or employee permissions verified. Next action: paste three components into CafeNow Categories, preserve CSS/dependencies/schema, set Page to Cafe Menu and test as an employee. If empty, inspect portal catalog and visible item membership. C01/U02/T07/T09 retain live evidence/status on the VTB.

## My Open Orders display limit and navigation - November 7, 2026

Added a server-bounded `max_orders` instance option (default 5, maximum 50), View all orders to `cafenow_my_orders`, and order-number links to exported `cafenow_order_details` using fixed table and record parameters. Updated setup/ACL checks and mocked verification; limit bounds, ignored browser limit and generated destinations passed along with prior server checks. Diff whitespace checked. Destination rendering, live instance configuration and direct-record authorization remain unverified. Next action: paste updated Server Script/HTML/Option schema, configure home instance limit, and test both destinations plus cross-user denial. Earlier preparation notes describe the original version.

## My Open Orders widget preparation - November 7, 2026

Prepared [CafeNow My Open Orders](docs/servicenow/widgets/cafenow-my-open-orders/README.md) for replacing the home-page My Requests instance with a CafeNow-owned widget. Lists authoritative Order records in Submitted/Confirmed/Ready for Pickup, scoped to the current user with GlideRecordSecure and field-read checks. Includes Refresh, empty/error/guest handling and a 20-record bound. Ownership defaults to Opened by; verify the actual recipient field and on-behalf behavior before installation. No global widget was modified. No state-changing actions or unverified detail-page links were added.

Checks: executed `node docs/servicenow/widgets/cafenow-my-open-orders/verify.cjs`; mocked ownership, state, ACL, guest, configuration/error and limit checks passed; client syntax parsed. Checked diff whitespace. No live deployment, ACL verification or rendered browser test was performed. Next action: verify table/owner field, install components in a non-public CafeNow widget, replace the home-page instance and test as two employees plus a guest. U03/S04/T07/T09 retain live status/evidence on the shared VTB.

## Category-widget preview error fix - November 6, 2026

User screenshot reports `GlideStringUtil.nil` missing at server line 232. Corrected the inherited call to documented scoped `gs.nil` in the [prepared Server Script](docs/servicenow/widgets/cafenow-category-items/server.js); retained documented `isEligibleSysID`. Added selected-category/Popular Items V2 rendering regression coverage and a check that reintroducing the old call reproduces failure. Executed the local Node verification: 34 mocked checks passed. Updated the patch/install notes and checked diff whitespace/UTF-8. This fixes local source; instance deployment/resolution and other inherited helpers remain unverified. Next action: replace the one call or repaste Server Script in the CafeNow widget and verify preview/category navigation, then test quick add with an employee. No instance records changed here.

## Category-card quick-add preparation - November 6, 2026

Prepared [CafeNow Category Items replacement components](docs/servicenow/widgets/cafenow-category-items/README.md) from the three user-pasted SC Category Page files. Adds quantity/Add to Cart in card and table views, a native-default-cart server action, trusted Menu/Vendor resolution, accessible catalog/item checks, required-variable guards and native refresh events. Retains category/detail behavior and rejects ordinary mixed-vendor additions without clearing the cart. No final-checkout pickup functionality, atomic multi-session vendor lock or capacity reservation is claimed. Required unanswered food/checkout questions block quick add; consent is not defaulted as accepted. No original export/attachment was modified.

Checks: executed `node docs/servicenow/widgets/cafenow-category-items/verify-quick-add.cjs`; 31 local contract checks passed with mocked ServiceNow APIs, including server guards and client double-click/refresh behavior; parsed both complete scripts. Checked HTML controls/IDs, local links, UTF-8 and diff whitespace. These are local checks, not ServiceNow instance execution or rendered layout verification. Next action: copy the three complete components into CafeNow `cafenow_category_items`, preserve its CSS/dependencies/options, replace the page instance, and test with an employee and a simple mapped food. Verify cross-scope access, mandatory-variable placement, native default-cart refresh and final-checkout revalidation before accepting the journey. C02/U02/B01/T02/T07/T09 retain live ownership/evidence on the shared VTB.

## Checkout implementation preparation - November 6, 2026

Prepared a [Catalog Item caller Server Script and two-line routing patch](docs/servicenow/widgets/cafenow-catalog-item/README.md) from the user-pasted source. Only the two embedded checkout IDs change to the proposed `cafenow-checkout`; actual clone ID/scope/dependencies still need verification. Proposed transport reuses one hidden/non-mandatory food-level `pickup_window` storage variable, populated consistently for all relevant cart items by the one checkout selector before submission through CartJS. This is a proposed integration, not verified implementation or a capacity reservation. Checkout copy source and active multi-item cart caller are still missing. No live changes or runtime tests performed; checked exact replacement/readback and diff whitespace. Next action: inspect those widget sources, implement the actual submit hook and test one-answer/multiple-food/one-Order behavior plus failure recovery on the VTB.

## Catalog page routing request - November 6, 2026

User screenshots show CafeNow `cafe_menu` category links navigating to shared `sc_category`. Recorded a targeted configuration plan in the [portal widget review](docs/planning/PORTAL-WIDGET-REVIEW-2026-11-06.md): use one CafeNow-owned catalog/category page, set SC Categories' instance Page option to that page, restrict the catalog context, and align portal/menu entry points. A redirect-map cause is not established. Existing data/import mappings remain usable. Next action: inspect current `cafe_menu` widget identities/options and page Application, apply the page-specific settings, and test category/item/cart navigation in the instance. No live access, configuration or runtime tests performed; documentation UTF-8 readback and diff whitespace checked. Follow-up stays on C01/U02/P03 and relevant VTB test cards.

## Portal widget reference audit - November 6, 2026

Reviewed retained portal/theme/layout/widget references, excluded deleted layout records, and inspected embedded calls in the three user-pasted Catalog Item components. Added the [portal widget review](docs/planning/PORTAL-WIDGET-REVIEW-2026-11-06.md). CafeNow owns exported portal/theme/instances and five custom widget definitions. Main Menu still references Header Menu (Global confirmed in original clone snapshot); its Cafe Header copy is not referenced by a current exported instance. Theme points to Employee Center Header. Current exported home/list/form instances reference shared widget definitions whose Application values are not included. Pasted Catalog Item Server Script embeds `sc-checkout` at lines 80/128; the multi-item cart caller and newly created copies are absent. References to shared widgets do not require copying every widget.

Live verification could not proceed: Computer Use reported missing native pipe and browser inventory reported browser access host unavailable. No live record read/write or configuration change is claimed. Next action: verify current widget Application values, active theme/header/menu path and actual food/cart page instances; export the new copies and cart caller before implementing the single checkout pickup selector. Checked UTF-8, local links, source XML preservation and diff whitespace; no application tests performed. Existing VTB tasks retain owners/status.

## Ordering simplification review - November 6, 2026

Reviewed all eight existing planning Markdown files, README/PROJECT/DECISIONS/BACKLOG/STATUS, relevant proposal sections, retained variables CSV and application XML, including decoded Menu import inputs and the published Order-flow snapshot. Added the [ordering review](docs/planning/ORDERING-REVIEW-2026-11-06.md) and aligned current planning around the user's one-vendor cart and one pickup selection at checkout. Corrected earlier assistant assumptions: the export already contains `u_cafenow_menu_item` mappings and Menu import variable-set associations; one Create Order is already outside item loops. Vendor/Pickup Window create inputs are blank. Identified separate custom session-storage/native-cart paths and redundant pickup/meal/vendor/quantity inputs. The export predates later screenshots; no current live configuration or runtime behavior is established.

Recommendation: preserve existing tables/catalog/Menu mapping/Order pickup reference and inspect the actual native cart/checkout extension for one pickup selector plus validated handoff to the existing flow. No hidden helper, new table, field migration, deletion or live configuration was performed. Next action: establish the actual CafeNow catalog cart/checkout widgets and persist one checkout window selection; correct existing flow inputs and verify complete-checkout/retry handling, same-vendor validation and daily capacity. Checks: source preservation hashes, UTF-8 readback, local Markdown links, stable IDs and diff whitespace; no application test executed. Owners/evidence remain on the shared VTB.

## Application export inspection - November 6, 2026

Read the user-supplied exports/sys_remote_update_set_cf1b4f8f6ddc13107f4484f0f2a4c618.xml without modifying it. Export dictionary shows Pickup Window table x_1234_cafenow_pickup_window with vendor reference, is_active boolean, start_time/end_time of type glide_time, time_slot_v2 String, and slot_label referencing Operations. Exported shared pickup_window lookup variable targets Operations, not vendor-specific Pickup Window records; a separate item-level variable has the same name. These are export observations, not live verification. Next action: select one pickup variable, point its lookup at Pickup Window, use sys_id values and a populated time label, then establish trusted item-to-vendor mapping for filtering. No instance changes or runtime tests performed.

## Order-process follow-up - November 6, 2026

Recorded requested vendor-only browsing after item selection, removal of the redundant Vendor variable/variable set using the reported category/vendor association, and pickup-window timing work in DECISIONS.md and the detailed task guide. Exact pickup times/duration, schedules, timezone and cart-reset behavior remain to be confirmed. Shared pickup/terms inputs and server-side vendor/window validation remain required. No live configuration or tests performed. Next action: confirm the actual item/category/vendor mapping and pickup schedule, then implement and test through existing C01-C03/U01-U02/B01/D04/T02-T03 cards on the shared VTB.

## Ordering, variables and import planning - November 5, 2026

Consolidated user intent and proposed cart/RITM-to-CafeNow-Order design in DECISIONS.md, PROJECT.md, requirements, planning review and the detailed task/component guide. Recorded shared variables, quantity control options, field screenshots/reported references, coordinated single-order creation, same-day capacity, and bounded Excel-to-Vendor/Menu/Catalog import. Orders/Menus/Vendors are user-confirmed navigation separators; suggested additional modules are My Vendor Menu, My Vendor Pickup Windows and role-restricted reports, reusing Vendor Orders for window grouping where suitable. No added module is claimed created.

Checks: UTF-8 readback, Markdown local file links and diff whitespace; retained proposal/assets unchanged. No live instance, flow, import or application test performed. Next action: inspect workbook and exact dictionary fields; prove complete-checkout coordination and one-order grouping in a small cart trial, then configure associations/import mappings and execute access/capacity/retry checks. Live owners and status remain on the shared VTB.

## Table and field ACL configuration - November 4, 2026

User reports completing table-level and field-level ACL configuration for CafeNow. This records reported configuration completion, not verified access enforcement or completion of S03/S04 acceptance checks. Exact rules, inherited/matching ACLs, vendor-group population/protection and catalog-to-order ownership mapping have not been inspected here.

Next action: execute allowed/denied record and field access checks with the [vendor test personas](docs/planning/VENDOR-ACL-TESTING.md), plus separate employee and facility-admin identities. Verify own-order and cross-vendor isolation, protected ownership/vendor/group/price/capacity fields, direct record access and reports. Confirm valid State transitions and cancellation rules server-side. Record results and evidence on the shared MVP VTB. Documentation checked by UTF-8 readback and diff whitespace; no live instance changes or tests performed.

## Vendor ACL test personas - November 4, 2026

Recorded the user's test account mapping: Vendor A employee Abel Tutor and admin Abe Lincoln; Vendor B employee Beth and admin Joe. Added the [vendor ACL testing reference](docs/planning/VENDOR-ACL-TESTING.md) with expected same-vendor allow/cross-vendor deny checks. User reports vendor role/group configuration and group assignment to test Vendor A/B records; effective memberships and ACL enforcement have not been inspected here. No test pass is claimed. Next action: impersonate all four accounts and record actual State write results/evidence on the shared VTB. Documentation checked by UTF-8 readback and diff whitespace; no instance changes or tests performed.

## Team progress summary - November 3, 2026

Recorded November 4 from the user's report and existing project notes. CafeNow by NowServing Solutions progressed in the following areas:

- **Service Portal (`/cafe`):** Worked on the employee/user view, including a "Place Your Order Now" action that directs users to vendors.
- **User stories and table ACLs:** Worked on role-based user stories and access controls for the application tables. Story approval, ACL completeness and enforcement have not been verified here.
- **Navigation modules:** Created All - Orders, My Orders, Place New Order, All - Vendors and All - Menu, as previously reported.
- **Tables and form configuration:** Created Order, Menu, Pickup Window and Vendor tables, as previously reported, and worked on table form configuration. Exact form layouts and fields have not been inspected here.
- **Order states:** Recorded Submitted = -5, Confirmed = 1, Ready for Pickup = 2, Closed Complete = 3 and Canceled = 4. This records the chosen mapping; transition behavior has not been tested here.

These are user-reported configuration activities and recorded decisions, not verified completion of acceptance criteria. Next action: review portal routing and form layouts, test module destinations and visibility, and verify employee ownership/vendor boundaries through record and field ACL tests. Record actual results and evidence on the shared MVP VTB. Documentation checked by UTF-8 readback and diff whitespace; no live instance configuration or application tests performed.

## Table creation - November 3, 2026

User reports creating four CafeNow tables: Order, Menu, Pickup Window and Vendor. This supersedes the earlier report that table creation had only begun. Exact current dictionary definitions, relationships, mandatory fields, inherited behavior and ACLs have not been live-inspected here. Order Line creation is not reported by this update. This is progress toward D02-D04, not completion of their acceptance checks or approval of catalog/order architecture. Next action: review the four dictionaries and relationships against D01/S01, confirm the order-line model and test access with the intended personas. Documentation checked by UTF-8 readback and diff whitespace; no instance configuration or tests performed.

## Application navigation modules - November 3, 2026

User reports creating five CafeNow navigation modules: All - Orders, My Orders, Place New Order, All - Vendors and All - Menu. Earlier screenshots show these module records under the CafeNow application menu. This is configuration progress toward the navigation work identified through P03/S01/U01; it does not establish task completion. Role-specific visibility, My Orders ownership filtering, the Place New Order catalog destination and underlying record/field ACL behavior have not been live-tested here. Next action: test each entry with the intended personas, verify destinations and own-order/vendor boundaries, and record evidence on the shared VTB. Documentation checked for UTF-8 readback and diff whitespace; no instance changes or tests performed.

## Food Order State mapping - November 3, 2026

Recorded the user's chosen State labels/values in DECISIONS.md and the detailed table-design guide: Submitted = -5; Confirmed = 1; Ready for Pickup = 2; Closed Complete = 3; Canceled = 4. Confirmed replaces Preparing in the current lifecycle; older examples are superseded by this record. Checked saved UTF-8 text and diff whitespace. No instance changes or tests performed. Next action: verify actual table choices/default and inherited active/terminal behavior before configuring transitions, ACL actions or flows.

## Today's team to-do - November 3, 2026

Menu-source update: user reports a team member created an Excel sheet with five vendors and various menu items. Added spreadsheet review, Catalog Item import investigation, catalog/vendor grouping clarification, source/target mappings and bounded trial/reconciliation tasks to today's to-do. One building catalog with vendor categories is a review option; separate vendor catalogs and the final hierarchy remain to be agreed. Workbook contents, instance capabilities and import execution have not been verified. Next action: assign the workbook review/import investigation and settle structure/order mapping before bulk import.

Created the [November 3 to-do document](docs/planning/TODO-2026-11-03.md) at the user's request. It lists group workstreams for tables, five-role user stories, application-module needs, access planning, ACL configuration when prerequisites are met, and security testing. Includes story/module checklists and end-of-day review, linked to existing tasks rather than creating another status board. This is a task list, not completed stories or approved access rules. Checked local links, UTF-8 text and diff whitespace. No instance configuration or tests performed. Next action: team assigns owners in the VTB and reviews the model and access matrix before ACL configuration.

## Studio setup and model progress - November 2, 2026

November 3 documentation update: incorporated the user's clarification of November 2 progress, including the five role labels, table creation begun, and interface sketches. Checked the saved UTF-8 text and diff whitespace; no live instance verification performed. Next action: inspect the dictionary and permissions, and review the sketches with the team.

User reports creating the CafeNow application in ServiceNow Studio and creating five roles with associated groups for user, sys admin, vendor, vendor admin and facility admin. These are reported persona labels; exact role/group identifiers, application scope, assignments and ACL behavior have not been inspected. This is progress toward P03/S02, not completion of architecture or security acceptance checks.

Menu-item import into Catalog Items for Service Portal is planned, not executed or verified. Tables and fields are being finalized under the reported names `u_cafeteria_vendor`, `u_cafeteria_order` and `u_order_line_item`; the user reports table creation has begun; completed tables and final dictionary approval are not claimed. User confirmed the vendor table name as `u_cafeteria_vendor`. The authoritative order model and catalog-to-order mapping remain open.

Next action: review the actual application scope and dictionary, map role/group identifiers to S01 permissions and vendor membership, and settle how catalog submissions produce one vendor order with lines before importing. Include vendor/window capacity and server-side validation in the design; record live owners/evidence in the VTB. Documentation checked locally; no instance access, import, ACL or application test performed.

## Team decisions — November 2, 2026

Portal planning: the user clarified that initial ideas were sketched for two Service Portal views (user and vendor) and an admin workspace. Earlier responsibility sketches remain planning input in the detailed guide; they do not establish four separate interfaces. Registration approvals, complaints, nutrition/cart details and financial scope remain for review; no new portal or workspace implementation is claimed. Next action: select MVP capabilities and verify interface feasibility/permissions through P01/P03/S01. Checked document links, UTF-8 text and diff whitespace; retained proposals/assets unchanged.

Latest user clarification: team access is reported established. Vendor service portal must group Submitted orders by pickup window and support individual/batch confirmation. Capacity is 20 orders per vendor/window. No-show notices have 30-minute intervals; final disposal warning is one hour before vendor closing. Pickup-window duration, initial notice trigger, scheduling conflicts, actual disposal timing and cancellation-state interaction remain open. Updated decision record, brief, requirements, task guide and daily note; no live application verification claimed. Next action: resolve policy edges and validate the model before configuration.

Table-planning update: incorporated the requested reuse/create/extend recommendations, field types, relationship diagram, integrity rules and catalog mapping investigation into the detailed task guide. Linked the review from DECISIONS.md; aligned D05's full-MVP seed scope to five vendors while retaining the two-vendor intermediate slice. Checked Markdown whitespace, local link/anchor targets and UTF-8 punctuation; task IDs and dependencies retained. Architecture approval and live instance verification remain pending. Next action: review P03/D01/S01 choices with the team before table creation.

Recorded the user's team decisions in DECISIONS.md and aligned the project brief and requirements refinements: five vendors, vendor confirmation and fulfillment control, employee cancellation only, vendor catalog offerings, all-vendor admin view, three no-show notices and ServiceNow Studio. User clarified: vendor confirmation follows employee submission; ordering closes 30 minutes before pickup-window start; cancellation closes 20 minutes before pickup-window start, disclosed in terms and conditions before submission; EOB means end of business. Exact lifecycle labels, cutoff boundary inclusivity/cancellation-state interaction, capacity reservation/release, business closing time/no-show outcome, scoped application and vendor table design remain unresolved. Team members have access, as reported by the user; live access checks, instructor approval and implementation remain unverified. Next action: resolve these questions in P01–P03/S01/D01 and define acceptance examples/user stories before configuration. Documentation checked for consistency with the reported choices; retained proposals and PDF were not changed.

## Repository preparation - November 2, 2026

User requested a public GitHub repository named `cafenow`. Prepared a local Git repository on `main`, with temporary files, diagnostic logs, credentials and machine-specific configuration excluded. Original planning documents and the team PDF are included. A scan found no matching common token/private-key or credential-assignment patterns in candidate text files; this is not a comprehensive security audit. GitHub creation and push remain pending authentication: no existing GitHub credential was available, and the GitHub plugin was not installed/connected. Next action: establish GitHub access, create the public repository and push, then verify the remote contents.

## Current evidence

November 2 daily planning: created the [daily PM note](docs/planning/DAILY-PM-NOTE-2026-11-02.md) using the playbook template. User priorities are group member accounts and finalizing MVP requirements/checklists. Account creation and requirements approval remain unverified; next action is to confirm access inputs and review scope/class obligations with the appropriate decision authority. Checked the note against all eight template fields and local link targets.

- CafeNow and NowServing Solutions naming is confirmed.
- User reports P01–P03 created on the shared ServiceNow VTB. Screenshots show a P01 card, but also showed P03 content under its title; correction was advised and has not been verified.
- Paste-ready foundation cards D01, S01, U01, T01 and X01 were provided in chat. Their creation and completion are not confirmed.
- Planning documents contain R01–R10, 47 task definitions, component examples, BP01–BP10 and a proposed November 2–6 work plan.
- No CafeNow application configuration exports, executed acceptance-test evidence or live Codex-to-ServiceNow connection has been established here. A planning board is not evidence of application completion.

## Latest documentation work

November 1 proposal revision: at the user's explicit request, updated the detailed Markdown proposal with CafeNow / NowServing Solutions naming, candidate R01–R10, BP01–BP10 and component/task mappings, clarified MVP versus future scope, and the weekend's VTB/first-week planning. Recorded P01–P03 as user-reported board cards, not completed work. Verified local links/anchors, UTF-8 punctuation and requirement/process/task references; other proposal files remained unchanged by SHA-256 comparison. Word proposals and exports are not synchronized with the revised Markdown.

November 1 encoding repair: restored 115 corrupted dashes/arrows across the 11 working Markdown files after PowerShell script transport had replaced them with question marks. Reviewed remaining question marks as genuine punctuation or URL syntax; preserved the proposal directory. Added explicit encoding guidance to AGENTS.md.

November 1: consolidated all 11 working Markdown files around one MVP VTB, stable task IDs, consistent lanes/labels, first-week selection and a reading/presentation order. Removed stale comparison/backlog references and duplicated checklist explanations. Preserved component examples and candidate requirements. Scope/architecture approvals remain pending.

Verification: local links/anchors, task/requirement/process/work-package IDs, task dependencies and document consistency checked. Proposal-directory, original image and log hashes compared with the pre-edit baseline. No live instance or application test execution is claimed.

## Next actions

1. Review P01–P03 cards for matching titles/body/references; confirm owners, reviewers and dates in the VTB.
2. Complete P01, then resolve P02/P03 together. Record approved choices in DECISIONS.md.
3. Add the five foundation cards to Backlog if not already present; move to Ready only when their prerequisites and owners/reviewers are established.
4. Select Week 1 work using actual capacity and begin the reviewed design/configuration sequence.

The proposed first week is November 2–6, 2026, America/New_York. Final submission date and team schedule are not confirmed.

## Shared locations and access

- MVP VTB URL: not supplied in project files.
- Team-accessible document/evidence location: not supplied.
- Instance release, modules and integration access: pending P03.
- Codex connection: REST/MCP/browser approaches discussed; no connection configured or tested in this workspace. Any connection work needs a defined instance, supported access and credential handling outside project files.

## History

October 31: proposals/assets reviewed and organized; original relocations verified by SHA-256; core working documents created. November 1: planning/task/component guidance and VTB card examples developed, then consolidated. Detailed live task history belongs in the VTB.
