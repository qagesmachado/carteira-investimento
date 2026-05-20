# Atualizar câmbio USD/BRL

## Metadados

- **ID:** `UI-CNS-003`
- **Status:** implementado
- **Página:** `/portfolios/consolidada`
- **Funcionalidade:** linha de status FX, refresh, recálculo em BRL
- **Depende de:** `UI-PRT-015` (posição `VOO`)
- **Arquivo de teste:** `e2e/specs/consolidada/03-atualizar-cambio-usd-brl.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Exibir e atualizar taxa USD/BRL

**Como** investidor  
**Quero** atualizar o câmbio  
**Para** ver patrimônio USD convertido em reais

### Passo a passo

1. Carteira ativa contém posição em `VOO` (USD).
2. Estou em `/portfolios/consolidada`.
3. Observo a linha de status com taxa USD/BRL.
4. Clico em atualizar câmbio (refresh FX) e aguardo conclusão.
5. A taxa exibida é atualizada ou confirmada pelo modo fake.
6. Valores consolidados em BRL nas linhas USD refletem a taxa (se o fake alterar).

## Notas para automação (fase 2)

- Pré-requisito para `UI-CNS-009` (tooltip e valor em R$).
