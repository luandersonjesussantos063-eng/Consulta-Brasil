# Diagnóstico DJEN — Cloudflare e Supabase

Data: 08/10/2026.

## Escopo
Teste isolado de acesso à API pública DJEN (Comunica PJe). Não foram utilizados CPF, dados pessoais, credenciais judiciais ou consultas em massa.

## Resultados observados
- Cloudflare Worker: `GET /health` retornou HTTP 200; a consulta externa de teste retornou HTTP 503.
- GitHub Actions → DJEN diretamente: HTTP 403.
- Função temporária Supabase no projeto PP-MT, executada com `forceFunctionRegion=sa-east-1` e região `SB_REGION=sa-east-1`: a função respondeu HTTP 200 ao diagnóstico; o **DJEN retornou HTTP 503** (53 ms).
- Assim, executá-la em São Paulo não bastou para obter resposta do DJEN. Isso não comprova o motivo do bloqueio ou da indisponibilidade e não autoriza contornar restrições.
- O teste não realizou consultas por CPF nem obteve qualquer registro processual.

## Encerramento
A função `ppmt-djen-diagnostico` foi substituída por resposta estática 410, com `verify_jwt=true`. O fluxo temporário do GitHub que disparava o teste foi retirado. Nenhuma tabela, política RLS, autenticação ou questão do aplicativo PP-MT foi alterada.

## Próximos passos
1. Confirmar junto à documentação e, se preciso, suporte oficial do CNJ o formato de requisição correto, disponibilidade e regras de acesso/uso/reutilização.
2. Usar o portal [DJEN](https://comunica.pje.jus.br/consulta) como alternativa de consulta manual.
3. Não anunciar consultas automáticas reais no Consulta Brasil enquanto não funcionarem.
4. Para consulta por CPF, buscar fonte contratualmente autorizada e controles de proteção de dados; o DJEN não é uma API nacional de pesquisa de processos por CPF.
