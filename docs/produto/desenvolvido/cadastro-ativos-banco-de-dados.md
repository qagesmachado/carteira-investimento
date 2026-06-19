# Cadastro de Ativos no Banco de Dados

## Objetivo

Manter uma base única de ativos conhecidos pela aplicação, independentemente de o usuário possuir ou não esses ativos em alguma carteira.

Essa base deve concentrar informações públicas, fiscais e classificatórias dos ativos. Sempre que possível, os dados devem ser preenchidos por APIs de terceiros para reduzir trabalho manual e evitar erro de digitação.

> **Renda fixa tradicional e previdência ficam fora desta base.** CDB, LCI, LCA,
> Tesouro Selic e previdência privada têm cadastro unificado na carteira
> (`/portfolios`), não em `/assets`. ETFs de renda fixa (ex.: `AUPO11`) seguem aqui,
> pois são ativos de mercado com cotação. Ver
> [Cadastro unificado de renda fixa e previdência na carteira](cadastro-rf-previdencia-na-carteira.md).

## Diferença para carteira

Cadastro no banco de dados não significa que o usuário possui o ativo.

Exemplo:

- `BBSE3` pode existir na base com nome, tipo, CNPJ, setor e fonte de cotação.
- A carteira só registra `BBSE3` quando uma pessoa ou estratégia realmente possui posição nesse ativo.

## Fluxo principal

1. Usuário busca ativo por ticker, nome ou identificador.
2. Sistema verifica se o ativo já existe na base.
3. Se não existir, sistema consulta APIs públicas ou de terceiros.
4. Sistema pré-preenche os dados encontrados.
5. Usuário revisa, complementa e confirma.
6. Ativo fica disponível para análises, carteiras, proventos, IR e objetivos.

## API HTTP (backend FastAPI)

Endpoints sob o prefixo `/assets` (lista viva em `http://127.0.0.1:8000/docs`):

| Método | Caminho | Uso |
|--------|---------|-----|
| `GET` | `/assets` | Lista ativos **já persistidos** na base local. |
| `POST` | `/assets` | Cria um novo registro na base. |
| `GET` | `/assets/lookup?symbol=...` | **Prévia** a partir de fonte externa (ex.: yfinance); **não grava** no banco. |
| `PATCH` | `/assets/{id}` | Atualiza um registro existente: corpo JSON **parcial**; apenas campos enviados são aplicados (**merge**); demais colunas permanecem. |
| `DELETE` | `/assets/{id}` | Remove o registro da base; resposta `204` sem corpo. |
| `POST` | `/assets/bulk/preview` | Pré-visualização em lote: body `{ "symbols": ["PETR4", ...] }`; consulta yfinance e indica duplicatas na base. |
| `POST` | `/assets/bulk` | Criação em lote: body `{ "assets": [ ... ] }`; resultado por ticker (`created`, `skipped`, `error`). |

**Lookup vs base:** `GET /assets/lookup` consulta o provedor externo para pré-preencher o formulário. `GET /assets` retorna somente o que está salvo. Persistência ocorre em `POST` ou após revisão em `PATCH`.

**Ticker e sufixo `.SA`:** a fonte Yahoo/yfinance usa tickers com sufixo `.SA` para a B3. A API pode devolver ou armazenar esse formato. Na **interface** web, o ticker é mostrado **sem** `.SA` (ex.: `EGIE3`), para alinhar à convenção local; isso não altera sozinho o valor gravado no SQLite.

## Dados que podem vir de API

- Ticker ou identificador.
- Nome do ativo.
- Tipo do ativo.
- Mercado.
- País.
- Moeda.
- Setor, subsetor ou segmento.
- CNPJ, quando disponível.
- Cotação atual.
- Fonte da cotação.
- Dados cadastrais complementares.

## Dados que podem exigir decisão do usuário

- Correção de classificação quando a API retornar algo ambíguo.
- Subtipo de ETF nacional: renda variável ou renda fixa.
- Ajustes fiscais ausentes na fonte externa.
- Fonte pagadora quando o dado da API não for suficiente.
- Observações internas.

## Classificação do ativo

Todo ativo deve ter:

- Tipo.
- Local: nacional ou internacional.
- País, quando internacional.
- Moeda.
- Classe de exibição.

Tipos iniciais:

- Ação.
- ETF.
- Fundo imobiliário.
- Renda fixa.
- Criptoativo.
- Previdência.
- Outro.

## Regra para ETF nacional

Quando o ativo for `ETF` e `Nacional`, o cadastro deve exigir uma pergunta adicional:

> Qual é o tipo do ETF?

Opções:

- Renda variável.
- Renda fixa.

Essa resposta define onde o ativo será exibido:

- ETF nacional de renda variável: ações/ETFs BR.
- ETF nacional de renda fixa: renda fixa.

Exemplo: `AUPO11` e `AREA11`, hoje controlados em `AUPO11AREA11`, devem ser cadastrados como ETFs nacionais de renda fixa.

## Dados fiscais

Campos relevantes:

- CNPJ da empresa, fundo ou emissor.
- CNPJ da fonte pagadora.
- Nome da fonte pagadora.
- Informações auxiliares para declaração de IR.

O cadastro deve permitir que o CNPJ do ativo e o CNPJ da fonte pagadora sejam diferentes.

## Cotação

Cotação deve ser informação atualizável, não um campo estático preenchido manualmente como na planilha.

Estratégias possíveis:

- API pública ou de terceiros.
- Rotina de atualização periódica.
- Atualização manual por botão na carteira ou detalhe do ativo.
- Cotação fixa/manual quando não houver fonte adequada.

## Regras funcionais

- Um ativo pode existir na base sem estar em nenhuma carteira.
- Dados públicos devem vir de API sempre que possível.
- Cadastro manual deve existir como fallback.
- ETF nacional deve ter subtipo obrigatório.
- A classificação da base define onde o ativo aparece nas carteiras e no rebalanceamento.
- Dados fiscais devem ser armazenados separadamente de dados pessoais da carteira.

## Interface web (`/assets`)

- Formulário de revisão com **todos** os campos do cadastro (classificação, fiscais, cotação, observações), editáveis após lookup yfinance ou ao editar ativo salvo. O tipo do ativo não oferece mais «Renda fixa» nem «Previdência» (cadastrados na carteira).
- A tabela “Base local” **não exibe** renda fixa tradicional nem previdência (geridas na carteira); exibe ações, ETFs, FIIs, cripto e demais ativos de mercado.
- **Filtro** na tabela “Base local” por ticker ou nome (client-side).
- **Paginação** client-side (20 itens por página, opções 10/20/50/100), igual à listagem de proventos.
- **Importação em lote:** colar tickers (vírgula, ponto-e-vírgula ou linha), arquivo `.csv` (coluna `symbol`/`ticker`/`codigo`) ou `.txt` (um ticker por linha); pré-visualização via `/assets/bulk/preview`; salvar selecionados via `/assets/bulk`. ETFs nacionais sem subtipo devem ser ajustados antes do save (botão Editar na linha).

## Persistência e Git

| O que | No repositório | Na máquina do desenvolvedor |
|-------|----------------|----------------------------|
| Schema / código ORM | Sim | — |
| Catálogo público (`backend/seed/assets.json`) | **Sim** — exemplo para clone | — |
| Catálogo pessoal (`backend/seed/assets.local.json`) | **Não** | Opcional; mesclado no seed local |
| Arquivo `backend/carteira.db` (SQLite do catálogo) | **Não** | Gerado com `npm run db:seed` após clone |
| Banco unificado (`carteira.db`) | **Não** | `%LOCALAPPDATA%/carteira-investimento/` ou `DATABASE_URL` |

Comandos: `npm run db:seed` (mescla `assets.json` + `assets.local.json` se existir), `npm run db:export` (grava em `assets.local.json`), `npm run db:export:public` (atualiza `assets.json` do repo).

Importar uma carteira pode **criar ou atualizar** registros nesta base quando o usuário confirmar na tela de conferência; posições importadas vão apenas para o banco local de carteiras.

## Critérios de aceite

- O usuário consegue buscar um ativo antes de cadastrá-lo manualmente.
- O sistema consegue pré-preencher dados a partir de fonte externa.
- O usuário pode **corrigir ou complementar todos os campos** após o pré-preenchimento, antes de salvar.
- O usuário consegue salvar um ativo apenas na base.
- O usuário consegue **editar** (`PATCH`) e **excluir** (`DELETE`) um ativo já cadastrado.
- A lista da base local pode ser **filtrada** por ticker ou nome.
- O usuário consegue **importar em lote** com pré-visualização e relatório de criação.
- ETF nacional exige escolha entre renda variável e renda fixa.
- Ativos cadastrados na base ficam disponíveis para inclusão em uma ou mais carteiras.

