"""Testes HTTP de export/import via /data."""

from datetime import date

from app.models.dividend_payment import DividendPaymentType
from app.schemas.dividend_payment import DividendPaymentCreate
from app.schemas.portfolio import PortfolioCreate, PositionCreate
from app.services.asset_service import create_asset
from app.services.dividend_payment_service import create_dividend_payment
from app.services.portfolio_service import create_portfolio, create_position
from app.schemas.asset import AssetCreate


def _seed_portfolio_with_data(client):
    asset_resp = client.post(
        "/assets",
        json={
            "symbol": "BBSE3",
            "name": "BB Seguridade",
            "asset_type": "stock",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
        },
    )
    assert asset_resp.status_code == 201
    asset_id = asset_resp.json()["id"]

    portfolio_resp = client.post(
        "/portfolios",
        json={"name": "Carteira Export", "base_currency": "BRL"},
    )
    assert portfolio_resp.status_code == 201
    portfolio_id = portfolio_resp.json()["id"]

    pos_resp = client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": 100, "average_price": 30},
    )
    assert pos_resp.status_code == 201

    div_resp = client.post(
        "/dividend-payments",
        json={
            "asset_id": asset_id,
            "portfolio_id": portfolio_id,
            "payment_type": "dividend",
            "payment_date": "2024-06-01",
            "amount": 120.5,
            "currency": "BRL",
        },
    )
    assert div_resp.status_code == 201
    return portfolio_id, asset_id


def test_export_portfolio_v2_includes_dividends(client):
    portfolio_id, _ = _seed_portfolio_with_data(client)
    resp = client.get(f"/portfolios/{portfolio_id}/export")
    assert resp.status_code == 200
    body = resp.json()
    assert body["version"] == 2
    assert len(body["dividend_payments"]) == 1
    assert body["dividend_payments"][0]["symbol"] == "BBSE3"


def test_data_export_assets(client):
    _seed_portfolio_with_data(client)
    resp = client.get("/data/export/assets")
    assert resp.status_code == 200
    assert len(resp.json()["assets"]) >= 1


def test_data_export_dividends_csv(client):
    portfolio_id, _ = _seed_portfolio_with_data(client)
    resp = client.get(f"/data/export/dividends?portfolio_id={portfolio_id}&format=csv")
    assert resp.status_code == 200
    assert "BBSE3" in resp.text
    assert "dividend" in resp.text


def test_data_export_full(client):
    _seed_portfolio_with_data(client)
    resp = client.get("/data/export/full")
    assert resp.status_code == 200
    body = resp.json()
    assert body["type"] == "full_backup"
    assert len(body["portfolios"]) >= 1
    assert len(body["assets"]) >= 1


def test_delete_position_keeps_dividends(client):
    portfolio_id, asset_id = _seed_portfolio_with_data(client)
    positions = client.get(f"/portfolios/{portfolio_id}/positions").json()
    position_id = positions[0]["id"]
    delete_resp = client.delete(f"/portfolios/{portfolio_id}/positions/{position_id}")
    assert delete_resp.status_code == 204
    divs = client.get(f"/dividend-payments?portfolio_id={portfolio_id}").json()
    assert len(divs) == 1


def test_delete_portfolio_blocked_with_data(client):
    portfolio_id, _ = _seed_portfolio_with_data(client)
    resp = client.delete(f"/portfolios/{portfolio_id}")
    assert resp.status_code == 409


def test_delete_portfolio_cascade(client):
    portfolio_id, _ = _seed_portfolio_with_data(client)
    resp = client.delete(f"/portfolios/{portfolio_id}?cascade=all")
    assert resp.status_code == 204
    divs = client.get(f"/dividend-payments?portfolio_id={portfolio_id}").json()
    assert divs == []
