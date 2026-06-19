# API — Posição unificada de renda fixa/previdência

## Metadados

- **ID:** `API-PRT-RF-001`
- **Status:** implementado
- **Depende de:** carteira existente (`POST /portfolios`)
- **Arquivo de teste:** `backend/tests/test_portfolios_http.py` (funções `test_create_fixed_income_position_*`, `test_update_fixed_income_position_*`)

## Pré-condições

- API em `http://127.0.0.1:8001` (E2E worker 0)
- Carteira criada via `POST /portfolios`

## Cenários

1. `POST /portfolios/{id}/fixed-income-positions` com `asset_type=fixed_income` cria produto + posição numa transação; retorna `201` com `PositionRead`.
2. `POST /portfolios/{id}/fixed-income-positions` com `asset_type=pension` aceita previdência da mesma forma.
3. `POST /portfolios/{id}/fixed-income-positions` com `asset_type=stock` retorna `422`.
4. Symbol duplicado (já existente em `/assets`) retorna `409` sem posição parcial.
5. `PATCH /portfolios/{id}/positions/{position_id}/fixed-income` atualiza produto + valores da posição; `symbol` não é alterado.
6. `contracted_yield` da posição deriva de `asset.fixed_income_yield_description`.

## Referência

- [Cadastro unificado de renda fixa e previdência na carteira](../../../docs/produto/desenvolvido/cadastro-rf-previdencia-na-carteira.md)
