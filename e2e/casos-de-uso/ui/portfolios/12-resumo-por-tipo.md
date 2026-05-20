# Resumo por tipo de ativo

## Metadados

- **ID:** `UI-PRT-012`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** rodapé «Por tipo»
- **Depende de:** `UI-PRT-005`, `UI-PRT-006`, `UI-PRT-015`
- **Arquivo de teste:** `e2e/specs/portfolios/12-resumo-por-tipo.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Exibir agrupamento por tipo

**Como** investidor  
**Quero** ver o agrupamento por tipo  
**Para** entender a composição da carteira

### Passo a passo

1. Carteira `E2E Principal` ativa com ação (`BBSE3`), ETF USD (`VOO`) e RF manual.
2. Visualizo o rodapé ou seção «Por tipo» abaixo da tabela.
3. Aparecem entradas para os tipos presentes (ex.: Ação, ETF, Renda fixa).
4. Os valores somam coerentemente com as linhas visíveis (tolerância na fase 2).

## Notas para automação (fase 2)

- Estado alimenta casos em `ui/consolidada/`.
