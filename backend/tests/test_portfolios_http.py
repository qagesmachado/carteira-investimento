"""Contratos HTTP de ``/portfolios``."""

from fastapi.testclient import TestClient


def _create_asset(
    client: TestClient,
    symbol: str = "POS1",
    asset_type: str = "stock",
) -> int:
    response = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": "Pos Asset",
            "asset_type": asset_type,
            "market": "national",
            "currency": "BRL",
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_get_portfolios_empty(client: TestClient) -> None:
    response = client.get("/portfolios")
    assert response.status_code == 200
    assert response.json() == []


def test_post_portfolio_returns_201(client: TestClient) -> None:
    response = client.post(
        "/portfolios",
        json={"name": "Pessoal", "base_currency": "BRL"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Pessoal"
    assert "id" in body


def test_active_portfolio_roundtrip(client: TestClient) -> None:
    created = client.post("/portfolios", json={"name": "Ativa"}).json()
    put = client.put("/portfolios/active", json={"portfolio_id": created["id"]})
    assert put.status_code == 200
    assert put.json()["portfolio_id"] == created["id"]
    assert client.get("/portfolios/active").json()["portfolio_id"] == created["id"]


def test_positions_crud(client: TestClient) -> None:
    asset_id = _create_asset(client)
    portfolio_id = client.post("/portfolios", json={"name": "Com posições"}).json()["id"]

    created = client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": 10, "average_price": 25},
    )
    assert created.status_code == 201
    position_id = created.json()["id"]

    listed = client.get(f"/portfolios/{portfolio_id}/positions")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    patched = client.patch(
        f"/portfolios/{portfolio_id}/positions/{position_id}",
        json={"quantity": 20},
    )
    assert patched.status_code == 200
    assert patched.json()["quantity"] == 20

    deleted = client.delete(f"/portfolios/{portfolio_id}/positions/{position_id}")
    assert deleted.status_code == 204
    assert client.get(f"/portfolios/{portfolio_id}/positions").json() == []


def test_fixed_income_position_accepts_manual_values(client: TestClient) -> None:
    asset_id = _create_asset(client, "CDBBTG2028", "fixed_income")
    portfolio_id = client.post("/portfolios", json={"name": "Renda fixa"}).json()["id"]

    created = client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={
            "asset_id": asset_id,
            "invested_amount": 1000,
            "current_value": 1069.02,
            "contracted_yield": "IPCA + 8,40% a.a.",
        },
    )

    assert created.status_code == 201
    body = created.json()
    assert body["invested_amount"] == 1000
    assert body["current_value"] == 1069.02
    assert body["contracted_yield"] == "IPCA + 8,40% a.a."

    patched = client.patch(
        f"/portfolios/{portfolio_id}/positions/{body['id']}",
        json={"current_value": 1080.5},
    )
    assert patched.status_code == 200
    assert patched.json()["current_value"] == 1080.5


def _fixed_income_asset_payload(symbol: str = "E2E-CDB-2028", asset_type: str = "fixed_income") -> dict:
    return {
        "symbol": symbol,
        "name": "CDB BTG IPCA+ 2028",
        "asset_type": asset_type,
        "market": "national",
        "currency": "BRL",
        "fixed_income_indexer": "ipca_plus",
        "fixed_income_yield_description": "IPCA + 8,40% a.a.",
        "fixed_income_title_type": "cdb",
    }


def test_create_fixed_income_position_creates_asset_and_position(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "RF unificada"}).json()["id"]

    response = client.post(
        f"/portfolios/{portfolio_id}/fixed-income-positions",
        json={
            "asset": _fixed_income_asset_payload(),
            "invested_amount": 1000,
            "current_value": 1069.02,
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["invested_amount"] == 1000
    assert body["current_value"] == 1069.02
    # Rentabilidade do produto reaproveitada como rendimento contratado da posição.
    assert body["contracted_yield"] == "IPCA + 8,40% a.a."

    # Asset foi criado na base e a posição o referencia.
    assets = client.get("/assets").json()
    symbols = [a["symbol"] for a in assets]
    assert "E2E-CDB-2028" in symbols
    positions = client.get(f"/portfolios/{portfolio_id}/positions").json()
    assert len(positions) == 1
    assert positions[0]["asset_id"] == body["asset_id"]


def test_create_fixed_income_position_accepts_pension(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Previdência"}).json()["id"]

    response = client.post(
        f"/portfolios/{portfolio_id}/fixed-income-positions",
        json={
            "asset": {
                "symbol": "E2E-PREV-PGBL",
                "name": "PGBL Itaú",
                "asset_type": "pension",
                "market": "national",
                "currency": "BRL",
            },
            "invested_amount": 5000,
            "current_value": 5200,
        },
    )

    assert response.status_code == 201
    assert response.json()["invested_amount"] == 5000


def test_create_fixed_income_position_rejects_non_fixed_income_type(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Tipo inválido"}).json()["id"]

    response = client.post(
        f"/portfolios/{portfolio_id}/fixed-income-positions",
        json={
            "asset": _fixed_income_asset_payload("E2E-STK", asset_type="stock"),
            "invested_amount": 1000,
        },
    )

    assert response.status_code == 422


def test_create_fixed_income_position_duplicate_symbol_is_atomic(client: TestClient) -> None:
    """Symbol duplicado retorna 409 e não cria asset nem posição órfãos."""
    portfolio_id = client.post("/portfolios", json={"name": "Duplicado"}).json()["id"]
    # Cria um ativo de RF com o mesmo symbol previamente.
    client.post("/assets", json=_fixed_income_asset_payload("E2E-DUP-RF"))
    positions_before = client.get(f"/portfolios/{portfolio_id}/positions").json()

    response = client.post(
        f"/portfolios/{portfolio_id}/fixed-income-positions",
        json={
            "asset": _fixed_income_asset_payload("E2E-DUP-RF"),
            "invested_amount": 1000,
        },
    )

    assert response.status_code == 409
    # Nenhuma posição criada.
    positions_after = client.get(f"/portfolios/{portfolio_id}/positions").json()
    assert len(positions_after) == len(positions_before)


def test_update_fixed_income_position_updates_asset_and_position(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Edição RF"}).json()["id"]
    created = client.post(
        f"/portfolios/{portfolio_id}/fixed-income-positions",
        json={"asset": _fixed_income_asset_payload(), "invested_amount": 1000, "current_value": 1000},
    ).json()
    position_id = created["id"]
    asset_id = created["asset_id"]

    response = client.patch(
        f"/portfolios/{portfolio_id}/positions/{position_id}/fixed-income",
        json={
            "asset": {
                "name": "CDB BTG IPCA+ 2028 (revisado)",
                "fixed_income_yield_description": "IPCA + 9,00% a.a.",
            },
            "invested_amount": 1000,
            "current_value": 1150.75,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["current_value"] == 1150.75
    assert body["contracted_yield"] == "IPCA + 9,00% a.a."

    asset = next(a for a in client.get("/assets").json() if a["id"] == asset_id)
    assert asset["name"] == "CDB BTG IPCA+ 2028 (revisado)"
    assert asset["fixed_income_yield_description"] == "IPCA + 9,00% a.a."


def test_update_fixed_income_position_ignores_symbol_change(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Symbol fixo"}).json()["id"]
    created = client.post(
        f"/portfolios/{portfolio_id}/fixed-income-positions",
        json={"asset": _fixed_income_asset_payload("E2E-FIX-SYM"), "invested_amount": 1000},
    ).json()

    response = client.patch(
        f"/portfolios/{portfolio_id}/positions/{created['id']}/fixed-income",
        json={
            "asset": {"symbol": "OUTRO-SYMBOL"},
            "invested_amount": 2000,
        },
    )

    assert response.status_code == 200
    asset = next(a for a in client.get("/assets").json() if a["id"] == created["asset_id"])
    assert asset["symbol"] == "E2E-FIX-SYM"


def test_post_position_rejects_negative_manual_value(client: TestClient) -> None:
    asset_id = _create_asset(client, "LCI1", "fixed_income")
    portfolio_id = client.post("/portfolios", json={"name": "RF inválida"}).json()["id"]

    response = client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "invested_amount": -1},
    )

    assert response.status_code == 422


def test_post_position_rejects_negative_quantity(client: TestClient) -> None:
    asset_id = _create_asset(client, "NEG1")
    portfolio_id = client.post("/portfolios", json={"name": "Validação"}).json()["id"]

    response = client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": -2, "average_price": 0},
    )

    assert response.status_code == 422


def test_patch_portfolio_renames(client: TestClient) -> None:
    created = client.post("/portfolios", json={"name": "Nome original"}).json()
    portfolio_id = created["id"]

    patched = client.patch(
        f"/portfolios/{portfolio_id}",
        json={"name": "Nome atualizado"},
    )
    assert patched.status_code == 200
    assert patched.json()["name"] == "Nome atualizado"

    other_id = client.post("/portfolios", json={"name": "Outra carteira"}).json()["id"]
    conflict = client.patch(
        f"/portfolios/{portfolio_id}",
        json={"name": "Outra carteira"},
    )
    assert conflict.status_code == 409
    assert "portfolio name already exists" in conflict.json()["detail"]


def test_export_portfolio_json(client: TestClient) -> None:
    asset_id = _create_asset(client, "EXPT1")
    portfolio_id = client.post("/portfolios", json={"name": "Exportável"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": 5, "average_price": 1},
    )

    response = client.get(f"/portfolios/{portfolio_id}/export")
    assert response.status_code == 200
    body = response.json()
    assert body["version"] == 2
    assert body["portfolio"]["name"] == "Exportável"
    assert len(body["positions"]) == 1
    assert body["positions"][0]["symbol"] == "EXPT1"


def test_export_portfolio_includes_manual_fixed_income_fields(client: TestClient) -> None:
    asset_id = _create_asset(client, "CDBEXP", "fixed_income")
    portfolio_id = client.post("/portfolios", json={"name": "Exporta RF"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={
            "asset_id": asset_id,
            "invested_amount": 2000,
            "current_value": 2161.48,
            "contracted_yield": "IPCA + 8,40% a.a.",
        },
    )

    response = client.get(f"/portfolios/{portfolio_id}/export")

    assert response.status_code == 200
    position = response.json()["positions"][0]
    assert position["symbol"] == "CDBEXP"
    assert position["invested_amount"] == 2000
    assert position["current_value"] == 2161.48
    assert position["contracted_yield"] == "IPCA + 8,40% a.a."


def test_post_position_accepts_fractional_quantity(client: TestClient) -> None:
    asset_id = _create_asset(client, "VOO1", "stock")
    portfolio_id = client.post("/portfolios", json={"name": "Fracionária"}).json()["id"]

    created = client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": 1.88637, "average_price": 580.5},
    )

    assert created.status_code == 201
    assert created.json()["quantity"] == 1.88637


def test_refresh_portfolio_quotes_updates_quoted_assets(client: TestClient) -> None:
    stock_id = _create_asset(client, "RFSTK", "stock")
    rf_id = _create_asset(client, "RFMAN", "fixed_income")
    portfolio_id = client.post("/portfolios", json={"name": "Refresh quotes"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock_id, "quantity": 10, "average_price": 25},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={
            "asset_id": rf_id,
            "invested_amount": 1000,
            "current_value": 1050,
            "contracted_yield": "100% CDI",
        },
    )

    response = client.post(f"/portfolios/{portfolio_id}/quotes/refresh")

    assert response.status_code == 200
    body = response.json()
    assert body["updated"] == 1
    assert body["skipped"] == 1
    assert body["failed"] == []

    asset = client.get("/assets").json()
    stock = next(a for a in asset if a["id"] == stock_id)
    assert stock["current_quote"] == 38.5
    assert stock["quote_source"] == "yfinance"


def test_patch_portfolio_delete_locked(client: TestClient) -> None:
    created = client.post("/portfolios", json={"name": "Com trava"}).json()
    patched = client.patch(
        f"/portfolios/{created['id']}",
        json={"delete_locked": True},
    )
    assert patched.status_code == 200
    assert patched.json()["delete_locked"] is True


def test_delete_portfolio_rejected_when_locked(client: TestClient) -> None:
    created = client.post("/portfolios", json={"name": "Bloqueada"}).json()
    portfolio_id = created["id"]
    client.patch(f"/portfolios/{portfolio_id}", json={"delete_locked": True})
    deleted = client.delete(f"/portfolios/{portfolio_id}?cascade=all")
    assert deleted.status_code == 403
    assert client.get(f"/portfolios/{portfolio_id}").status_code == 200
