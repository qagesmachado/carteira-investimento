# Totais por moeda na carteira

## Metadados

- **ID:** `UI-PRT-020`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** totais BRL e USD no resumo da tabela
- **Depende de:** posições BRL e USD (`UI-PRT-005`, `UI-PRT-015`)
- **Arquivo de teste:** `e2e/specs/portfolios/20-resumo-totais-moeda.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Totais separados por moeda

**Como** investidor  
**Quero** ver totais separados por moeda  
**Para** distinguir exposição em reais e dólares

### Passo a passo

1. Existem posições em BRL e USD na carteira `E2E Principal`.
2. Observo os totais por moeda na interface da tabela ou resumo.
3. Há total ou subtotal em BRL para posições em reais.
4. Há indicação de exposição USD para `VOO`.

## Notas para automação (fase 2)

- Conversão consolidada em reais é testada em `UI-CNS-007`.
