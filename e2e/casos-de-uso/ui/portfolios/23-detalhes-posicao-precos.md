# Detalhes expansíveis com preços unitários

## Metadados

- **ID:** `UI-PRT-023`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** painel de detalhes por posição
- **Depende de:** `UI-PRT-005` (posição em `BBSE3` com cotação)
- **Arquivo de teste:** `e2e/specs/portfolios/23-detalhes-posicao-precos.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Ver preço médio e cotação no painel

**Como** investidor  
**Quero** abrir os detalhes de uma posição de mercado  
**Para** ver preço médio de compra e cotação atual unitária

### Passo a passo

1. Carteira `E2E Principal` ativa com posição `BBSE3`.
2. Clico em **Detalhes** na linha de `BBSE3`.
3. O painel expansível exibe **Preço médio de compra** e **Preço atual (cotação)**.
