# Atualizar cotações na consolidada

## Metadados

- **ID:** `UI-CNS-004`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** refresh de cotações da carteira ativa
- **Depende de:** `UI-PRT-009`
- **Arquivo de teste:** `e2e/specs/consolidada/04-atualizar-cotacoes.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Atualizar cotações na consolidada

**Como** investidor  
**Quero** atualizar preços sem voltar a `/portfolios`  
**Para** ver valores atuais na visão consolidada

### Passo a passo

1. Carteira `E2E Principal` ativa com `BBSE3` e `VOO`.
2. Estou em `/consolidada`.
3. Clico em atualizar cotações e aguardo o fim da operação.
4. Mensagem de resumo (updated/skipped/failed) é exibida.
5. Colunas de valor na tabela refletem cotações do modo fake.
6. Cartões de resumo são recalculados.

## Notas para automação (fase 2)

- Mesmo comportamento de API que `UI-PRT-009`.
