# Adicionar posição USD (VOO)

## Metadados

- **ID:** `UI-PRT-015`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** posição em ETF internacional
- **Depende de:** `UI-PRT-005`, `UI-AST-010` (`VOO` no catálogo)
- **Arquivo de teste:** `e2e/specs/portfolios/15-adicionar-posicao-voo-usd.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (contém `VOO`)
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Posição em VOO

**Como** investidor  
**Quero** registrar ETF internacional  
**Para** testar consolidado em USD na página 3

### Passo a passo

1. `VOO` está no catálogo de teste.
2. Carteira `E2E Principal` ativa sem posição em `VOO`.
3. Adiciono posição em `VOO` com quantidade `10` e preço em USD conforme a UI.
4. Salvo a posição.
5. Linha `VOO` aparece com indicação de moeda USD.
6. Registro persiste em `portfolios.db` após recarregar.

## Notas para automação (fase 2)

- Pré-requisito para `UI-CNS-009` (tooltip USD).
