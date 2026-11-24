const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/server.js', 'utf8');
new vm.Script(fs.readFileSync(__dirname + '/client.js', 'utf8'));
function run(rows, settings = {}) {
  let queried = false;
  const filters = [];
  function Record(table) {
    assert.equal(table, 'x_1234_cafenow_order');
    let index = -1;
    this.isValid = () => !settings.invalid;
    this.isValidField = () => true;
    this.addQuery = (...args) => filters.push(args);
    this.orderByDesc = () => {};
    this.setLimit = n => assert.equal(n, (settings.expectedLimit || 5) + 1);
    this.query = () => { queried = true; if (settings.fail) throw Error('failure'); };
    this.next = () => ++index < rows.length;
    this.canRead = () => rows[index].read !== false;
    this.getElement = field => ({canRead: () => !(rows[index].hidden || []).includes(field)});
    this.getValue = field => rows[index][field];
    this.getDisplayValue = field => rows[index][field];
    this.getUniqueValue = () => String(index);
  }
  const ctx = {data: {}, options: settings.options || {}, input: {user_id:'B', table:'sc_request', max_orders:50}, GlideRecordSecure: Record,
    gs: {getUserName: () => settings.guest ? 'guest' : 'employee', getUserID: () => 'A', getMessage: s => s, error: () => {}}};
  vm.runInNewContext(source, ctx);
  return {data:ctx.data, queried, filters};
}
const row = (state = '-5', extra = {}) => ({opened_by:'A', number:'ORDER1', state, vendor:'Vendor', ...extra});
let result = run([row(), row('1'), row('2'), row('3'), row('4'), row('-5', {opened_by:'B'}), row('-5', {read:false})]);
assert.equal(result.data.orders.length, 3);
assert.deepEqual(result.filters, [['opened_by','A'], ['state','IN','-5,1,2']]);
assert.equal(run([row()], {guest:true}).queried, false);
assert.equal(run([], {invalid:true}).data.error.length > 0, true);
assert.equal(run([row('-5', {hidden:['state']})]).data.orders.length, 0);
assert.equal(run([row('-5', {hidden:['vendor']})]).data.orders[0].vendor, '');
result = run(Array.from({length:21}, () => row()));
assert.equal(result.data.orders.length, 5);
assert.equal(result.data.has_more, true);
assert.equal(run([], {options:{max_orders:1000}, expectedLimit:50}).data.limit, 50);
assert.equal(run([], {options:{max_orders:'bad'}}).data.limit, 5);
assert.equal(run([], {options:{max_orders:0}}).data.limit, 5);
assert.equal(run([], {options:{max_orders:3}, expectedLimit:3}).data.limit, 3);
assert.equal(run([row()]).data.orders[0].url, '?id=cafenow_order_details&table=x_1234_cafenow_order&sys_id=0');
assert.equal(run([]).data.all_orders_url, '?id=cafenow_my_orders');
assert.equal(run([], {fail:true}).data.error.length > 0, true);
assert.equal(run([]).data.orders.length, 0);
console.log('Passed server ownership/state/ACL/guest/error/limit checks; client syntax parsed. Mock APIs only.');
