const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/server.js', 'utf8');
new vm.Script(source);
new vm.Script(fs.readFileSync(__dirname + '/client.js', 'utf8'));
const uid = 'a'.repeat(32);
function run({roles = ['x_1234_cafenow.user'], roleText, input, enabled = true, denied = false, fieldDenied = false, abort = false, guest = false, receiptDenied = false, receiptThrows = false} = {}) {
  const inserts = [];
  class Row {
    constructor(table) { this.table = table; this.values = {}; }
    initialize() {}
    isValidField() { return true; }
    setValue(k,v) { this.values[k] = v; }
    canCreate() { return !denied; }
    getElement() { return {canRead:()=>!receiptDenied, canCreate: () => !fieldDenied, canWrite: () => { throw new Error('Update permission must not be checked for submission'); }}; }
    get() { if(receiptThrows) throw Error('receipt read'); return true; }
    canRead() { return !receiptDenied; }
    getValue(field) { return field==='submitted_by' ? uid : field==='number' ? 'CMP0001001' : ''; }
    getDisplayValue(field) { return this.getValue(field); }
    insert() { if (abort) return null; inserts.push({table:this.table, values:this.values}); return 'b'.repeat(32); }
  }
  const vendorId = 'c'.repeat(32), groupId = 'd'.repeat(32);
  class Lookup {
    constructor(table) { this.table=table; this.index=0; }
    addQuery() {} query() {} next() { return ++this.index===1; }
    get() { return true; } canRead() { return true; }
    getUniqueValue() { return this.table==='x_1234_cafenow_vendor' ? vendorId : groupId; }
    getValue(field) { return ({user:uid,group:groupId,active:'1',parent:'',vendor_group:groupId,name:'Test Vendor'})[field]; }
    getDisplayValue(field) { return this.getValue(field); }
    isValidField() { return true; } getElement() { return {canRead:()=>true}; }
  }
  function Secure(table) { return table==='x_1234_cafenow_vendor' ? new Lookup(table) : new Row(table); }
  const ctx = {data:{},input,gs:{getUserName:()=>guest?'guest':'user',getUserID:()=>uid,
    getUser:()=>({getRoles:()=>roleText === undefined ? roles.join(',') : roleText,hasRole:r=>roles.includes(r)}),error:()=>{}},GlideRecordSecure:Secure,GlideRecord:Lookup};
  vm.runInNewContext(enabled ? source : source.replace('var CONFIGURED = true;', 'var CONFIGURED = false;'), ctx);
  return {data:ctx.data,inserts};
}
const valid = {action:'submit', form:{audience:'requester',kind:'request',category:'portal_issue',summary:'Help',details:'Please help.',submitted_by:'forged',state:'closed'}};
let n = 0;
function test(name, fn) { fn(); n++; console.log('PASS ' + name); }
test('setup gate prevents insert',()=>assert.equal(run({input:valid,enabled:false}).inserts.length,0));
test('guest denied',()=>assert.equal(run({input:valid,guest:true}).inserts.length,0));
test('unrelated role denied',()=>assert.equal(run({input:valid,roles:['admin']}).inserts.length,0));
test('request inserted with server owner and fixed allowlist',()=>{const r=run({input:valid});assert.equal(r.data.saved,true);assert.equal(r.inserts[0].table,'x_1234_cafenow_user_complaints');assert.equal(r.inserts[0].values.submitted_by,uid);assert.equal(r.inserts[0].values.state,undefined);assert.equal(r.inserts[0].values.complaint_type,'request');assert.equal(r.inserts[0].values.short_description,'Help');assert.equal(r.inserts[0].values.description,'Please help.');});
test('vendor route cannot be forged',()=>assert.equal(run({input:{...valid,form:{...valid.form,audience:'vendor'}}}).inserts.length,0));
test('invalid kind denied',()=>assert.equal(run({input:{...valid,form:{...valid.form,kind:'refund'}}}).inserts.length,0));
test('invalid category denied',()=>assert.equal(run({input:{...valid,form:{...valid.form,category:'fake'}}}).inserts.length,0));
test('blank summary denied',()=>assert.equal(run({input:{...valid,form:{...valid.form,summary:'  '}}}).inserts.length,0));
test('oversized details denied',()=>assert.equal(run({input:{...valid,form:{...valid.form,details:'x'.repeat(4001)}}}).inserts.length,0));
test('table create denial',()=>assert.equal(run({input:valid,denied:true}).inserts.length,0));
test('field denial',()=>assert.equal(run({input:valid,fieldDenied:true}).inserts.length,0));
test('aborted insert is not success',()=>assert.equal(run({input:valid,abort:true}).data.saved,false));
const vendorForm = {audience:'vendor',kind:'request',category:'Service',summary:'Support',details:'Please assist.',vendor:'c'.repeat(32)};
for (const role of ['x_1234_cafenow.vendor_admin']) {
  test(role+' inserts confirmed vendor fields',()=>{const r=run({roles:[role],input:{action:'submit',form:vendorForm}});assert.equal(r.data.saved,true);assert.equal(r.inserts[0].table,'x_1234_cafenow_cafenow_vendor_compliants');assert.equal(r.inserts[0].values.submission_type,'Request');assert.equal(r.inserts[0].values.complaint_category,'Service');assert.equal(r.inserts[0].values.complaint_summary,'Support');assert.equal(r.inserts[0].values.complaint_description,'Please assist.');assert.equal(r.inserts[0].values.submitted_by,uid);assert.equal(r.inserts[0].values.order_id,undefined);});
}
function vendor(values) { return run({roles:['x_1234_cafenow.vendor_admin'],input:{action:'submit',form:{...vendorForm,...values}}}); }
test('vendor staff alone cannot submit',()=>assert.equal(run({roles:['x_1234_cafenow.vendor_staff'],input:{action:'submit',form:vendorForm}}).inserts.length,0));
test('vendor admin Java-list role representation accepted',()=>assert.equal(run({roles:['x_1234_cafenow.vendor_admin'],roleText:'[x_1234_cafenow.vendor_admin]',input:{action:'submit',form:vendorForm}}).data.saved,true));
test('bracket normalization preserves staff-only denial',()=>assert.equal(run({roles:['x_1234_cafenow.vendor_staff'],roleText:'[x_1234_cafenow.vendor_staff]',input:{action:'submit',form:vendorForm}}).inserts.length,0));
test('vendor complaint capitalization',()=>assert.equal(vendor({kind:'complaint'}).inserts[0].values.submission_type,'Complaint'));
test('vendor summary limit',()=>assert.equal(vendor({summary:'x'.repeat(41)}).inserts.length,0));
test('vendor description limit',()=>assert.equal(vendor({details:'x'.repeat(251)}).inserts.length,0));
test('vendor dictionary boundaries accepted',()=>assert.equal(vendor({summary:'x'.repeat(40),details:'x'.repeat(250)}).data.saved,true));
test('vendor rejects employee category',()=>assert.equal(vendor({category:'portal_issue'}).inserts.length,0));
test('vendor rejects another vendor',()=>assert.equal(vendor({vendor:'e'.repeat(32)}).inserts.length,0));
test('employee receipt displays saved number',()=>assert.equal(run({input:valid}).data.number,'CMP0001001'));
test('vendor receipt displays saved number',()=>assert.equal(vendor({}).data.number,'CMP0001001'));
test('denied receipt keeps saved success',()=>{const r=run({input:valid,receiptDenied:true});assert.equal(r.data.saved,true);assert.equal(r.data.number,'');assert.equal(r.data.error,'');});
test('receipt exception never prompts duplicate insert',()=>{const r=run({input:valid,receiptThrows:true});assert.equal(r.data.saved,true);assert.equal(r.inserts.length,1);assert.equal(r.data.error,'');});
console.log(n + ' mocked checks passed; server/client parse.');
