"""Testes de serviço de objetivos financeiros."""

from fastapi.testclient import TestClient

from app.models.objective import DEFAULT_OBJECTIVE_NAME


def _create_portfolio(client: TestClient, name: str = "Carteira OBJ") -> int:
    response = client.post("/portfolios", json={"name": name})
    assert response.status_code == 201
    return response.json()["id"]


def _create_stock(client: TestClient, symbol: str = "PETR4", quote: float = 10.0) -> int:
    response = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": f"Ativo {symbol}",
            "asset_type": "stock",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
            "current_quote": quote,
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def _create_rf(client: TestClient, symbol: str = "CDB-TEST") -> int:
    response = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": "CDB Teste",
            "asset_type": "fixed_income",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def _add_position(
    client: TestClient,
    portfolio_id: int,
    asset_id: int,
    *,
    quantity: float | None = None,
    current_value: float | None = None,
) -> None:
    payload: dict = {"asset_id": asset_id}
    if quantity is not None:
        payload["quantity"] = quantity
        payload["average_price"] = 1.0
    if current_value is not None:
        payload["current_value"] = current_value
    response = client.post(f"/portfolios/{portfolio_id}/positions", json=payload)
    assert response.status_code == 201


def test_default_livre_created_with_portfolio(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    response = client.get(f"/portfolios/{portfolio_id}/objectives")
    assert response.status_code == 200
    body = response.json()
    assert len(body["objectives"]) == 1
    assert body["objectives"][0]["name"] == DEFAULT_OBJECTIVE_NAME
    assert body["objectives"][0]["is_default"] is True


def test_create_objective_and_allocate_shares(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client)
    _add_position(client, portfolio_id, asset_id, quantity=100)

    create = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Reserva"},
    )
    assert create.status_code == 201
    objective_id = create.json()["id"]

    put = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 60}]},
    )
    assert put.status_code == 200

    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    reserva = next(o for o in snapshot["objectives"] if o["name"] == "Reserva")
    livre = next(o for o in snapshot["objectives"] if o["is_default"])
    assert reserva["allocations"][0]["quantity"] == 60
    assert livre["allocations"][0]["quantity"] == 40


def test_allocate_rf_by_amount(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_rf(client)
    _add_position(client, portfolio_id, asset_id, current_value=100_000)

    obj1 = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Objetivo 1"},
    ).json()["id"]
    obj2 = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Objetivo 2"},
    ).json()["id"]

    assert client.put(
        f"/portfolios/{portfolio_id}/objectives/{obj1}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "amount": 50_000}]},
    ).status_code == 200
    assert client.put(
        f"/portfolios/{portfolio_id}/objectives/{obj2}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "amount": 50_000}]},
    ).status_code == 200

    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    livre = next(o for o in snapshot["objectives"] if o["is_default"])
    assert livre["allocations"] == []


def test_allocation_exceeds_total_rejected(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client)
    _add_position(client, portfolio_id, asset_id, quantity=100)
    objective_id = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Reserva"},
    ).json()["id"]

    response = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 101}]},
    )
    assert response.status_code == 422


def test_delete_objective_returns_to_livre(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client)
    _add_position(client, portfolio_id, asset_id, quantity=100)
    objective_id = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Reserva"},
    ).json()["id"]
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 60}]},
    )

    assert client.delete(f"/portfolios/{portfolio_id}/objectives/{objective_id}").status_code == 204

    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    livre = next(o for o in snapshot["objectives"] if o["is_default"])
    assert livre["allocations"][0]["quantity"] == 100


def test_divergence_after_position_reduction(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client)
    position = client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": 100, "average_price": 1},
    ).json()
    objective_id = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Reserva"},
    ).json()["id"]
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 60}]},
    )

    client.patch(
        f"/portfolios/{portfolio_id}/positions/{position['id']}",
        json={"quantity": 50},
    )

    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    divergence = next(d for d in snapshot["divergences"] if d["asset_id"] == asset_id)
    assert divergence["status"] == "over_total"
    assert divergence["delta"] == -10.0

    blocked = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 55}]},
    )
    assert blocked.status_code == 422

    fixed = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 30}]},
    )
    assert fixed.status_code == 200


def test_allocation_includes_invested_and_profit_metrics(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client, quote=20.0)
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": 100, "average_price": 10},
    )
    objective_id = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Reserva"},
    ).json()["id"]
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 50}]},
    )

    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    reserva = next(o for o in snapshot["objectives"] if o["name"] == "Reserva")
    row = reserva["allocations"][0]
    assert row["current_value_brl"] == 1000.0
    assert row["invested_value_brl"] == 500.0
    assert row["profit_brl"] == 500.0
    assert row["profit_percent"] == 100.0


def test_create_single_asset_objective(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client)
    _add_position(client, portfolio_id, asset_id, quantity=100)

    response = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={
            "name": "Viagem PETR",
            "mode": "single_asset",
            "partition_asset_id": asset_id,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["mode"] == "single_asset"
    assert body["partition_asset_id"] == asset_id


def test_create_single_asset_without_partition_then_allocate(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client)
    _add_position(client, portfolio_id, asset_id, quantity=100)

    created = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Caixinha", "mode": "single_asset"},
    )
    assert created.status_code == 201
    objective_id = created.json()["id"]
    assert created.json()["partition_asset_id"] is None

    put = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Reserva", "asset_id": asset_id, "quantity": 25}]},
    )
    assert put.status_code == 200

    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    obj = next(o for o in snapshot["objectives"] if o["id"] == objective_id)
    assert obj["partition_asset_id"] == asset_id
    assert obj["allocations"][0]["quantity"] == 25


def test_clear_single_asset_allocation_resets_partition(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client)
    _add_position(client, portfolio_id, asset_id, quantity=100)
    objective_id = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Temp", "mode": "single_asset", "partition_asset_id": asset_id},
    ).json()["id"]
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 10}]},
    )

    cleared = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": []},
    )
    assert cleared.status_code == 200
    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    obj = next(o for o in snapshot["objectives"] if o["id"] == objective_id)
    assert obj["partition_asset_id"] is None
    assert obj["allocations"] == []


def test_single_asset_objective_rejects_other_assets(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_a = _create_stock(client, "PETR4")
    asset_b = _create_stock(client, "ITSA4")
    _add_position(client, portfolio_id, asset_a, quantity=100)
    _add_position(client, portfolio_id, asset_b, quantity=50)

    objective_id = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={
            "name": "Partição PETR",
            "mode": "single_asset",
            "partition_asset_id": asset_a,
        },
    ).json()["id"]

    response = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_b, "quantity": 10}]},
    )
    assert response.status_code == 422


def test_asset_partitions_in_snapshot(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client)
    _add_position(client, portfolio_id, asset_id, quantity=100)
    obj1 = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Obj A"},
    ).json()["id"]
    obj2 = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={
            "name": "Obj B",
            "mode": "single_asset",
            "partition_asset_id": asset_id,
        },
    ).json()["id"]
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{obj1}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 60}]},
    )
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{obj2}/allocations",
        json={"allocations": [{"slice_name": "Principal", "asset_id": asset_id, "quantity": 30}]},
    )

    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    assert "asset_partitions" in snapshot
    partition = next(p for p in snapshot["asset_partitions"] if p["asset_id"] == asset_id)
    assert partition["free"] == 10
    assert len(partition["slices"]) == 3
    names = {s["objective_name"] for s in partition["slices"]}
    assert "Obj A" in names
    assert "Obj B" in names
    assert DEFAULT_OBJECTIVE_NAME in names


def test_single_asset_multiple_slices_same_asset(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_stock(client, symbol="AUPO11")
    _add_position(client, portfolio_id, asset_id, quantity=100)
    objective_id = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": "Caixinhas", "mode": "single_asset", "partition_asset_id": asset_id},
    ).json()["id"]

    put = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={
            "allocations": [
                {"slice_name": "Viagem", "asset_id": asset_id, "quantity": 10},
                {"slice_name": "Reserva", "asset_id": asset_id, "quantity": 20},
            ]
        },
    )
    assert put.status_code == 200
    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    obj = next(o for o in snapshot["objectives"] if o["id"] == objective_id)
    assert len(obj["allocations"]) == 2
    slice_names = {a["slice_name"] for a in obj["allocations"]}
    assert slice_names == {"Viagem", "Reserva"}
