// Local authorization/validation mocks; not a substitute for ServiceNow ACL tests.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/server.js', 'utf8');
const ids = {user: '1'.repeat(32), group: '2'.repeat(32), vendor: '3'.repeat(32), item: '4'.repeat(32), other: '5'.repeat(32)};
function run(input, settings = {}) {
    const writes = [];
    const menu = {sys_id: ids.item, vendor: ids.vendor, item_name: 'Soup', description: 'Fresh soup',
        price: '8.50', active: '1', in_stock: '1', sys_mod_count: '2', number: 'MENU001', item_image: settings.image || ''};
    const rows = Array.from({length: settings.count || 1}, (_, i) => ({...menu, sys_id: i ? String(i).padStart(32, '0') : ids.item}));
    if (settings.foreign) rows[0].vendor = ids.other;
    const tables = {
        sys_user_grmember: settings.noGroup ? [] : [{user: ids.user, group: ids.group}],
        sys_user_group: [{sys_id: ids.group, active: '1', parent: ''}],
        x_1234_cafenow_vendor: [{sys_id: ids.vendor, vendor_group: ids.group, name: 'Vendor', active: '1'}],
        x_1234_cafenow_menu: rows
    };
    class Record {
        constructor(table) { this.table = table; this.filters = []; this.row = {}; this.matches = []; this.index = 0; }
        isValid() { return true; }
        isValidField(field) { return !(settings.noImageField && field === 'item_image'); }
        addQuery(field, op, value) { this.filters.push([field, value === undefined ? '=' : op, value === undefined ? op : value]); }
        orderBy() {}
        query() {
            this.matches = tables[this.table].filter(row => this.filters.every(([field, op, value]) =>
                op === 'IN' ? String(value).split(',').includes(row[field]) : String(row[field]) === String(value === true ? '1' : value)));
        }
        next() { this.row = this.matches[this.index++]; return !!this.row; }
        get(id) { this.row = tables[this.table].find(row => row.sys_id === id); return !!this.row; }
        initialize() { this.row = {}; }
        getValue(field) { return this.row[field] || ''; }
        getDisplayValue(field) { return this.getValue(field); }
        getUniqueValue() { return this.row.sys_id; }
        canRead() { return !settings.denyRead; }
        canWrite() { return !settings.denyWrite; }
        canCreate() { return !settings.denyCreate; }
        getElement(field) { return {canRead: () => settings.hidden !== field, canWrite: () => settings.readOnly !== field,
            getCurrencyValue: () => this.row[field], getCurrencyCode: () => 'USD'}; }
        setValue(field, value) { this.row[field] = value; }
        update() { writes.push({...this.row}); return settings.abort ? null : ids.item; }
        insert() { writes.push({...this.row}); return settings.abort ? null : ids.item; }
    }
    const roles = settings.staff ? 'x_1234_cafenow.vendor_staff' : settings.noRole ? '' : 'x_1234_cafenow.vendor_admin';
    const context = {input, data: {}, GlideRecord: Record, GlideRecordSecure: Record,
        gs: {getUserName: () => settings.guest ? 'guest' : 'vendor', getUserID: () => ids.user,
            getUser: () => ({getRoles: () => roles, hasRole: role => roles.includes(role)}),
            getMessage: text => text, error: () => {}}};
    vm.runInNewContext(source, context);
    return {data: context.data, writes};
}
const item = {sys_id: ids.item, vendor: ids.vendor, item_name: 'New soup', description: 'Daily soup',
    price: '9.25', active: true, in_stock: false, revision: '2'};
let checks = 0;
function check(name, callback) { callback(); checks++; process.stdout.write('PASS ' + name + '\n'); }
check('guest blocked', () => assert.equal(run({action: 'save', item}, {guest: true}).writes.length, 0));
check('non-vendor blocked', () => assert.equal(run({action: 'save', item}, {noRole: true}).data.authorized, false));
check('membership required', () => assert.equal(run({}, {noGroup: true}).data.authorized, false));
check('staff can view', () => assert.equal(run({}, {staff: true}).data.items.length, 1));
check('staff cannot save', () => assert.equal(run({action: 'save', item}, {staff: true}).writes.length, 0));
check('admin edits own menu', () => assert.equal(run({action: 'save', item}).data.saved, true));
check('currency encoded server side', () => assert.equal(run({action: 'save', item}).writes[0].price, 'USD;9.25'));
check('new own menu item', () => assert.equal(run({action: 'save', item: {...item, sys_id: ''}}).data.saved, true));
check('foreign record rejected', () => assert.equal(run({action: 'save', item}, {foreign: true}).writes.length, 0));
check('foreign create rejected', () => assert.equal(run({action: 'save', item: {...item, sys_id: '', vendor: ids.other}}).writes.length, 0));
check('vendor reassignment rejected', () => assert.equal(run({action: 'save', item: {...item, vendor: ids.other}}).writes.length, 0));
check('stale edit rejected', () => assert.equal(run({action: 'save', item: {...item, revision: '1'}}).writes.length, 0));
check('record write ACL honored', () => assert.equal(run({action: 'save', item}, {denyWrite: true}).writes.length, 0));
check('field write ACL honored', () => assert.equal(run({action: 'save', item}, {readOnly: 'price'}).writes.length, 0));
check('create ACL honored', () => assert.equal(run({action: 'save', item: {...item, sys_id: ''}}, {denyCreate: true}).writes.length, 0));
check('hidden field not returned', () => assert.equal(run({}, {hidden: 'description'}).data.items.length, 0));
check('negative price rejected', () => assert.equal(run({action: 'save', item: {...item, price: '-1'}}).writes.length, 0));
check('extra decimal rejected', () => assert.equal(run({action: 'save', item: {...item, price: '1.234'}}).writes.length, 0));
check('overlong description rejected', () => assert.equal(run({action: 'save', item: {...item, description: 'x'.repeat(501)}}).writes.length, 0));
check('string boolean rejected', () => assert.equal(run({action: 'save', item: {...item, active: 'false'}}).writes.length, 0));
check('unexpected fields ignored', () => assert.equal(run({action: 'save', item: {...item, sys_created_by: 'attacker'}}).writes[0].sys_created_by, undefined));
check('aborted save not reported successful', () => assert.equal(run({action: 'save', item}, {abort: true}).data.saved, false));
check('first page bounded', () => {const r = run({}, {count: 26}); assert.equal(r.data.items.length, 25); assert.equal(r.data.has_more, true);});
check('second page reachable', () => {const r = run({page: 2}, {count: 26}); assert.equal(r.data.items.length, 1); assert.equal(r.data.has_more, false);});
check('unknown action rejected', () => assert.equal(run({action: 'delete', item}).writes.length, 0));
check('existing image uses same-instance route', () => assert.equal(run({}, {image: ids.other}).data.items[0].image_url, '/' + ids.other + '.iix'));
check('empty image omitted', () => assert.equal(run({}).data.items[0].image_url, ''));
check('denied image field omitted without hiding item', () => assert.equal(run({}, {image: ids.other, hidden: 'item_image'}).data.items[0].image_url, ''));
check('absent image field supported', () => assert.equal(run({}, {noImageField: true}).data.items[0].image_url, ''));
check('malformed image reference omitted', () => assert.equal(run({}, {image: 'https://example.com/image.png'}).data.items[0].image_url, ''));
check('client image payload cannot replace stored image', () => assert.equal(run({action: 'save', item: {...item, item_image: ids.other, image_url: '/fake.iix'}}).writes[0].item_image, ''));
new vm.Script(fs.readFileSync(__dirname + '/client.js', 'utf8'));
console.log(checks + ' mocked server checks passed; client syntax parsed.');
