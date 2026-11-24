# CafeNow portal widget reference review - November 6, 2026

## Result and evidence boundary

Reviewed the retained [application XML](../../exports/sys_remote_update_set_cf1b4f8f6ddc13107f4484f0f2a4c618.xml) and the three user-pasted Catalog Item widget components. CafeNow already owns the exported portal, theme, current page layout instances and five custom widget definitions. These can reference shared widgets owned by other applications. Instance scope and widget definition scope are separate.

Only Header Menu's Global scope is directly established here, by the original-widget payload retained in the clone relationship. Other referenced widget definitions are missing from this application export; their actual Application fields must be checked in the instance. Do not classify every missing definition as Global: some may belong to Employee Center or another installed application.

Desktop inventory failed with a missing Computer Use native pipe; browser inventory also reported that the browser access host is unavailable. No live instance inspection or configuration was performed. The recently created/renamed checkout and Catalog Item copies are not present in the retained export. Pasted source establishes script calls but not the source record's Application field or its current placement in the portal.

## Portal entry points in the export

| Record | Exported reference | Observation |
| --- | --- | --- |
| Portal CafeNow, suffix `cafe` | Home `cafenow_home`; theme CafeNow; main menu CafeNow Main Menu | Portal scope is CafeNow |
| Theme CafeNow | Header Employee Center Header, sys_id `d0009941eb103010ed7966d6475228c1` | Header definition is not exported; its scope and embedded calls are unverified |
| CafeNow Main Menu instance | Widget Header Menu, sys_id `5ef595c1cb12020000f8d856634c9c6e` | Instance scope is CafeNow; referenced Header Menu is Global in the clone snapshot |
| Menu navigation entry | Type `sc` | Native catalog navigation; the exact current destination page requires live inspection |
| Home / My Orders navigation | `cafenow_home` / `cafenow_my_orders` | Both destination pages are exported in CafeNow |

The portal's exported catalog/category-page override fields are empty. That does not establish the runtime destination of all catalog links. In particular, the newer `cafenow_catalog` page visible in screenshots and the Catalog Item/cart pages are not defined in this older app export.

## Current exported page instances referencing shared widgets

Page placement below is resolved through Instance -> Column -> Row -> Container -> Page. Records marked DELETE are excluded. All five instance records below are in CafeNow scope; this does not make their referenced widget definitions CafeNow-owned.

| Placement | Referenced widget | Widget sys_id | Definition scope evidence |
| --- | --- | --- | --- |
| `cafenow_home` | Catalog Content | `f2384e2047101200ba13a5554ee490ce` | Not exported; verify Application |
| `cafenow_home` | Quick Links on Topic Page | `0fe509c7c32030108ae53e5f2b40ddbf` | Not exported; verify Application |
| CafeNow Main Menu | Header Menu | `5ef595c1cb12020000f8d856634c9c6e` | Global confirmed in original clone payload |
| `cafenow_my_orders` | Simple List | `5b255672cb03020000f8d856634c9c28` | Not exported; verify Application |
| `cafenow_order_details` | Form | `fd1f4ec347730200ba13a5554ee490c0` | Not exported; verify Application |

The Simple List instance's direct `sp_page` field says Order Details while its layout chain places it under My Orders. Treat this as an exported configuration discrepancy to inspect, rather than claiming the list renders on both pages. Its saved filter text also needs review against a real encoded ownership query; no ACL or ownership result is established by this audit.

## CafeNow-owned widget definitions

| Widget | ID | Scope | Placement evidence |
| --- | --- | --- | --- |
| Cafe Header | `cafe_header` | CafeNow | Clone of Global Header Menu; exported main-menu instance still points to the original. No current exported instance references Cafe Header |
| Cafe Vendor List | `cafe_vendor_list` | CafeNow | Its earlier instance and Vendors page are marked DELETE |
| Cafe Now main | Empty ID in export | CafeNow | Earlier home instance is marked DELETE |
| Menu List | `menu_list` | CafeNow | Its earlier instance and Menu page are marked DELETE |
| Cafe Cart Bar | `cafe_cart_bar` | CafeNow | Earlier instances are marked DELETE |

Do not count retained definitions as active portal placements. The custom `cafeCart` Angular provider and its Menu List/Cart Bar relationships exist in CafeNow, but that does not show those widgets are on the current catalog route.

## Embedded references in Cafe Header

Exported Cafe Header server script:

| Line | Embedded widget ID | Condition |
| --- | --- | --- |
| 20 | `sc_wishlist_cart` | Wishlist enabled |
| 23 | `sc-shopping-cart-v2` | Cart enabled and V2-header property true |
| 25 | `sc-shopping-cart` | Cart enabled and V2-header property false |

It also links to `?id=sc_cart` and references the Angular template `menuTemplate`. All three embedded definitions and the template scope are unverified here. Cafe Header's existence does not establish that this code runs: the retained theme points to Employee Center Header and the main-menu instance points to Header Menu. Inspect those actual callers before changing Cafe Header or attempting to replace a theme header with a menu widget.

## Embedded references in the pasted Catalog Item caller

The third pasted file is the Catalog Item Server Script, not the checkout implementation. Its actual calls are:

| Lines | Call | Purpose |
| --- | --- | --- |
| 79-80 | `$sp.getWidget('widget-modal', ...)`, `embeddedWidgetId: 'sc-checkout'` | Normal Order Now confirmation |
| 107-108 | `$sp.getWidget('widget-modal', ...)`, `embeddedWidgetId: 'sc-item-save'` | Save item modal |
| 127-128 | `$sp.getWidget('widget-modal', ...)`, `embeddedWidgetId: 'sc-checkout'` | Wishlist/draft ordering confirmation |
| 404 | `$sp.getWidget('ec_favorite', ...)` | Favorite control |
| 721 | `$sp.getWidget('servicenow_lens', ...)` | Lens widget |

The first pasted file renders the resulting order/save modal widget models with `<sp-widget>`. A widget's use of JavaScript globals such as `$scope` does not identify its ServiceNow application scope. Explicit server dependencies include `global.GlobalServiceCatalogUtil`, `global.CatalogItemTypeProcessor`, `global.DynamicCatalogContentUtil`, `global.MobileDeepLinkGenerator` and `global.StdChangeUtils`. A CafeNow-owned copy still needs supported access to the APIs it calls; renaming or copying does not rewrite dependencies.

Both `sc-checkout` call sites are exact candidate changes in a CafeNow-owned caller copy after the new checkout ID is verified. The pasted files do not include the shopping-cart caller, so they do not identify its checkout call sites. Do not claim that changing these two lines changes multi-item cart checkout.

## Recommended boundary for pickup customization

1. Keep shared Catalog Content, Quick Links, Simple List, Form, favorites and modal utilities where their existing behavior meets CafeNow's needs. Sharing a base widget does not require editing it in Global. ServiceNow supports configuring instance options independently of base widget code: [widget/instance documentation](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/service-portal-widgets.html).
2. Verify the new CafeNow checkout record's Application, ID, dependencies, templates and unchanged behavior. Cloned templates require particular attention: [clone documentation](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/t_CloneAndEditAWidget.html).
3. Use a CafeNow-owned Catalog Item caller only where its checkout ID must change. Configure a CafeNow-specific item-page instance/route to use that copy; inspect shared-page use first.
4. Inspect the actual shopping-cart widget and its caller path before cloning or redirecting anything. That is the priority route for multiple food items with one checkout pickup choice. The native header can select different cart versions; no currently active branch is verified by this export.
5. Add and persist one vendor-filtered pickup selection through the checkout copy and connect it to the existing Order flow. Keep the data relationships in the [ordering review](ORDERING-REVIEW-2026-11-06.md); no additional item-level context variables or table copies are justified by this scope audit.

## Instance checks needed to complete live verification

- Open the referenced widget records and read Application. The direct-instance list can be audited via `sp_instance.list` with Application = CafeNow and Widget > Application shown; this does not cover embedded calls or all shared-page instances.
- Open portal CafeNow -> Theme -> Employee Center Header and inspect its embedded widgets. Open CafeNow Main Menu and verify whether Widget still points to Header Menu.
- Inspect the actual current food-item and cart URLs/pages, their widget instances, caller scripts, portal route mappings and active header-cart branch.
- Export the new checkout/caller copies and any relevant shared widget/page definitions for a complete current snapshot. Keep credentials and sensitive user/order data out of exports.

No records were moved, cloned, renamed, updated or deleted during this audit. Existing P03/D01/C01-C03/U02/S03-S04/T02/T07/T09 tasks own follow-up; live status remains on the shared VTB.


## CafeNow catalog page routing follow-up

User screenshots show `/cafe?id=cafe_menu` and category clicks navigating to `id=sc_category`, with `catalog_id=-1`. These show navigation targets; they do not prove a Page Route Map is redirecting the request. The user requests a CafeNow-owned catalog page. Reuse `cafe_menu` as the proposed category/menu page, verifying Application = CafeNow, and inspect its current widgets before adding duplicates.

Recommended configuration: SC Categories on the left and SC Category Page on the right; set the category widget instance's Page option to `cafe_menu`. ServiceNow documents this option as the page opened when clicking a category: [SC Categories widget](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/sc-categories-widget.html). Configure CafeNow's Catalog category home page to the same page where supported; make the Menu entry explicitly target that page. Keep the CafeNow Service Catalog association and pass its actual catalog sys_id, rather than relying on `-1` (all catalogs). The retained export's CafeNow catalog ID is `7a175062185813107f44e367c73ecbd0`; verify it remains current.

Test direct entry and a vendor category click, retaining `sys_id` for the selected category and `catalog_id` for the catalog. Preserve standard widget behavior through instance options first; only create scoped widget copies when needed for custom behavior. Category display/route controls remain separate from mixed-vendor cart validation and checkout customization. Do not create a broad route map for every portal or modify the base `sc_category` page to achieve this CafeNow-specific route. No live changes or route tests performed.
