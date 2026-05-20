# Colunas USD: valor em R$ e tooltip

## Metadados

- **ID:** `UI-CNS-009`
- **Status:** implementado
- **Página:** `/portfolios/consolidada`
- **Funcionalidade:** célula em R$, ícone `$`, tooltip em USD
- **Depende de:** `UI-PRT-015`, `UI-CNS-003`
- **Arquivo de teste:** `e2e/specs/consolidada/09-colunas-valores-usd-tooltip.spec.ts`
- **Referência:** `NativeCurrencyHint.svelte`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Valor em reais com dica em dólar

**Como** investidor  
**Quero** ver o valor convertido em R$ com referência ao USD original  
**Para** entender a exposição cambial

### Passo a passo

1. Linha de `VOO` visível na tabela consolidada.
2. Taxa USD/BRL carregada.
3. Observo a célula de valor da linha `VOO`.
4. O valor principal está formatado em **R$** (BRL).
5. O ícone `$` está visível ao lado do valor.
6. Passo o mouse sobre o ícone `$`.
7. O tooltip exibe «Moeda original — US$ …» com valor nativo em dólar, em uma linha legível.

## Notas para automação (fase 2)

- Hover no ícone; tooltip via popover CSS.
- Valor BRL ≈ valor USD × taxa (tolerância).
