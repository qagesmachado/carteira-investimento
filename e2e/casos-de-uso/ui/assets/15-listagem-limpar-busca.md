# Limpar busca na listagem

## Metadados

- **ID:** `UI-AST-015`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** restaurar lista completa ao limpar filtro
- **Depende de:** `UI-AST-006` (filtro ativo)
- **Arquivo de teste:** `e2e/specs/assets/15-listagem-limpar-busca.spec.ts`

- **Referência:** filtro da tabela em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Limpar filtro restaura todas as linhas

**Como** investidor  
**Quero** limpar o filtro  
**Para** ver todos os ativos novamente

### Passo a passo

1. O filtro da listagem está ativo e reduziu o número de linhas visíveis.
2. Apago o texto do campo de busca da listagem.
3. Aguardo o debounce.
4. Todas as linhas cadastradas na base de teste voltam a ser exibidas.
5. O contador volta ao total de ativos na base.

## Notas para automação (fase 2)

- Pode ser continuação do mesmo spec de `06` ou spec separado após aplicar filtro.
