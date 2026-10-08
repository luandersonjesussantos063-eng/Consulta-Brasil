const assert=require('node:assert/strict');
global.document={getElementById:()=>null};
const core=require('../assets/app.js');
const n='00008323520184013202';
assert.equal(core.format(n),'0000832-35.2018.4.01.3202');
assert.equal(core.verify(n).ok,true);
assert.equal(core.verify(n.slice(0,-1)+'3').ok,false);
assert.equal(core.verify('001').ok,false);
assert.equal(core.describe(n).court,'TRF1 — Tribunal Regional Federal da 1ª Região');
function fixture(justice,court){const n='0000001',year='2025',origin='0001',body=n+year+justice+court+origin+'00',dv=String(98n-BigInt(body)%97n).padStart(2,'0');return n+dv+year+justice+court+origin;}
let count=0;for(let i=1;i<=27;i++){const p=fixture('8',String(i).padStart(2,'0'));assert.equal(core.verify(p).ok,true);assert.match(core.describe(p).court,/^TJ/);count++;}
for(let i=1;i<=24;i++){const p=fixture('5',String(i).padStart(2,'0'));assert.equal(core.verify(p).ok,true);assert.match(core.describe(p).court,/^TRT/);count++;}
console.log('PASSOU: número CNJ e '+count+' tribunais estaduais e trabalhistas.');