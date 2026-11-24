# CafeNow knowledge article revision package

Updated November 13, 2026 after receiving the direct kb_knowledge XML export. All **15 article bodies** are now matched by sys_id to the retained menu references and reviewed. Replacement HTML, observed article metadata, a readable change report and plain-text diffs are prepared locally; nothing is installed or published. Original exports and original documents remain unchanged.

Start with [Article inventory](ARTICLE-INVENTORY.md), [body review](BODY-REVIEW.md) and [text changes](BODY-CHANGES.diff). Each HTML file is a body fragment intended for the article's HTML/source editor. [manifest.json](manifest.json) records the source menu labels, referenced article sys_ids, menu-item references, timestamps and source-file SHA-256 hashes. These identifiers are evidence from retained files, not verified current article/version identities.

## What the XML actually contains

The two update-set exports contain menu references but no article bodies. The newly supplied direct kb_knowledge export contains 15 matching records with nonempty HTML bodies, article numbers, short descriptions, category names/sys_ids, KB references and version references. All 15 have exported workflow_state=published. Article Can Read/Cannot Read fields are empty in these exported records; this is not proof of unrestricted live access because base criteria and platform settings also apply. Direct version/KB criteria records were not exported here.

The inventory now preserves the observed categories, including How to Track Your Food Order under Ordering and Payments. Earlier proposed category assignments are superseded by the actual exported assignments. The manifest records each original body hash and export source. BODY-CHANGES.diff compares normalized visible text, omitting original CSS/layout markup so wording changes are readable. Source HTML remains intact in the original XML.
The older export also references the CafeNow knowledge base **5602e4aa189813107f44e367c73ecbb6** in knowledge-base criteria records. Verify it against the actual target instance before using it in the category widget. It is not installed as an automatic default.

Observed retained criteria associations include Can Read **Any User**, Cannot Read **Guest User**, Can Contribute **Has atleast one role apart from snc_internal KB**, and Cannot Contribute **Guest User**. The actual definitions/current assignments have not been inspected. These associations do not demonstrate article-level role isolation. The broad contribution criterion needs particular review before claiming read segregation: contributor access can affect article-read outcomes.

## Confirmed category audience

The user confirmed the persona mapping in chat November 13:

| Category | Assigned/inherited CafeNow roles that see it |
| --- | --- |
| Administration | facility_manager; admin |
| Employee Help | user; admin |
| Menu Management | vendor_admin; vendor_staff; admin |
| Ordering and Payments | user; admin |
| Troubleshooting | user; vendor_admin; vendor_staff; facility_manager; admin |
| Vendor Operations | vendor_admin; vendor_staff; admin |

Role prefix is x_1234_cafenow, from retained project sources. Confirm the actual target role records. Multi-role users see the union. Actual article-category assignments are now available and preserved in the revised inventory. No new payment scope is introduced by preserving the existing category label.

## Changes reflected in replacement bodies

- CafeNow / NowServing Solutions branding and the current About page with collapsible sections.
- Direct Vendor/Menu -> custom cart and pickup -> one Order with Order Lines. Catalog/Request/RITM guidance is historical.
- Submitted -> Confirmed -> Ready for Pickup -> Closed Complete, with Canceled separate. Completion requires actual collection.
- November 12 ordering policy: 20-minute cutoff. The separate 20-minute cancellation policy is retained, with eligible states/boundary behavior unresolved. No unimplemented Cancel button is promised.
- My Orders/manual status refresh, current cart and support routes, read-only staff versus vendor-admin menu maintenance, existing image display and conditional vendor-provided nutrition information.
- No payments/refunds, guaranteed allergen-free meals, proven notification delivery, verified automatic reminders, guaranteed capacity protection or safe automatic retries.

Review found placeholder example.com support email addresses, outdated lifecycle/action labels, unverified notification claims and a copied allergen overview in the cart article. Replacements correct these and preserve useful sign-in/security, urgent vendor contact and allergen guidance. Some articles intentionally describe known limitations relevant to the reader. These do not declare live behavior observed. Review every UI instruction in the school instance before publishing.

## Update the existing articles in ServiceNow

1. Use Knowledge > Articles or the equivalent available module. Locate each referenced article using the manifest, then verify its title/number, knowledge base, version and current body. Do not assume an old sys_id is the current editable revision.
2. Save the current article/version as a rollback reference. If versioning is enabled, use the normal checkout/new-version workflow; avoid raw XML imports or direct state changes that bypass it.
3. Review the corresponding HTML file, then paste it into the article body's HTML/source editor. Check that the stored body renders rather than displaying HTML code. Apply the proposed short description only after checking the current record; existing exported categories are retained. Do not move articles just because an earlier draft proposed another category. Preserve unrelated attachments, ownership and metadata.
4. Set article Can Read criteria to the intended category audience, including CafeNow admin in every audience. Use separate criteria records for OR audiences where appropriate, and verify role matching. Do not apply a negative criterion that inadvertently excludes a multi-role user with allowed access. Reconcile the retained base Can Read/Can Contribute configuration with your intended authoring policy.
5. Test actual user-criteria outcomes for each persona through the article page, direct links, search and attachments. A category widget filter alone is not protection. Check actual properties and contributor privileges before declaring article segregation complete.
6. Verify `/cafe?id=cafe_menu`, `cafenow_cart`, `cafenow_my_orders`, `cafenow_support` and `cafenow_about` links. About section links use section=nutrition. Confirm menus, order states, requester support and vendor controls before publishing reader instructions.
7. Follow the instance's configured article review/publishing workflow. No article is published by this package. If a feature is not present, revise that instruction or keep the article unpublished until corrected. Capture results in the shared MVP VTB.

Official ServiceNow references: [Edit an article](https://www.servicenow.com/docs/r/servicenow-platform/knowledge-management/edit-knowledge-article.html), [Article version checkout](https://www.servicenow.com/docs/r/servicenow-platform/knowledge-management/create-new-article-version.html), [Article user criteria and contributor behavior](https://www.servicenow.com/docs/r/servicenow-platform/knowledge-management/t_SelectUCArticle.html). Release/modules and article lifecycle remain unverified on the school instance.

## Project sources

Policy and architecture: [DECISIONS.md](../../../../DECISIONS.md), [PROJECT.md](../../../../PROJECT.md), [STATUS.md](../../../../STATUS.md).

Prepared behavior/limits: [direct ordering](../../widgets/cafenow-direct-ordering/README.md), [employee order views](../../widgets/cafenow-order-views/README.md), [vendor orders](../../widgets/cafenow-vendor-orders/README.md), [vendor menu](../../widgets/cafenow-vendor-menu/README.md), [support](../../widgets/cafenow-support/README.md), [About](../../widgets/cafenow-information/README.md), [role-filtered FAQ categories](../../widgets/cafenow-faq-categories/README.md).

The About, team and nutrition Word documents remain unchanged. Past conversations are represented by their retained decision/status/source records and the current chat; unavailable conversations are not treated as evidence.

## Local checks and limits

Rebuild with `python docs/servicenow/knowledge/cafenow-faq-revision/build.py` from the project root. The builder requires 15 unique matching article references and direct bodies; it stops if the inventory changes or duplicate exported revisions require selection. Verify HTML structure, all 15 manifest targets, source hashes, project links and forbidden stale promises before delivery. Local checks do not verify rendering in ServiceNow, live article identity, role inheritance, knowledge criteria or notifications. No connection to the school instance exists in this session.
