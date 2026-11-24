const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/server.js', 'utf8');
const id = n => String(n).repeat(32);
const A=id('a'), B=id('b'), PA=id('c'), PB=id('d'), SA=id('e'), SB=id('f'), W=id('1');
const staff='x_1234_cafenow.vendor_staff', admin='x_1234_cafenow.vendor_admin';
function run(settings={}) {
  const tables={
    sys_user_grmember:[{user:'userA',group:SA}],
    sys_user_group:[{sys_id:SA,parent:PA,active:'1'},{sys_id:SB,parent:PB,active:'1'},
      {sys_id:PA,parent:'',active:'1'},{sys_id:PB,parent:'',active:'1'}],
    x_1234_cafenow_vendor:[{sys_id:A,vendor_group:PA,name:'Pizza Hut',active:'1'},
      {sys_id:B,vendor_group:PB,name:'Vendor B',active:'1'}],
    x_1234_cafenow_order:[{sys_id:id('2'),vendor:A,state:'-5',number:'A1',time_slot_v2:W},
      {sys_id:id('3'),vendor:A,state:'1',number:'A2',time_slot_v2:W},
      {sys_id:id('4'),vendor:A,state:'2',number:'A3',time_slot_v2:W},
      {sys_id:id('5'),vendor:A,state:'3',number:'closed',time_slot_v2:W},
      {sys_id:id('6'),vendor:A,state:'4',number:'canceled',time_slot_v2:W},
      {sys_id:id('7'),vendor:B,state:'-5',number:'B1',time_slot_v2:W}]
  };
  if(settings.change)settings.change(tables);
  const queries=[];
  function Record(table){
    let row={}, rows=[], pos=0, filters=[], limit=Infinity;
    this.isValid=()=>!!tables[table];
    this.isValidField=f=>!(settings.missing===table+'.'+f) && (f!=='time_slot_v2'||!settings.legacy);
    this.canRead=()=>!row.denied;
    this.getElement=f=>({canRead:()=>!(settings.hidden||[]).includes(table+'.'+f)});
    this.getValue=f=>row[f];
    this.getDisplayValue=f=>row[f]||'';
    this.getUniqueValue=()=>row.sys_id;
    this.get=value=>{row=(tables[table]||[]).find(r=>r.sys_id===value)||{};return !!row.sys_id;};
    this.addQuery=(f,op,v)=>{if(v===undefined){v=op;op='=';}filters.push([f,op,String(v===true?'1':v)]);};
    this.orderBy=()=>{};
    this.setLimit=n=>limit=n;
    this.query=()=>{
      queries.push({table,filters});
      rows=(tables[table]||[]).filter(r=>filters.every(([f,op,v])=>op==='IN'?v.split(',').includes(String(r[f])):String(r[f])===v)).slice(0,limit);
      // Simulate an overly permissive/misbehaving record source: post-read guards must still protect output.
      if(settings.inject && table==='x_1234_cafenow_order')rows.push(...settings.inject);
    };
    this.next=()=>{row=rows[pos++];return !!row;};
  }
  const roles=settings.roles===undefined?[staff]:settings.roles;
  const context={data:{},options:settings.options||{},input:settings.input,
    GlideRecordSecure:function(table){assert.equal(table,'x_1234_cafenow_order');return new Record(table);},
    GlideRecord:function(table){assert.notEqual(table,'x_1234_cafenow_order');return new Record(table);},
    gs:{getUserName:()=>settings.guest?'guest':'staff',getUserID:()=> 'userA',
      getUser:()=>({getRoles:()=>roles.join(','),hasRole:r=>settings.sessionDenied?false:roles.includes(r)||roles.includes('admin')}),
      getMessage:s=>s,error:()=>{}}};
  vm.runInNewContext(source,context);
  return {data:context.data,queries};
}
let checks=0;
function test(name,fn){fn();checks++;}
const numbers=r=>Array.from(r.data.groups).flatMap(g=>Array.from(g.orders, o=>o.number));
test('Staff A sees only A open states',()=>assert.deepEqual(numbers(run()),['A1','A2','A3']));
test('Admin A same vendor restriction',()=>assert.deepEqual(numbers(run({roles:[admin]})),['A1','A2','A3']));
test('Staff B cannot see A',()=>assert.deepEqual(numbers(run({change:t=>t.sys_user_grmember[0].group=SB})),['B1']));
test('Guest does not query',()=>assert.equal(run({guest:true}).queries.length,0));
test('Non-vendor role does not query',()=>assert.equal(run({roles:['x_1234_cafenow.user']}).queries.length,0));
test('Platform admin has no implicit vendor role',()=>assert.equal(run({roles:['admin']}).queries.length,0));
test('Session denied role does not query',()=>assert.equal(run({sessionDenied:true}).queries.length,0));
test('Role alone does not query orders',()=>assert.equal(run({change:t=>t.sys_user_grmember=[]}).queries.some(q=>q.table.endsWith('_order')),false));
test('Input and old options cannot switch vendors',()=>assert.deepEqual(numbers(run({input:{vendor_sys_id:B,group:PB,roles:[admin]},options:{vendor_sys_id:B}})),['A1','A2','A3']));
test('Parent direct member with vendor role allowed',()=>assert.equal(run({change:t=>t.sys_user_grmember[0].group=PA}).data.count,3));
test('Multiple vendors have separate buckets',()=>{
 const r=run({change:t=>t.sys_user_grmember.push({user:'userA',group:SB})});
 assert.equal(r.data.count,4);assert.equal(r.data.groups.length,2);
 assert.notEqual(r.data.groups[0].key,r.data.groups[1].key);
});
test('Duplicate memberships do not duplicate orders',()=>assert.equal(run({change:t=>t.sys_user_grmember.push({user:'userA',group:PA})}).data.count,3));
test('Inactive staff group denied',()=>assert.equal(run({change:t=>t.sys_user_group[0].active='0'}).data.count,0));
test('Inactive parent denied',()=>assert.equal(run({change:t=>t.sys_user_group[2].active='0'}).data.count,0));
test('Inactive vendor denied',()=>assert.equal(run({change:t=>t.x_1234_cafenow_vendor[0].active='0'}).data.count,0));
test('Grandchild does not authorize grandparent vendor',()=>assert.equal(run({change:t=>{
 t.sys_user_group[0].parent=SB;
}}).data.count,0));
for(const field of ['x_1234_cafenow_order.vendor','x_1234_cafenow_order.time_slot_v2','x_1234_cafenow_order.state','x_1234_cafenow_order.number']){
 test('Field ACL '+field,()=>assert.equal(run({hidden:[field]}).data.count,0));
}
test('Hidden administrative mapping fields do not block authorized orders',()=>assert.equal(run({hidden:['sys_user_grmember.user','sys_user_grmember.group','sys_user_group.parent','sys_user_group.active','x_1234_cafenow_vendor.vendor_group','x_1234_cafenow_vendor.name','x_1234_cafenow_vendor.active']}).data.count,3));
test('Unmapped vendor has actionable error',()=>{const r=run({change:t=>t.x_1234_cafenow_vendor[0].vendor_group=PB});assert.match(r.data.error,/Vendor.vendor_group/);assert.equal(r.data.count,0);});
test('Group display names cannot authorize wrong references',()=>assert.equal(run({change:t=>{t.sys_user_group[0].name='Pizza Hut Admin';t.sys_user_group[0].parent='';}}).data.count,0));
test('Missing membership field fails closed',()=>{const r=run({missing:'sys_user_grmember.group'});assert.equal(r.data.count,0);assert.ok(r.data.error);});
test('Post-read guard rejects cross vendor and terminal states',()=>assert.deepEqual(numbers(run({inject:[{vendor:B,state:'-5',number:'leak'},{vendor:A,state:'4',number:'canceled'}]})),['A1','A2','A3']));
test('Hidden records omitted',()=>assert.equal(run({change:t=>t.x_1234_cafenow_order[0].denied=true}).data.count,2));
test('Missing window gets separate bucket',()=>assert.equal(run({change:t=>t.x_1234_cafenow_order[0].time_slot_v2=''}).data.groups.length,2));
test('Old pickup_window field supported',()=>assert.equal(run({legacy:true,change:t=>t.x_1234_cafenow_order.forEach(o=>o.pickup_window=o.time_slot_v2)}).data.count,3));
test('Limit is enforced',()=>{const r=run({change:t=>t.x_1234_cafenow_order=Array.from({length:201},(_,i)=>({sys_id:String(i),vendor:A,state:'-5',number:'O'+i,time_slot_v2:W}))});assert.equal(r.data.count,200);assert.equal(r.data.truncated,true);});
test('Revoked membership disappears on next request',()=>assert.equal(run({change:t=>t.sys_user_grmember[0].user='other'}).data.count,0));
test('Incomplete direct Orders stay hidden',()=>assert.equal(run({change:t=>t.x_1234_cafenow_order[0].submission_status='building'}).data.count,2));
test('Failed direct Orders stay hidden',()=>assert.equal(run({change:t=>t.x_1234_cafenow_order[0].submission_status='failed'}).data.count,2));
new vm.Script(fs.readFileSync(__dirname+'/client.js','utf8'));
assert.deepEqual(JSON.parse(fs.readFileSync(__dirname+'/option-schema.json','utf8')),[]);
console.log(checks+' mocked server checks passed; client and schema parsed.');
