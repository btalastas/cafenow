// Local authorization/paging checks; not a substitute for live ServiceNow ACL tests.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/server.js', 'utf8');
const id = n => n.toString(16).padStart(32, '0');
const orders = Array.from({length: 26}, (_, i) => ({sys_id:id(i+1), opened_by:'employee-a',
  number:'ORD'+String(i+1).padStart(7,'0'), state:'3', active:'0', vendor:'Cafe', order_total:'USD;10', sys_created_on:String(i).padStart(3,'0')}));
orders.push({sys_id:id(90),opened_by:'employee-b',number:'PRIVATE',state:'2',active:'1'});
const lines = [{sys_id:id(100),order:id(1),item_name:'Meal',quantity:'1',unit_price:'USD;10',line_price:'USD;10'},
  {sys_id:id(101),order:id(90),item_name:'PRIVATE MEAL',quantity:'1',unit_price:'USD;10',line_price:'USD;10'}];
function run(view, input={}, config={}) {
  let queries=0;
  class Record {
    constructor(table) { this.rows=table.endsWith('_line')?lines:orders; this.filters=[];this.sort=[];this.i=-1;queries++; }
    isValidField(f) { return f!=='submission_status'; }
    getElement(f) { return {canRead:()=>!(config.denied||[]).includes(f)}; }
    canRead() { return this.row && this.row.sys_id!==config.hidden; }
    getValue(f) { return this.row[f] || ''; }
    getDisplayValue(f) { return this.getValue(f); }
    getUniqueValue() { return this.row.sys_id; }
    get(key) { this.row=this.rows.find(r=>r.sys_id===key);return !!this.row; }
    addQuery(f,op,v) { if(v===undefined){v=op;op='=';} this.filters.push(r=>op==='CONTAINS'?String(r[f]||'').includes(v):op==='IN'?v.split(',').includes(r[f]):typeof v==='boolean'?r[f]===(v?'1':'0'):r[f]===v); }
    orderBy(f) {this.sort.push([f,1]);}
    orderByDesc(f) {this.sort.push([f,-1]);}
    query() {this.results=this.rows.filter(r=>this.filters.every(fn=>fn(r))).sort((a,b)=>{
      for(const [f,d] of this.sort){if(a[f]!==b[f])return a[f]>b[f]?d:-d;}return 0;});}
    next() {this.row=this.results[++this.i];return !!this.row;}
  }
  const context={options:{view},input,data:{},GlideRecordSecure:Record,
    gs:{getUserName:()=>config.guest?'guest':'a',getUserID:()=>'employee-a',error:()=>{}},
    $sp:{getParameter:()=>config.urlId||''}};
  vm.runInNewContext(source, context);
  return {data:context.data,queries};
}
let checks=0;
function test(name, fn){fn();checks++;console.log('PASS '+name);}
test('guest performs no queries',()=>assert.equal(run('all',{}, {guest:true}).queries,0));
test('recent list bounded to five own orders',()=>{const d=run('recent').data;assert.equal(d.orders.length,5);assert(d.has_more);assert(d.orders.every(r=>r.number!=='PRIVATE'));});
test('all history includes inactive completed orders',()=>assert.equal(run('all').data.orders.length,20));
test('unconfigured instance defaults to all orders',()=>{const d=run(undefined).data;assert.equal(d.view,'all');assert.equal(d.orders.length,20);});
test('invalid instance view defaults to all orders',()=>assert.equal(run('invalid').data.view,'all'));
test('page two exposes remaining six',()=>{const d=run('all',{page:2}).data;assert.equal(d.orders.length,6);assert.equal(d.has_more,false);});
test('paging has no duplicates',()=>{const a=run('all').data.orders,b=run('all',{page:2}).data.orders;assert(!b.some(r=>a.some(q=>q.sys_id===r.sys_id)));});
test('owner input cannot change authorization',()=>assert.equal(run('all',{opened_by:'employee-b',search:'PRIVATE'}).data.orders.length,0));
test('direct URL to another owner denied',()=>assert(run('details',{}, {urlId:id(90)}).data.error));
test('forged details input denied',()=>assert(run('details',{order_id:id(90)}).data.error));
test('malformed identifier denied',()=>assert(run('details',{order_id:'bad^ORopened_by=employee-b'}).data.error));
test('own detail includes only own parent lines',()=>{const d=run('details',{order_id:id(1)}).data;assert(d.order);assert.equal(d.lines.length,1);assert.equal(d.lines[0].name,'Meal');});
test('record ACL denial denies detail',()=>assert(run('details',{order_id:id(1)},{hidden:id(1)}).data.error));
test('number field ACL denial hides record',()=>assert.equal(run('all',{}, {denied:['number']}).data.orders.length,0));
test('optional total field ACL denial redacts value',()=>assert.equal(run('all',{}, {denied:['order_total']}).data.orders[0].total,''));
test('line price field ACL denial hides line',()=>assert.equal(run('details',{order_id:id(1)},{denied:['line_price']}).data.lines.length,0));
test('invalid page normalizes to one',()=>assert.equal(run('all',{page:-1}).data.page,1));
test('search string is not an encoded query',()=>assert.equal(run('all',{search:'^ORopened_by=employee-b'}).data.orders.length,0));
test('inactive submitted parent remains hidden',()=>{orders.push({sys_id:id(99),opened_by:'employee-a',number:'PARTIAL',state:'-5',active:'0'});assert.equal(run('all',{search:'PARTIAL'}).data.orders.length,0);});
new vm.Script(fs.readFileSync(__dirname+'/client.js','utf8'));
test('open view excludes completed canceled inactive and other owners',()=>{
  orders.push({sys_id:id(110),opened_by:'employee-a',number:'OPEN',state:'2',active:'1'});
  orders.push({sys_id:id(111),opened_by:'employee-a',number:'CANCELED',state:'4',active:'1'});
  const d=run('open').data;assert.equal(d.orders.length,1);assert.equal(d.orders[0].number,'OPEN');
});
test('open view refresh returns updated state',()=>{
  orders.find(r=>r.number==='OPEN').state='3';
  assert.equal(run('open').data.orders.length,0);
});
JSON.parse(fs.readFileSync(__dirname+'/option-schema.json','utf8'));
console.log(checks+' checks passed; client syntax and option JSON parsed.');
