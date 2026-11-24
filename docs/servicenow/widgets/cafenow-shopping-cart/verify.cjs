const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const server = fs.readFileSync(__dirname + '/server.js', 'utf8');
const client = fs.readFileSync(__dirname + '/client.js', 'utf8');
new vm.Script(server);
new vm.Script(client);
const ownId = 'a'.repeat(32), foreignId = 'b'.repeat(32);
function run(input, settings = {}) {
  const state = [
    {sys_id:ownId, cart:'own', quantity:'2', cat_item:'Food A'},
    {sys_id:foreignId, cart:'other', quantity:'7', cat_item:'Food B'}
  ];
  const mutations = [];
  let apiCalls = 0;
  function Record(table) {
    let row, list, index = -1;
    this.isValidField = () => true;
    this.getElement = field => ({canRead:()=> !(settings.hidden || []).includes(field), canWrite:()=> !settings.fieldDenied});
    this.canRead = () => !settings.readDenied;
    this.canWrite = () => !settings.writeDenied;
    this.canDelete = () => !settings.deleteDenied;
    this.get = id => {
      if (table === 'sc_cart') row = {user:settings.otherUser ? 'B':'A', name:settings.named ? 'SAVED':'DEFAULT'};
      else row = state.find(r=>r.sys_id===id);
      return !!row;
    };
    this.getValue = field => row[field];
    this.getDisplayValue = field => row[field];
    this.getUniqueValue = () => row.sys_id;
    this.addQuery = (field, value) => { assert.equal(field,'cart'); assert.equal(value,'own'); list=state.filter(r=>r.cart===value); };
    this.orderBy = () => {};
    this.query = () => {};
    this.next = () => { row=list[++index]; return !!row; };
    this.deleteRecord = () => {
      if (settings.deleteFails) return false;
      mutations.push('delete');state.splice(state.indexOf(row),1);return true;
    };
  }
  function Cart(...args) {
    apiCalls++;
    assert.equal(args.length,0);
    if (settings.fail) throw Error('scope failure');
    this.getCartID = () => 'own';
    this.updateItem = (request,id) => {
      mutations.push('update');
      assert.equal(id,ownId);
      assert.deepEqual(Object.keys(request),['sysparm_quantity']);
      if (!settings.ignoreUpdate) state.find(r=>r.sys_id===id).quantity=request.sysparm_quantity;
    };
  }
  const context = {input,data:{},GlideRecordSecure:Record,sn_sc:{CartJS:Cart},
    gs:{getUserName:()=>settings.guest?'guest':'A', getUserID:()=> 'A', getMessage:(s,args)=>args?s.replace('{0}',args[0]):s,error:()=>{}}};
  vm.runInNewContext(server,context);
  return {data:context.data,mutations,apiCalls};
}
let checks=0;
function check(condition) { assert.ok(condition);checks++; }
let result = run();
check(result.data.items.length===1 && result.data.quantity_count===2);
check(result.data.items[0].name==='Food A');
check(run(undefined,{guest:true}).apiCalls===0);
for (const settings of [{otherUser:true},{named:true},{readDenied:true},{hidden:['user']}]) {
  result=run({action:'remove_item',item_id:ownId},settings);
  check(result.data.error && result.mutations.length===0);
}
result=run({action:'update_quantity',item_id:ownId,quantity:4});
check(result.data.ok && result.data.items[0].quantity===4);
for (const quantity of [0,-1,1.5,'bad',true,null,[],2147483648]) {
  result=run({action:'update_quantity',item_id:ownId,quantity});
  check(result.data.error && result.mutations.length===0);
}
for (const settings of [{writeDenied:true},{fieldDenied:true},{hidden:['cart']}]) {
  result=run({action:'update_quantity',item_id:ownId,quantity:4},settings);
  check(result.data.error && result.mutations.length===0);
}
for (const action of ['update_quantity','remove_item']) {
  result=run({action,item_id:foreignId,quantity:4,cart_id:'other',user_id:'B'});
  check(result.data.error && result.mutations.length===0 && result.data.items.length===1);
}
result=run({action:'update_quantity',item_id:ownId,quantity:4},{ignoreUpdate:true});
check(!result.data.ok && result.data.error);
result=run({action:'remove_item',item_id:ownId});
check(result.data.ok && result.data.items.length===0 && result.data.quantity_count===0);
for (const settings of [{deleteDenied:true},{deleteFails:true}]) {
  result=run({action:'remove_item',item_id:ownId},settings);
  check(!result.data.ok && result.data.error && result.data.items.length===1);
}
result=run({action:'checkout'});
check(result.data.error && result.mutations.length===0);
check(run({}, {fail:true}).data.error.length>0);
check(run({}, {hidden:['cat_item']}).data.items.length===0);

async function clientChecks() {
  const events={}, broadcasts=[], requests=[], timers=[];
  let finish;
  const scope = {$id:7,$emit:()=>{},$on:(name,fn)=>{events[name]=fn;return ()=>{delete events[name];};}};
  const root = {$broadcast:(name,payload)=>{broadcasts.push(name);if(events[name])events[name]({},payload);}};
  function timeout(fn) {const timer={fn};timers.push(timer);return timer;}
  timeout.cancel = timer => {timer.cancelled=true;};
  const context={api:{}};
  vm.runInNewContext(client,context);
  const item={sys_id:ownId,quantity:2,can_update:true,can_remove:true};
  const controller={data:{items:[item],quantity_count:2}, server:{get:payload=>{
    requests.push(payload);return new Promise(resolve=>{finish=resolve;});
  }}};
  context.api.controller.call(controller,scope,root,timeout);
  item.edit_quantity=3;
  const pending=controller.updateQuantity(item);
  controller.updateQuantity(item);
  check(requests.length===1);
  events['$sp.service_catalog.cart.update']({},{});
  timers.shift().fn(); // refresh while mutation is pending must queue
  finish({data:{items:[{...item,quantity:3}],quantity_count:3,ok:true}});
  await pending;
  check(broadcasts.length===1 && timers.length===1); // no self refresh loop
  timers.shift().fn();
  check(requests[1].action==='refresh');
  finish({data:{items:[{...item,quantity:3}],quantity_count:3}});
  await new Promise(resolve=>setImmediate(resolve));
  const current=controller.data.items[0];
  controller.removeItem(current);
  check(requests.length===2); // removal needs confirmation
  controller.askRemove(current);
  const removal=controller.removeItem(current);
  check(requests[2].action==='remove_item');
  finish({data:{items:[],quantity_count:0,ok:true}});
  await removal;
  events['$sp.service_catalog.cart.add_item']();
  const timer=timers[0];
  events.$destroy();
  check(timer.cancelled===true);
}
clientChecks().then(()=>console.log('Passed '+checks+' server/client checks: cart ownership, ACLs, validation, mutations, event refresh, duplicate clicks, confirmation and cleanup. Mock APIs only.')).catch(error=>{console.error(error);process.exitCode=1;});
