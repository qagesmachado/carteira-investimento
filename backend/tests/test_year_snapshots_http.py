from fastapi.testclient import TestClient


def _create_asset(client: TestClient, symbol: str = "ITSA4") -> dict:
    response = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": f"Ativo {symbol}",
            "asset_type": "stock",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
        },
    )
    assert response.status_code == 201
    return response.json()


def _create_portfolio(client: TestClient, name: str = "HTTP IR") -> dict:
    response = client.post(
        "/portfolios",
        json={"name": name, "base_currency": "BRL", "status": "active"},
    )
    assert response.status_code == 201
    return response.json()


def test_http_year_snapshot_and_report(client: TestClient) -> None:
    asset = _create_asset(client)
    portfolio = _create_portfolio(client)

    position_response = client.post(
        f"/portfolios/{portfolio['id']}/positions",
        json={"asset_id": asset["id"], "quantity": 40, "average_price": 11.5},
    )
    assert position_response.status_code == 201

    dividend_response = client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "portfolio_id": portfolio["id"],
            "payment_type": "dividend",
            "payment_date": "2024-05-01",
            "amount": 12.0,
            "currency": "BRL",
        },
    )
    assert dividend_response.status_code == 201

    create_response = client.post(
        f"/portfolios/{portfolio['id']}/year-snapshots",
        json={"year": 2024},
    )
    assert create_response.status_code == 201
    body = create_response.json()
    assert body["year"] == 2024
    assert body["positions"][0]["quantity"] == 40

    report_response = client.get(f"/portfolios/{portfolio['id']}/annual-ir-report?year=2024")
    assert report_response.status_code == 200
    report = report_response.json()
    assert len(report["payments"]) == 1
    assert report["has_position_snapshot"] is True

    export_response = client.get(
        f"/portfolios/{portfolio['id']}/annual-ir-report/export?year=2024&format=csv",
    )
    assert export_response.status_code == 200
    assert "# DETALHADO" in export_response.text
