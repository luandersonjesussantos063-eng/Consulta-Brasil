# Consulta Brasil — fontes oficiais e situação do projeto

Atualização: 08/10/2026. Status: **pesquisa técnica e protótipo; sem coleta em produção**.

## Fontes analisadas

| Fonte | Pesquisa por CPF disponível para integração? | Tipo de dado | Política/status |
|---|---|---|---|
| API Pública do DataJud (CNJ) | Não: metadados não expõem CPF de pessoas físicas | Capa, movimentação, órgão, classe | Portaria CNJ nº 374/2026: dados apenas para fins legais, não comerciais, e veda exploração comercial. Não integrar à área monetizada. |
| API DJEN / Comunica PJe (CNJ) | Não identificado filtro CPF documentado | Comunicações/publicações, busca por número, nome de parte, advogado e OAB | API pública com restrições de acesso e uso abusivo. Antes de uso comercial, confirmar por escrito a política aplicável à reutilização dos resultados. |
| PJe e portais de tribunais | Alguns oferecem filtro CPF em páginas oficiais | Consultas públicas heterogêneas | Interface web não equivale a API com autorização de coleta em massa. Não automatizar CAPTCHA, login, bloqueios ou contornar termos. |
| Repositório centralizado do CNJ (Portaria 316/2024) | Acesso específico mediante instrumento próprio | Dados judiciais consolidados | Exige requerimento, segurança e governança; há custeio da infraestrutura para entidades privadas. |

### Links das fontes oficiais
- CNJ, API Pública DataJud: https://www.cnj.jus.br/sistemas/datajud/api-publica/
- CNJ, Portaria 374/2026: https://atos.cnj.jus.br/atos/detalhar/6972
- CNJ, Portaria 316/2024: https://atos.cnj.jus.br/atos/detalhar/5792
- CNJ, API DJEN Swagger: https://hcomunicaapi.cnj.jus.br/swagger/index.html
- CNJ, Comunicações Processuais: https://www.cnj.jus.br/programas-e-acoes/processo-judicial-eletronico-pje/comunicacoes-processuais/
- CNJ, Resolução 121/2010: https://atos.cnj.jus.br/atos/detalhar/92

## Plano de integração responsável
1. **Protótipo DJEN:** adapter de backend incluído em `worker/djen-worker.mjs`. Consulta somente por número CNJ ou nome de parte, retorna no máximo 20 publicações resumidas por requisição. **Não é consulta por CPF.**
2. **Proteção de dados:** não coletar CPF nem montar base de associação CPF→processos sem fonte adequada e fundamento legal. Evitar exibir textos integrais ou campos pessoais por padrão.
3. **Publicação da API:** Cloudflare Workers é uma opção de hospedagem com camada gratuita; domínio e deploy exigem conta separada. Pode haver restrição geográfica do serviço DJEN, e hospedagem fora do Brasil pode gerar HTTP 403: respeitar o bloqueio, sem contorná-lo.
4. **Autorização:** antes de uso comercial de dados do DJEN, solicitar esclarecimento de condições de reutilização e, se necessário, licença/termo. Não configurar a interface para publicidade direcionada por dados pessoais.
5. **Expansão:** para consulta integral nacional por CPF, verificar uma fonte contratualmente autorizada ou parcerias com tribunais. Busca por nome não permite atribuir processos a CPF e não substitui consulta oficial.

### Limites
A presença de uma publicação não comprova situação atual do processo; a ausência de publicação não comprova inexistência. Nenhuma integração em produção foi ativada por este commit.
