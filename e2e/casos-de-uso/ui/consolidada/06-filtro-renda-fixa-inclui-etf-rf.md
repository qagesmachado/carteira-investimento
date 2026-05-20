# Filtro Renda fixa inclui ETF de RF

## Metadados

- **ID:** `UI-CNS-006`
- **Status:** implementado
- **Página:** `/portfolios/consolidada`
- **Funcionalidade:** tipo «Renda fixa» inclui ETFs de subtipo RF
- **Depende de:** `UI-AST-005`, posição em `AUVP11`
- **Arquivo de teste:** `e2e/specs/consolidada/06-filtro-renda-fixa-inclui-etf-rf.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — ETF RF aparece no filtro Renda fixa

**Como** investidor  
**Quero** ver ETFs de renda fixa ao filtrar RF  
**Para** alinhar com a regra de negócio do produto

### Passo a passo

1. `AUVP11` está cadastrado como ETF com subtipo Renda fixa e há posição na carteira ativa.
2. Existe também RF manual na mesma carteira.
3. Em `/portfolios/consolidada`, seleciono filtro de tipo «Renda fixa».
4. A linha do ETF `AUVP11` permanece visível.
5. A linha de RF manual permanece visível.
6. Linhas de tipo Ação (ex.: `BBSE3`) não aparecem.

## Notas para automação (fase 2)

- Cobre `rowMatchesAssetTypeFilter` para ETF RF.
