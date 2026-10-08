// Consulta Brasil — DJEN adapter, V 1.2.0
// Oficial: https://comunicaapi.pje.jus.br/api/v1/comunicacao
// Não oferece consulta por CPF. Não usar para identificar homônimos.
// Requer confirmação de licenciamento/uso comercial antes de monetizar.
const DJEN_ENDPOINT = "https://comunicaapi.pje.jus.br/api/v1/comunicacao";
const BASE_ORIGIN = "https://luandersonjesussantos063-eng.github.io";
const MAX_RESPONSE_ITEMS = 20;
function headers(origin) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
function respond(data, status, origin) { return new Response(JSON.stringify(data), { status, headers: headers(origin) }); }
const digits = v => String(v || "").replace(/\D/g, "");
export function validateSearch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error:"Requisição inválida." };
  const mode=value.mode;
  const input = typeof value.query === "string" ? value.query.trim() : "";
  if (mode === "processo") {
    const numero = digits(input);
    if (numero.length !== 20 || input.replace(/[\d.\- ]/g,"").length) return { error:"Digite um número CNJ de 20 dígitos." };
    return { mode, param:"numeroProcesso", query:numero };
  }
  if (mode === "nome") {
    // Evita CPF disfarçado, siglas isoladas e buscas massivas por substring.
    if (input.length < 6 || input.length > 80 || !/^[\p{L}\p{M}' -]+$/u.test(input) || !input.includes(" ")) {
      return { error:"Informe nome e sobrenome (6 a 80 caracteres). CPF não é aceito." };
    }
    return { mode, param:"nomeParte", query:input.replace(/\s+/g," ") };
  }
  return { error:"Pesquisa permitida somente por número de processo ou nome de parte." };
}
function clean(s,limit=100) {return typeof s==="string" ? s.replace(/<[^>]*>/g,"").slice(0,limit) : "";}
function safeOfficialLink(value) {
  if(typeof value!=="string")return null;
  try {
    const u=new URL(value);
    if(u.protocol!=="https:" || !u.hostname.endsWith(".jus.br"))return null;
    return u.toString();
  }catch{ return null; }
}
export function normalize(data) {
  if(!data || !Array.isArray(data.items)) throw Error("Resposta externa inesperada");
  return {
    total: Number.isFinite(Number(data.count))? Math.max(0,Math.min(Number(data.count), 100000000)):data.items.length,
    items: data.items.slice(0,MAX_RESPONSE_ITEMS).filter(x=>x&&typeof x==="object").map(x=>({
      // Comunica PJe publica variantes de nomes (camelCase, snake_case e sem separadores).
      numeroProcesso:clean(x.numeroProcesso||x.numero_processo||x.numeroprocessocommascara||"",30),
      siglaTribunal:clean(x.siglaTribunal||x.sigla_tribunal||"",20),
      tipoComunicacao:clean(x.tipoComunicacao||x.tipo_comunicacao||"",55),
      dataDisponibilizacao:clean(x.dataDisponibilizacao||x.data_disponibilizacao||x.datadisponibilizacao||"",35),
      nomeOrgao:clean(x.nomeOrgao||x.nome_orgao||x.orgao||"",110),
      link:safeOfficialLink(x.link)
    })),
    source:"DJEN / CNJ",
    scope:"Apenas comunicações publicadas, não todos os processos nem situação processual em tempo real.",
    cpfLookup:false
  };
}
export default {
  async fetch(request,env={}) {
    const origin=request.headers.get("Origin");
    const allowed=(env.ALLOWED_ORIGIN||BASE_ORIGIN).replace(/\/+$/,"");
    const responseOrigin=origin===allowed?origin:null;
    const url=new URL(request.url);
    if(request.method==="GET" && url.pathname==="/health")return respond({ok:true,source:"DJEN",cpf:false},200,responseOrigin);
    if(origin && origin!==allowed)return respond({error:"Origem não permitida."},403,null);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:headers(responseOrigin)});
    if(request.method!=="POST"||url.pathname!=="/api/djen")return respond({error:"Rota não encontrada."},404,responseOrigin);
    if(!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json"))return respond({error:"Envie JSON."},415,responseOrigin);
    if(Number(request.headers.get("Content-Length")||0)>512)return respond({error:"Requisição grande demais."},413,responseOrigin);
    let text;
    try{text=await request.text();}catch{return respond({error:"Requisição ilegível."},400,responseOrigin);}
    if(text.length>512)return respond({error:"Requisição grande demais."},413,responseOrigin);
    let body;try{body=JSON.parse(text);}catch{return respond({error:"JSON inválido."},400,responseOrigin);}
    const q=validateSearch(body);
    if(q.error)return respond({error:q.error},422,responseOrigin);
    const target=new URL(DJEN_ENDPOINT);
    target.searchParams.set(q.param,q.query);
    target.searchParams.set("pagina","1");
    target.searchParams.set("itensPorPagina",String(MAX_RESPONSE_ITEMS));
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),12000);
    try {
      const upstream=await fetch(target.toString(),{method:"GET",headers:{"Accept":"application/json"},signal:controller.signal,redirect:"error",cache:"no-store"});
      if(upstream.status===429)return respond({error:"O serviço oficial está limitando as consultas. Tente mais tarde."},503,responseOrigin);
      if(upstream.status===403)return respond({error:"O DJEN recusou a solicitação (HTTP 403). Pode haver uma regra de acesso ou restrição de origem."},503,responseOrigin);
      if(!upstream.ok)return respond({error:"O serviço oficial está temporariamente indisponível."},503,responseOrigin);
      const data=await upstream.json();
      const safe=normalize(data);
      return respond(safe,200,responseOrigin);
    } catch {
      return respond({error:"Não foi possível consultar o DJEN neste momento."},503,responseOrigin);
    } finally {clearTimeout(timer);}
  }
};