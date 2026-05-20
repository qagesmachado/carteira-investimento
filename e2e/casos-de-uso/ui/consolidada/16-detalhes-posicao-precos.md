# Detalhes expansíveis com preços unitários

## Metadados

- **ID:** `UI-CNS-016`
- **Status:** implementado
- **Página:** `/portfolios/consolidada`
- **Funcionalidade:** painel de detalhes por posição
- **Depende de:** seed consolidada principal (`BBSE3` com cotação)
- **Arquivo de teste:** `e2e/specs/consolidada/16-detalhes-posicao-precos.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Ver preço médio e cotação no painel

**Como** investidor  
**Quero** abrir os detalhes de uma posição na visão consolidada  
**Para** ver preço médio de compra e cotação atual unitária

### Passo a passo

1. Carteira `E2E Principal` selecionada com posição `BBSE3`.
2. Clico em **Detalhes** na linha de `BBSE3`.
3. O painel expansível exibe **Preço médio de compra** e **Preço atual (cotação)**.
