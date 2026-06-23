"""Contratos HTTP de controle de patrimônio."""

from fastapi.testclient import TestClient


def _create_portfolio_with_stock(
    client: TestClient,
    *,
    symbol: str = "PAT4",
    quantity: float = 100,
    quote: float = 10.0,
) -> int:
    asset_resp = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": "Ativo PAT",
            "asset_type": "stock",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
            "current_quote": quote,
        },
    )
    assert asset_resp.status_code == 201
    asset_id = asset_resp.json()["id"]

    portfolio_id = client.post("/portfolios", json={"name": "PAT Portfolio"}).json()["id"]
    pos_resp = client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": quantity, "average_price": 8.0},
    )
    assert pos_resp.status_code == 201
    return portfolio_id


def _create_manual_item(
    client: TestClient,
    portfolio_id: int,
    *,
    category: str,
    name: str,
    amount_brl: float,
    location: str | None = None,
) -> dict:
    payload: dict = {
        "category": category,
        "name": name,
        "amount_brl": amount_brl,
    }
    if location is not None:
        payload["location"] = location
    response = client.post(
        f"/portfolios/{portfolio_id}/manual-patrimony-items",
        json=payload,
    )
    assert response.status_code == 201
    return response.json()


def test_snapshot_empty_portfolio(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "PAT Empty"}).json()["id"]
    response = client.get(f"/portfolios/{portfolio_id}/patrimony-control")
    assert response.status_code == 200
    body = response.json()
    assert body["portfolio_id"] == portfolio_id
    assert body["invested_portfolio_brl"] == 0.0
    assert body["manual_items"] == []
    assert body["total_patrimony_brl"] == 0.0


def test_snapshot_invested_matches_objectives(client: TestClient) -> None:
    portfolio_id = _create_portfolio_with_stock(client)
    patrimony = client.get(f"/portfolios/{portfolio_id}/patrimony-control").json()
    objectives = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    assert patrimony["invested_portfolio_brl"] == 1_000.0
    assert objectives["patrimony_brl"] == patrimony["invested_portfolio_brl"]
    assert patrimony["total_patrimony_brl"] == 1_000.0


def test_create_emergency_reserve_requires_location(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "PAT Val"}).json()["id"]
    response = client.post(
        f"/portfolios/{portfolio_id}/manual-patrimony-items",
        json={
            "category": "emergency_reserve",
            "name": "Reserva",
            "amount_brl": 500.0,
        },
    )
    assert response.status_code == 422


def test_create_emergency_reserve_rejects_invalid_location(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "PAT Loc"}).json()["id"]
    response = client.post(
        f"/portfolios/{portfolio_id}/manual-patrimony-items",
        json={
            "category": "emergency_reserve",
            "name": "Reserva",
            "amount_brl": 500.0,
            "location": "Nubank — conta corrente",
        },
    )
    assert response.status_code == 422


def test_rejects_legacy_cash_category(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "PAT Cash"}).json()["id"]
    response = client.post(
        f"/portfolios/{portfolio_id}/manual-patrimony-items",
        json={"category": "cash", "name": "Cofre", "amount_brl": 500.0},
    )
    assert response.status_code == 422


def test_create_and_aggregate_manual_items(client: TestClient) -> None:
    portfolio_id = _create_portfolio_with_stock(client)
    _create_manual_item(
        client,
        portfolio_id,
        category="emergency_reserve",
        name="Conta Nubank",
        amount_brl=5_000.0,
        location="banco",
    )
    _create_manual_item(
        client,
        portfolio_id,
        category="emergency_reserve",
        name="Cofre casa",
        amount_brl=500.0,
        location="dinheiro_especie",
    )

    snapshot = client.get(f"/portfolios/{portfolio_id}/patrimony-control").json()
    assert snapshot["invested_portfolio_brl"] == 1_000.0
    assert snapshot["total_emergency_reserve_brl"] == 5_500.0
    assert snapshot["total_manual_brl"] == 5_500.0
    assert snapshot["total_patrimony_brl"] == 6_500.0
    assert len(snapshot["manual_items"]) == 2


def test_update_and_delete_manual_item(client: TestClient) -> None:
    portfolio_id = _create_portfolio_with_stock(client)
    item = _create_manual_item(
        client,
        portfolio_id,
        category="emergency_reserve",
        name="Reserva",
        amount_brl=5_000.0,
        location="banco",
    )

    patch_resp = client.patch(
        f"/portfolios/{portfolio_id}/manual-patrimony-items/{item['id']}",
        json={"amount_brl": 4_000.0},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["amount_brl"] == 4_000.0

    snapshot = client.get(f"/portfolios/{portfolio_id}/patrimony-control").json()
    assert snapshot["total_patrimony_brl"] == 5_000.0

    delete_resp = client.delete(
        f"/portfolios/{portfolio_id}/manual-patrimony-items/{item['id']}",
    )
    assert delete_resp.status_code == 204

    snapshot_after = client.get(f"/portfolios/{portfolio_id}/patrimony-control").json()
    assert snapshot_after["total_manual_brl"] == 0.0
    assert snapshot_after["total_patrimony_brl"] == 1_000.0


def test_duplicate_name_conflict(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "PAT Dup"}).json()["id"]
    _create_manual_item(
        client,
        portfolio_id,
        category="emergency_reserve",
        name="Cofre",
        amount_brl=100.0,
        location="dinheiro_especie",
    )
    response = client.post(
        f"/portfolios/{portfolio_id}/manual-patrimony-items",
        json={
            "category": "emergency_reserve",
            "name": "Cofre",
            "amount_brl": 200.0,
            "location": "dinheiro_especie",
        },
    )
    assert response.status_code == 409


def test_cascade_delete_portfolio_removes_manual_items(client: TestClient) -> None:
    portfolio_id = _create_portfolio_with_stock(client)
    _create_manual_item(
        client,
        portfolio_id,
        category="emergency_reserve",
        name="Reserva cascade",
        amount_brl=1_000.0,
        location="banco",
    )
    delete_resp = client.delete(f"/portfolios/{portfolio_id}?cascade=all")
    assert delete_resp.status_code == 204

    portfolio_id_2 = client.post("/portfolios", json={"name": "PAT Reuse Id"}).json()["id"]
    item = _create_manual_item(
        client,
        portfolio_id_2,
        category="emergency_reserve",
        name="Reserva cascade",
        amount_brl=2_000.0,
        location="corretora",
    )
    assert item["name"] == "Reserva cascade"


def test_get_snapshot_404_unknown_portfolio(client: TestClient) -> None:
    response = client.get("/portfolios/99999/patrimony-control")
    assert response.status_code == 404


def test_linked_emergency_reserve_splits_invested_and_total(client: TestClient) -> None:
    """Fatia vinculada entra na reserva e sai do investido líquido; total = bruto + manual."""
    portfolio_id = _create_portfolio_with_stock(client, symbol="PAT-LINK", quote=100.0)
    asset_resp = client.get(f"/portfolios/{portfolio_id}/positions")
    asset_id = asset_resp.json()[0]["asset_id"]

    obj_resp = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "AUPO11", "mode": "single_asset", "partition_asset_id": asset_id},
    )
    objective_id = obj_resp.json()["id"]
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={
            "allocations": [
                {"slice_name": "Reserva", "asset_id": asset_id, "quantity": 40},
            ],
        },
    )
    objectives = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    objective = next(o for o in objectives["objectives"] if o["id"] == objective_id)
    reserve_id = objective["allocations"][0]["id"]
    client.patch(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations/{reserve_id}/purpose",
        json={"is_emergency_reserve": True},
    )

    _create_manual_item(
        client,
        portfolio_id,
        category="emergency_reserve",
        name="Caixinha",
        amount_brl=500.0,
        location="banco",
    )

    snapshot = client.get(f"/portfolios/{portfolio_id}/patrimony-control").json()
    assert snapshot["invested_portfolio_brl"] == 10_000.0
    assert snapshot["linked_emergency_reserve_brl"] == 4_000.0
    assert snapshot["invested_excluding_emergency_brl"] == 6_000.0
    assert snapshot["total_emergency_reserve_brl"] == 4_500.0
    assert snapshot["total_patrimony_brl"] == 10_500.0
    assert (
        snapshot["invested_excluding_emergency_brl"] + snapshot["total_emergency_reserve_brl"]
        == snapshot["total_patrimony_brl"]
    )
