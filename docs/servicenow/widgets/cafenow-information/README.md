# CafeNow About page and header tab

Updated November 13, 2026. One About page contains three collapsible sections, retaining the supplied document content. Header navigation opens all sections collapsed. Footer links open the same page with the selected section expanded. Users can independently open/close sections. Same-page query changes and browser Back/Forward reset the expanded selection to the URL value.

## Install the content widget and page

1. In Service Portal > Widgets create or update **CafeNow Information**, ID cafenow_information. Paste all four files in this folder into their corresponding fields: template.html, style.css, client.js and server.js. No options/dependencies needed.
2. Reuse/create one page: **Title: About NowServing Solutions; ID: cafenow_about**. Keep non-public and apply existing intended portal access settings.
3. Open it in Designer. Add one container > one row > one full-width 12-column column. Add CafeNow Information once. The theme supplies the footer; do not add another footer widget to the page.
4. The earlier cafenow_team and cafenow_nutrition pages are no longer needed for this navigation. Do not delete existing pages until other links/bookmarks have been reviewed. If already created with this widget, they can still display the combined content, but all new navigation targets cafenow_about.

## Add About to the existing header

In Service Portal > Portals open the CafeNow portal (/cafe). Follow its **Main menu** reference to the actual menu used by the header (or find that menu under Service Portal > Menus). In its Menu Items related list create a top-level item:

| Field | Value |
| --- | --- |
| Label | About |
| Type | Page |
| Page | About NowServing Solutions (cafenow_about) |
| Parent menu item | Empty, for a top-level tab |
| Order | Next appropriate value after the existing tabs |

Match the existing menu's visibility/access conventions. The target must have no section parameter so all sections start collapsed. A URL-type menu item pointing to ?id=cafenow_about is an alternative if required by the actual custom header. Do not add both. Verify desktop and mobile: the retained custom header consumes configured menu data, but the live header/menu binding has not been inspected. No live menu record has been created. Preserve current header source rather than pasting a replacement just to add a menu item.

ServiceNow reference: [Configure a portal header menu](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/configure-header-menu.html).

## Footer destinations

Update the theme footer using ../cafenow-footer/template.html. It retains the supplied group PNG and these links:

| Footer link | Destination |
| --- | --- |
| About Us | /cafe?id=cafenow_about&section=about |
| Meet Our Team | /cafe?id=cafenow_about&section=team |
| Nutrition & Allergen | /cafe?id=cafenow_about&section=nutrition |

Only about/team/nutrition are accepted; missing or unsupported values collapse all sections. The content is static and no table access/record mutation is introduced. The server selects initial expansion and the client observes query changes, including links clicked while already on About. Source provenance/adaptations remain in the footer guide.

## Verify in the instance

Header About: one page heading and three collapsed sections. Each footer link: same About page with only the matching section initially expanded. Click different footer links while staying on the page, refresh, and use browser Back/Forward. Confirm selected content changes without stale expansion. Manually toggle each button with mouse, Enter and Space, and verify aria-expanded and screen-reader labels. Check all three full sections, the five team links, nutrition notice, mobile layout and 200% zoom. Check signed-in employee/vendor and existing guest policy. Check any fixed header/footer leaves page controls accessible. No live installation, rendered UI or accessibility verification claimed.

## About Us copy update

User requested a shift from product-led About CafeNow to About NowServing Solutions. Updated the page heading and About Us section to introduce the five-person group, its mission, values and approach; CafeNow is presented as its product. Repaste template.html and optionally rename the page Title to About NowServing Solutions. Keep page ID cafenow_about, menu label About, and existing section links. Original Word sources remain historical and unchanged; revised company copy is an adaptation requested by the user. Team and nutrition sections are unchanged. No live content change or rendering verified.
