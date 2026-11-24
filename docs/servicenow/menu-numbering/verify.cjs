const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/backfill-menu-numbers.js','utf8');
const helper=fs.readFileSync(__dirname+'/CafeNowMenuNumberGenerator.js','utf8');
new vm.Script(source);
new vm.Script(helper);
function run(settings={}) {
  const records=[{sys_id:'a',number:'',item_number:'OLD1'},{sys_id:'b',number:'MENU0000010',item_number:'OLD2'},{sys_id:'c',number:null,item_number:'OLD3'}];
  let allocations=0,writes=0;
  const logs=[];
  function Record(table) {
    let row={},rows=[],pos=0,filters=[];
    this.isValid=()=>!settings.badTable;
    this.isValidField=()=>!settings.badField;
    this.addQuery=(f,v)=>filters.push(r=>r[f]===v);
    this.addNullQuery=f=>filters.push(r=>r[f]===null||r[f]==='');
    this.orderBy=()=>{};
    this.query=()=>{rows=(table==='sys_number'?(settings.noConfig?[]:[{category:'x_1234_cafenow_menu',prefix:settings.prefix||'MENU'}]):records).filter(r=>filters.every(fn=>fn(r)));if(settings.duplicateConfig&&table==='sys_number')rows.push(rows[0]);};
    this.next=()=>{row=rows[pos++];return !!row;};
    this.getRowCount=()=>rows.length;
    this.getValue=f=>row[f];
    this.getUniqueValue=()=>row.sys_id;
    this.get=id=>{row=records.find(r=>r.sys_id===id);return !!row;};
    let pending;
    this.setValue=(f,v)=>{pending=[f,v];};
    this.update=()=>{if(settings.failWrite)return null;row[pending[0]]=pending[1];writes++;return row.sys_id;};
  }
  const globalContext={Class:{create:()=>function(){if(this.initialize)this.initialize();}},
    NumberManager:function(table){assert.equal(table,'x_1234_cafenow_menu');this.getNextObjNumberPadded=()=>{allocations++;return settings.generated||'MENU'+String(allocations).padStart(7,'0');};},gs:{hasRole:()=>!settings.nonAdmin}};
  vm.runInNewContext(helper,globalContext);
  const context={GlideRecord:Record,global:{CafeNowMenuNumberGenerator:globalContext.CafeNowMenuNumberGenerator},
    gs:{info:s=>logs.push(s),error:s=>logs.push(s)}};
  vm.runInNewContext(settings.apply?source.replace('var DRY_RUN = true;','var DRY_RUN = false;'):source,context);
  return {records,allocations,writes,logs};
}
let tests=0;
function test(fn){fn();tests++;}
test(()=>{const r=run();assert.equal(r.allocations,0);assert.equal(r.writes,0);assert.match(r.logs[0],/2 blank/);});
test(()=>{const r=run({apply:true});assert.equal(r.writes,2);assert.equal(r.records[1].number,'MENU0000010');assert.equal(r.records[0].item_number,'OLD1');assert.equal(r.records[2].number,'MENU0000002');});
for(const settings of [{badTable:true},{badField:true},{noConfig:true},{prefix:'FOOD'},{duplicateConfig:true}])test(()=>{const r=run({...settings,apply:true});assert.equal(r.allocations,0);assert.equal(r.writes,0);});
test(()=>{const r=run({apply:true,generated:'MENU0000010'});assert.equal(r.writes,0);assert.match(r.logs[0],/already exists/);});
test(()=>{const r=run({apply:true,generated:'BAD1'});assert.equal(r.writes,0);assert.match(r.logs[0],/unexpected/);});
test(()=>{const r=run({apply:true,failWrite:true});assert.equal(r.writes,0);assert.equal(r.allocations,1);assert.match(r.logs.at(-1),/failed=1/);});
test(()=>assert.throws(()=>run({apply:true,nonAdmin:true}),/administrator/));
test(()=>{const r=run({nonAdmin:true});assert.equal(r.allocations,0);assert.equal(r.writes,0);});
console.log(tests+' mocked backfill/helper checks passed; both scripts parsed.');
