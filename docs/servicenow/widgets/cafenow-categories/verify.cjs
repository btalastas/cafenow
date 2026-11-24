const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/server.js', 'utf8');
new vm.Script('(' + fs.readFileSync(__dirname + '/client.js', 'utf8').trim() + ')');
function run(count, extra = {}, code = source) {
  const rows = Array.from({length:count}, (_,i) => 'category' + i);
  let queries = 0;
  function Record(table) {
    assert.equal(table, 'sc_category');
    let start = 0, end = 0, pos;
    this.addQuery = (field, op, value) => { if (field === 'sc_catalog') { assert.equal(op, 'IN'); assert.equal(value, 'catalog1'); } };
    this.addActiveQuery = this.orderBy = this.addNullQuery = () => {};
    this.chooseWindow = (a,b) => { assert.equal(typeof b, 'number'); start=a; end=b; };
    this.query = () => { queries++; pos=start-1; };
    this.hasNext = () => pos+1 < Math.min(end, rows.length);
    this.next = () => ++pos < Math.min(end, rows.length);
    this.getUniqueValue = () => rows[pos];
  }
  function Catalog() { this.getTitle = () => 'CafeNow'; this.canView = () => true; }
  function Category(id) {
    this.canView = () => true;
    this.getID = () => id;
    this.getCatalog = () => 'catalog1';
    this.getTitle = () => id;
    for (const name of ['getDescription','getFullDescription','getIconSRC','getHeaderIconSRC','getHomepageImageSRC']) this[name] = () => '';
    this.hasVisibleItem = () => !extra.empty;
    this.getViewableSubCategories = () => [];
  }
  const context = {data:{}, options:{title:'Vendors', number_of_categories_to_load:'15'}, input:extra.input,
    $sp:{getParameter: key => key === 'catalog_id' ? extra.catalog : null, getCatalogs: () => ({value:'catalog1'})},
    gs:{nil: x => x == null || x === '', getMessage:s=>s, getProperty:()=> 'false'},
    sn_sc:{Catalog, CatCategory:Category}, GlideRecord:Record};
  vm.runInNewContext(code, context);
  return {data:context.data, queries};
}
for (const count of [0,1,5,15,16]) {
  const {data} = run(count);
  assert.equal(data.visibleCategoriesList.length, count);
  assert.equal(data.showMore, count > 15);
  assert.equal(data.visibleCategories, Math.min(count,15));
  assert.equal(data.page,'cafe_menu');
}
assert.equal(run(5,{empty:true}).data.visibleCategoriesList.length,0);
assert.equal(run(5,{catalog:'outside'}).queries,0);
assert.equal(run(20,{input:{new_limit:'30'}}).data.limit,30);
assert.throws(() => run(5,{},source.replace('gs.nil(', 'JSUtil.nil(')), /JSUtil/);
assert.throws(() => run(5,{},source.replace('Math.min(data.limit, data.categoriesList.length)', 'data.limit')), /totalCount/);
const html = fs.readFileSync(__dirname + '/template.html','utf8');
assert.match(html, /ng-repeat="category in \(data.visibleCategoriesList[^\n]+">\s*<\/li>/);
console.log('Passed category empty/short/full/paged results, numeric limits, catalog rejection, regression checks and script syntax. Mock APIs only.');
