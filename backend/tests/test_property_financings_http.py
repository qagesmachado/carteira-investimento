"""Contratos HTTP de financiamento imóvel."""

from datetime import date

from fastapi.testclient import TestClient


def _create_financing(
    client: TestClient,
    portfolio_id: int,
    name: str = "Apto Centro",
    property_type: str = "apartamento",
) -> dict:
    response = client.post(
        f"/portfolios/{portfolio_id}/property-financings",
        json={
            "name": name,
            "property_type": property_type,
        },
    )
    assert response.status_code == 201
    return response.json()


def _create_entry(
    client: TestClient,
    portfolio_id: int,
    financing_id: int,
    *,
    event_date: str,
    entry_type: str,
    event_category: str,
    description: str,
    amount_brl: float,
) -> dict:
    response = client.post(
        f"/portfolios/{portfolio_id}/property-financings/{financing_id}/entries",
        json={
            "event_date": event_date,
            "entry_type": entry_type,
            "event_category": event_category,
            "description": description,
            "amount_brl": amount_brl,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_get_snapshot_empty(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "FIN Empty"}).json()["id"]
    response = client.get(f"/portfolios/{portfolio_id}/property-financings")
    assert response.status_code == 200
    body = response.json()
    assert body["portfolio_id"] == portfolio_id
    assert body["financings"] == []
    assert body["consolidated"]["financing_count"] == 0
    assert body["consolidated"]["metrics"]["profit_brl"] == 0.0


def test_get_snapshot_404_unknown_portfolio(client: TestClient) -> None:
    response = client.get("/portfolios/99999/property-financings")
    assert response.status_code == 404


def test_create_financing_and_entry_metrics(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "FIN HTTP"}).json()["id"]
    financing = _create_financing(client, portfolio_id)
    assert financing["property_type"] == "apartamento"
    assert financing["entries"] == []

    today = date.today()
    entry = _create_entry(
        client,
        portfolio_id,
        financing["id"],
        event_date=today.isoformat(),
        entry_type="expense",
        event_category="financiamento",
        description="Parcela junho",
        amount_brl=3_000.0,
    )
    assert entry["event_category"] == "financiamento"

    _create_entry(
        client,
        portfolio_id,
        financing["id"],
        event_date=today.isoformat(),
        entry_type="income",
        event_category="aluguel",
        description="Aluguel junho",
        amount_brl=2_000.0,
    )

    snapshot = client.get(f"/portfolios/{portfolio_id}/property-financings").json()
    assert snapshot["consolidated"]["financing_count"] == 1
    metrics = snapshot["consolidated"]["metrics"]
    assert metrics["total_income_brl"] == 2_000.0
    assert metrics["total_expenses_brl"] == 3_000.0
    assert metrics["profit_brl"] == -1_000.0
    assert metrics["capital_invested_brl"] == 3_000.0


def test_entry_category_must_match_type(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "FIN Val"}).json()["id"]
    financing = _create_financing(client, portfolio_id)
    response = client.post(
        f"/portfolios/{portfolio_id}/property-financings/{financing['id']}/entries",
        json={
            "event_date": date.today().isoformat(),
            "entry_type": "income",
            "event_category": "financiamento",
            "description": "Inválido",
            "amount_brl": 100.0,
        },
    )
    assert response.status_code == 422


def test_financings_isolated_by_portfolio(client: TestClient) -> None:
    p1 = client.post("/portfolios", json={"name": "FIN P1"}).json()["id"]
    p2 = client.post("/portfolios", json={"name": "FIN P2"}).json()["id"]
    _create_financing(client, p1, name="Imóvel P1")

    snap1 = client.get(f"/portfolios/{p1}/property-financings").json()
    snap2 = client.get(f"/portfolios/{p2}/property-financings").json()
    assert len(snap1["financings"]) == 1
    assert len(snap2["financings"]) == 0


def test_duplicate_name_rejected(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "FIN Dup"}).json()["id"]
    _create_financing(client, portfolio_id)
    response = client.post(
        f"/portfolios/{portfolio_id}/property-financings",
        json={"name": "Apto Centro", "property_type": "casa"},
    )
    assert response.status_code == 422


def test_delete_financing(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "FIN Del"}).json()["id"]
    financing = _create_financing(client, portfolio_id)
    response = client.delete(
        f"/portfolios/{portfolio_id}/property-financings/{financing['id']}"
    )
    assert response.status_code == 204
    snapshot = client.get(f"/portfolios/{portfolio_id}/property-financings").json()
    assert snapshot["financings"] == []
