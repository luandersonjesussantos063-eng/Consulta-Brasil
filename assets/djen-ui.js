(function(){
"use strict";
const el=id=>document.getElementById(id), form=el("djen-form"), query=el("djen-query"), mode=el("djen-mode"), submit=el("djen-submit");
if(!form||!query||!mode||!submit)return;
const api=(window.CONSULTA_BRASIL_DJEN_API_BASE||"").trim().replace(/\/+$/,"");
const enabled=api.startsWith("https://");
submit.disabled=!enabled;
if(enabled)el("djen-connection").textContent="Teste experimental conectado ao Worker. O DJEN pode restringir acessos nesta região e a consulta pode falhar; não pesquisa por CPF.";
const error=el("djen-error"), results=el("djen-results"), container=el("djen-items");
function report(message){error.textContent=message;error.hidden=false;}
mode.addEventListener("change",()=>{
  const isName=mode.value==="nome";
  query.value="";
  query.placeholder=isName?"Nome completo da parte":"0000000-00.0000.0.00.0000";
  query.inputMode=isName?"text":"numeric";
  query.maxLength=isName?80:25;
  el("djen-label").textContent=isName?"Nome e sobrenome":"Número CNJ";
  results.hidden=true;error.hidden=true;
});
function itemLine(label,value){
  const p=document.createElement("p"),strong=document.createElement("strong");
  strong.textContent=label+": ";p.append(strong,document.createTextNode(String(value||"Não informado")));return p;
}
function render(data){
  container.replaceChildren();
  const list=Array.isArray(data.items)?data.items:[];
  el("djen-count").textContent=list.length+" publicação(ões) nesta página. A ausência de publicação não prova inexistência de processo.";
  for(const item of list){
    const article=document.createElement("article");article.className="publication-result";
    article.append(itemLine("Número",item.numeroProcesso),itemLine("Tribunal",item.siglaTribunal),itemLine("Disponibilização",item.dataDisponibilizacao),itemLine("Comunicação",item.tipoComunicacao));
    if(item.nomeOrgao)article.append(itemLine("Órgão",item.nomeOrgao));
    if(item.link&&item.link.startsWith("https://")&&new URL(item.link).hostname.endsWith(".jus.br")){
       const a=document.createElement("a");a.href=item.link;a.target="_blank";a.rel="noopener noreferrer";a.className="text-link";a.textContent="Ver fonte oficial ↗";article.append(a);
    }
    container.append(article);
  }
  results.hidden=false;results.scrollIntoView({block:"start",behavior:"smooth"});
}
form.addEventListener("submit",async e=>{
  e.preventDefault();if(!enabled)return;
  const value=query.value.trim();error.hidden=true;
  if(mode.value==="processo"&&value.replace(/\D/g,"").length!==20)return report("Informe os 20 dígitos CNJ.");
  if(mode.value==="nome"&&(value.length<6||value.length>80||!value.includes(" ")||/\d/.test(value)))return report("Use nome completo, nunca CPF.");
  submit.disabled=true;submit.textContent="Consultando...";
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(api+"/api/djen",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:mode.value,query:value}),cache:"no-store",signal:controller.signal});
    const data=await response.json();
    if(!response.ok)throw Error(data.error||"Serviço indisponível.");
    render(data);
  }catch(err){report(err.name==="AbortError"?"Tempo de consulta esgotado.":(err.message||"Falha ao consultar."));}
  finally{clearTimeout(timer);submit.disabled=false;submit.textContent="Buscar publicações ↗";}
});
})();