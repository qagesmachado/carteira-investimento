import pytest
from fastapi.testclient import TestClient


def _create_crypto_asset(client: TestClient, symbol: str = "BTC-USD") -> dict:
    response = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": "Bitcoin USD",
            "asset_type": "crypto",
            "market": "international",
            "country": "US",
            "currency": "USD",
            "current_quote": 65000.0,
        },
    )
    assert response.status_code == 201
    return response.json()


def _create_portfolio(client: TestClient, name: str = "Carteira Teste") -> dict:
    response = client.post(
        "/portfolios",
        json={"name": name, "base_currency": "BRL", "status": "active"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_get_crypto_fees_empty(client: TestClient) -> None:
    response = client.get("/crypto-fees")
    assert response.status_code == 200
    assert response.json() == []


def test_post_and_get_crypto_fee(client: TestClient) -> None:
    asset = _create_crypto_asset(client)
    portfolio = _create_portfolio(client)
    response = client.post(
        "/crypto-fees",
        json={
            "portfolio_id": portfolio["id"],
            "asset_id": asset["id"],
            "fee_type": "purchase",
            "fee_date": "2025-06-26",
            "quantity_moved": 0.00084,
            "fee_quantity_btc": 0.00000084,
            "quote_brl": 590867.0,
            "fx_rate": 5.54,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["symbol"] == "BTC-USD"
    assert body["fee_type"] == "purchase"
    assert body["final_quantity_after_fee"] == pytest.approx(0.00083916)
    assert body["fee_percent"] == pytest.approx(0.1)
    assert body["fee_value_brl"] == pytest.approx(0.4963278, rel=1e-4)

    listed = client.get("/crypto-fees", params={"portfolio_id": portfolio["id"]}).json()
    assert len(listed) == 1


def test_patch_and_delete_crypto_fee(client: TestClient) -> None:
    asset = _create_crypto_asset(client)
    portfolio = _create_portfolio(client)
    created = client.post(
        "/crypto-fees",
        json={
            "portfolio_id": portfolio["id"],
            "asset_id": asset["id"],
            "fee_type": "transfer",
            "fee_date": "2025-06-26",
            "quantity_moved": 0.00083916,
            "fee_quantity_btc": 0.00003,
            "quote_brl": 590867.0,
            "fx_rate": 5.54,
            "notes": "Ledger",
        },
    ).json()

    patched = client.patch(
        f"/crypto-fees/{created['id']}",
        json={"notes": "Ledger atualizado"},
    )
    assert patched.status_code == 200
    assert patched.json()["notes"] == "Ledger atualizado"

    deleted = client.delete(f"/crypto-fees/{created['id']}")
    assert deleted.status_code == 204
    assert client.get("/crypto-fees").json() == []


def test_rejects_non_crypto_asset(client: TestClient) -> None:
    stock = client.post(
        "/assets",
        json={
            "symbol": "BBSE3",
            "name": "BB Seguridade",
            "asset_type": "stock",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
        },
    ).json()
    portfolio = _create_portfolio(client)
    response = client.post(
        "/crypto-fees",
        json={
            "portfolio_id": portfolio["id"],
            "asset_id": stock["id"],
            "fee_type": "purchase",
            "fee_date": "2025-06-26",
            "quantity_moved": 1,
            "fee_quantity_btc": 0.001,
            "quote_brl": 100,
            "fx_rate": 5,
        },
    )
    assert response.status_code == 422


def test_bitcoin_snapshot_with_position_and_fees(client: TestClient) -> None:
    asset = _create_crypto_asset(client)
    portfolio = _create_portfolio(client)
    client.post(
        f"/portfolios/{portfolio['id']}/positions",
        json={
            "asset_id": asset["id"],
            "quantity": 0.01491742,
            "average_price": 83521.5048,
        },
    )
    client.post(
        "/crypto-fees",
        json={
            "portfolio_id": portfolio["id"],
            "asset_id": asset["id"],
            "fee_type": "purchase",
            "fee_date": "2025-06-26",
            "quantity_moved": 0.00084,
            "fee_quantity_btc": 0.00000084,
            "quote_brl": 590867.0,
            "fx_rate": 5.54,
        },
    )

    response = client.get(f"/portfolios/{portfolio['id']}/bitcoin-snapshot")
    assert response.status_code == 200
    body = response.json()
    assert body["position"]["symbol"] == "BTC-USD"
    assert body["position"]["quantity"] == pytest.approx(0.01491742)
    assert body["total_fees_brl"] > 0
    assert body["rebalance"]["target_value_brl"] is not None
    assert body["transfer_ledger_final_btc"] == 0.0
    assert body["transfer_ledger_count"] == 0


def test_bitcoin_snapshot_sums_transfer_ledger_final_btc(client: TestClient) -> None:
    asset = _create_crypto_asset(client)
    portfolio = _create_portfolio(client)
    client.post(
        f"/portfolios/{portfolio['id']}/positions",
        json={
            "asset_id": asset["id"],
            "quantity": 0.01491742,
            "average_price": 83521.5048,
        },
    )
    client.post(
        "/crypto-fees",
        json={
            "portfolio_id": portfolio["id"],
            "asset_id": asset["id"],
            "fee_type": "purchase",
            "fee_date": "2025-06-26",
            "quantity_moved": 0.00084,
            "fee_quantity_btc": 0.00000084,
            "quote_brl": 590867.0,
            "fx_rate": 5.54,
        },
    )
    client.post(
        "/crypto-fees",
        json={
            "portfolio_id": portfolio["id"],
            "asset_id": asset["id"],
            "fee_type": "transfer",
            "fee_date": "2025-06-26",
            "quantity_moved": 0.00083916,
            "fee_quantity_btc": 0.00003,
            "quote_brl": 590867.0,
            "fx_rate": 5.54,
        },
    )

    response = client.get(f"/portfolios/{portfolio['id']}/bitcoin-snapshot")
    assert response.status_code == 200
    body = response.json()
    assert body["transfer_ledger_final_btc"] == pytest.approx(0.00080916)
    assert body["transfer_ledger_count"] == 1
