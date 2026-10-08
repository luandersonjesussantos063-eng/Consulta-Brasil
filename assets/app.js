// Consulta Brasil v1.0.0 — identificador de números CNJ, executado localmente.
(() => {
'use strict';
const ESTADOS={ '01':'TJAC — Acre','02':'TJAL — Alagoas','03':'TJAP — Amapá','04':'TJAM — Amazonas','05':'TJBA — Bahia','06':'TJCE — Ceará','07':'TJDFT — Distrito Federal e Territórios','08':'TJES — Espírito Santo','09':'TJGO — Goiás','10':'TJMA — Maranhão','11':'TJMT — Mato Grosso','12':'TJMS — Mato Grosso do Sul','13':'TJMG — Minas Gerais','14':'TJPA — Pará','15':'TJPB — Paraíba','16':'TJPR — Paraná','17':'TJPE — Pernambuco','18':'TJPI — Piauí','19':'TJRJ — Rio de Janeiro','20':'TJRN — Rio Grande do Norte','21':'TJRS — Rio Grande do Sul','22':'TJRO — Rondônia','23':'TJRR — Roraima','24':'TJSC — Santa Catarina','25':'TJSE — Sergipe','26':'TJSP — São Paulo','27':'TJTO — Tocantins'};
const JUSTICAS={'1':'Supremo Tribunal Federal','2':'Conselho Nacional de Justiça','3':'Superior Tribunal de Justiça','4':'Justiça Federal','5':'Justiça do Trabalho','6':'Justiça Eleitoral','7':'Justiça Militar da União','8':'Justiça Estadual','9':'Justiça Militar Estadual'};
const el=id=>document.getElementById(id);
const onlyDigits=s=>String(s||'').replace(/\D/g,'').slice(0,20);
const format=s=>{const d=onlyDigits(s);return [d.slice(0,7),d.slice(7,9),d.slice(9,13),d.slice(13,14),d.slice(14,16),d.slice(16,20)].map((v,i)=>v?(i?['-','.','.','.','.'][i-1]:'')+v:'').join('')};
function hasValidDigits(s){const d=onlyDigits(s);if(d.length!==20)return false;const body=d.slice(0,7)+d.slice(9)+'00';return Number(d.slice(7,9))===Number(98n-(BigInt(body)%97n));}
function describe(s){const d=onlyDigits(s),ramo=d[13],cod=d.slice(14,16);let tribunal='Órgão não identificado pela tabela desta versão';if(ramo==='8')tribunal=ESTADOS[cod]||'Código estadual não reconhecido';else if(ramo==='4')tribunal=Number(cod)>=1&&Number(cod)<=7?'TRF'+Number(cod)+' — Tribunal Regional Federal da '+Number(cod)+'ª Região':'Justiça Federal — código '+cod;else if(ramo==='5')tribunal=Number(cod)>=1&&Number(cod)<=24?'TRT'+Number(cod)+' — Tribunal Regional do Trabalho da '+Number(cod)+'ª Região':'Justiça do Trabalho — código '+cod;else if(ramo==='6')tribunal='Justiça Eleitoral — código '+cod;else if(ramo==='9')tribunal='Justiça Militar Estadual — código '+cod;else if(['1','2','3','7'].includes(ramo))tribunal=JUSTICAS[ramo];return {branch:JUSTICAS[ramo]||'Ramo da Justiça não identificado',court:tribunal,year:d.slice(9,13)};}
function verify(s){const d=onlyDigits(s);if(d.length!==20)return {ok:false,error:'Digite os 20 dígitos do número CNJ. Confira os zeros à esquerda.'};if(!hasValidDigits(d))return{ok:false,error:'O dígito verificador não confere. Revise o número.'};const year=Number(d.slice(9,13));if(year<1900||year>new Date().getFullYear())return {ok:false,error:'Confira o ano informado no número do processo.'};if(!JUSTICAS[d[13]])return {ok:false,error:'O código do ramo da Justiça não foi reconhecido.'};return {ok:true,d};}
const form=el('cnj-form'),input=el('processo'),result=el('result-area'),error=el('error');
function toast(s){const x=el('toast');if(!x)return;x.textContent=s;x.hidden=false;setTimeout(()=>x.hidden=true,2800);}
if(form&&input){
input.addEventListener('input',()=>{const before=input.selectionStart,nd=onlyDigits(input.value.slice(0,before)).length,v=format(input.value);input.value=v;let i=0,count=0;while(i<v.length&&count<nd){if(/\d/.test(v[i]))count++;i++;}input.setSelectionRange(i,i);error.hidden=true;result.hidden=true;input.removeAttribute('aria-invalid');});
el('clear-processo')?.addEventListener('click',()=>{input.value='';input.focus();error.hidden=true;result.hidden=true;});
form.addEventListener('submit',event=>{event.preventDefault();const o=verify(input.value);if(!o.ok){error.textContent=o.error;error.hidden=false;input.setAttribute('aria-invalid','true');result.hidden=true;input.focus();return;}error.hidden=true;input.removeAttribute('aria-invalid');const x=describe(o.d);el('result-number').textContent=format(o.d);el('result-branch').textContent=x.branch;el('result-court').textContent=x.court;el('result-year').textContent=x.year;result.hidden=false;result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
el('copy-number')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(el('result-number').textContent);toast('Número copiado. Cole no portal oficial.');}catch(e){toast('Selecione e copie o número acima.');}});
}

/* Pesquisa por CPF: apenas validação local; busca real somente no tribunal de destino. */
const cpfDigits=v=>String(v||'').replace(/\D/g,'').slice(0,11);
const cpfFormat=v=>{const d=cpfDigits(v);return d.slice(0,3)+(d.length>3?'.'+d.slice(3,6):'')+(d.length>6?'.'+d.slice(6,9):'')+(d.length>9?'-'+d.slice(9,11):'');};
function validCPF(v){
 const d=cpfDigits(v);if(d.length!==11||/^(\d)\1{10}$/.test(d))return false;
 let sum=0;for(let i=0;i<9;i++)sum+=Number(d[i])*(10-i);
 const a=(sum*10)%11;if((a===10?0:a)!==Number(d[9]))return false;
 sum=0;for(let i=0;i<10;i++)sum+=Number(d[i])*(11-i);
 const b=(sum*10)%11;return (b===10?0:b)===Number(d[10]);
}
const cpfPortals={
 mt:{name:'Tribunal de Justiça de Mato Grosso (TJMT)',url:'https://consultaprocessual.tjmt.jus.br/'},
 mg:{name:'Tribunal de Justiça de Minas Gerais (TJMG) — PJe 1º grau',url:'https://pje-consulta-publica.tjmg.jus.br/'},
 rj:{name:'Tribunal de Justiça do Rio de Janeiro (TJRJ) — PJe 2º grau',url:'https://tjrj.pje.jus.br/2g/ConsultaPublica/listView.seam'},
 outros:{name:'Diretório de Tribunais do CNJ',url:'https://www.cnj.jus.br/tribunais-de-justica-estaduais/'}
};
const tabCNJ=el('tab-cnj'),tabCPF=el('tab-cpf'),cpfForm=el('cpf-form'),cpfInput=el('cpf'),cpfCourt=el('cpf-court'),cpfError=el('cpf-error'),cpfResult=el('cpf-result');
function chooseTab(which){
 if(!tabCNJ||!tabCPF||!cpfForm||!form)return;
 const useCPF=which==='cpf';tabCNJ.setAttribute('aria-selected',String(!useCPF));tabCPF.setAttribute('aria-selected',String(useCPF));
 tabCNJ.classList.toggle('active',!useCPF);tabCPF.classList.toggle('active',useCPF);
 form.hidden=useCPF;cpfForm.hidden=!useCPF;if(result)result.hidden=true;
}
tabCNJ?.addEventListener('click',()=>chooseTab('cnj'));
tabCPF?.addEventListener('click',()=>chooseTab('cpf'));
if(cpfForm&&cpfInput&&cpfCourt&&cpfError&&cpfResult){
 cpfInput.addEventListener('input',()=>{cpfInput.value=cpfFormat(cpfInput.value);cpfError.hidden=true;cpfResult.hidden=true;cpfInput.removeAttribute('aria-invalid');});
 cpfCourt.addEventListener('change',()=>{cpfResult.hidden=true;});
 el('clear-cpf')?.addEventListener('click',()=>{cpfInput.value='';cpfError.hidden=true;cpfResult.hidden=true;cpfInput.focus();});
 cpfForm.addEventListener('submit',event=>{
   event.preventDefault();
   if(!validCPF(cpfInput.value)){cpfError.textContent='CPF inválido. Confira os dígitos.';cpfError.hidden=false;cpfInput.setAttribute('aria-invalid','true');cpfResult.hidden=true;cpfInput.focus();return;}
   cpfError.hidden=true;cpfInput.removeAttribute('aria-invalid');
   const court=cpfCourt.value, portal=cpfPortals[court]||cpfPortals.outros;
   el('cpf-result-title').textContent='CPF validado no seu dispositivo';
   el('cpf-result-info').textContent=court==='outros'?'Abra o diretório oficial do CNJ, escolha seu tribunal e confira se existe consulta por CPF. O CPF não será enviado automaticamente.':'Abra a consulta oficial do '+portal.name+' e informe seu CPF lá. O Consulta Brasil ainda não buscou processos; o resultado depende do tribunal.';
   el('cpf-official-link').href=portal.url;
   el('cpf-official-link').textContent=court==='outros'?'Abrir diretório do CNJ ↗':'Abrir consulta oficial ↗';
   cpfResult.hidden=false;
 });
 el('copy-cpf')?.addEventListener('click',async()=>{
   if(!validCPF(cpfInput.value)){cpfResult.hidden=true;return;}
   try{await navigator.clipboard.writeText(cpfFormat(cpfInput.value));toast('CPF copiado. Cole somente no portal oficial.');}
   catch(e){toast('Selecione o CPF e copie manualmente.');}
 });
}
const toggle=el('mobile-menu'),nav=el('mobile-nav');if(toggle&&nav){toggle.addEventListener('click',()=>{nav.hidden=!nav.hidden;toggle.setAttribute('aria-expanded',String(!nav.hidden));toggle.textContent=nav.hidden?'☰':'×';});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';}));}
if(el('year'))el('year').textContent=String(new Date().getFullYear());
if(typeof module!=='undefined'&&module.exports)module.exports={onlyDigits,format,hasValidDigits,describe,verify,cpfDigits,cpfFormat,validCPF,cpfPortals};
})();