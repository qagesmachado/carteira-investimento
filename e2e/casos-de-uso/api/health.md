# API-HEALTH-001 — Health check

- **ID:** `API-HEALTH-001`
- **Status:** rascunho
- **Arquivo de teste:** `e2e/api/health.contract.spec.ts` (fase 2)
- **Referência:** `GET /health`

## Pré-condições

- API rodando em `http://127.0.0.1:8000` (webServer Playwright)

## Passos

1. Enviar `GET /health`

## Resultado esperado

- Status `200`
- JSON com campo `status` (ex.: `"ok"`)
