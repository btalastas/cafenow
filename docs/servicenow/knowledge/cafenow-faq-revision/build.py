"""Build reviewable replacement article bodies from retained export references.

No instance calls or changes to original exports. Run from the project root.
"""
from pathlib import Path
import hashlib
import difflib
from html.parser import HTMLParser
import html
import json
import re
import xml.etree.ElementTree as ET

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[3]

def p(text):
    return '<p>' + html.escape(text) + '</p>'

def steps(items):
    return '<ol>' + ''.join('<li>' + html.escape(item) + '</li>' for item in items) + '</ol>'

def heading(text):
    return '<h2>' + html.escape(text) + '</h2>'

def link(url, label):
    return '<p><a href="' + html.escape(url, quote=True) + '">' + html.escape(label) + '</a></p>'

# Source titles identify retained article references, not exported article bodies.
# category is the proposed destination; the exports do not supply article category fields.
CONTENT = {
 'Register and Access CafeNow': ('register-and-access', 'Employee Help',
    p('CafeNow by NowServing Solutions connects employees and cafeteria vendors through the workplace Service Portal.') +
    steps(['Use the CafeNow portal address supplied by your organization or instructor.',
           'Sign in with your assigned account using the configured sign-in method.',
           'Open the menu to browse vendors. Your assigned roles determine which employee, vendor and administration tools are available.',
           'If access is missing, ask the CafeNow administrator to check your account, role and group assignments.']) +
    p('An account does not automatically grant vendor or administration access. Contact the administrator for account provisioning; do not assume self-registration or a particular approval process is available.') +
    p('Do not share login credentials. If sign-in fails, verify your username and use your organization\'s approved password-assistance process. Ask the administrator to check whether the account is active or locked.')),
 'Getting Started with CafeNow': ('getting-started', 'Employee Help',
    p('Use CafeNow to select food from one vendor, choose a pickup window, and track your order.') +
    steps(['Browse the available vendors and menu items.', 'Add foods and quantities from one vendor to your cart.',
           'Review prices, select the vendor pickup window and read the terms before submitting.',
           'After successful submission, keep the order number and check My Orders.',
           'Collect the order when it is Ready for Pickup during the selected window.']) +
    p('The class pilot uses simulated checkout. No payment is collected through this ordering journey.') +
    link('/cafe?id=cafe_menu', 'Browse menus') + link('/cafe?id=cafenow_my_orders', 'My Orders') +
    link('/cafe?id=cafenow_about', 'About CafeNow and NowServing Solutions')),
 'Browse Food Vendors and Menus': ('browse-vendors-and-menus', 'Employee Help',
    steps(['Open Menu in the CafeNow portal.', 'Choose a vendor and review its available menu items.',
           'Review the item description, price and any vendor-provided ingredient, nutrition or allergen information.',
           'Choose the quantity and add the item to your cart. Keep one vendor per order.']) +
    p('Availability and prices may change before checkout. If an item is unavailable, choose an alternative or ask the vendor. Missing nutrition or allergen details do not mean an item is safe for a particular allergy.') +
    link('/cafe?id=cafe_menu', 'Browse menus') + link('/cafe?id=cafenow_about&section=nutrition', 'Nutrition & Allergen information')),
 'How to Add Items to Your Shopping Cart': ('add-items-to-cart', 'Ordering and Payments',
    steps(['Open a vendor menu.', 'Select a whole-number quantity for an available item and add it to the cart.',
           'Add other foods from that same vendor.', 'Open the full cart to review quantities, unit prices, item subtotals and the order total.',
           'Adjust or remove items before choosing a pickup window and submitting.']) +
    p('Each order is limited to one vendor. Finish or clear the current cart before ordering from another vendor. Adding food to the cart does not place an order or guarantee availability.') +
    link('/cafe?id=cafenow_cart', 'Open cart')),
 'How to Place a Food Order': ('place-food-order', 'Ordering and Payments',
    steps(['Browse a vendor menu and add available foods and quantities to your cart.',
           'Open the cart and review the foods, quantities, prices and total.',
           'Select an available pickup window for that vendor.',
           'Read and accept the terms. Ordering policy closes ordering 20 minutes before the window starts; for an 11:30 AM window, order before 11:10 AM.',
           'Select Place Order once and wait for the result.',
           'After success, note the order number and open My Orders to check the order and its items.']) +
    p('One checkout creates one CafeNow Order containing its Order Lines. The current journey does not require separate Service Catalog requests or RITMs.') +
    p('The pilot does not collect payment. If checkout times out or the result is uncertain, check My Orders before trying again and ask support to review any unclear result. Repeated submissions can create duplicate orders.') +
    link('/cafe?id=cafenow_cart', 'Open cart') + link('/cafe?id=cafenow_my_orders', 'Check My Orders')),
 'How to Select a Pickup Time': ('select-pickup-time', 'Ordering and Payments',
    steps(['Add food from one vendor and open the full cart.', 'Choose one pickup window offered for that vendor.',
           'Review the selected window and the ordering terms before placing the order.',
           'Check the saved pickup details in My Orders and collect during the selected window when the order is Ready for Pickup.']) +
    p('Ordering policy closes ordering 20 minutes before the pickup-window start. For example, an 11:30 AM start has an 11:10 AM ordering cutoff. Plan to submit before the cutoff.') +
    p('A visible window is not a capacity reservation. If the desired window is unavailable, select another offered window or contact the vendor. Do not assume that a recurring time-window label independently confirms a service date; ask the vendor if the date is unclear.')),
 'How to Track Your Food Order': ('track-food-order', 'Employee Help',
    steps(['Open My Orders in the CafeNow portal.', 'Find your order by its order number and open its details.',
           'Review the vendor, items, pickup details and current status.', 'Refresh the page or use Refresh status where shown to obtain the latest saved status.']) +
    heading('Order statuses') +
    p('Submitted: the order has been recorded and awaits vendor acknowledgement. Confirmed: the vendor has acknowledged the order. Ready for Pickup: the order is ready to collect. Closed Complete: the order was collected. Canceled: the order was canceled.') +
    p('Status refresh is manual in the prepared employee views. Check My Orders rather than relying on automatic email or real-time updates. If the order is late, contact the vendor with your order number.') +
    link('/cafe?id=cafenow_my_orders', 'Open My Orders')),
 'How to Cancel an Order': ('cancel-order', 'Ordering and Payments',
    p('Cancellation policy applies to your own orders and closes 20 minutes before the pickup-window start. Eligible order states and exact cutoff-boundary behavior must be confirmed with the vendor or CafeNow administrator.') +
    steps(['Open My Orders and identify the order and its pickup window.',
           'Check whether the portal provides an authorized cancellation action for this order.',
           'If no cancellation action is available, contact the vendor or support promptly with the order number; do not assume a support request automatically cancels the order.',
           'Confirm the order actually shows Canceled before treating the cancellation as complete.']) +
    p('Employees cannot use status fields to advance vendor fulfillment. The pilot has no payment/refund processing. Contacting support after the cutoff does not guarantee cancellation.') +
    link('/cafe?id=cafenow_my_orders', 'My Orders') + link('/cafe?id=cafenow_support', 'Contact CafeNow support')),
 'How to Submit Feedback or Report an Issue': ('submit-feedback-or-issue', 'Troubleshooting',
    steps(['For a question about a food item, ingredients or pickup, contact the responsible vendor.',
           'For an order or portal issue, open Complaints and Requests when available to your role.',
           'Select the submission type and category. Provide a clear summary and details, including the vendor and order number when relevant.',
           'Submit once and check the confirmation or error message. If access is denied, ask the CafeNow administrator to review it.']) +
    p('Do not include passwords, payment details or unnecessary personal information. Reported issues do not automatically cancel an order, issue a refund or prove a notification was delivered.') +
    p('For urgent food allergy or food-safety concerns, contact the responsible vendor directly rather than relying on a feedback submission.') +
    p('The prepared support form is enabled for CafeNow requesters. Vendor-only submission remains pending setup; vendor staff should use their agreed administrator/support contact if the form is not available.') +
    link('/cafe?id=cafenow_support', 'Complaints and Requests')),
 'Understanding Food Allergens and Nutrition': ('allergens-and-nutrition', 'Employee Help',
    p('Nutrition, ingredient and allergen information is supplied by vendors where available. CafeNow does not independently verify food safety and cannot guarantee an item is allergen-free.') +
    steps(['Review the available information for the food item before ordering.',
           'Confirm ingredients, substitutions and possible cross-contact directly with the vendor.',
           'Ask about shared utensils, equipment and preparation areas.',
           'If the vendor cannot confirm the information you need, do not assume the item meets your dietary requirements.',
           'Report missing or incorrect information to the vendor and CafeNow support.']) +
    p('Common ingredients and allergens to ask about include milk, eggs, wheat and gluten-containing ingredients, peanuts, tree nuts, soy, sesame, fish, shellfish and mustard. This is not an exhaustive list.') +
    p('Nutrition values are estimates and may vary with portion size, recipe and preparation. Missing information is not a safety assurance.') +
    link('/cafe?id=cafenow_about&section=nutrition', 'Read Nutrition & Allergen information')),
 'Vendor Portal \u2013 Getting Started': ('vendor-getting-started', 'Vendor Operations',
    p('CafeNow vendor tools are intended for assigned vendor administrators and vendor staff. Access must remain limited to the vendor records associated with your authorized vendor group.') +
    steps(['Sign in using your assigned vendor account.', 'Open the vendor tools available in your CafeNow portal.',
           'Review incoming orders and their pickup windows.', 'Open an order to review all items, quantities and any available instructions.',
           'Confirm eligible orders, mark them Ready for Pickup when ready, and complete them only after collection.',
           'Use menu maintenance according to your role: vendor administrators can maintain menu items in the prepared widget; vendor staff have read-only menu access.']) +
    p('If no vendor is found or another vendor\'s records appear, contact the administrator. Do not work around access restrictions or use an employee account to process vendor orders.')),
 'How to Accept and Manage Incoming Orders': ('accept-incoming-orders', 'Vendor Operations',
    steps(['Open the vendor order queue and choose the relevant pickup window.',
           'Review each order and its items before acknowledging it.', 'Confirm eligible Submitted orders using the authorized vendor action.',
           'If batch confirmation is available, review which orders succeeded, were skipped or failed; do not assume every selected order changed.',
           'Refresh the queue to see current saved states, especially after another vendor user changes an order.']) +
    p('Act only on your own vendor\'s orders. Do not confirm an order that is already canceled, and do not repeatedly apply an action because the screen has not refreshed.') +
    p('The planned capacity is 20 orders per vendor pickup window, not 20 meals. The simplified ordering service has not established simultaneous-booking protection; administrators must verify capacity enforcement before relying on that limit.') +
    p('If food cannot be supplied, follow the agreed vendor exception process and record a reason for any authorized vendor cancellation. Do not invent a replacement state or mark an uncollected order complete.')),
 'How to Update Order Preparation Status': ('update-order-status', 'Vendor Operations',
    heading('Recorded lifecycle') + p('Submitted -> Confirmed -> Ready for Pickup -> Closed Complete. Canceled is a separate outcome. Preparing and Delayed are not additional approved normal state labels in the recorded mapping.') +
    steps(['Open an order belonging to your vendor and review its current saved status.',
           'Confirm an eligible Submitted order when acknowledging receipt and availability.',
           'Set Ready for Pickup only when the food is ready to collect.',
           'Set Closed Complete only after the customer actually collects the order.',
           'Refresh and check that the intended status was saved.']) +
    p('Use authorized actions only. If an action is unavailable, an order is canceled or the state changes unexpectedly, stop and ask the administrator to review it. Record delays through the agreed delay process rather than inventing a new state. Automatic reminders and disposal scheduling must not be assumed to be active.') +
    p('An uncollected order is not Closed Complete. Ask the manager how to handle no-shows under the agreed policy.')),
 'How to Manage Menu Items and Availability': ('manage-menu', 'Menu Management',
    p('Vendor administrators maintain menu items for their own vendor. Vendor staff have read-only access in the prepared menu widget.') +
    steps(['Sign in with the assigned vendor administrator account and open menu maintenance.',
           'Choose an existing item to edit, or use Add when authorized.',
           'Review the name, description, price, category, availability and any ingredient or dietary details.',
           'Save and verify the saved values. Check the employee menu using an authorized test account.',
           'If a picture already exists, confirm it displays. The prepared vendor widget displays existing images; it does not supply image upload.']) +
    p('Keep allergen and nutrition information accurate and current. Check it against actual recipes, ingredient substitutions and supplier information. Missing details must not be described as allergen-free. Availability changes can affect food already in an employee\'s cart; checkout rechecks current availability and prices.') +
    p('Do not edit another vendor\'s items. If authorized Add/Edit controls are missing or saving fails, ask the administrator to check role, group and field permissions.')),
 'CafeNow Administrator \u2013 Management Guide': ('administrator-guide', 'Administration',
    p('CafeNow by NowServing Solutions is a one-building, multi-vendor class pilot. Facility managers handle the business-administration information authorized for them; CafeNow administrators manage the application within their granted permissions. Business roles do not automatically grant platform administration.') +
    heading('Access and knowledge') +
    p('Employees use the CafeNow user role; vendors use vendor admin/staff roles; facility managers use the facility manager role. CafeNow admins see all FAQ categories. Multiple personas combine visible categories. Apply knowledge-base and article user criteria separately: hiding a category does not protect direct article links, search results or attachments.') +
    heading('Ordering and operations') +
    p('The current path is Vendor/Menu -> custom cart and pickup selection -> one authoritative CafeNow Order with Order Lines. Do not create a second fulfillment authority from historical Catalog Item/Request/RITM examples. Payments and refunds remain outside this pilot.') +
    p('Recorded states are Submitted, Confirmed, Ready for Pickup, Closed Complete and Canceled. Closed Complete means actual pickup. Ordering policy is 20 minutes before window start; cancellation policy is also 20 minutes, with eligible states and exact-boundary behavior still to confirm.') +
    heading('Verification priorities') +
    steps(['Verify employee ownership and vendor isolation through portal pages, native records, direct URLs and APIs.',
           'Verify server-side cutoff, capacity and duplicate-submission handling before treating these as enforced. The simplified local checkout does not enforce cutoff or capacity and has no durable duplicate-request identity.',
           'Reconcile orders, lines and totals after failures or uncertain responses before advising a resubmission.',
           'Check saved state transitions and actual notification/email records. Prepared reminder text is not proof of automated delivery.',
           'Verify requester complaint submission and vendor support routing independently; vendor-only complaint submission remains pending configuration.',
           'Verify the FAQ/About pages, header/footer links and any fixed-footer clearance as each persona.']) +
    p('The three-notice no-show direction has unresolved scheduling details. Do not infer a disposal time or automatically complete uncollected orders. Keep credentials out of project files and record evidence and unresolved issues in the agreed project tracking locations.'))
}

class BodyText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        if tag in ('style', 'script'):
            self.hidden += 1
        if tag in ('p', 'li', 'h1', 'h2', 'h3', 'br'):
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in ('style', 'script'):
            self.hidden -= 1

    def handle_data(self, text):
        if not self.hidden:
            self.parts.append(text)

def plain(body):
    parser = BodyText()
    parser.feed(body)
    return '\n'.join(line.strip() for line in ''.join(parser.parts).splitlines() if line.strip())

def build():
    references = {}
    counts = {}
    hashes = {}
    base_references = []
    actual_articles = {}
    for source in sorted((ROOT / 'exports').glob('*.xml')):
        raw = source.read_bytes()
        hashes[source.name] = hashlib.sha256(raw).hexdigest()
        counts[source.name] = 0
        if source.name.startswith('kb_knowledge'):
            direct = ET.fromstring(raw)
            for article in direct.findall('kb_knowledge'):
                counts[source.name] += 1
                article_id = article.findtext('sys_id')
                assert article_id not in actual_articles, 'Multiple exported revisions need explicit selection'
                actual_articles[article_id] = (article, source.name)
        for payload in re.findall(r'<payload><!\[CDATA\[(.*?)\]\]></payload>', raw.decode('utf-8'), re.S):
            tree = ET.fromstring(payload)
            for record in tree:
                if record.tag == 'kb_knowledge':
                    counts[source.name] += 1
                if record.tag == 'kb_uc_can_read_mtom' and record.get('action') != 'DELETE':
                    field = record.find('kb_knowledge_base')
                    if field is not None and field.get('display_value') == 'CafeNow':
                        base_references.append({'source': source.name, 'sys_id': field.text})
                if record.tag != 'sp_rectangle_menu_item' or record.get('action') == 'DELETE':
                    continue
                article_id = record.findtext('kb_article')
                if not article_id:
                    continue
                item = {
                    'source': source.name, 'article_sys_id': article_id,
                    'exported_menu_label': record.findtext('label'),
                    'menu_item_sys_id': record.findtext('sys_id'),
                    'menu_updated_on': record.findtext('sys_updated_on'),
                    'article_display_value': record.find('kb_article').get('display_value')
                }
                references.setdefault(article_id, []).append(item)
    assert len(references) == 15, 'Unexpected reference inventory; review before rebuilding'
    assert len(actual_articles) == 15, 'Expected 15 reviewed article bodies; review a changed inventory'
    assert set(actual_articles) == set(references), 'Direct export and menu references do not match'
    manifest = []
    diffs = []
    findings = []
    for article_id, refs in references.items():
        latest = max(refs, key=lambda item: item['menu_updated_on'] or '')
        title = latest['exported_menu_label']
        slug, category, body = CONTENT[title]
        article, body_source = actual_articles[article_id]
        original_body = article.findtext('text') or ''
        assert original_body.strip(), 'Empty exported article body'
        exported_category = article.find('kb_category')
        current_category = exported_category.get('display_value')
        # Preserve observed assignment rather than silently moving the tracking article.
        category = current_category
        filename = 'articles/' + slug + '.html'
        (OUT / filename).write_text('<!-- Replacement article body; paste into the existing article HTML field. -->\n' + body + '\n', encoding='utf-8')
        manifest.append({
            'article_sys_id_from_menu_reference': article_id,
            'exported_menu_label': title,
            'proposed_short_description': title.replace('\u2013', '-'),
            'proposed_category': category,
            'body_file': filename,
            'current_body_available': True,
            'current_article_category_available': True,
            'body_source': body_source,
            'number': article.findtext('number'),
            'exported_short_description': article.findtext('short_description'),
            'exported_workflow_state': article.findtext('workflow_state'),
            'exported_version_reference': article.findtext('version'),
            'exported_category': current_category,
            'exported_category_sys_id': exported_category.text,
            'exported_knowledge_base_sys_id': article.findtext('kb_knowledge_base'),
            'exported_body_sha256': hashlib.sha256(original_body.encode('utf-8')).hexdigest(),
            'references': refs,
            'review_notes': 'Verify the live article identity, current revision, audience, category and all UI steps before updating. No publication or migration is performed.'
        })
        diffs.extend(difflib.unified_diff(plain(original_body).splitlines(), plain(body).splitlines(),
                     fromfile=article.findtext('number') + '-exported', tofile=filename, lineterm=''))
        flags = []
        original_text = plain(original_body)
        if 'example.com' in original_text:
            flags.append('Replace placeholder support email with current support route/contact guidance.')
        if any(word in original_text for word in ('Accepted', 'Preparing', 'Rejected', 'Cancelled', 'Completed')):
            flags.append('Align status/action wording with the recorded lifecycle; do not imply unsupported controls.')
        if 'notif' in original_text.lower():
            flags.append('Remove unverified notification delivery/readiness dependence; direct readers to saved order status.')
        if slug == 'add-items-to-cart':
            flags.append('Correct copied allergen overview to cart instructions.')
        flags.append('Remove editor-specific styles/empty layout rows; retain useful topic guidance and update current routes/limits.')
        findings.append((article.findtext('number'), title, current_category, flags))
    manifest.sort(key=lambda item: item['body_file'])
    result = {'status': 'prepared_replacement_content_not_installed', 'source_sha256': hashes,
              'exported_kb_knowledge_record_counts': counts,
              'knowledge_base_references_not_live_verified': base_references, 'articles': manifest}
    (OUT / 'manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'BODY-CHANGES.diff').write_text('\n'.join(diffs) + '\n', encoding='utf-8')
    review = ['# Article body review', '', 'Compared all 15 supplied article bodies with the replacement HTML. Exported Published states are observations in the file, not verified current live publication. Existing categories are preserved.', '']
    for number, title, category, flags in sorted(findings):
        review.extend(['## ' + number + ' - ' + title, '', 'Existing category: ' + category + '.', ''])
        review.extend('- ' + flag for flag in flags)
        review.append('')
    (OUT / 'BODY-REVIEW.md').write_text('\n'.join(review) + '\n', encoding='utf-8')
    rows = ['# CafeNow FAQ article revision inventory', '',
            'Compared against 15 directly exported article bodies. Existing categories are preserved. See BODY-REVIEW.md and BODY-CHANGES.diff for the review.', '',
            '| Article number | Exported menu label | Existing category | Replacement body |', '| --- | --- | --- | --- |']
    for item in manifest:
        rows.append('| ' + item['number'] + ' | ' + item['exported_menu_label'] + ' | ' + item['proposed_category'] + ' | [HTML](' + item['body_file'] + ') |')
    (OUT / 'ARTICLE-INVENTORY.md').write_text('\n'.join(rows) + '\n', encoding='utf-8')
    print('Prepared 15 replacement HTML bodies, manifest and article inventory. Original exports unchanged.')

if __name__ == '__main__':
    build()
