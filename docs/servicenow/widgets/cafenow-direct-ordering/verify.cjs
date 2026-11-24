const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const code=fs.readFileSync(__dirname+'/CafeNowDirectOrdering.js','utf8');
for(const f of fs.readdirSync(__dirname).filter(x=>x.endsWith('.js')))new vm.Script(fs.readFileSync(__dirname+'/'+f,'utf8'),{filename:f});
JSON.parse(fs.readFileSync(__dirname+'/option-schema.json','utf8'));
JSON.parse(fs.readFileSync(__dirname+'/schema.json','utf8'));
new vm.Script(fs.readFileSync(__dirname+'/header/server.js','utf8'));
new vm.Script('('+fs.readFileSync(__dirname+'/header/client.js','utf8')+')');
const id=n=>Number(n).toString(16).padStart(32,'0');
const U=id(1),V=id(2),M=id(3),W=id(4),L=id(5),G=id(6),CHILD=id(7),TOKEN=id(8);
const T={vendor:'x_1234_cafenow_vendor',menu:'x_1234_cafenow_menu',window:'x_1234_cafenow_pickup_window',order:'x_1234_cafenow_order',line:'x_1234_cafenow_order_line'};
function fixture(settings={}){
 let serial=100,now=Date.parse('2026-11-09T14:00:00Z'),user=U;
 const props={enabled:'true',schema_verified:'true',terms_url:'?id=terms',terms_version:'v1',building_location:L,window_time_storage:'wall_clock',...settings.props};
 const tables={
  [T.vendor]:[{sys_id:V,name:'Pizza Hut',active:'1',accepting_orders:'1',vendor_group:G}],
  [T.menu]:[{sys_id:M,vendor:V,item_name:'Pizza',price:'11.4500',currency:'USD',active:'1',in_stock:'1',description:'Food',sys_updated_on:'1'}],
  [T.window]:[{sys_id:W,vendor:V,is_active:'1',start_time:'11:30:00',end_time:'12:00:00',time_slot_v2:'slot1',label:'11:30 AM - noon',max_order_capacity:'20'}],
  [T.order]:[],[T.line]:[],cmn_location:[{sys_id:L}],
  sys_user_grmember:[{user:U,group:CHILD}],sys_user_group:[{sys_id:CHILD,parent:G,active:'1'},{sys_id:G,parent:'',active:'1'}]
 };
 const fields={
  [T.vendor]:['name','active','accepting_orders','vendor_group','location'],
  [T.menu]:['vendor','item_name','price','active','in_stock','description','item_image','sys_updated_on'],
  [T.window]:['vendor','is_active','start_time','end_time','time_slot_v2','max_order_capacity'],
  [T.order]:['vendor','time_slot_v2','opened_by','number','state','active','order_total','location','assignment_group','short_description','submission_key','booking_key','submission_status','pickup_date','terms_version','terms_accepted_at','sys_created_on'],
  [T.line]:['order','menu_item','item_name','quantity','unit_price','line_price','sys_created_on']
 };
 const operations=[];
 function Record(table,secure){
  let row={},rows=[],pos=0,filters=[],limit=Infinity;
  const copy=o=>JSON.parse(JSON.stringify(o));
  this.isValid=()=>!!tables[table];
  this.isValidField=f=>!(settings.missing===table+'.'+f)&&!(settings.missingFields||[]).includes(table+'.'+f)&&(!fields[table]||fields[table].includes(f));
  this.canRead=()=>!(secure&&(settings.denied||[]).includes(table));
  this.getElement=f=>({canRead:()=>!(settings.hidden||[]).includes(table+'.'+f),getCurrencyValue:()=>row[f],getCurrencyCode:()=>row.currency||'USD'});
  this.get=id=>{const found=(tables[table]||[]).find(x=>x.sys_id===String(id));row=found?copy(found):{};return !!found;};
  this.getValue=f=>row[f]===undefined?'':row[f];
  this.getDisplayValue=f=>f==='time_slot_v2'?(row.label||row[f]):this.getValue(f);
  this.getUniqueValue=()=>row.sys_id;
  this.addQuery=(f,op,v)=>{if(v===undefined){v=op;op='=';}filters.push([f,op,v===true?'1':String(v)]);};
  this.addNotNullQuery=f=>filters.push([f,'notnull','']);
  this.orderBy=this.orderByDesc=()=>{};this.setLimit=n=>limit=n;
  this.query=()=>{rows=(tables[table]||[]).filter(r=>filters.every(([f,op,v])=>op==='IN'?v.split(',').includes(String(r[f])):op==='notnull'?!!r[f]:op==='!='?String(r[f])!==v:String(r[f]===undefined?'':r[f])===v)).slice(0,limit).map(copy);pos=0;};
  this.getRowCount=()=>rows.length;
  this.next=()=>{row=rows[pos++];return !!row;};
  this.initialize=()=>{row={};};this.setValue=(f,v)=>{row[f]=v===false?'0':v===true?'1':String(v);};
  const conflict=()=>table===T.order&&['submission_key','booking_key'].some(f=>row[f]&&tables[table].some(r=>r.sys_id!==row.sys_id&&r[f]===row[f]));
  this.insert=()=>{
   if(settings.insertDenied===table||conflict())return null;
   row.sys_id=id(serial++);if(table===T.order){row.number='ORD'+serial;if(settings.closeInactive&&row.active==='0')row.state='3';}
   tables[table].push(copy(row));operations.push(['insert',table]);return row.sys_id;
  };
  this.update=()=>{
   if(settings.updateDenied===table||conflict())return null;
   const i=tables[table].findIndex(r=>r.sys_id===row.sys_id);if(i<0)return null;
   if(settings.forceClosed&&table===T.order)row.state='3';
   tables[table][i]=copy(row);operations.push(['update',table]);return row.sys_id;
  };
  this.deleteRecord=()=>{
   if(settings.deleteDenied===table)return false;
   const i=tables[table].findIndex(r=>r.sys_id===row.sys_id);if(i<0)return false;
   tables[table].splice(i,1);operations.push(['delete',table]);return true;
  };
 }
 const roles=settings.roles||['x_1234_cafenow.user'];
 const context={Class:{create:()=>function(){this.initialize();}},
  GlideRecord:function(t){assert.ok(!t.startsWith('sc_'));return new Record(t,false);},
  GlideRecordSecure:function(t){assert.ok(!t.startsWith('sc_'));return new Record(t,true);},
  GlideDigest:function(){this.getSHA256Hex=s=>crypto.createHash('sha256').update(s).digest('hex');},
  GlideDateTime:function(){this.getNumericValue=()=>now;this.getValue=()=>new Date(now).toISOString().slice(0,19).replace('T',' ');},
  gs:{getUserID:()=>user,getUserName:()=>settings.guest?'guest':'employee',getUser:()=>({getRoles:()=>roles.join(','),hasRole:r=>roles.includes(r)||roles.includes('admin')}),
   getProperty:(p,def)=>Object.hasOwn(props,p.replace('x_1234_cafenow.direct.',''))?props[p.replace('x_1234_cafenow.direct.','')]:def,
   getMessage:s=>s,generateGUID:()=>id(serial++),error:()=>{}},JSON,Date};
 vm.createContext(context);vm.runInContext(code,context);
 const service=new context.CafeNowDirectOrdering();
 const items=[{menu_id:M,quantity:2}];
 const preview=(changes={},view='cart')=>service.handle({items,...changes},{view},{vendor:V});
 const payload=review=>({action:'submit',items,token:TOKEN,snapshot:review.snapshot,window_id:W,accept_terms:true,pickup_date:review.pickup_date,terms_version:review.terms_version});
 const submit=changes=>preview({...payload(preview()),...changes});
 return {context,tables,props,operations,settings,service,preview,payload,submit,user:v=>{user=v;service.userId=v;},now:v=>{now=Date.parse(v);}};
}
let tests=0;
// Optional image access must not affect ordering eligibility.
{
 const f=fixture();f.tables[T.menu][0].item_image=id(77);
 const r=f.preview();assert.equal(r.menu[0].image_url,'/'+id(77)+'.iix');assert.equal(r.items[0].image_url,r.menu[0].image_url);
 const denied=fixture({hidden:[T.menu+'.item_image']});denied.tables[T.menu][0].item_image=id(77);
 assert.equal(denied.preview().items[0].image_url,'');assert.equal(denied.preview().error,'');
 assert.equal(fixture().preview().menu[0].image_url,'');
 f.tables[T.menu][0].item_image='https://example.com/image';assert.equal(f.preview().items[0].image_url,'');
 tests+=3;
}
function test(name,fn){try{fn();tests++;}catch(e){e.message=name+': '+e.message;throw e;}}
test('Vendor/Menu/choice label resolved without catalogs',()=>{const r=fixture().preview();assert.equal(r.vendors[0].sys_id,V);assert.equal(r.menu[0].sys_id,M);assert.equal(r.windows[0].label,'11:30 AM - noon');assert.equal(r.total_display,'USD 22.90');});
test('Inactive vendors excluded from browsing',()=>{const f=fixture();f.tables[T.vendor][0].active='0';assert.equal(f.preview().vendors.length,0);});
test('Submission creates one ORD and expected line snapshots',()=>{const f=fixture();const r=f.submit();assert.equal(r.submitted,true);assert.equal(f.tables[T.order].length,1);assert.equal(f.tables[T.line].length,1);const line=f.tables[T.line][0];assert.equal(line.menu_item,M);assert.equal(line.quantity,'2');assert.equal(line.unit_price,'USD;11.45');assert.equal(line.line_price,'USD;22.90');assert.equal(line.order,r.order_id);assert.equal(f.tables[T.order][0].time_slot_v2,W);assert.equal(f.tables[T.order][0].active,'1');});
test('Menu update does not rewrite captured prices',()=>{const f=fixture();f.submit();f.tables[T.menu][0].price='99.00';assert.equal(f.tables[T.line][0].unit_price,'USD;11.45');});
test('Duplicate menu lines merge quantities',()=>{const f=fixture();const r=f.preview({items:[{menu_id:M,quantity:1},{menu_id:M,quantity:2}]});assert.equal(r.items.length,1);assert.equal(r.items[0].quantity,3);});
test('No instructions column needed',()=>assert.equal(fixture().submit().submitted,true));
test('Guest does not query records',()=>assert.equal(fixture({guest:true}).preview().signed_in,false));
for(const q of [0,-1,1.5,100,'bad',true,null,[],{}])test('Invalid quantity '+JSON.stringify(q),()=>{const f=fixture();assert.ok(f.preview({items:[{menu_id:M,quantity:q}]}).error);assert.equal(f.operations.length,0);});
for(const change of [{accept_terms:false},{accept_terms:'true'},{window_id:id(99)},{snapshot:'forged'},{pickup_date:'2026-11-08'}])test('Submission validation '+JSON.stringify(change),()=>{const f=fixture();assert.ok(f.submit(change).error);assert.equal(f.tables[T.order].length,0);});
test('Browser price/vendor/owner are ignored',()=>{const f=fixture();f.submit({vendor:id(99),opened_by:id(99),unit_price:0});assert.equal(f.tables[T.order][0].vendor,V);assert.equal(f.tables[T.order][0].opened_by,U);assert.equal(f.tables[T.order][0].order_total,'USD;22.90');});
for(const field of [T.menu+'.price',T.menu+'.vendor',T.vendor+'.accepting_orders',T.window+'.vendor'])test('Field ACL '+field,()=>{const f=fixture({hidden:[field]});assert.equal(f.preview().can_submit,false);});
test('Unavailable cart entry remains removable',()=>{const f=fixture();f.tables[T.menu][0].in_stock='0';const r=f.preview();assert.ok(r.error);assert.equal(r.items[0].unavailable,true);assert.equal(r.can_submit,false);});
test('Mixed vendor cart rejected',()=>{const f=fixture();f.tables[T.vendor].push({...f.tables[T.vendor][0],sys_id:id(22)});f.tables[T.menu].push({...f.tables[T.menu][0],sys_id:id(23),vendor:id(22)});const r=f.preview({items:[{menu_id:M,quantity:1},{menu_id:id(23),quantity:1}]});assert.match(r.error,/one vendor/);assert.equal(r.items.length,2);});
test('Inactive and stopped vendors rejected',()=>{const f=fixture();f.tables[T.vendor][0].accepting_orders='0';assert.equal(f.preview().can_submit,false);});
test('DST conversion',()=>{const f=fixture();f.now('2026-07-01T15:30:00Z');assert.equal(f.service.clock().seconds,41400);});
test('Failed line insertion cleans incomplete parent',()=>{const f=fixture({insertDenied:T.line});assert.ok(f.submit().error);assert.equal(f.tables[T.order].length,0);assert.equal(f.tables[T.line].length,0);});
test('Failed completion cleanup releases capacity',()=>{const f=fixture({updateDenied:T.order});assert.ok(f.submit().error);assert.equal(f.tables[T.order].length,0);assert.equal(f.tables[T.line].length,0);});
test('Deferred fields and properties are unnecessary',()=>{
 const deferred=['submission_key','booking_key','submission_status','pickup_date','terms_version','terms_accepted_at'];
 const f=fixture({missingFields:deferred.map(x=>T.order+'.'+x),props:{enabled:'false',schema_verified:'false',terms_url:'',terms_version:'',window_time_storage:''}});
 const result=f.submit();assert.equal(result.submitted,true,result.error);
 for(const key of deferred)assert.equal(f.tables[T.order][0][key],undefined);
});
test('Multiple foods create separate lines under one parent',()=>{
 const f=fixture();f.tables[T.menu].push({...f.tables[T.menu][0],sys_id:id(50),price:'5.00'});
 const items=[{menu_id:M,quantity:2},{menu_id:id(50),quantity:3}];
 const review=f.preview({items});const result=f.preview({...f.payload(review),items});
 assert.equal(result.submitted,true,result.error);assert.equal(f.tables[T.order].length,1);
 assert.equal(f.tables[T.line].length,2);assert.ok(f.tables[T.line].every(x=>x.order===result.order_id));
 assert.equal(f.tables[T.order][0].order_total,'USD;37.90');
});
test('Vendor location supports checkout without property',()=>{const f=fixture({props:{building_location:''}});f.tables[T.vendor][0].location=L;assert.equal(f.submit().submitted,true);});
test('Missing mandatory building gives actionable error before writes',()=>{const f=fixture({props:{building_location:''}});assert.match(f.submit().error,/Location/);assert.equal(f.tables[T.order].length,0);});
test('Inactive window refused on submission',()=>{const f=fixture();const p=f.payload(f.preview());f.tables[T.window][0].is_active='0';assert.ok(f.preview(p).error);assert.equal(f.tables[T.order].length,0);});
test('Other vendor window refused',()=>{const f=fixture();f.tables[T.window][0].vendor=id(99);assert.ok(f.submit().error);assert.equal(f.tables[T.order].length,0);});
test('Missing line field blocks parent creation',()=>{const f=fixture({missing:T.line+'.menu_item'});assert.ok(f.submit().error);assert.equal(f.tables[T.order].length,0);});
test('Failed cleanup reports uncertainty and retains parent',()=>{const f=fixture({insertDenied:T.line,deleteDenied:T.order});assert.equal(f.submit().pending,true);const row=f.tables[T.order][0];assert.equal(row.active,'1');assert.equal(row.state,'-5');});
test('Checkout stays active Submitted with inactive-Task closure automation',()=>{const f=fixture({closeInactive:true});assert.equal(f.submit().submitted,true);assert.equal(f.tables[T.order][0].state,'-5');assert.equal(f.tables[T.order][0].active,'1');});
test('Unexpected live state override is reported without deleting or duplicating',()=>{const f=fixture({forceClosed:true});const r=f.submit();assert.equal(r.pending,true);assert.match(r.error,/automation/);assert.equal(r.submitted,undefined);assert.equal(f.tables[T.order].length,1);assert.equal(f.tables[T.line].length,1);});
test('Status never retries a submission',()=>{const f=fixture();assert.equal(f.preview({action:'status'}).pending,true);assert.equal(f.operations.length,0);});
test('Own ORD and line details',()=>{const f=fixture();const r=f.submit();const detail=f.service.handle({}, {view:'details'}, {order_id:r.order_id});assert.equal(detail.lines.length,1);assert.equal(detail.order.number,r.order_number);});
test('Employee cannot view another employee ORD',()=>{const f=fixture();const r=f.submit();f.user(id(99));assert.ok(f.service.handle({}, {view:'details'}, {order_id:r.order_id}).error);});
test('Vendor staff parent mapping can view own vendor ORD',()=>{const f=fixture({roles:['x_1234_cafenow.vendor_staff']});const r=f.submit();f.tables[T.order][0].opened_by=id(99);assert.equal(f.service.handle({}, {view:'details'}, {order_id:r.order_id}).lines.length,1);});
test('Vendor role alone cannot read another vendor',()=>{const f=fixture({roles:['x_1234_cafenow.vendor_staff']});const r=f.submit();f.tables[T.order][0].opened_by=id(99);f.tables[T.vendor][0].vendor_group=id(100);assert.ok(f.service.handle({}, {view:'details'}, {order_id:r.order_id}).error);});
test('Platform admin has no implicit vendor read in widget',()=>{const f=fixture({roles:['admin']});const r=f.submit();f.tables[T.order][0].opened_by=id(99);assert.ok(f.service.handle({}, {view:'details'}, {order_id:r.order_id}).error);});
test('My Orders restricts owner',()=>{const f=fixture();f.submit();f.tables[T.order].push({sys_id:id(99),opened_by:id(99),number:'OTHER',state:'-5'});const r=f.service.handle({}, {view:'orders'}, {});assert.equal(r.orders.length,1);});
test('Precise cents and unsupported precision',()=>{const f=fixture();assert.equal(f.service.cents('0.10'),10);assert.throws(()=>f.service.cents('1.001'));});
test('Vendor purchaser cannot manage another vendor just because they own the Order',()=>{const f=fixture({roles:['x_1234_cafenow.vendor_staff']});const r=f.submit();f.tables[T.vendor][0].vendor_group=id(99);const row=f.tables[T.order][0];const record={isValidField:()=>true,getValue:k=>row[k]||''};assert.equal(f.service.canReadOrder(record),true);assert.equal(f.service.canManageVendorOrder(record),false);});
function client(f,loseResponse=false){
 const api={},saved={};const localStorage={getItem:k=>saved[k]||null,setItem:(k,v)=>{saved[k]=v;}};
 saved['cafenow.direct.cart.'+U]=JSON.stringify({items:[{menu_id:M,quantity:2}],token:'',uncertain:false});
 vm.runInNewContext(fs.readFileSync(__dirname+'/client.js','utf8'),{api});
 const c={data:f.preview(),server:{get:p=>{const data=f.service.handle(p,{view:'cart'},{vendor:V});return loseResponse&&p.action==='submit'?Promise.reject(Error('lost')):Promise.resolve({data});}}};
 const scope={$id:1,$on:()=>()=>{},$evalAsync:fn=>fn()};
 api.controller.call(c,scope,{$broadcast:()=>{}},{localStorage,addEventListener:()=>{},removeEventListener:()=>{}});
 return c;
}
(async()=>{
 let f=fixture(),c=client(f);await new Promise(resolve=>setImmediate(resolve));
 c.stepQuantity(c.data.menu[0],1);assert.equal(c.menuQuantities[M],2);
 c.stepQuantity(c.data.menu[0],-1);assert.equal(c.menuQuantities[M],1);
 c.menuQuantities[M]=3;await c.add(c.data.menu[0]);assert.equal(c.cart[0].quantity,5);
 c.menuQuantities[M]=99;await c.add(c.data.menu[0]);assert.equal(c.cart[0].quantity,5);assert.match(c.localError,/99/);tests++;
 c.choice.window_id=W;c.choice.accept_terms=true;
 const first=c.submit();assert.equal(c.submit(),undefined);await first;
 assert.equal(c.data.submitted,true);assert.equal(f.tables[T.order].length,1);assert.equal(c.cart.length,0);tests++;
 f=fixture();c=client(f,true);await new Promise(resolve=>setImmediate(resolve));c.choice.window_id=W;c.choice.accept_terms=true;
 await c.submit();assert.equal(c.uncertain,true);assert.equal(c.submit(),undefined);await c.refresh();assert.equal(c.uncertain,true);assert.equal(f.tables[T.order].length,1);assert.match(c.localError,/My Orders/);tests++;
 f=fixture();c=client(f);await new Promise(resolve=>setImmediate(resolve));c.choice.window_id=W;c.choice.accept_terms=true;
 f.tables[T.menu][0].price='12.00';await c.refresh();assert.equal(c.choice.accept_terms,false);assert.equal(c.choice.window_id,'');tests++;
 console.log(tests+' mocked direct service/client checks passed; scripts, header derivatives and JSON parsed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
