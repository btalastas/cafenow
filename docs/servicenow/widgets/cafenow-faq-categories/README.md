# CafeNow FAQ Categories

Prepared November 13, 2026 for the existing cafe_faqs page. Replaces its KB Categories instance with a server-filtered category list; does not modify the base widget. No article content or counts are queried. Category links navigate to an existing category article page rather than broadcasting the base KB Categories widget's selection event to Column 2.

## Confirmed visibility map

| Assigned/inherited CafeNow role | Visible categories |
| --- | --- |
| user | Employee Help; Ordering and Payments; Troubleshooting |
| vendor_admin or vendor_staff | Menu Management; Vendor Operations; Troubleshooting |
| facility_manager | Administration; Troubleshooting |
| admin | All six |

The user confirmed this persona/category mapping November 13, 2026. Multiple roles combine categories. The exact x_1234_cafenow role names come from retained project sources; verify current live role assignments. Platform admin alone is not treated as every CafeNow persona. Guest/no matching CafeNow role sees no widget. The screenshot's Ordering and Payments label is preserved for lookup, not approval or implementation of payments.

RULES and ROLES at the top of server.js own the mapping. Role decisions happen on the server, and disallowed category names/IDs are not sent in data.categories. Only active, ACL-readable top-level categories directly under the configured knowledge base are considered; nested categories are intentionally not traversed. Labels must exactly match the screenshot's labels. Duplicate or unreadable matches are omitted rather than guessed. Renamed categories require a matching RULES update.

## Install on the current page

1. In Service Portal > Widgets create **CafeNow FAQ Categories**, ID cafenow_faq_categories. Keep Public unchecked. Paste template.html, style.css, client.js and server.js into matching fields; paste option-schema.json into Option schema.
2. Open the existing **Cafe FAQs**, ID **cafe_faqs**, in Designer. Record the current KB Categories widget instance/options for rollback. Replace that instance in Container 1 > Row 1 > Column 1 with CafeNow FAQ Categories. Do not leave both visible.
3. In the NEW instance's options, enter the CafeNow FAQ knowledge base's 32-character sys_id in **CafeNow FAQ knowledge base sys_id**. Obtain it from the actual Knowledge Base record via Copy sys_id, or inspect the old instance's configured KB. A subsequent export review found the retained CafeNow KB reference 5602e4aa189813107f44e367c73ecbb6; verify that against the target instance before using it. The widget displays a setup message until configured.
4. Verify each category record is active with Parent table kb_knowledge_base and Parent ID equal to that KB sys_id. Confirm label spelling and role constants. Do not broaden category ACLs just to make the widget display.
5. Verify the category destination page ID; default is **kb_category**, but that page has not been verified in your instance. It must contain a standard KB Category Page widget consuming kb_category and the same knowledge base. Set the destination in **Category article page ID** if your instance uses another page. If no destination exists, create a non-public CafeNow FAQ Articles page (for example cafenow_faq_articles), add the base KB Category Page widget in a full-width Designer column, configure its KB options using the actual release, then enter that page ID here.
6. Column 2 is empty in the supplied page-structure screenshot; it can stay empty. This list navigates to the article page, not into Column 2. If the live page has a companion article widget, verify/adjust that layout rather than assuming the stock event integration is preserved.
7. Preserve the FAQ header menu entry to cafe_faqs. Restrict page/widget access consistently with current portal policy. Restore the recorded base widget instance/options to roll back.

## Article authorization remains separate

This widget controls category navigation only. GlideRecordSecure enforces category ACL reads; it is not a replacement for knowledge-base/article Can Read/Cannot Read user criteria. The linked standard knowledge widgets must enforce actual article access. Configure appropriate criteria for administration, vendor and employee articles, including articles moved into subcategories. Test restricted articles through direct URLs, search, standard KB pages and attachments. A category with no readable articles can still appear here: this widget makes no article-count/access claim. Do not describe hidden categories as protected articles until those tests pass.

Official references: [KB Categories](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/kb-categories-widget.html), [KB Category Page](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/kb-category-page.html), [Portal and knowledge user criteria](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/user-criteria.html). Target release and supported cross-scope access remain unverified; troubleshoot scoped read errors in development without broadly granting access.

## Verify

Run node verify.cjs locally for mocked role/data cases. In the school instance, impersonate each persona, a multi-role user, guest and a user with no CafeNow role. Compare visible categories to the approved map, inspect the widget response for hidden IDs/labels, and verify category links return only readable published articles. Check inactive/wrong-base/nested/duplicate category cases, missing KB setup, keyboard/mobile layout and 200% zoom. Log out/in after role or criteria changes if cached access persists. Local mocks do not verify ServiceNow role inheritance, ACL/user-criteria behavior, schema, rendered UI or live links.
