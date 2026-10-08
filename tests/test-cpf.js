// Execute: node tests/test-cpf.js
const assert=require('node:assert/strict');
global.document={getElementById:()=>null};
const {cpfDigits,cpfFormat,validCPF,cpfPortals}=require('../assets/app.js');
assert.equal(cpfDigits('529.982.247-25'),'52998224725');
assert.equal(cpfFormat('52998224725'),'529.982.247-25');
assert.equal(validCPF('52998224725'),true);
assert.equal(validCPF('529.982.247-25'),true);
assert.equal(validCPF('52998224726'),false);
assert.equal(validCPF('00000000000'),false);
assert.equal(validCPF('5299822472'),false);
for(const key of ['mt','mg','rj','outros']){
  assert.ok(cpfPortals[key]);
  assert.match(cpfPortals[key].url,/^https:\/\//);
}
console.log('PASSOU: 7 validações e 4 destinos oficiais de consulta CPF.');
