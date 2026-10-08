# Consulta Brasil — versão 1.0

Site estático de orientação para consulta de processos judiciais brasileiros.

## Funciona de verdade

- Formata e verifica matematicamente os 20 dígitos do número CNJ (módulo 97).
- Interpreta o segmento da Justiça, ano e tribunal conforme os códigos disponíveis.
- Reconhece os 27 códigos de tribunais estaduais e os códigos TRF/TRT usuais.
- Permite copiar o número e abrir o portal oficial https://www.jus.br/.
- Tem 3 guias jurídicos originais, páginas legais e layout responsivo.

## Limites transparentes

Este site **não pesquisa andamentos de processos ao vivo**. A numeração validada não indica existência real de um processo. A confirmação e consultas processuais são feitas no Jus.br ou nos tribunais competentes.

## Monetização

O termo atual da API pública do DataJud restringe uso comercial, por isso esta versão **não faz nenhuma chamada à API DataJud**. Caso deseje monetizar conteúdo próprio no futuro, revise políticas do provedor de anúncios, implemente aviso/consentimento quando necessário e garanta uma fonte de dados cuja licença permita o uso pretendido. Não há AdSense integrado nem promessa de aprovação.

## Publicação

1. Crie um repositório público no GitHub chamado `Consulta-Brasil`.
2. Envie todos os arquivos desta pasta, mantendo `index.html` na raiz.
3. Em *Settings → Pages*, selecione *Deploy from a branch*, `main` e `/ (root)`.
4. O endereço habitual fica em `https://SEU-USUARIO.github.io/Consulta-Brasil/` quando o GitHub Pages estiver ativo.

Para visualizar localmente, abra `index.html` no navegador ou execute `python3 -m http.server 8000` nesta pasta.

## SEO

Quando decidir o domínio final, crie `sitemap.xml` com URLs reais absolutas, defina URLs canônicas e vincule ao Google Search Console. Evitamos colocar domínios fictícios ou apontar o sitemap ao endereço errado.

## Privacidade

Não guarda números pesquisados nem os transmite a um backend. Sem analytics, anúncios ou cookies nesta versão. A hospedagem e links de terceiros têm regras próprias.
## Consulta orientada por CPF (v1.1)

- Aba opcional para validar CPF **apenas no navegador**; não salva nem envia o CPF ao servidor.
- Encaminha voluntariamente para páginas oficiais com campo de busca CPF: TJMT, TJMG (PJe 1º grau) e TJRJ (PJe 2º grau).
- Para outros estados, o site abre o diretório de tribunais do CNJ (nem todos disponibilizam pesquisa pública por CPF).
- **Não realiza consulta nacional por CPF**: não há essa busca na API Pública do DataJud. A ferramenta Consulta Nacional de Pessoas do CNJ é restrita a magistrados.
- Links externos abrem sem enviar o CPF. O usuário deverá inseri-lo no portal oficial, onde regras e resultados variam.
