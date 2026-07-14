"""Resumos financeiros em lote para o hub de carteiras."""

import pytest
from fastapi.testclient import TestClient

import app.services.portfolio_patrimony as portfolio_patrimony


def _create_asset(
    client: TestClient,
    symbol: str,
    *,
    asset_type: str = "stock",
    currency: str = "BRL",
    current_quote: float | None = 100.0,
) -> int:
    market = "national" if currency == "BRL" else "international"
    payload: dict = {
        "symbol": symbol,
        "name": f"Asset {symbol}",
        "asset_type": asset_type,
        "market": market,
        "currency": currency,
    }
    if currency == "USD":
        payload["country"] = "US"
    if current_quote is not None:
        payload["current_quote"] = current_quote
    response = client.post("/assets", json=payload)
    assert response.status_code == 201
    return response.json()["id"]


def test_get_portfolio_summaries_empty_portfolio(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Vazia"}).json()["id"]

    response = client.get("/portfolios/summaries")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    row = body[0]
    assert row["portfolio_id"] == portfolio_id
    assert row["invested_brl"] == 0.0
    assert row["current_brl"] == 0.0
    assert row["profit_brl"] == 0.0
    assert row["profit_pct"] is None
    assert row["position_count"] == 0
    assert row["is_active"] is False


def test_get_portfolio_summaries_brl_position(client: TestClient) -> None:
    asset_id = _create_asset(client, "BBSE3", current_quote=35.0)
    portfolio_id = client.post("/portfolios", json={"name": "BRL mix"}).json()["id"]
    client.put("/portfolios/active", json={"portfolio_id": portfolio_id})
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": 100, "average_price": 30.0},
    )

    response = client.get("/portfolios/summaries")
    assert response.status_code == 200
    row = next(item for item in response.json() if item["portfolio_id"] == portfolio_id)
    assert row["invested_brl"] == 3_000.0
    assert row["current_brl"] == 3_500.0
    assert row["profit_brl"] == 500.0
    assert row["profit_pct"] == 500.0 / 3_000.0 * 100.0
    assert row["position_count"] == 1
    assert row["is_active"] is True


def test_get_portfolio_summaries_usd_with_fx(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(portfolio_patrimony, "get_usd_brl_state", lambda _session: (5.0, None))
    asset_id = _create_asset(client, "VOO", asset_type="etf", currency="USD", current_quote=400.0)
    portfolio_id = client.post("/portfolios", json={"name": "USD"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": 2, "average_price": 350.0},
    )

    response = client.get("/portfolios/summaries")
    row = next(item for item in response.json() if item["portfolio_id"] == portfolio_id)
    assert row["invested_brl"] == 3_500.0
    assert row["current_brl"] == 4_000.0
    assert row["profit_brl"] == 500.0


def test_get_portfolio_summaries_fixed_income_manual(client: TestClient) -> None:
    asset_id = _create_asset(client, "CDB1", asset_type="fixed_income", current_quote=None)
    portfolio_id = client.post("/portfolios", json={"name": "RF"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={
            "asset_id": asset_id,
            "invested_amount": 1_000.0,
            "current_value": 1_069.02,
        },
    )

    response = client.get("/portfolios/summaries")
    row = next(item for item in response.json() if item["portfolio_id"] == portfolio_id)
    assert row["invested_brl"] == 1_000.0
    assert row["current_brl"] == 1_069.02
    assert row["profit_brl"] == pytest.approx(69.02)
