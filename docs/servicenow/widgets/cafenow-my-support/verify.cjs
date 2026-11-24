const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(__dirname+'/server.js','utf8');
new vm.Script(source);new vm.Script(fs.readFileSync(__dirname+'/client.js','utf8'));
const uid='a'.repeat(32), other='b'.repeat(32), employee='x_1234_cafenow_user_complaints',vendor='x_1234_cafenow_cafenow_vendor_compliants';
function record(n,owner=uid){return {sys_id:n.toString(16).padStart(32,'0'),submitted_by:owner,number:'CMP'+n,sys_created_on:'2026-11-13 12:'+String(n%60).padStart(2,'0')+':00',complaint_type:'request',submission_type:'Request',category:'other',complaint_category:'Service',short_description:'Employee '+n,complaint_summary:'Vendor '+n,description:'Employee details',complaint_description:'Vendor details',vendor:'Pizza Hut'};}
function run({roles=['user'],input,rows,deniedField,ignoreOwner=false,guest=false}={}) {
 const datasets=rows||{[employee]:[record(1),record(2,other)],[vendor]:[record(3),record(4,other)]};let queries=[];
 class Secure {
  constructor(table){assert([employee,vendor].includes(table));this.table=table;this.filters=[];this.index=-1;}
  addQuery(k,op,v){this.filters.push([k,v===undefined?'=':op,v===undefined?op:v]);}
  orderByDesc(){}
  query(){queries.push(this.table);this.rows=(datasets[this.table]||[]).filter(r=>this.filters.every(([k,o,v])=>ignoreOwner&&k==='submitted_by'||(o==='CONTAINS'?r[k].includes(v):r[k]===v))).sort((a,b)=>b.sys_created_on.localeCompare(a.sys_created_on)||b.sys_id.localeCompare(a.sys_id));}
  next(){return ++this.index<this.rows.length;}
  get(id){this.row=(datasets[this.table]||[]).find(r=>r.sys_id===id);return !!this.row;}
  current(){return this.row||this.rows[this.index];}
  canRead(){return !this.current().deny;}
  isValidField(k){return k in this.current();}
  getElement(k){return k===deniedField?null:{canRead:()=>true};}
  getValue(k){return this.current()[k];}
  getDisplayValue(k){return this.getValue(k);}
  getUniqueValue(){return this.current().sys_id;}
 }
 const full=roles.map(r=>'x_1234_cafenow.'+r),ctx={data:{},input,gs:{getUserName:()=>guest?'guest':'tester',getUserID:()=>uid,getUser:()=>({getRoles:()=> '['+full.join(', ')+']',hasRole:r=>full.includes(r)})},GlideRecordSecure:Secure};
 vm.runInNewContext(source,ctx);return {data:ctx.data,queries};
}
let count=0;function test(n,f){f();count++;console.log('PASS '+n);}
test('employee source own rows only',()=>{let r=run();assert.equal(r.data.rows.length,1);assert.equal(r.data.rows[0].source,'Employee');assert.deepEqual(r.queries,[employee]);});
test('vendor source own rows only',()=>assert.equal(run({roles:['vendor_admin']}).data.rows[0].source,'Vendor'));
test('dual role combines both sources',()=>assert.equal(run({roles:['user','vendor_admin']}).data.rows.length,2));
for(const role of ['vendor_staff','facility_manager','admin'])test(role+' has no personal-view bypass',()=>assert.equal(run({roles:[role]}).data.authorized,false));
test('guest denied',()=>assert.equal(run({guest:true}).queries.length,0));
test('ownership independently rechecked',()=>assert.equal(run({ignoreOwner:true}).data.rows.length,1));
test('number search',()=>assert.equal(run({input:{search:'missing'}}).data.rows.length,0));
test('denied number hides rows',()=>assert.equal(run({deniedField:'number'}).data.rows.length,0));
test('denied optional summary omitted',()=>assert.equal(run({deniedField:'short_description'}).data.rows[0].summary,''));
test('direct cross-owner lookup denied',()=>assert(run({input:{action:'details',audience:'requester',record_id:record(2).sys_id}}).data.error));
test('unauthorized source denied',()=>assert(run({input:{action:'details',audience:'vendor',record_id:record(3).sys_id}}).data.error));
test('prototype source denied',()=>assert(run({input:{action:'details',audience:'constructor',record_id:record(1).sys_id}}).data.error));
test('own detail fields returned',()=>assert.equal(run({input:{action:'details',audience:'requester',record_id:record(1).sys_id}}).data.detail.description,'Employee details'));
test('denied details hidden',()=>assert.equal(run({deniedField:'description',input:{action:'details',audience:'requester',record_id:record(1).sys_id}}).data.detail.description,''));
test('merged pagination has no duplicates',()=>{const rows={[employee]:Array.from({length:23},(_,i)=>record(i+1)),[vendor]:Array.from({length:22},(_,i)=>record(i+30))};const roles=['user','vendor_admin'];let all=[];for(let page=1;page<=3;page++){const r=run({roles,rows,input:{page}}).data;assert.equal(r.rows.length,page===3?5:20);assert.equal(r.has_more,page<3);all.push(...r.rows.map(r=>r.key));}assert.equal(new Set(all).size,45);});
console.log(count+' mocked history checks passed.');
