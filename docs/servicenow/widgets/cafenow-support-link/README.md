# CafeNow support link and dedicated submission page

Prepared November 12, 2026. New home-page link widget; reuses the existing cafenow-support submission widget, not a second form or table.

## Create destination page

Service Portal > Pages > New. Title: CafeNow Complaints and Requests. ID: cafenow_support (check first for an existing page with that ID; reuse it rather than duplicate). Public: false. Apply actual requester role/access criteria available in the release. Keep existing table/field ACLs; a page role or hidden link does not replace them.

Open the page in Designer. Add a container, one row, and a full-width 12-column column. Place **CafeNow Complaints and Requests** (source in ../cafenow-support) inside it. Remove any old submission-widget instance from home only after this destination has been tested. The previous narrow-column screenshot can be addressed by using this full-width column; the form itself has a 760px maximum width.

Destination: /cafe?id=cafenow_support. This is a proposed local installation, not a verified live page. Keep requester-only support server settings until vendor configuration is verified.

## Create link widget

Create a non-public same-scope widget named **CafeNow Support Link**, ID cafenow_support_link. Paste template.html, server.js, client.js and style.css into their corresponding fields. Add this widget to cafenow_home or another employee-facing page. It links to the dedicated page without auto-redirecting or submitting records. No option schema/Script Include needed.

Link is currently limited to exact assigned/inherited x_1234_cafenow.user, consistent with the requester-only form. Vendor users with that role can access as requesters; vendor-only users cannot yet submit. Facility manager complaint reading needs a separate list/dashboard, not this submission page. When enabling vendor submissions later, update both destination page permissions and this link's server role gate, along with the existing form configuration.

## Verify

As a requester, verify link visibility, same-portal navigation, full-width form layout and successful authorized submission. As vendor-only, facility-only and guest users, verify the requester link is absent and direct page/form access is denied by destination controls/server gates as appropriate. Verify requester A cannot link requester B's order. No live deployment, page access or rendered UI verified.
