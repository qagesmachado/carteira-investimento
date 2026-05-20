# Filtro sem resultados na consolidada

## Metadados

- **ID:** `UI-CNS-011`
- **Status:** implementado
- **Página:** `/portfolios/consolidada`
- **Funcionalidade:** filtro zera linhas — ocultar cartões e mensagem na tabela
- **Depende de:** carteira com posições
- **Arquivo de teste:** `e2e/specs/consolidada/11-estados-sem-linhas-filtro.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Busca sem correspondência

**Como** investidor  
**Quero** feedback claro quando nenhum ativo corresponde  
**Para** saber que devo ajustar os filtros

### Passo a passo

1. Carteira ativa com várias posições visíveis sem filtro.
2. Aplico busca por texto inexistente (ex.: `ZZZNOMATCH`).
3. Aguardo atualização da tabela.
4. A tabela não exibe linhas de dados.
5. Vejo mensagem de nenhum resultado (ou estado vazio).
6. Os cartões de resumo BRL/USD/consolidado **não** são exibidos.

## Notas para automação (fase 2)

- `not.toBeVisible()` nos seletores dos cartões.
