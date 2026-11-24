const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync(__dirname + '/server.js', 'utf8');
const base = 'a'.repeat(32);
const labels = ['Administration', 'Employee Help', 'Menu Management', 'Ordering and Payments', 'Troubleshooting', 'Vendor Operations'];
const records = labels.map((label, i) => ({label, sys_id: String(i+1).repeat(32), parent_id: base, parent_table: 'kb_knowledge_base', active: '1'}));
function run(roles, settings = {}) {
    const calls = [];
    function Secure() {
        this.filters = []; this.rows = []; this.index = -1;
        this.addQuery = (key, value) => this.filters.push([key, String(value)]);
        this.setLimit = limit => { this.limit = limit; };
        this.query = () => { calls.push(this.filters); this.rows = (settings.records || records).filter(row => this.filters.every(([k,v]) => String(row[k]) === (v === 'true' ? '1' : v))).slice(0,this.limit); };
        this.next = () => ++this.index < this.rows.length;
        this.canRead = () => !this.rows[this.index].deny;
        this.getElement = field => ({canRead: () => this.rows[this.index].deniedField !== field});
        this.getUniqueValue = () => this.rows[this.index].sys_id;
        this.getValue = field => this.rows[this.index][field];
    }
    const full = roles.map(role => 'x_1234_cafenow.' + role);
    const context = {data: {}, options: {kb_knowledge_base: settings.base === undefined ? base : settings.base},
        gs: {getUserName: () => settings.guest ? 'guest' : 'tester', getUser: () => ({getRoles: () => full.join(','), hasRole: role => settings.platformAdmin || full.includes(role)})},
        GlideRecordSecure: Secure};
    vm.runInNewContext(source,context);
    return {data: context.data, calls};
}
const visible = (roles,settings) => Array.from(run(roles,settings).data.categories, c => c.label);
assert.deepStrictEqual(visible(['user']), ['Employee Help','Ordering and Payments','Troubleshooting']);
for (const vendor of ['vendor_admin','vendor_staff']) assert.deepStrictEqual(visible([vendor]), ['Menu Management','Troubleshooting','Vendor Operations']);
assert.deepStrictEqual(visible(['facility_manager']), ['Administration','Troubleshooting']);
assert.deepStrictEqual(visible(['admin']), labels);
assert.deepStrictEqual(visible(['user','vendor_staff']), labels.filter(l => l !== 'Administration'));
for (const settings of [{}, {guest:true}, {platformAdmin:true}]) assert.strictEqual(run([],settings).calls.length,0);
assert.strictEqual(run(['admin'],{guest:true}).data.authorized,false);
assert.strictEqual(run(['user'],{base:''}).data.ready,false);
assert.strictEqual(run(['user'],{base:'not-a-sys-id'}).calls.length,0);
assert.deepStrictEqual(visible(['user'],{records: records.map(r => ({...r,deny:true}))}),[]);
assert.deepStrictEqual(visible(['user'],{records: records.map(r => ({...r,deniedField:'label'}))}),[]);
assert.deepStrictEqual(visible(['user'],{records: records.map(r => ({...r,parent_id:'b'.repeat(32)}))}),[]);
assert.deepStrictEqual(visible(['user'],{records: records.map(r => ({...r,parent_table:'kb_category'}))}),[]);
assert.deepStrictEqual(visible(['user'],{records: records.map(r => ({...r,active:'0'}))}),[]);
assert.deepStrictEqual(visible(['admin'],{records: [...records,{...records[0],sys_id:'f'.repeat(32)}]}), labels.slice(1));
const employee = run(['user']);
assert.strictEqual(employee.calls.length,3);
assert(!JSON.stringify(employee.data).includes('Administration'));
assert(employee.data.categories[0].url.includes('kb_category='));
JSON.parse(fs.readFileSync(__dirname + '/option-schema.json','utf8'));
console.log('PASS: role matrix, multi-role union, guest/no-role/platform-admin isolation, setup gate, category ACL/field filtering, base/root/active isolation, duplicates, filtered payload, links and option JSON.');
