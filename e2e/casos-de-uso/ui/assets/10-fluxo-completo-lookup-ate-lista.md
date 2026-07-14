# Fluxo completo: lookup até listagem

## Metadados

- **ID:** `UI-AST-010`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** popular catálogo mínimo para suíte portfolios
- **Depende de:** bases vazias no início (run dedicada ou início de suíte)
- **Arquivo de teste:** `e2e/specs/assets/10-fluxo-completo-lookup-ate-lista.spec.ts`

- **Referência:** [`dependencias.md`](../../dependencias.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (vazia no início)
- **Base de carteiras:** `backend/data/test/portfolios.db` (vazia)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Popular catálogo mínimo E2E

**Como** investidor  
**Quero** cadastrar o mix mínimo de ativos  
**Para** habilitar os casos de `/portfolios` e `/consolidada`

### Passo a passo

1. `globalSetup` deixou ambas as bases de teste vazias (ou este spec roda em run dedicada).
2. Estou em `/assets`.
3. Cadastro via lookup o ticker `BBSE3` (ação BRL) e verifico na tabela.
4. Cadastro via lookup o ticker `VOO` (ETF internacional USD) e verifico na tabela.
5. Cadastro manual de um ativo de renda fixa (fluxo simplificado de RF).
6. Opcional: cadastro de `AUPO11` (ETF RF) e `BTC-USD` se o fake suportar.
7. A tabela lista todos os ativos com tipos e moedas esperados.
8. `data/test/carteira.db` contém o mix documentado em `dependencias.md`.
9. A suíte `ui/portfolios/` pode assumir estes tickers nos casos seguintes.

## Notas para automação (fase 2)

- Pode ser o último spec de `assets/` na run completa.
- Alternativa: seed via API no `beforeAll` na fase 2.
