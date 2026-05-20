# API-ASSETS-002 — Lookup de ticker

- **ID:** `API-ASSETS-002`
- **Status:** rascunho
- **Arquivo de teste:** `e2e/api/assets-lookup.contract.spec.ts` (fase 2)
- **Referência:** `GET /assets/lookup?symbol=`

## Pré-condições

- `ASSET_LOOKUP_MODE=fake`

## Passos

1. `GET /assets/lookup` sem query `symbol`
2. `GET /assets/lookup?symbol=bbse3`

## Resultado esperado

- Passo 1: `422`
- Passo 2: `200`, JSON com `symbol`, `name`, `asset_type`, `currency`
