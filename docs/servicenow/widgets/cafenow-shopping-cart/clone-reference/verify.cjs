const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/server.js','utf8');
const client = fs.readFileSync(__dirname + '/client.js','utf8');
new vm.Script('(' + client.trim() + ')');
assert.match(client,/function \(\$scope, \$rootScope,/);
assert.doesNotMatch(client, /\.size\(\)/);
assert.doesNotMatch(client, /[^$]scope\.setFocusEmptyCartHeading/);
const id = 'a'.repeat(32);
function run(input, settings = {}, code = source) {
  const updates = [], errors = [];
  function Cart(name) {
    assert.equal(name, 'DEFAULT');
    this.getCartItems = () => ({getRowCount:()=>1});
    this.getCartID = () => 'own-cart';
    this.getCartDetails = () => ({cart_items:{none:{items:[]}}});
    this.checkAllItemsHaveRequestedFor = () => false;
    this.updateItem = (...args) => updates.push(args);
  }
  Cart.canViewRF = () => false;
  function Choices() {
    this.getChoiceList = () => ({
      size:settings.method ? () => 2 : 2,
      get:i=>({getValue:()=>String(i+1), getLabel:()=>String(i+1)})
    });
  }
  function Secure(table) {
    assert.equal(table,'sc_cart_item');
    this.get = () => true;
    this.canWrite = () => !settings.denied;
    this.getElement = () => ({canWrite:()=>!settings.fieldDenied});
    this.getValue = () => settings.foreign ? 'other-cart' : 'own-cart';
  }
  function Utility() { this.getEngagementChannel = () => 'portal'; }
  const context = {input,options:{},data:{},sn_sc:{CartJS:Cart}, GlideChoiceList:Choices, GlideRecordSecure:Secure,
    global:{GlobalServiceCatalogUtil:Utility},
    gs:{getMessage:s=>s,getUser:()=>({getID:()=> 'userA'}),getProperty:(key,value)=>value, addErrorMessage:m=>errors.push(m)},
    $sp:{getParameter:()=>null,getWidget:()=>({})}};
  vm.runInNewContext(code,context);
  return {data:context.data,updates,errors};
}
assert.equal(run().data.choiceListQuantity.length,2);
assert.equal(run(undefined,{method:true}).data.choiceListQuantity.length,2);
const regressed = source.replace(/typeof choiceListQuantity.size === 'function' \?\s*choiceListQuantity.size\(\) : Number\(choiceListQuantity.size\)/, 'choiceListQuantity.size()');
assert.notEqual(regressed, source);
assert.throws(()=>run(undefined,{},regressed),/size/);
assert.equal(run({action:'update_quantity',itemID:id,quantity:'3'}).updates.length,1);
for (const quantity of [0,-1,1.5,'bad',2147483648])
  assert.equal(run({action:'update_quantity',itemID:id,quantity}).updates.length,0);
for (const settings of [{foreign:true},{denied:true},{fieldDenied:true}])
  assert.equal(run({action:'update_quantity',itemID:id,quantity:2},settings).updates.length,0);
assert.equal(run({action:'update_quantity',itemID:'bad',quantity:2}).updates.length,0);
assert.equal(run({action:'save_cart'}).errors.length,1);
console.log('Passed numeric/method choice sizes, regression reproduction, default-cart and quantity ownership/validation checks; scripts parse. Mock APIs only.');
