# CafeNow Catalog Item checkout caller

Prepared from the user-pasted Catalog Item Server Script. Only two embedded checkout IDs change, from `sc-checkout` to `cafenow-checkout`. This target ID is the proposed ID from chat; verify the actual CafeNow checkout widget ID before use. This file is for a CafeNow-owned caller copy, not for editing the shared original.

The source's APIs/dependencies must work in the target application scope. The patch is not deployed or runtime-tested. It only connects normal Order Now and draft/wishlist confirmation; it does not modify the multi-item shopping-cart caller or implement pickup capture.

## Pickup handoff to implement after inspecting checkout source

- Keep one `pickup_window` variable associated with CafeNow foods as a stored value. Hide it on the food form and remove food-form mandatory behavior so items can be added before the checkout choice exists. Enforce required pickup at checkout/server submission.
- Resolve the actual checkout cart items' Menu/Vendor links server-side and reject mixed or missing mappings.
- Show one eligible vendor-window selector in the checkout copy; store window sys_id, not the time label.
- Before the existing checkout submission, validate the selection and write the same window value (and validated same-day pickup date) into each relevant cart item's variables through the supported CartJS API. Preserve original quantities and other answers; use the actual user's named checkout cart, including the separate Order Now cart. Do not update unrelated carts or submit if any update fails. Revalidate all items on retry.
- Read the resulting RITM variables in the existing flow, validate agreement, then populate Order.pickup_window and derive Order.vendor from Menu mapping. Preserve the single parent Order and linked RITMs.
- This transports one answer on item variables; it does not reserve capacity. Capacity/cutoff validation, complete-checkout coordination and retry protection remain required before accepting an order.

CartJS documents updating cart-item variable answers through updateItem: https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_CartJSScoped.html

Needed source: the actual checkout copy's HTML, Client Script and Server Script, and the active shopping-cart caller. They are not in the retained application export. Exact hook points must be identified from those files rather than guessed.
