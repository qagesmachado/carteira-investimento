# API-ASSETS-004 — Importação em lote

- **ID:** `API-ASSETS-004`
- **Status:** rascunho
- **Arquivo de teste:** `e2e/api/assets-bulk.contract.spec.ts` (fase 2)
- **Referência:** `POST /assets/bulk/preview`, `POST /assets/bulk`

## Pré-condições

- `ASSET_LOOKUP_MODE=fake`
- Banco vazio

## Passos

1. `POST /assets/bulk/preview` com lista de símbolos
2. `POST /assets/bulk` com payloads válidos
3. `GET /assets`

## Resultado esperado

- Preview retorna itens com `lookup` ou `error` por símbolo
- Bulk cria ativos; listagem contém os símbolos enviados
