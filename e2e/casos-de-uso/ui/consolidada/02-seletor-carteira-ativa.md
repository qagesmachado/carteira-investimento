# Seletor preenchido após carregar

## Metadados

- **ID:** `UI-CNS-002`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** select de carteira com valor após load
- **Depende de:** `UI-PRT-002`
- **Arquivo de teste:** `e2e/specs/consolidada/02-seletor-carteira-ativa.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Select com E2E Principal selecionada

**Como** investidor  
**Quero** ver qual carteira estou consolidando  
**Para** não analisar a carteira errada

### Passo a passo

1. Carteira `E2E Principal` está definida como ativa em `portfolios.db`.
2. Existem posições nesta carteira.
3. Abro `/consolidada` e aguardo o carregamento.
4. O seletor exibe `E2E Principal` selecionada (não fica vazio após load).
5. A tabela reflete posições desta carteira.

## Notas para automação (fase 2)

- Regressão do bug de select vazio no primeiro paint.
