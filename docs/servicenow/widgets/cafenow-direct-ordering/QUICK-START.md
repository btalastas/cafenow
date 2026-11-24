# CafeNow simplified checkout - quick start

1. Repaste the updated [CafeNowDirectOrdering Script Include](CafeNowDirectOrdering.js).
2. Repaste the direct-ordering [server](server.js), [client](client.js), [template](template.html), [CSS](style.css) and [option schema](option-schema.json) into your shared cafenow widget. Do not use the historical cafenow-cart-checkout files.
3. Retain cafe_menu instances with views vendors/menu/sidebar and cafenow_cart with view cart.
4. Ensure the cart vendor has a valid Location pointing to the building. Verify parent/line read ACLs and reconcile any old creation guards/flows.
5. Add two foods, open the cart, select a vendor-specific active Pickup Window, check terms and choose Place Order. Confirm one ORD with two Order Lines and correct totals/references.
6. Add the Order Line related list through order to the platform Order form. Retain orders/details widget views for portal tracking.

No submission_key, booking_key, submission_status, enabled/schema_verified or time-storage setup is needed. Cutoff, capacity and durable duplicate protection are deferred; a lost response requires My Orders/administrator review before retrying. The current service is prepared locally, not deployed or live-verified. See the [current setup guide](README.md) for security, optional fields and failure-handling limits.
