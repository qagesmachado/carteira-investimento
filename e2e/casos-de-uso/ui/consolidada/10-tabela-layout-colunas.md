# Layout da tabela: colunas Ativo e Qtd

## Metadados

- **ID:** `UI-CNS-010`
- **Status:** implementado
- **Página:** `/portfolios/consolidada`
- **Funcionalidade:** legibilidade sem sobreposição de colunas
- **Depende de:** tabela carregada
- **Arquivo de teste:** `e2e/specs/consolidada/10-tabela-layout-colunas.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Colunas legíveis sem sobreposição

**Como** investidor  
**Quero** ler ticker e nome do ativo  
**Para** identificar cada linha sem confusão visual

### Passo a passo

1. Tabela consolidada com ativo de nome longo (ex.: `BBSE3` no fake).
2. Viewport desktop (projeto Chrome do Playwright).
3. Visualizo colunas «Ativo», «Nome» (se separada) e «Qtd».
4. O ticker na coluna Ativo está totalmente visível.
5. A coluna «Qtd» é mais estreita que colunas de texto longo.
6. Não há sobreposição de texto entre colunas Ativo e Nome.

## Notas para automação (fase 2)

- `boundingBox` para verificar que caixas não se intersectam.
