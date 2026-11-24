# CafeNow Full Shopping Cart - preview repair

Complete replacement scripts derived from user-supplied SC Shopping Cart attachments, November 8, 2026. Separate from the standalone sidebar and its clone-reference. Original attachments preserved.

Paste client.js and server.js into the CafeNow Full Shopping Cart clone. Keep supplied HTML, CSS, dependencies, ng-templates and original cartTemplate instance option. This preparation accepts callable/numeric choice-list size, injects $rootScope, replaces two jQuery size() calls, fixes native clear-cart scope typo and routes client cart links to cafenow_cart. Checkout still embeds sc-checkout; vendor/pickup capture is not implemented.

Checks: both complete scripts parsed in Node; numeric/callable size compatibility checked; git diff --check passed. No instance or rendered verification. Preview repair only: inherited quantity mutation checks canRead but does not explicitly validate cart membership/write permission, and save_cart references undefined cart. These remain unresolved in this derivative; do not treat it as fulfillment/security acceptance. Test with disposable cart records. Scoped helpers/dependencies, quantity choices, rendering and checkout require live verification before employee use.

Next: confirm preview renders, then inspect active checkout source and repair mutation authorization before delivery. Keep live VTB evidence on C02/U02/S04/T07/T09.

Follow-up: after the live preview rejected get(i), quantity choices now prefer getChoice(i), with a legacy get(i) fallback only if callable. Actual quantity-block mocks exercised both accessors and size forms successfully; live rendering still requires verification.
