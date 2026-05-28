# Proventos no dashboard — Por ano, por mês, tabela e barras

## Metadados

- **ID:** `UI-DASH-008`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** painel de proventos com visão anual (cada ano registrado), visão mensal (Jan–Dez do ano escolhido), tabela e barras
- **Depende de:** seed consolidada com proventos em 2020, 2021 e ano corrente
- **Arquivo de teste:** `e2e/specs/dashboard/08-proventos-painel-visao.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira.db`
- **Lookup:** `yfinance`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Visão anual e mensal com filtros

**Como** investidor  
**Quero** ver proventos agrupados por ano registrado ou por mês de um ano escolhido  
**Para** analisar a evolução histórica dos proventos da carteira

### Passo a passo

1. Existe carteira ativa com proventos em 2020, 2021 e no ano corrente (seed).
2. Abro `/dashboard`.
3. Na seção «Proventos no dashboard», a visão **Anual** lista anos como 2020 e 2021.
4. Clico «Barras» e as barras horizontais por ano aparecem.
5. Clico «Mensal» e seleciono o ano **2021**.
6. A tabela exibe meses (Jan–Dez) com totais de fev e ago preenchidos.
7. Seleciono **2020** e vejo o mês **Jun** com lançamento.
8. Clico «Anual» e a lista por ano volta.
