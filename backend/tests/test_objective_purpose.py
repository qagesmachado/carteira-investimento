"""Testes de finalidade por fatia de objetivo (rebalanceamento e reserva de emergência)."""

from fastapi.testclient import TestClient


def _create_portfolio(client: TestClient, name: str = "Carteira Finalidade") -> int:
    response = client.post("/portfolios", json={"name": name})
    assert response.status_code == 201
    return response.json()["id"]


def _create_etf(client: TestClient, symbol: str = "AUPO11", quote: float = 100.0) -> int:
    response = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": f"ETF {symbol}",
            "asset_type": "etf",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
            "etf_subtype": "fixed_income",
            "current_quote": quote,
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def _add_position(
    client: TestClient,
    portfolio_id: int,
    asset_id: int,
    *,
    quantity: float,
) -> None:
    response = client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": asset_id, "quantity": quantity, "average_price": 100.0},
    )
    assert response.status_code == 201


def _create_objective(
    client: TestClient,
    portfolio_id: int,
    name: str,
    *,
    mode: str = "single_asset",
    partition_asset_id: int | None = None,
) -> int:
    payload: dict = {"name": name, "mode": mode}
    if partition_asset_id is not None:
        payload["partition_asset_id"] = partition_asset_id
    response = client.post(f"/portfolios/{portfolio_id}/objectives", json=payload)
    assert response.status_code == 201
    return response.json()["id"]


def _allocation_id(client: TestClient, portfolio_id: int, objective_id: int, slice_name: str) -> int:
    response = client.get(f"/portfolios/{portfolio_id}/objectives")
    objective = next(o for o in response.json()["objectives"] if o["id"] == objective_id)
    row = next(a for a in objective["allocations"] if a["slice_name"] == slice_name)
    return row["id"]


def test_emergency_reserve_allocation_sets_exclude_from_rebalance(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_etf(client)
    _add_position(client, portfolio_id, asset_id, quantity=10)

    objective_id = _create_objective(
        client,
        portfolio_id,
        "AUPO11",
        partition_asset_id=asset_id,
    )
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={
            "allocations": [
                {"slice_name": "Reserva", "asset_id": asset_id, "quantity": 10},
            ],
        },
    )
    allocation_id = _allocation_id(client, portfolio_id, objective_id, "Reserva")

    response = client.patch(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations/{allocation_id}/purpose",
        json={"is_emergency_reserve": True},
    )
    assert response.status_code == 200
    allocation = next(
        a for a in response.json()["allocations"] if a["slice_name"] == "Reserva"
    )
    assert allocation["is_emergency_reserve"] is True
    assert allocation["exclude_from_rebalance"] is True


def test_rebalance_includes_full_position_without_flagged_allocations(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_etf(client, quote=100.0)
    _add_position(client, portfolio_id, asset_id, quantity=100)

    objective_id = _create_objective(
        client,
        portfolio_id,
        "AUPO11",
        partition_asset_id=asset_id,
    )
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={
            "allocations": [
                {"slice_name": "Investimento", "asset_id": asset_id, "quantity": 100},
            ],
        },
    )

    rebalance = client.get(f"/portfolios/{portfolio_id}/rebalance").json()
    rf = next(c for c in rebalance["classes"] if c["display_class"] == "fixed_income")
    assert rf["current_value_brl"] == 10_000.0
    assert rebalance["patrimony_brl"] == 10_000.0


def test_rebalance_excludes_non_investment_allocation_slice(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_etf(client, quote=100.0)
    _add_position(client, portfolio_id, asset_id, quantity=100)

    objective_id = _create_objective(
        client,
        portfolio_id,
        "AUPO11",
        partition_asset_id=asset_id,
    )
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={
            "allocations": [
                {"slice_name": "Investimento", "asset_id": asset_id, "quantity": 60},
                {"slice_name": "Reserva", "asset_id": asset_id, "quantity": 40},
            ],
        },
    )
    reserve_id = _allocation_id(client, portfolio_id, objective_id, "Reserva")
    client.patch(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations/{reserve_id}/purpose",
        json={"is_emergency_reserve": True},
    )

    rebalance = client.get(f"/portfolios/{portfolio_id}/rebalance").json()
    rf = next(c for c in rebalance["classes"] if c["display_class"] == "fixed_income")
    assert rf["current_value_brl"] == 6_000.0
    assert rebalance["patrimony_brl"] == 6_000.0


def test_patrimony_control_includes_linked_emergency_reserve(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_etf(client, quote=100.0)
    _add_position(client, portfolio_id, asset_id, quantity=50)

    objective_id = _create_objective(
        client,
        portfolio_id,
        "AUPO11",
        partition_asset_id=asset_id,
    )
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={
            "allocations": [
                {"slice_name": "Reserva", "asset_id": asset_id, "quantity": 50},
            ],
        },
    )
    reserve_id = _allocation_id(client, portfolio_id, objective_id, "Reserva")
    client.patch(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations/{reserve_id}/purpose",
        json={"is_emergency_reserve": True},
    )

    snapshot = client.get(f"/portfolios/{portfolio_id}/patrimony-control").json()
    assert len(snapshot["linked_emergency_reserve_items"]) == 1
    linked = snapshot["linked_emergency_reserve_items"][0]
    assert linked["symbol"] == "AUPO11"
    assert linked["amount_brl"] == 5_000.0
    assert linked["location"] == "corretora"
    assert snapshot["total_emergency_reserve_brl"] == 5_000.0


def test_partition_slice_includes_allocation_purpose_flags(client: TestClient) -> None:
    portfolio_id = _create_portfolio(client)
    asset_id = _create_etf(client)
    _add_position(client, portfolio_id, asset_id, quantity=10)

    objective_id = _create_objective(
        client,
        portfolio_id,
        "AUPO11",
        partition_asset_id=asset_id,
    )
    client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={
            "allocations": [
                {"slice_name": "Reserva", "asset_id": asset_id, "quantity": 10},
            ],
        },
    )
    reserve_id = _allocation_id(client, portfolio_id, objective_id, "Reserva")
    client.patch(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations/{reserve_id}/purpose",
        json={"is_emergency_reserve": True},
    )

    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    partition = next(p for p in snapshot["asset_partitions"] if p["asset_id"] == asset_id)
    slice_row = partition["slices"][0]
    assert slice_row["exclude_from_rebalance"] is True
    assert slice_row["is_emergency_reserve"] is True
