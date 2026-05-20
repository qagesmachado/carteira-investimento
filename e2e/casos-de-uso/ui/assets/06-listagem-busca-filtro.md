# Filtrar tabela por texto de busca

## Metadados

- **ID:** `UI-AST-006`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** busca na listagem de cadastrados com debounce
- **Depende de:** múltiplos ativos na base (`UI-AST-002`, `UI-AST-009` ou seed)
- **Arquivo de teste:** `e2e/specs/assets/06-listagem-busca-filtro.spec.ts`

- **Referência:** tabela e filtro em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (pelo menos 3 tickers)
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Filtrar listagem por BBSE

**Como** investidor  
**Quero** buscar na lista de cadastrados  
**Para** encontrar um ativo rapidamente

### Passo a passo

1. A base de teste contém ativos `BBSE3`, `PETR4` e outros (cadastrados em casos anteriores da suíte).
2. Estou em `/assets` com a tabela carregada.
3. Digito `BBSE` no campo de busca/filtro da listagem.
4. Aguardo o debounce da busca.
5. A tabela exibe apenas linhas cujo ticker ou nome contém `BBSE` (ex.: `BBSE3`).
6. O badge ou contador de resultados reflete o número filtrado (ex.: 1).
7. Linhas que não correspondem ao filtro não aparecem.

## Notas para automação (fase 2)

- Garantir pré-condição com API ou sequência de specs anteriores na mesma run.
