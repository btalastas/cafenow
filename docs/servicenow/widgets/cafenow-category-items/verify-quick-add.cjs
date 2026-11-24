/* Local contract checks with ServiceNow API stubs. These are not instance tests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const server = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
const client = fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8');
new vm.Script(server, { filename: 'server.js' });
new vm.Script(client, { filename: 'client.js' });

const ids = { a: 'a'.repeat(32), b: 'b'.repeat(32), c: 'c'.repeat(32),
    menuA: '1'.repeat(32), menuB: '2'.repeat(32), vendorA: '3'.repeat(32),
    vendorB: '4'.repeat(32), catalog: '5'.repeat(32) };

function fixture(settings = {}) {
    const tables = {
        sc_cat_item: {
            [ids.a]: { sys_id: ids.a, sys_class_name: 'sc_cat_item', name: 'Pizza', active: '1', u_cafenow_menu_item: ids.menuA },
            [ids.b]: { sys_id: ids.b, sys_class_name: 'sc_cat_item', name: 'Coffee', active: '1', u_cafenow_menu_item: ids.menuB },
            [ids.c]: { sys_id: ids.c, sys_class_name: 'sc_cat_item', name: 'Unmapped', active: '1', u_cafenow_menu_item: '' }
        },
        x_1234_cafenow_menu: {
            [ids.menuA]: { sys_id: ids.menuA, vendor: ids.vendorA },
            [ids.menuB]: { sys_id: ids.menuB, vendor: ids.vendorB }
        },
        x_1234_cafenow_vendor: {
            [ids.vendorA]: { sys_id: ids.vendorA, active: '1' },
            [ids.vendorB]: { sys_id: ids.vendorB, active: '1' }
        },
        sc_cat_item_catalog: {
            first: { sc_cat_item: ids.a, sc_catalog: ids.catalog },
            second: { sc_cat_item: ids.b, sc_catalog: ids.catalog },
            third: { sc_cat_item: ids.c, sc_catalog: ids.catalog }
        }
    };
    const state = { cart: structuredClone(settings.cart || []), writes: [], messages: [] };
    if (settings.changeTables) settings.changeTables(tables);
    function cursor(rows) {
        let index = -1;
        return { next() { return ++index < rows.length; },
            getValue(field) { return rows[index][field] ?? null; } };
    }
    function GlideRecordSecure(table) {
        let row = null;
        let results = [], index = -1;
        const conditions = [];
        this.get = function(id) {
            row = settings.unreadable === id ? null : (tables[table] || {})[id];
            return !!row;
        };
        this.getValue = field => row && row[field] !== undefined ? row[field] : null;
        this.isValidField = field => !!row && Object.prototype.hasOwnProperty.call(row, field);
        this.addQuery = function(field, op, value) {
            conditions.push({ field, op: arguments.length === 2 ? '=' : op,
                value: arguments.length === 2 ? op : value });
        };
        this.query = function() {
            results = Object.values(tables[table] || {}).filter(record => conditions.every(condition =>
                condition.op === 'IN' ? String(condition.value).split(',').includes(record[condition.field]) :
                    record[condition.field] === condition.value));
        };
        this.next = function() { row = results[++index]; return !!row; };
    }
    function CartJS() {
        this.getCartItems = () => cursor(state.cart);
        this.addToCart = request => {
            if (settings.throwOnAdd) throw new Error('Native API unavailable');
            if (settings.nativeError) return { error: 'denied' };
            if (settings.noMutation) return { cart_id: 'default' };
            state.writes.push(structuredClone(request));
            state.cart.push({ cat_item: request.sysparm_id, quantity: request.sysparm_quantity });
            return { cart_id: 'default' };
        };
    }
    const context = {
        input: { action: 'cafenow_quick_add', item_id: settings.item || ids.a,
            quantity: settings.quantity === undefined ? 2 : settings.quantity,
            vendor: ids.vendorB, price: '0.01' },
        data: {}, options: {}, GlideRecordSecure,
        gs: {
            getUserName: () => settings.guest ? 'guest' : 'employee',
            getMessage: (message, args = []) => message.replace(/\{(\d+)\}/g, (_, i) => args[i]),
            error: message => state.messages.push(message)
        },
        $sp: {
            getCatalogs: () => ({ value: ids.catalog }),
            getCatalogItem: () => settings.noMetadata ? {} : ({ _fields: settings.fields || {}, can_order: true })
        },
        sn_sc: {
            CatItem: function(id) { this.canView = () => settings.denied !== id; },
            Catalog: function() { this.canView = () => !settings.catalogDenied; },
            CartJS
        }
    };
    vm.runInNewContext(server, context, { timeout: 1000 });
    return { state, result: context.data.quick_add };
}

let checks = 0;
function reject(settings) {
    const { state, result } = fixture(settings);
    assert.equal(result.success, false);
    assert.ok(result.message);
    assert.equal(state.writes.length, 0);
    checks++;
}

// Positive path: native cart receives the Catalog Item and quantity, never client price/vendor.
{
    const { state, result } = fixture({ fields: {
        vendor_ref: { name: 'vendor_ref', mandatory: true, value: '' },
        meal_option: { name: 'meal_option', mandatory: true, value: '' },
        special_instructions: { name: 'special_instructions', value: '' }
    } });
    assert.equal(result.success, true);
    assert.equal(state.writes[0].sysparm_id, ids.a);
    assert.equal(state.writes[0].sysparm_quantity, '2');
    assert.equal(state.writes[0].variables.vendor_ref, ids.vendorA);
    assert.equal(state.writes[0].variables.meal_option, ids.menuA);
    assert.equal(state.writes[0].price, undefined);
    checks++;
}
// Same-vendor additions and repeated items preserve the old cart's contents.
{
    const { state, result } = fixture({ cart: [{ cat_item: ids.a, quantity: '3' }] });
    assert.equal(result.success, true);
    assert.equal(state.cart.reduce((sum, row) => sum + Number(row.quantity), 0), 5);
    checks++;
}
for (const quantity of [0, -1, 1.5, 'bad', '', true, ['2'], 2147483648]) reject({ quantity });
reject({ guest: true });
reject({ item: 'invalid-id' });
reject({ changeTables: tables => { tables.sc_cat_item[ids.a].active = '0'; } });
reject({ changeTables: tables => { tables.x_1234_cafenow_menu[ids.menuA].available = '0'; } });
reject({ item: ids.c });
reject({ denied: ids.a });
reject({ unreadable: ids.menuA });
reject({ catalogDenied: true });
reject({ noMetadata: true });
reject({ cart: [{ cat_item: ids.b, quantity: '1' }] });
reject({ cart: [{ cat_item: ids.c, quantity: '1' }] });
reject({ changeTables: tables => { tables.x_1234_cafenow_vendor[ids.vendorA].active = '0'; } });
reject({ changeTables: tables => { tables.sc_cat_item[ids.a].no_cart = '1'; } });
reject({ changeTables: tables => { tables.sc_cat_item_catalog = {}; } });
reject({ fields: { allergies: { name: 'allergies', label: 'Allergies', mandatory: true, value: '' } } });
// Configured consent defaults are not accepted by a quick-add operation.
reject({ fields: { accept_terms: { name: 'accept_terms', type: 'boolean', mandatory: true, value: true } } });
reject({ fields: { pickup_window: { name: 'pickup_window', mandatory: true, value: 'old-window' } } });
reject({ nativeError: true });
reject({ noMutation: true });
reject({ throwOnAdd: true });

// Render the actual category branch with only documented scoped string methods.
// The previous GlideStringUtil.nil call fails in this environment, matching the instance error.
function renderFixture(noCategory, source = server) {
    let nilCalls = 0;
    const context = {
        input: undefined,
        data: {}, options: noCategory ? { use_popular_items_v2: 'true', popular_items_created: 6 } : {},
        gs: {
            nil(value) { nilCalls++; return value === undefined || value === null || value === ''; },
            getMessage: message => message,
            getProperty: (_, fallback) => fallback
        },
        GlideStringUtil: { isEligibleSysID: value => /^[0-9a-f]{32}$/i.test(value) },
        $sp: {
            getParameter: name => name === 'catalog_id' ? ids.catalog : (noCategory ? '' : ids.vendorA),
            getCatalogs: () => ({ value: ids.catalog, displayValue: 'CafeNow' }),
            showCatalogPrices: () => false,
            getWidget: () => ({ data: { items: [] } })
        },
        sn_sc: {
            Catalog: function() { this.canView = () => true; this.getTitle = () => 'CafeNow'; },
            CatCategory: function() {
                this.canView = () => true;
                this.getCatalog = () => ids.catalog;
                this.getTitle = () => 'Pizza Hut';
                this.getDescription = () => '';
                this.getParent = () => '';
            },
            CatalogSearch: function() {
                this.search = () => ({
                    addQuery() {}, addEncodedQuery() {}, chooseWindow() {},
                    orderBy() {}, query() {}, hasNext: () => false
                });
            }
        }
    };
    vm.runInNewContext(source, context, { timeout: 1000 });
    return { data: context.data, nilCalls };
}
{
    const rendered = renderFixture(false);
    assert.equal(rendered.data.category.title, 'Pizza Hut');
    assert.equal(rendered.data.error, '');
    assert.equal(rendered.nilCalls, 1);
    checks++;
    const landing = renderFixture(true);
    assert.equal(landing.data.show_popular_item, true);
    assert.equal(landing.nilCalls, 1);
    checks++;
    assert.throws(() => renderFixture(false, server.replace('gs.nil(data.category_id)', 'GlideStringUtil.nil(data.category_id)')),
        /GlideStringUtil.nil is not a function/);
    checks++;
}

// Client contract: no browser-side price/vendor, in-flight double clicks blocked, refresh on success only.
{
    const api = {};
    vm.runInNewContext(client, { api });
    let resolve, calls = 0, events = [];
    const pending = new Promise(done => { resolve = done; });
    const scope = {
        options: {}, data: {},
        server: { get(payload) { calls++; assert.equal(payload.quantity, 2); assert.equal(payload.price, undefined); return pending; } },
        $on: () => () => {}
    };
    const root = { $on: () => () => {}, $broadcast: name => events.push(name) };
    const preferences = { getPreference: (_, callback) => callback('card') };
    const timeout = () => {};
    api.controller(scope, {}, preferences, { sendLiveMessage() {} }, {}, root, {}, timeout, { navigator: {} });
    const event = { preventDefault() {}, stopPropagation() {} };
    scope.quickAdd(event, { sys_id: ids.a, cafenow_quantity: 2 });
    scope.quickAdd(event, { sys_id: ids.a, cafenow_quantity: 2 });
    assert.equal(calls, 1);
    resolve({ data: { quick_add: { success: true, message: 'Added' } } });
    setImmediate(() => {
        assert.deepEqual(events, ['$sp.service_catalog.cart.add_item', '$sp.service_catalog.cart.update']);
        assert.equal(scope.quickAddInFlight, false);
        checks++;
        console.log(`${checks} local quick-add contract checks passed; ServiceNow runtime not tested.`);
    });
}
