# Lote com ticker já cadastrado

## Metadados

- **ID:** `UI-AST-017`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** pré-visualização marca ticker duplicado no lote
- **Depende de:** `UI-AST-002` (`BBSE3` cadastrado)
- **Arquivo de teste:** `e2e/specs/assets/17-importacao-lote-ja-cadastrado.spec.ts`

- **Referência:** cadastro em lote em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (contém `BBSE3`)
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake` (fake) · `yfinance` (complete)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — BBSE3 aparece como já cadastrado no lote

**Como** investidor  
**Quero** ver quais tickers já existem  
**Para** não duplicar importação

### Passo a passo

1. `BBSE3` já está em `data/test/carteira.db` (`UI-AST-002`).
2. Estou no fluxo de lote em `/assets`.
3. Incluo `BBSE3` junto com `KLBN4` na lista colada.
4. Executo a pré-visualização.
5. A linha de `BBSE3` indica status «já cadastrado» (ou equivalente) e não pode ser salva novamente.
6. `KLBN4` permanece elegível para salvar se o lookup retornar dados.

## Notas para automação (fase 2)

- Não salvar `BBSE3` neste cenário.
- Ticker elegível no lote: `KLBN4` (PN da Klabin na B3). O símbolo `KLBN` isolado não existe no Yahoo/yfinance.
