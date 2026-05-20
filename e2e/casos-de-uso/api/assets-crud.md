# API-ASSETS-003 — CRUD de ativo

- **ID:** `API-ASSETS-003`
- **Status:** rascunho
- **Arquivo de teste:** `e2e/api/assets-crud.contract.spec.ts` (fase 2)
- **Referência:** `POST/PATCH/DELETE /assets`

## Pré-condições

- Banco vazio

## Passos

1. Criar ativo via `POST /assets`
2. Atualizar nome via `PATCH /assets/{id}`
3. Confirmar alteração via `GET /assets`
4. Excluir via `DELETE /assets/{id}`
5. `GET /assets` — lista vazia

## Resultado esperado

- `201` na criação; corpo com `id`
- `200` no patch; nome atualizado na listagem
- `204` no delete; listagem vazia
