# Pesquisa oficial: APIs judiciais nacionais e consulta por CPF (08/10/2026)

## Conclusão operacional

**Hoje não identificamos uma API oficial nacional, aberta, gratuita e autorizada para exploração comercial que receba qualquer CPF e devolva todos os processos da pessoa.** Consulta por CPF em portais individuais de tribunais não equivale a uma API nacional.

| Fonte | O que permite | Limitações relevantes | Decisão |
| --- | --- | --- | --- |
| DJEN / Comunica PJe | Consultas públicas de **comunicações processuais** por processo, parte e OAB (GET /api/v1/comunicacao). | Sem consulta nacional por CPF, não substitui andamento. Requisições de infraestrutura de teste retornaram 403 (fora do Brasil) e 503 (Worker e Supabase sa-east-1). A causa definitiva ainda não foi confirmada; requer contato oficial. | Integração automática permanece pausada. |
| API Pública DataJud | Número CNJ, tribunal e metadados de movimentações. | Portaria CNJ 160/2020 com alteração 374/2026: fornecimento para fins não comerciais; proíbe exploração comercial dos dados. Sem identificação de partes físicas por CPF. | Não integrar em serviço pago/anúncio baseado nos dados. |
| Repositório consolidado CNJ, Portaria 316/2024 e Resolução 574/2024 | Prevê acesso por entidades privadas a dados processuais públicos, mediante instrumento próprio. | Requer políticas de privacidade, segurança, auditoria, solicitação à Presidência do CNJ, avaliação técnica e custeio da infraestrutura. A norma menciona nomes das partes, mas **não garante endpoint de pesquisa por CPF**. | Caminho formal para avaliar integração nacional. |
| Consulta Nacional de Pessoas | Busca por CPF em várias bases. | Acesso exclusivo a magistrados. | Não elegível para plataforma pública. |
| Tribunais individuais (PJe e outros) | Alguns possuem interface pública com campo CPF. | Interfaces heterogêneas; não representam autorização para robôs, redistribuição ou coleta em massa. | Permitir navegação manual para canais oficiais, sem automação não autorizada. |

## Problema técnico identificado e corrigido

O adaptador original interpretava unicamente `numeroProcesso` e `dataDisponibilizacao`. Existem amostras do Comunica PJe que usam `numero_processo` e `datadisponibilizacao`, além de outras variantes. O parser do repositório agora aceita ambas as formas, preservando filtragem de texto integral/CPF. Testes automatizados adicionados. Essa correção **não elimina os erros 403/503** e **não foi aplicada automaticamente ao Worker em produção**.

## Contato oficial recomendado

A Ouvidoria do CNJ também presta Serviço de Informação ao Cidadão (SIC), via https://www.cnj.jus.br/ouvidoria-cnj/. Pedir confirmação, por escrito:

1. Se GET /api/v1/comunicacao do DJEN está operante para integrações externas; restrições atuais por IP/país, rate limits, formatos de parâmetros e motivos possíveis de 403/503.
2. Se é permitida a reutilização de resultados públicos do DJEN num portal monetizado por anúncios/assinaturas, e quais limites, obrigações e medidas de segurança.
3. Qual procedimento, documentos, valor aproximado e contato técnico para requerer acesso ao repositório CNJ nos termos da Portaria 316/2024.
4. Se há, no âmbito desse acesso autorizado, pesquisa por CPF do próprio titular ou de terceiros com base legal; quais controles de autenticação/consentimento/auditoria seriam obrigatórios.
5. Se há ambiente de homologação e documentação formal atualizada de resposta/paginação.

O contato é uma solicitação de informação, não autoriza contornar restrições nem implica deferimento.

## Fontes oficiais

- Swagger DJEN: https://hcomunicaapi.cnj.jus.br/swagger/index.html
- CNJ, orientações de produção DJEN: https://www.cnj.jus.br/programas-e-acoes/processo-judicial-eletronico-pje/comunicacoes-processuais/orientacoes-aos-tribunais/
- Portaria 316/2024: https://atos.cnj.jus.br/atos/detalhar/5792
- Resolução 574/2024: https://atos.cnj.jus.br/atos/detalhar/5708
- Portaria 160/2020 (com alterações 374/2026): https://atos.cnj.jus.br/atos/detalhar/3453
- Consulta Nacional de Pessoas: https://www.cnj.jus.br/tecnologia-da-informacao-e-comunicacao/justica-4-0/consulta-nacional-de-pessoas/
- Ouvidoria e SIC: https://www.cnj.jus.br/ouvidoria-cnj/

Enquanto não houver aprovação/autorização e teste real, manter no site a consulta automática DJEN desabilitada. **O objetivo de busca por CPF não está implementado.**
