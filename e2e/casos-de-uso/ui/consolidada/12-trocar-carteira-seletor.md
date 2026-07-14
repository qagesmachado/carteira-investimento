# Trocar carteira no seletor da consolidada

## Metadados

- **ID:** `UI-CNS-012`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** trocar carteira ativa no select
- **Depende de:** `UI-PRT-004` (duas carteiras)
- **Arquivo de teste:** `e2e/specs/consolidada/12-trocar-carteira-seletor.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Alternar para E2E Secundária

**Como** investidor  
**Quero** mudar a carteira na visão consolidada  
**Para** comparar outra carteira de teste

### Passo a passo

1. Existem `E2E Principal` e `E2E Secundária` com posições distintas.
2. Estou em `/consolidada` com `E2E Principal` selecionada.
3. No seletor, escolho `E2E Secundária`.
4. A tabela e os cartões recalculam para a carteira secundária.
5. O seletor mantém `E2E Secundária` selecionada.

## Notas para automação (fase 2)

- Requer `E2E Secundária` criada na suíte portfolios.
