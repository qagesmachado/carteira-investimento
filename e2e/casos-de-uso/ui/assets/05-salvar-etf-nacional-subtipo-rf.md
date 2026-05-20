# Cadastrar ETF nacional com subtipo Renda fixa

## Metadados

- **ID:** `UI-AST-005`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** informar subtipo de ETF nacional ao salvar
- **Depende de:** `AUVP11` ainda não cadastrado
- **Arquivo de teste:** `e2e/specs/assets/05-salvar-etf-nacional-subtipo-rf.spec.ts`

- **Referência:** formulário de revisão em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake` (fake) · `yfinance` (complete)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — ETF nacional classificado como Renda fixa

**Como** investidor  
**Quero** informar o subtipo de um ETF nacional  
**Para** classificar corretamente na carteira

### Passo a passo

1. Estou em `/assets`.
2. O ticker `AUVP11` ainda não está cadastrado na base de teste.
3. Busco `AUVP11` via lookup.
4. No formulário de revisão, seleciono subtipo «Renda fixa».
5. Salvo o ativo.
6. O ativo aparece na tabela com tipo ETF e subtipo/indicador de RF conforme a UI.
7. O registro persiste em `data/test/carteira.db`.

## Notas para automação (fase 2)

- `AUVP11` (ETF nacional na B3, classificado como ETF no yfinance) substitui `AUPO11` neste caso — o Yahoo costuma devolver `AUPO11` como FII/ação, sem o campo de subtipo.
- Ticker usado em `UI-CNS-006` (filtro RF inclui ETF RF) após `UI-AST-005`.
