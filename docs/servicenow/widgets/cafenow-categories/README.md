# CafeNow Categories rendering repair

Prepared November 7, 2026 from the user's two attached scripts and pasted Body HTML. Original attachments and exports are unchanged. Only CafeNow Categories is addressed; the Shopping Cart scope/choice-list errors are separate.

## Install

In the existing **CafeNow Categories** Widget Editor, replace Server Script with [server.js](server.js), Body HTML template with [template.html](template.html), and Client Script with [client.js](client.js). Preserve cloned CSS, dependencies and option schema. Do not paste the My Open Orders option schema into this widget.

Set the Categories instance Page option to **Cafe Menu (`cafe_menu`)**, title to **Vendors** or **Categories**, and number of categories to load to **15**. The prepared server defaults its destination to `cafe_menu` if Page is unset; a configured Page reference still takes precedence. Confirm the portal's catalog associations and the URL's `catalog_id`, if supplied. This script gets its catalog list from `$sp.getCatalogs()` and the URL, not a newly invented catalog instance option.

## Corrections

- Replaced `JSUtil.nil` with scoped `gs.nil` ([official API](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_GlideSystemScopedAPI.html)).
- Bounded the position/count loop by actual returned categories. The supplied loop dereferenced an undefined row whenever fewer than the limit existed, including zero results.
- Closed the top-level repeated `<li>` opening tag. Removed a duplicate `catalog_title` HTML id; retained recursive category templates.
- Converted category page size, requested limit and client Show More arithmetic to numbers to avoid string concatenation.
- Made catalog membership query explicit with `IN` and a joined list; initialized list output before early returns and avoided querying with no allowed catalogs.
- Added a visible empty-list message. Visibility/count checks remain: categories with no visible items stay hidden.

These are targeted derivatives, not a complete security or accessibility audit of inherited widget code. Existing category/catalog visibility checks are retained; no ACL bypass is added. No item assignments, catalog memberships, user criteria or published records were changed.

## Verification

Run `node docs/servicenow/widgets/cafenow-categories/verify.cjs` from project root. Local mocked checks cover zero/one/five/fifteen/sixteen results, truncation/Show More, numeric page sizes, inaccessible catalog rejection, default routing, and regression reproduction of the original JSUtil and short-list errors. Both scripts parse; a template assertion checks the corrected tag. These checks do not render Angular or execute actual ServiceNow APIs.

In the instance, test initial Cafe Menu load, a five-category list, category clicks staying on `cafe_menu`, child expansion, Show More, back/forward and mobile category explorer. Test as an employee. If the empty message appears, inspect the portal catalog association, category active/catalog/parent fields, item-to-category membership, item visibility and user criteria. The template intentionally hides categories whose visible-item count is zero. Inspect any new error naming this widget; fixing these source defects does not establish that every inherited helper is supported by the target release.

Planning references: [portal review](../../../planning/PORTAL-WIDGET-REVIEW-2026-11-06.md), C01/U02/T07/T09 in the detailed task guide. Live task status remains on the VTB.
