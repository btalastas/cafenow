const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const folder = __dirname + '/';
const code = fs.readFileSync(folder + 'CafeNowCheckout.js', 'utf8');
const orderCode = fs.readFileSync(folder + 'create-order-action.js', 'utf8');
const guardCode = fs.readFileSync(folder + 'order-insert-guard.js', 'utf8');
for (const file of ['CafeNowCheckout.js', 'server.js', 'client.js', 'create-order-action.js', 'order-insert-guard.js',
  'release-canceled-reservation.js', 'protect-booked-window.js', 'backfill-legacy-reservations.js'])
  new vm.Script(fs.readFileSync(folder + file, 'utf8'), {filename:file});
assert.deepEqual(JSON.parse(fs.readFileSync(folder+'option-schema.json','utf8')),[]);
assert.equal(JSON.parse(fs.readFileSync(folder+'schema.json','utf8')).tables.length,2);
const id = n => Number(n).toString(16).padStart(32,'0');
const U=id(1), CART=id(2), FOOD=id(3), MENU=id(4), VENDOR=id(5), WINDOW=id(6), CAT=id(7), LOCATION=id(8);
const T = {menu:'x_1234_cafenow_menu',vendor:'x_1234_cafenow_vendor',window:'x_1234_cafenow_pickup_window',
  checkout:'x_1234_cafenow_checkout',reservation:'x_1234_cafenow_pickup_reservation',order:'x_1234_cafenow_order'};
function fixture(settings={}) {
  let serial=1000, now=Date.parse('2026-11-09T14:00:00Z'), calls=0;
  const props={catalog_id:CAT,enabled:'true',storage_verified:'true',timezone:'America/New_York',window_time_storage:'wall_clock',
    terms_url:'?id=cafenow_terms',terms_version:'2026-11-09',building_location:LOCATION,
    order_window_field:'time_slot_v2',order_user_field:'opened_by',enforce_order_guard:'true',...settings.props};
  const tables={
    sc_cart:[{sys_id:CART,user:U,name:'DEFAULT'}],
    sc_cart_item:[{sys_id:id(10),cart:CART,cat_item:FOOD,quantity:'2',sys_updated_on:'2026-11-09 13:00:00'}],
    sc_cat_item:[{sys_id:FOOD,name:'Pizza',sys_class_name:'sc_cat_item',active:'1',u_cafenow_menu_item:MENU,sys_updated_on:'1'}],
    sc_cat_item_catalog:[{sys_id:id(11),sc_cat_item:FOOD,sc_catalog:CAT}],
    [T.menu]:[{sys_id:MENU,vendor:VENDOR,sys_updated_on:'1'}],
    [T.vendor]:[{sys_id:VENDOR,name:'Pizza Hut',active:'1',vendor_group:id(9)}],
    [T.window]:[{sys_id:WINDOW,vendor:VENDOR,is_active:'1',start_time:'1970-01-01 11:30:00',end_time:'12:00:00',time_slot_v2:'11:30 AM - 12:00 PM',max_order_capacity:'20'}],
    [T.checkout]:[],[T.reservation]:[],[T.order]:[],sc_request:[],sc_req_item:[],cmn_location:[{sys_id:LOCATION}]
  };
  const fieldMap={
    sc_cart:['user','name'],sc_cart_item:['cart','cat_item','quantity','sys_updated_on'],
    sc_cat_item:['name','sys_class_name','active','u_cafenow_menu_item','sys_updated_on','no_cart','recurring_frequency'],
    sc_req_item:['request','cat_item','quantity','x_1234_cafenow_cafenow'],
    [T.menu]:['vendor','sys_updated_on'],[T.vendor]:['name','active','vendor_group'],
    [T.window]:['vendor','is_active','start_time','end_time','time_slot_v2','max_order_capacity'],
    [T.checkout]:['token','cart_key','user','cart','vendor','pickup_window','pickup_date','window_label','snapshot','items_json','terms_version','accepted_at','instructions','state','request','request_number','order'],
    [T.reservation]:['slot_key','checkout','vendor','pickup_window','pickup_date','seat'],
    [T.order]:['checkout_context','source_request','vendor','time_slot_v2','opened_by','pickup_date','location','state','assignment_group','short_description','description','active','order_total'],
    sc_request:['requested_for','price','number'],cmn_location:[]
  };
  const unique={[T.checkout]:['token','cart_key'],[T.reservation]:['slot_key','checkout'],[T.order]:['checkout_context']};
  const writes=[];
  const copy=o=>JSON.parse(JSON.stringify(o));
  function record(table,secure) {
    let row={}, rows=[], pos=0, queries=[];
    this.isValid=()=>Object.hasOwn(tables,table);
    this.isValidField=f=>!(settings.missing===table+'.'+f) && (f==='sys_id'||(fieldMap[table]||[]).includes(f));
    this.getElement=f=>({canRead:()=>!(settings.hidden||[]).includes(table+'.'+f),canWrite:()=>!settings.fieldWriteDenied,
      getCurrencyValue:()=>String(row[f]||0),getCurrencyCode:()=> 'USD'});
    this.canRead=()=>!(secure&&(settings.denied||[]).includes(table));
    this.canWrite=()=>!settings.writeDenied;
    this.canDelete=()=>!settings.deleteDenied;
    this.get=idValue=>{const found=(tables[table]||[]).find(x=>x.sys_id===String(idValue));row=found?copy(found):{};return !!found;};
    this.getValue=f=>row[f]===undefined?'':row[f];
    this.getDisplayValue=f=>f==='cat_item'?'Pizza':this.getValue(f);
    this.getUniqueValue=()=>row.sys_id;
    this.addQuery=(f,op,v)=>{if(v===undefined){v=op;op='=';}queries.push([f,op,v===true?'1':String(v)]);};
    this.orderBy=()=>{};
    this.query=()=>{rows=(tables[table]||[]).filter(r=>queries.every(([f,op,v])=>op==='IN'?v.split(',').includes(String(r[f])):String(r[f] === undefined ? '' : r[f])===v)).map(copy);pos=0;};
    this.getRowCount=()=>rows.length;
    this.next=()=>{row=rows[pos++];return !!row;};
    this.initialize=()=>{row={};};
    this.setValue=(f,v)=>{row[f]=v===true?'1':String(v);};
    this.getTableName=()=>table;
    const conflict=()=> (unique[table]||[]).some(f=>row[f] && tables[table].some(r=>r.sys_id!==row.sys_id&&r[f]===row[f]));
    this.insert=()=>{
      if(settings.insertDenied===table||conflict()) return null;
      row.sys_id=id(serial++);tables[table].push(copy(row));writes.push(['insert',table,row.sys_id]);return row.sys_id;
    };
    this.update=()=>{
      if(settings.updateDenied===table||conflict())return null;
      const index=tables[table].findIndex(r=>r.sys_id===row.sys_id);
      if(index<0)return null;
      tables[table][index]=copy(row);writes.push(['update',table,row.sys_id]);return row.sys_id;
    };
    this.deleteRecord=()=>{
      if(settings.deleteFails)return false;
      const index=tables[table].findIndex(r=>r.sys_id===row.sys_id);
      if(index<0)return false;tables[table].splice(index,1);writes.push(['delete',table,row.sys_id]);return true;
    };
  }
  function Cart() {
    assert.equal(arguments.length,0);
    this.getCartID=()=>CART;
    this.updateItem=(payload,lineId)=>{
      const r=tables.sc_cart_item.find(r=>r.sys_id===lineId);
      if(!settings.ignoreQuantity) {r.quantity=payload.sysparm_quantity;r.sys_updated_on=String(serial++);}
      writes.push(['quantity',lineId]);
    };
    this.getCartDetails=()=>({subtotal_price:settings.noTotal?'':'$20.00',none:{items:tables.sc_cart_item.filter(x=>x.cart===CART).map(x=>({cart_item_id:x.sys_id,localized_price:'$10.00',quantity:x.quantity}))}});
    this.validateCartItems=()=>settings.invalidCart?'invalid options':'valid';
    this.submitOrder=payload=>{
      calls++;assert.equal(payload.requested_for,U);
      if(settings.submitThrows)throw Error('network');
      const requestId=id(serial++);
      tables.sc_request.push({sys_id:requestId,number:'REQ1',requested_for:U,price:'20.00'});
      for(const item of tables.sc_cart_item.filter(x=>x.cart===CART)) tables.sc_req_item.push({sys_id:id(serial++),request:requestId,cat_item:item.cat_item,quantity:item.quantity});
      tables.sc_cart_item=tables.sc_cart_item.filter(x=>x.cart!==CART);
      if(settings.badResult)return {};
      return {request_id:requestId,request_number:'REQ1'};
    };
  }
  const context={Class:{create:()=>function(){if(this.initialize)this.initialize.apply(this,arguments);}},
    GlideRecord:function(t){return new record(t,false);},GlideRecordSecure:function(t){return new record(t,true);},
    GlideDigest:function(){this.getSHA256Hex=s=>crypto.createHash('sha256').update(s).digest('hex');},
    GlideDateTime:function(){this.getNumericValue=()=>now;this.getValue=()=>new Date(now).toISOString().replace('T',' ').slice(0,19);},
    sn_sc:{CartJS:Cart,Catalog:function(){this.canView=()=>!settings.catalogDenied;},CatItem:function(){this.canView=()=>!settings.itemDenied;}},
    gs:{getUserID:()=>U,getUserName:()=>settings.guest?'guest':'employee',generateGUID:()=>id(serial++),
      getProperty:(p,def)=>Object.hasOwn(props,p.replace('x_1234_cafenow.checkout.',''))?props[p.replace('x_1234_cafenow.checkout.','')]:def,
      getMessage:s=>s,error:()=>{},addErrorMessage:()=>{}},JSON,Date};
  vm.createContext(context);vm.runInContext(code,context);
  const service=new context.CafeNowCheckout();
  const load=()=>service.handle({action:'refresh'});
  const payload=review=>({action:'submit',snapshot:review.snapshot,token:review.token,window_id:WINDOW,accept_terms:true,
    pickup_date:review.pickup_date,terms_version:review.terms_version,instructions:'No onions'});
  const submit=(changes={})=>{const review=load();return service.handle({...payload(review),...changes});};
  const fulfill=checkoutId=>{context.inputs={checkout_id:checkoutId};context.outputs={};vm.runInContext(orderCode,context);return context.outputs;};
  return {tables,props,service,load,submit,payload,fulfill,writes,settings,context,now:v=>{now=Date.parse(v);},calls:()=>calls};
}
let tests=0;
function test(name,fn){try{fn();tests++;}catch(e){e.message=name+': '+e.message;throw e;}}
test('Complete cart vendor windows and native pricing',()=>{const r=fixture().load();assert.equal(r.items.length,1);assert.equal(r.vendor_name,'Pizza Hut');assert.equal(r.windows[0].sys_id,WINDOW);assert.equal(r.total_display,'$20.00');assert.equal(r.items[0].unit_price,'$10.00');assert.equal(r.can_submit,true);});
test('Guest has no cart access',()=>{const f=fixture({guest:true});assert.equal(f.load().signed_in,false);assert.equal(f.writes.length,0);});
test('Empty cart',()=>{const f=fixture();f.tables.sc_cart_item=[];assert.equal(f.load().can_checkout,false);});
test('Disabled submission still allows pickup review',()=>{const f=fixture({props:{enabled:'false'}});assert.equal(f.load().can_checkout,true);assert.equal(f.submit().can_submit,false);assert.equal(f.calls(),0);});
for(const field of ['sc_cart.user','sc_cart.name','sc_cart_item.cart','sc_cart_item.cat_item','sc_cart_item.quantity'])
 test('Cart ACL '+field,()=>{const f=fixture({hidden:[field]});assert.ok(f.load().error);assert.equal(f.calls(),0);});
test('Foreign cart denied',()=>{const f=fixture();f.tables.sc_cart[0].user=id(99);assert.ok(f.load().error);});
test('Named cart denied',()=>{const f=fixture();f.tables.sc_cart[0].name='SAVED';assert.ok(f.load().error);});
for(const settings of [{catalogDenied:true},{itemDenied:true},{noTotal:true},{denied:['sc_cart_item']},{hidden:[T.menu+'.vendor']}])
 test('Catalog/item/pricing/read guard '+JSON.stringify(settings),()=>{const f=fixture(settings);assert.equal(f.load().can_checkout,false);assert.equal(f.calls(),0);});
test('Quantity update uses native cart',()=>{const f=fixture();const r=f.service.handle({action:'quantity',item_id:id(10),quantity:3});assert.equal(r.items[0].quantity,3);assert.equal(r.ok,true);});
for(const quantity of [0,-1,1.5,100,'bad',true,null,[],{}])
 test('Invalid quantity '+JSON.stringify(quantity),()=>{const f=fixture();assert.ok(f.service.handle({action:'quantity',item_id:id(10),quantity}).error);assert.equal(f.writes.length,0);});
for(const settings of [{writeDenied:true},{fieldWriteDenied:true},{ignoreQuantity:true}])
 test('Quantity permission/readback '+JSON.stringify(settings),()=>assert.ok(fixture(settings).service.handle({action:'quantity',item_id:id(10),quantity:3}).error));
test('Foreign item cannot mutate',()=>{const f=fixture();f.tables.sc_cart_item.push({sys_id:id(99),cart:id(90),cat_item:FOOD,quantity:'1'});assert.ok(f.service.handle({action:'remove',item_id:id(99)}).error);assert.equal(f.tables.sc_cart_item.length,2);});
test('Remove owned food',()=>{const f=fixture();assert.equal(f.service.handle({action:'remove',item_id:id(10)}).items.length,0);});
for(const settings of [{deleteDenied:true},{deleteFails:true}])
 test('Remove permission '+JSON.stringify(settings),()=>assert.ok(fixture(settings).service.handle({action:'remove',item_id:id(10)}).error));
test('Mixed vendor cart rejected',()=>{const f=fixture();f.tables.sc_cat_item.push({...f.tables.sc_cat_item[0],sys_id:id(40),u_cafenow_menu_item:id(41)});f.tables[T.menu].push({sys_id:id(41),vendor:id(42)});f.tables[T.vendor].push({sys_id:id(42),name:'Other',active:'1'});f.tables.sc_cat_item_catalog.push({sc_cat_item:id(40),sc_catalog:CAT});f.tables.sc_cart_item.push({sys_id:id(43),cart:CART,cat_item:id(40),quantity:'1'});assert.match(f.load().error,/more than one vendor/);});
test('Missing menu mapping rejected',()=>{const f=fixture();f.tables.sc_cat_item[0].u_cafenow_menu_item='';assert.equal(f.load().can_checkout,false);});
test('Expired/inactive/wrong-vendor windows omitted',()=>{const f=fixture();f.tables[T.window].push({...f.tables[T.window][0],sys_id:id(61),vendor:id(99)});f.tables[T.window][0].is_active='0';assert.equal(f.load().windows.length,0);});
test('Cutoff closes at exactly 30 minutes before start',()=>{const f=fixture();f.now('2026-11-09T16:00:00Z');assert.equal(f.load().windows.length,0);f.now('2026-11-09T15:59:59Z');assert.equal(f.load().windows.length,1);});
test('Eastern DST and local date independent of host',()=>{const f=fixture();f.now('2026-07-01T15:30:00Z');assert.equal(f.service.clock().seconds,41400);f.now('2026-11-09T16:30:00Z');assert.equal(f.service.clock().seconds,41400);f.now('2026-11-09T02:00:00Z');assert.equal(f.service.clock().date,'2026-11-08');});
test('DST transition instants',()=>{const f=fixture();f.now('2026-03-08T06:59:59Z');assert.equal(f.service.clock().seconds,7199);f.now('2026-03-08T07:00:00Z');assert.equal(f.service.clock().seconds,10800);f.now('2026-11-01T05:59:59Z');assert.equal(f.service.clock().seconds,7199);f.now('2026-11-01T06:00:00Z');assert.equal(f.service.clock().seconds,3600);});
test('Epoch UTC time fields normalize independently of user timezone',()=>{const f=fixture({props:{window_time_storage:'utc_1970'}});f.tables[T.window][0].start_time='1970-01-01 16:30:00';f.tables[T.window][0].end_time='1970-01-01 17:00:00';assert.equal(f.load().windows[0].start,41400);});
test('Unconfigured time storage blocks checkout',()=>{const f=fixture({props:{window_time_storage:''}});assert.match(f.load().error,/time storage/);assert.equal(f.calls(),0);});
for(const change of [{accept_terms:false},{accept_terms:'true'},{window_id:id(99)},{snapshot:'forged'},{pickup_date:'2026-11-08'},{terms_version:'old'},{instructions:'x'.repeat(1001)}])
 test('Submission validation '+JSON.stringify(change).slice(0,80),()=>{const f=fixture();assert.ok(f.submit(change).error);assert.equal(f.calls(),0);});
test('Successful native Request and one persisted checkout',()=>{const f=fixture();const r=f.submit({vendor:id(99),user:id(99),price:0});assert.equal(r.submitted,true);assert.equal(f.calls(),1);assert.equal(f.tables[T.checkout][0].vendor,VENDOR);assert.equal(f.tables[T.checkout][0].user,U);assert.equal(f.tables[T.checkout][0].pickup_window,WINDOW);assert.equal(f.tables[T.checkout][0].terms_version,'2026-11-09');assert.equal(f.tables[T.reservation].length,1);});
test('Same token is idempotent after cart emptied',()=>{const f=fixture();const review=f.load(),p=f.payload(review);assert.equal(f.service.handle(p).submitted,true);assert.equal(f.service.handle(p).submitted,true);assert.equal(f.calls(),1);});
test('Foreign token denied',()=>{const f=fixture();f.submit();f.tables[T.checkout][0].user=id(99);const r=f.service.handle({action:'status',token:f.tables[T.checkout][0].token});assert.ok(r.error);assert.equal(r.request_number,undefined);});
test('Unknown native result retains hold and blocks retries',()=>{const f=fixture({badResult:true});const r=f.submit();assert.equal(r.pending,true);assert.equal(f.tables[T.checkout][0].state,'unknown');assert.equal(f.tables[T.checkout][0].cart_key,CART);assert.equal(f.tables[T.reservation].length,1);f.service.handle({action:'submit',token:r.token});assert.equal(f.calls(),1);});
test('Native exception retains hold',()=>{const f=fixture({submitThrows:true});f.submit();assert.equal(f.tables[T.checkout][0].state,'unknown');assert.equal(f.tables[T.reservation].length,1);});
test('Pre-submit failure releases capacity and lock',()=>{const f=fixture({invalidCart:true});assert.ok(f.submit().error);assert.equal(f.calls(),0);assert.equal(f.tables[T.reservation].length,0);assert.equal(f.tables[T.checkout][0].state,'rejected');assert.notEqual(f.tables[T.checkout][0].cart_key,CART);});
test('Twenty unique seats, twenty-first rejected',()=>{const f=fixture();const w={sys_id:WINDOW,capacity:20};for(let i=1;i<=20;i++)assert.ok(f.service.reserve(id(100+i),VENDOR,w,'2026-11-09'));assert.equal(f.service.reserve(id(199),VENDOR,w,'2026-11-09'),'');assert.equal(f.tables[T.reservation].length,20);assert.equal(f.load().windows.length,0);});
test('Capacity is date and vendor specific',()=>{const f=fixture();const w={sys_id:WINDOW,capacity:1};assert.ok(f.service.reserve(id(101),VENDOR,w,'2026-11-09'));assert.ok(f.service.reserve(id(102),VENDOR,w,'2026-11-10'));assert.ok(f.service.reserve(id(103),id(99),w,'2026-11-09'));});
test('Second seat for same attempt cannot be allocated',()=>{const f=fixture();const w={sys_id:WINDOW,capacity:20};assert.ok(f.service.reserve(id(100),VENDOR,w,'2026-11-09'));assert.equal(f.service.reserve(id(100),VENDOR,w,'2026-11-09'),'');assert.equal(f.tables[T.reservation].length,1);});
test('Storage indexes must be declared verified before mutation',()=>{const f=fixture({props:{storage_verified:'false'}});assert.ok(f.submit().error);assert.equal(f.tables[T.checkout].length,0);assert.equal(f.calls(),0);});
test('Order guard must be enabled before native submission',()=>{const f=fixture({props:{enforce_order_guard:'false'}});assert.equal(f.load().can_submit,false);assert.ok(f.submit().error);assert.equal(f.calls(),0);});
test('Unreserved legacy orders cannot be silently ignored',()=>{const f=fixture();f.tables[T.order].push({sys_id:id(99),vendor:VENDOR,time_slot_v2:WINDOW,pickup_date:'2026-11-09',state:'1',checkout_context:''});assert.match(f.submit().error,/migration/);assert.equal(f.calls(),0);});
test('Undated open orders need reconciliation',()=>{const f=fixture();f.tables[T.order].push({sys_id:id(99),vendor:VENDOR,time_slot_v2:WINDOW,state:'-5',pickup_date:''});assert.match(f.submit().error,/pickup dates/);assert.equal(f.calls(),0);});
test('Changed review snapshot cannot submit',()=>{const f=fixture();const p=f.payload(f.load());f.tables.sc_cart_item[0].quantity='3';assert.ok(f.service.handle(p).error);assert.equal(f.calls(),0);});
test('Status recovers successful request',()=>{const f=fixture();const r=f.submit();assert.equal(f.service.handle({action:'status',token:r.token}).submitted,true);});
test('Multiple foods create one Order and link all RITMs',()=>{const f=fixture();f.tables.sc_cart_item.push({...f.tables.sc_cart_item[0],sys_id:id(20),quantity:'1'});f.submit();const checkout=f.tables[T.checkout][0];const result=f.fulfill(checkout.sys_id);assert.ok(result.order_id);assert.equal(f.tables[T.order].length,1);assert.equal(f.tables.sc_req_item.length,2);for(const line of f.tables.sc_req_item)assert.equal(line.x_1234_cafenow_cafenow,result.order_id);assert.equal(f.tables[T.order][0].time_slot_v2,WINDOW);assert.equal(f.tables[T.order][0].pickup_date,'2026-11-09');assert.equal(f.tables[T.order][0].order_total,'USD;20.00');});
test('Flow retry returns same Order',()=>{const f=fixture();f.submit();const key=f.tables[T.checkout][0].sys_id;const first=f.fulfill(key).order_id;assert.equal(f.fulfill(key).order_id,first);assert.equal(f.tables[T.order].length,1);});
test('Partial or changed RITMs create no Order',()=>{const f=fixture();f.submit();f.tables.sc_req_item[0].quantity='1';assert.throws(()=>f.fulfill(f.tables[T.checkout][0].sys_id),/quantities/);assert.equal(f.tables[T.order].length,0);});
test('Missing reservation prevents fulfillment',()=>{const f=fixture();f.submit();f.tables[T.reservation]=[];assert.throws(()=>f.fulfill(f.tables[T.checkout][0].sys_id),/reservation/);});
test('Order guard rejects bypass',()=>{const f=fixture();let aborted=false;f.context.current={isValidField:()=>true,getValue:()=>'',setAbortAction:()=>{aborted=true;}};f.context.previous=null;vm.runInContext(guardCode,f.context);assert.equal(aborted,true);});
test('Reload recovers pending checkout instead of opening another cart',()=>{const f=fixture({submitThrows:true});const result=f.submit();const reload=f.load();assert.equal(reload.pending,true);assert.equal(reload.token,result.token);assert.equal(f.calls(),1);});
test('Cancellation releases only its own hold and is repeatable',()=>{const f=fixture();f.submit();const context=f.tables[T.checkout][0];f.tables[T.reservation].push({sys_id:id(990),checkout:id(991),slot_key:'other'});f.context.current={state:{changesTo:v=>v==='4'},getValue:()=>context.sys_id};f.context.previous=null;const script=fs.readFileSync(folder+'release-canceled-reservation.js','utf8');vm.runInContext(script,f.context);vm.runInContext(script,f.context);assert.equal(f.tables[T.reservation].length,1);assert.equal(f.tables[T.reservation][0].checkout,id(991));});
test('Booked window times cannot be edited',()=>{const f=fixture();f.submit();let aborted=false;f.context.current={isValidField:()=>true,getElement:()=>({changes:()=>true}),getUniqueValue:()=>WINDOW,setAbortAction:()=>{aborted=true;}};f.context.previous=null;vm.runInContext(fs.readFileSync(folder+'protect-booked-window.js','utf8'),f.context);assert.equal(aborted,true);});

function clientFixture(f, transport) {
  const api={};vm.runInNewContext(fs.readFileSync(folder+'client.js','utf8'),{api});
  const c={data:f.load(),server:{get:payload=>transport?transport(payload):Promise.resolve({data:f.service.handle(payload)})}};
  const handlers={};
  api.controller.call(c,{$id:1,$emit:()=>{},$on:(name,fn)=>{handlers[name]=fn;return ()=>{};}},{$broadcast:()=>{}});
  return {c,handlers};
}
(async()=>{
  let f=fixture(), c=clientFixture(f).c;
  c.proceed();assert.equal(c.reviewing,true);
  c.choice.window_id=WINDOW;c.choice.accept_terms=true;
  const first=c.submit(),second=c.submit();assert.equal(second,undefined);await first;
  assert.equal(f.calls(),1);assert.equal(c.data.submitted,true);tests++;

  f=fixture();c=clientFixture(f).c;c.proceed();c.choice.window_id=WINDOW;c.choice.accept_terms=true;
  f.tables.sc_cart_item[0].quantity='3';await c.refresh();
  assert.equal(c.reviewing,false);assert.equal(c.choice.accept_terms,false);assert.equal(c.choice.window_id,'');tests++;

  f=fixture();c=clientFixture(f,payload=>{
    const data=f.service.handle(payload);
    if(payload.action==='submit')return Promise.reject(Error('lost response'));
    return Promise.resolve({data});
  }).c;
  c.proceed();c.choice.window_id=WINDOW;c.choice.accept_terms=true;await c.submit();
  assert.equal(c.uncertain,true);assert.equal(f.calls(),1);assert.equal(c.submit(),undefined);
  await c.checkStatus();assert.equal(c.data.submitted,true);assert.equal(c.uncertain,false);assert.equal(f.calls(),1);tests++;

  f=fixture({submitThrows:true});c=clientFixture(f).c;c.proceed();c.choice.window_id=WINDOW;c.choice.accept_terms=true;
  await c.submit();assert.equal(c.uncertain,true);assert.equal(c.data.pending,true);tests++;
  console.log(tests+' mocked service/flow/client checks passed; eight scripts and both JSON files parsed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
