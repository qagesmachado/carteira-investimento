# Lote com ETF nacional sem subtipo

## Metadados

- **ID:** `UI-AST-018`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** revisar ETF no modal do lote e informar subtipo
- **Depende de:** pré-visualização com ETF sem subtipo
- **Arquivo de teste:** `e2e/specs/assets/18-importacao-lote-etf-subtipo.spec.ts`

- **Referência:** modal de revisão do lote em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Informar subtipo Renda fixa no lote

**Como** investidor  
**Quero** informar subtipo na revisão do lote  
**Para** concluir o cadastro do ETF

### Passo a passo

1. Executo pré-visualização de lote que inclui ETF nacional sem subtipo definido.
2. Abro o modal de revisão da linha problemática.
3. Informo subtipo «Renda fixa».
4. Marco a linha como selecionável e salvo selecionados.
5. O ETF é criado na base de teste com subtipo correto.
6. Aparece na tabela de cadastrados após recarregar.

## Notas para automação (fase 2)

- Usar ticker de ETF RF conhecido do fake provider no texto do lote.
