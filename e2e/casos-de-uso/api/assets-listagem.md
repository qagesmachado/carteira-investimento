# API-ASSETS-001 — Listagem vazia e com dados

- **ID:** `API-ASSETS-001`
- **Status:** rascunho
- **Arquivo de teste:** `e2e/api/assets-listagem.contract.spec.ts` (fase 2)
- **Referência:** `GET /assets`

## Pré-condições

- Banco de teste recém-criado

## Passos

1. `GET /assets` em banco vazio
2. `POST /assets` com payload válido
3. `GET /assets` novamente

## Resultado esperado

- Passo 1: `200`, lista `[]`
- Passo 3: `200`, lista contém o ativo criado
