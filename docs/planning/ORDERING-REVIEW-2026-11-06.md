# CafeNow ordering review - November 6, 2026

## Conclusion

The user's intended journey is coherent: browse CafeNow vendor categories, add multiple foods from one vendor, choose one pickup window at checkout, and submit one CafeNow Order. Keep Vendor, Menu, Pickup Window, food Catalog Items, Request/RITMs and the existing Order pickup reference. The avoidable complexity is asking order-level questions separately on every food and maintaining several competing pickup variables and cart implementations.

The earlier assistant guidance focused on per-item qualifiers and introduced an unverified catalog-item context/helper variable before inspecting the full import and order flows. That is not an established requirement or tested solution. Do not add more helper variables to solve the checkout experience until the actual cart/checkout path is selected and inspected.

## Sources and limits

Reviewed README.md, PROJECT.md, DECISIONS.md, BACKLOG.md, STATUS.md and all eight existing Markdown files under docs/planning as they existed before this review. Also inspected the relevant working proposal sections, retained variables CSV, and the application export [sys_remote_update_set_cf1b4f8f6ddc13107f4484f0f2a4c618.xml](../../exports/sys_remote_update_set_cf1b4f8f6ddc13107f4484f0f2a4c618.xml), including decoded flow action inputs and the exported published order-flow snapshot. Later chat/screenshots describe changes after that snapshot. This is a static configuration review, not live access or runtime verification. Original exports, proposal files, CSV, images and logs are preserved.

## Confirmed intent and observed configuration

| Area | Evidence | Implication |
| --- | --- | --- |
| Employee journey | User explicitly wants one vendor per cart/order and one pickup selection when proceeding to checkout | Pickup is order-level input; per-food pickup questions are an earlier implementation alternative |
| Vendor | Export has `x_1234_cafenow_vendor` | Reuse the vendor record as the identity used for validation |
| Menu | `x_1234_cafenow_menu.vendor` references Vendor | The food's vendor is already known through the Menu record |
| Catalog mapping | Exported Catalog Items and import-flow inputs contain `u_cafenow_menu_item`; user confirmed its name | Resolve Catalog Item -> Menu -> Vendor. The field dictionary itself is absent from the inspected dictionary entries; verify it on the instance before script changes |
| Catalog/category | Import looks up a category using Menu Vendor Name plus the CafeNow catalog; Hawaiian Pizza has both category and Menu mapping in the export | Category organizes browsing; use the Menu Vendor reference for business identity rather than equating category and Vendor sys_ids |
| Pickup windows | `x_1234_cafenow_pickup_window` has `vendor`, `start_time`, `end_time`, `is_active`, `max_order_capacity`, `time_slot_v2` | Each record is one vendor's window. Query records by the derived vendor; present the time label and store the record sys_id |
| Time representation | Start/End are `glide_time`; Time Slot V2 is String; older `slot_label` references Operations | Keep time-only windows for this MVP direction; combine with the actual pickup date for cutoffs and daily capacity. A label is not a unique window identity |
| Order | `x_1234_cafenow_order.pickup_window` already references Pickup Window; `vendor` references Vendor; `source_request` references Request | Reuse these links. A second Order Time Slot V2 reference is unnecessary for the same selection |
| Variables | Exported CafeNow Ordering contains `vendor_ref`, `meal_option`, custom `quantity`, two pickup alternatives, date, terms and instructions; a producer also has `pickup_window` | Consolidate the customer journey before changing more qualifiers. Retain one quantity source and one pickup-selection source |

## Menu import flow findings

Exported flow: **Menu import to Catalog Items**, sys_id `03c580aa185413107f44e367c73ecb43`.

- Trigger is Menu created/updated. The first lookup uses `u_cafenow_menu_item = triggering Menu` and the CafeNow catalog, with a two-record limit to distinguish zero/one/multiple mappings.
- The create branch sets the Menu reference, name, description, price, catalog and category, and creates the `io_set_item` relationship for CafeNow Ordering. New Catalog Items are deliberately configured with `active=false` in this branch; publication needs review.
- The update branch updates item text/price and adds the variable-set relationship if missing. It does not visibly resynchronize category or reassign the Menu link; account for vendor changes explicitly if permitted.
- Category lookup uses vendor name and takes the first matching category. Verify missing/duplicate names rather than assume this is a durable Vendor reference.
- The update-price template is exported as `price=0{{trigger.current.price}}`; inspect and reconcile actual prices before acceptance.
- The exported flow is `active=false`, `status=draft`. These findings establish saved design/configuration, not successful import execution or current live activation.

This flow already supplies the important Catalog Item -> Menu relationship. There is no need to ask the employee which vendor owns the food or which food they mean after they have selected its Catalog Item.

## Order flow findings

Exported flow: **Copy of Placing Order Flow**, sys_id `c7e1aa8f6d1813107f4484f0f2a4c6a1`. The export includes an active/published flow and published snapshot `a104b2036d1c13107f4484f0f2a4c6fa`; execution remains unverified.

1. A Request-created trigger looks up RITMs for that Request where the Catalog Item Menu link is populated.
2. A first For Each reads food-level catalog variables.
3. Create CafeNow Order is outside both For Each loops, under the Count > 0 branch. This already expresses one parent per flow execution; it does not prove retry uniqueness or complete-child coordination.
4. A second For Each links RITMs to that created Order using `x_1234_cafenow_cafenow`.

Material gaps in exported Create Record inputs:

- Vendor and Pickup Window are blank.
- `sys_created_by` is assigned Requested for. Preserve audit attribution and use a separately verified requested-for/employee field instead.
- Order Total uses Request Price; reconcile it to the relevant CafeNow foods and quantities if unrelated items can share a Request.
- The export does not establish complete-RITM availability at Request insertion, a stored checkout-level pickup selection, server validation, daily capacity reservation or retry protection. Do not infer those from the flow's published status.

Preserve the one-parent/two-loop structure while correcting its inputs. A post-submission Get Catalog Variables action cannot supply a question the user never answered during checkout.

## Portal placement follow-up

The later [widget reference audit](PORTAL-WIDGET-REVIEW-2026-11-06.md) distinguishes retained widget definitions from current placement. The older custom Vendors/Menu pages and their widget instances are marked DELETE in this export; their retained code is prototype evidence, not an active second ordering route. The theme uses Employee Center Header; the CafeNow Main Menu instance still uses Global Header Menu despite an exported Cafe Header copy. Other shared-widget Application values and recent checkout copies require current instance verification.

## Two cart paths in the export

The custom **Menu List** reads Menu directly and calls the `cafeCart` Angular provider. That provider stores lines in browser session storage and prompts to clear the cart on a vendor switch. This is useful prototype behavior, but it is client-side and does not show that native catalog-cart additions are restricted. **Cafe Cart Bar** points to `?id=cart`; this export does not include a custom `cart` page/checkout widget or a demonstrated bridge from that session-storage cart to native Request/RITMs. The custom header also references native shopping-cart widgets.

For the user's current catalog/category/item journey, use the native catalog cart as the working baseline. Treat the separate custom Menu/session-storage cart as a prototype to reconcile, not a second independently maintained ordering route. This is a review recommendation, not authorization to delete artifacts or proof that routing has been changed.

## Recommended implementation boundary

Keep browsing and food Catalog Items. Introduce one CafeNow cart/checkout integration for the order-level behavior, using supported extension points verified in the target release:

1. Derive vendor from the actual CafeNow cart items' Menu links on the server. Reject missing mappings and mixed vendors; guide the UI to keep subsequent choices within that vendor. Changing vendor/removing the last item needs an explicit reset policy.
2. At checkout, show one pickup selector filtered by that vendor and eligible windows. Display `time_slot_v2`; submit Pickup Window sys_id. Retain the selected pickup date (same-day only under current requirements) without a redundant employee vendor/meal question.
3. Save the selection against the pending checkout/cart through a defined, supported mechanism and pass it to the existing Request/Order-creation process. Choose the exact storage and handoff only after inspecting the actual cart and checkout widgets; do not add placeholder order fields, hidden context variables or an extra catalog item by assumption.
4. Validate window/vendor/date, availability, quantities, ordering cutoff and capacity before accepting the CafeNow order. Count 20 orders per vendor/date/window, not meals or all dates combined. Reserve/recover capacity safely and prevent duplicate Orders on retries.
5. Create one Order with Vendor, Pickup Window, pickup date, recipient and Source Request; link all food RITMs. Keep fulfillment on CafeNow Order.

This requires checkout integration work. Attaching a shared variable set to food items does not automatically create one cart-wide checkout question: variable sets reuse item/guide questions, and the variable editor edits cart-item variables. See [variable sets](https://www.servicenow.com/docs/r/servicenow-platform/service-catalog/t_CreateAVariableSet.html) and [SP Variable Editor](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/variable-editor-widget.html). Confirm the target release before modifying widgets. The earlier item-level qualifier is a possible per-food experience, not a demonstrated implementation of this checkout requirement.

For this review, no new database table is justified solely for filtering pickup windows. Date storage, capacity reservation and checkout handoff still require dictionary/instance confirmation. Do not present a per-item dropdown as satisfying pickup-once-at-checkout.

## Focused next checks

- Inspect the actual CafeNow catalog cart and checkout page/widgets and confirm which path users reach. Preserve base widgets; determine the supported extension/customization before building.
- Demonstrate two Pizza Hut foods with quantities, one checkout pickup choice, one Request, one Order and linked RITMs. Repeat with Tim Hortons and verify vendor-specific windows.
- Reject a mixed-vendor cart and a forged/wrong-vendor pickup sys_id. Verify inactive/full/late windows and employee access.
- Verify date-scoped capacity, simultaneous final booking, complete checkout, retry behavior and failure recovery before acceptance.
- Review the retained variables CSV's stale single-form fields and 20-minute cancellation calculation separately from the 30-minute ordering cutoff. Do not use it as the current schema.

Existing tasks: P03/D01 for checkout feasibility/dictionary, C01-C03/U01-U02 for the catalog/cart journey, B01-B02/D04 for validation/capacity, I01-I02 for import, and T02-T03/T07/T09 for evidence. Preserve the 47 task IDs and use the shared VTB for live status.
