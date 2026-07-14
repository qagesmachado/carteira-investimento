# Limpar filtro restaura linhas e cartões

## Metadados

- **ID:** `UI-CNS-015`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** limpar filtros e restaurar visão completa
- **Depende de:** `UI-CNS-011` (filtro ativo sem linhas)
- **Arquivo de teste:** `e2e/specs/consolidada/15-limpar-filtro-restaura-linhas.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Limpar filtro e ver patrimônio completo

**Como** investidor  
**Quero** voltar à visão completa  
**Para** ver todo o patrimônio novamente

### Passo a passo

1. Filtro atual zera todas as linhas (após `UI-CNS-011`).
2. Limpo o campo de busca e demais filtros aplicados.
3. As linhas da carteira voltam à tabela.
4. Os cartões de resumo reaparecem com valores recalculados.

## Notas para automação (fase 2)

- Pode ser continuação do mesmo spec de `11` ou spec separado na mesma sessão.
