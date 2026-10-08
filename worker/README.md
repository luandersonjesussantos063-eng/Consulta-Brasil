# Consulta Brasil — API de publicações DJEN (V 1.2.0)

O arquivo [djen-worker.mjs](djen-worker.mjs) é um backend **experimental**, preparado para consulta resumida à API do Diário de Justiça Eletrônico Nacional (CNJ). Não está implantado automaticamente no GitHub Pages.

## O que é possível

- Pesquisa por número CNJ e por nome completo de parte.
- API oficial consultada via servidor, com até 20 resultados por consulta.
- Retorno resumido de número de processo, tribunal, tipo/data da comunicação e link oficial.
- Sem banco de dados, sem armazenamento de CPF, sem extração de segredo de Justiça.
- O CPF não é enviado, pesquisado ou vinculado a nomes. Homônimos não são identificados.

**Não retorna todos os processos do país; retorna apenas comunicações do DJEN.**

## Deploy direto pelo GitHub (caminho recomendado)

Este repositório agora inclui `wrangler.jsonc` na raiz, com `name = consulta-brasil-djen`, entrada `worker/djen-worker.mjs` e origem autorizada do GitHub Pages. Não é preciso copiar o JavaScript à mão.

1. No painel da Cloudflare: **Workers & Pages → Create application → Import a repository → Get started**.
2. Conecte a conta GitHub e autorize apenas o repositório **Consulta-Brasil**, quando essa opção for apresentada.
3. Selecione `luandersonjesussantos063-eng/Consulta-Brasil`, branch `main`, diretório raiz `/`, e nome do Worker **consulta-brasil-djen** (igual ao `wrangler.jsonc`).
4. Não há etapa de compilação; deixe o *Build command* em branco quando permitido. No *Deploy command*, use `npx wrangler deploy`.
5. Clique em **Save and Deploy**. Quando receber uma URL `https://...workers.dev`, abra `/health` e verifique se responde `{ "ok": true, "source": "DJEN", "cpf": false }`.
6. O link do Worker poderá ser colocado em `assets/config.js` para habilitar a interface de publicações. **Não compartilhar tokens, senhas ou códigos de autenticação.**

Esse deploy é um experimento técnico, **não autorização para exploração comercial**. Antes de ativar a coleta publicamente, confirmar acesso, reutilização permitida e limites de solicitações.

## Ativar em uma hospedagem gratuita compatível com Workers

1. Crie sua conta Cloudflare (não requer pagar para começar, dentro da franquia gratuita).
2. Hospede o arquivo `worker/djen-worker.mjs` como Cloudflare Worker, usando JavaScript Modules, com caminho `/api/djen`.
3. Defina a variável de ambiente `ALLOWED_ORIGIN` como `https://luandersonjesussantos063-eng.github.io`.
4. Configure o domínio HTTPS fornecido pela Cloudflare em `assets/config.js`, na variável `CONSULTA_BRASIL_DJEN_API_BASE` (somente URL base, sem `/api/djen`).
5. Antes de tornar a função pública, teste a conectividade e ative limites de requisições, fiscalização contra abuso e medidas LGPD. A API do DJEN pode restringir requisições por região e volume; **não contorne bloqueios ou CAPTCHAs**.
6. Confirme a licença/condições de reutilização dos resultados e **não monetizar dados sem autorização compatível**.

Exemplo de rotas do Worker: `GET /health` retorna estado, e `POST /api/djen` aceita `{"mode":"processo","query":"0000832-35.2018.4.01.3202"}` ou `{"mode":"nome","query":"Nome Sobrenome"}`. A segunda alternativa não identifica pessoas e pode incluir homônimos.

## Testes
`node --test worker/djen-worker.test.mjs`

## Fontes
[Swagger oficial do DJEN](https://hcomunicaapi.cnj.jus.br/swagger/index.html)
[CNJ, Comunicações Processuais](https://www.cnj.jus.br/programas-e-acoes/processo-judicial-eletronico-pje/comunicacoes-processuais/)
[Mapa de fontes legais](../docs/fontes-oficiais.md)

A etapa de produção depende de autorização de uso, hospedagem, proteção de dados e testes externos. Não há coleta em massa, e o código não faz chamadas DataJud.
