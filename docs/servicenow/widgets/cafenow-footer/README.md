# CafeNow portal footer

Updated November 13, 2026 at the user's request: a compact, shared footer with the supplied NowServing Solutions logo and three links to sections of one About page. Replaces the original expandable sections. Content lives in ../cafenow-information, not inside the footer. Each link uses ?id=cafenow_about&section=about, team or nutrition; header About uses ?id=cafenow_about with all sections collapsed.

## Install

1. Record the current /cafe theme/footer for rollback. Confirm the target release and form labels. If other portals share the theme, use a CafeNow-specific copy before editing.
2. Upload assets/nowserving-solutions.png using the instance image manager (commonly System UI > Images). Use cafenow_nowserving_solutions.png, or set data.logoUrl in server.js to the actual served URL. Verify employee access to the image.
3. In Service Portal > Headers & Footers create CafeNow Footer, preferably by copying Sample Footer rather than editing the base record. Paste template.html, style.css, client.js and server.js into the matching HTML/CSS/client/server fields. This is a theme footer record (sp_header_footer), not a Designer page widget. If already installed, repaste the updated HTML and CSS.
4. Create the combined About page, header About menu item and CafeNow Information widget using [the page setup guide](../cafenow-information/README.md).
5. In Service Portal > Portals open /cafe and its Theme reference. Set Footer to CafeNow Footer. Preserve existing header and other settings.
6. Optional: select Fixed footer to keep the footer visible at the bottom of the viewport while scrolling, like Fixed header at the top. Leave it unchecked for a normal footer at the end of the page. CSS deliberately does not set fixed positioning or a guessed page-bottom spacer. Test the actual theme's content clearance before enabling it for users.
7. Refresh the portal. Restore the previous theme/footer selection to roll back.

ServiceNow references: [Theme fields and Fixed footer](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/c_CustomCSS.html), [Attach header/footer](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/configure-header-menu.html), [Sample Footer](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/sample-footer-widget.html).

## Sources and adaptations

- [About Us](../../../About%20Us%20-%20Cafenow.docx)
- [Meet Our Team](../../../Meet%20Our%20Team.docx)
- [Nutrition & Allergen](../../../Nutrition%20%26%20Allergen.docx)
- [Original PNG](../../../planning/F700DB96-18BD-4AFC-8B1D-A2F8D893C3C8.png); identical installation copy in assets/nowserving-solutions.png.

Word sources are in docs/, not docs/planning/. Originals are unchanged. Page copy normalizes CafeNow naming, retains the five team names/biographies/LinkedIn URLs, replaces automatic-notification promises with checking My Orders, removes draft Published metadata, and clarifies vendor-provided/missing allergen information. No knowledge article publication, live notifications or measured waiting-time improvement is claimed.

## Verify

Open preview.html locally to see the compact normal-flow footer; its links require the installed ServiceNow pages. Do not paste preview.html into the instance.

Verify the logo, all three section links, correct expanded content on the About page, keyboard focus, mobile width and 200% zoom. With Fixed footer enabled, scroll every page to its bottom and confirm the last menu item, Submit button, terms, pagination and any floating chat controls remain visible and usable. Check on a small phone and short desktop viewport too. If content is obscured, leave Fixed footer unchecked until the theme's bottom spacing is adjusted to the observed footer height. Do not assume a hardcoded height works at every zoom level. Check existing employee/vendor/guest access policy and external LinkedIn profiles. Render the footer only through the theme to avoid duplicates.

Local HTML/JavaScript checks do not establish live deployment, image access, browser layout, accessibility or fixed-footer clearance. Those require testing in the school instance.
