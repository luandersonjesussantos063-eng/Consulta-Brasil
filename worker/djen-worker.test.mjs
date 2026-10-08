import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{validateSearch,normalize} from './djen-worker.mjs';
const base='https://consulta-brasil.exemplo.workers.dev';
const origin='https://luandersonjesussantos063-eng.github.io';
const req=(path,body,requestOrigin=origin)=>new Request(base+path,{method:'POST',headers:{'Content-Type':'application/json','Origin':requestOrigin},body:JSON.stringify(body)});
test('aceita processo CNJ e nome completo, rejeita CPF',()=>{
 assert.equal(validateSearch({mode:'processo',query:'0000832-35.2018.4.01.3202'}).query,'00008323520184013202');
 assert.equal(validateSearch({mode:'nome',query:'Ana de Souza'}).param,'nomeParte');
 assert.ok(validateSearch({mode:'cpf',query:'52998224725'}).error);
 assert.ok(validateSearch({mode:'nome',query:'529.982.247-25'}).error);
 assert.ok(validateSearch({mode:'nome',query:'Ana'}).error);
});
test('resposta só inclui campos públicos selecionados, sem cpf ou texto integral',()=>{
 const record={items:[{numeroProcesso:'00008323520184013202',siglaTribunal:'TJMT',texto:'CPF: 529.982.247-25',cpfCnpj:'52998224725',link:'https://tribunal.jus.br/processo',nomeOrgao:'Vara Cível'}],count:1};
 const n=normalize(record);
 assert.equal(n.items.length,1);
 assert.equal(n.items[0].numeroProcesso,'00008323520184013202');
 assert.equal(n.items[0].link,'https://tribunal.jus.br/processo');
 assert.equal(JSON.stringify(n).includes('52998224725'),false);
 assert.equal(JSON.stringify(n).includes('529.982.247-25'),false);
});
test('recusa origem não autorizada',async()=>{const response=await worker.fetch(req('/api/djen',{mode:'processo',query:'00008323520184013202'},'https://atacante.exemplo'));assert.equal(response.status,403);});
test('não envia CPF nem faz busca externa se receber CPF',async()=>{const response=await worker.fetch(req('/api/djen',{mode:'cpf',query:'52998224725'}));assert.equal(response.status,422);});
test('faz busca de publicações num endpoint fixo, sem servidor escolhido pelo visitante',async()=>{
 const prior=globalThis.fetch;
 let calledUrl=null;
 globalThis.fetch=async url=>{calledUrl=new URL(url);return new Response(JSON.stringify({count:1,items:[{numeroProcesso:'00008323520184013202',siglaTribunal:'TRF1',dataDisponibilizacao:'2026-10-08'}]}),{status:200,headers:{'Content-Type':'application/json'}})};
 try{
  const response=await worker.fetch(req('/api/djen',{mode:'processo',query:'0000832-35.2018.4.01.3202',host:'https://evil.exemplo'}));
  assert.equal(response.status,200);
  const data=await response.json();
  assert.equal(data.items.length,1);
  assert.equal(data.cpfLookup,false);
  assert.equal(calledUrl.hostname,'comunicaapi.pje.jus.br');
  assert.equal(calledUrl.searchParams.get('itensPorPagina'),'20');
 } finally{globalThis.fetch=prior;}
});

test('aceita a nomenclatura real do Comunica PJe sem incluir texto ou documentos pessoais',()=>{
 const input={count:1,items:[{
   numero_processo:'00009992220268000001',
   numeroprocessocommascara:'0000999-22.2026.8.00.0001',
   datadisponibilizacao:'08/10/2026',
   siglaTribunal:'TJMT',
   tipoComunicacao:'Intimação',
   nomeOrgao:'Vara de Exemplo',
   texto:'Documento pessoal confidencial de exemplo',
   cpf:'52998224725',
   link:'https://example.com/inseguro'
 }]};
 const output=normalize(input);
 assert.equal(output.items.length,1);
 assert.equal(output.items[0].numeroProcesso,'00009992220268000001');
 assert.equal(output.items[0].dataDisponibilizacao,'08/10/2026');
 assert.equal(output.items[0].siglaTribunal,'TJMT');
 assert.equal(output.items[0].link,null);
 assert.equal(JSON.stringify(output).includes('Documento pessoal confidencial'),false);
 assert.equal(JSON.stringify(output).includes('52998224725'),false);
});
