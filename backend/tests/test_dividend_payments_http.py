from fastapi.testclient import TestClient


def _create_asset(client: TestClient, symbol: str = "BBSE3", market: str = "national") -> dict:
    response = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": f"Ativo {symbol}",
            "asset_type": "stock",
            "market": market,
            "country": "BR" if market == "national" else "US",
            "currency": "BRL" if market == "national" else "USD",
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


def test_get_dividend_payments_empty(client: TestClient) -> None:
    response = client.get("/dividend-payments")
    assert response.status_code == 200
    assert response.json() == []


def test_post_and_get_dividend_payment(client: TestClient) -> None:
    asset = _create_asset(client)
    portfolio = _create_portfolio(client)
    response = client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "portfolio_id": portfolio["id"],
            "payment_type": "dividend",
            "payment_date": "2024-03-10",
            "amount": 50.25,
            "currency": "BRL",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["symbol"] == "BBSE3"
    assert body["payment_type"] == "dividend"
    assert body["market"] == "national"
    assert body["portfolio_id"] == portfolio["id"]
    assert "id" in body

    listed = client.get("/dividend-payments").json()
    assert len(listed) == 1


def test_patch_and_delete_dividend_payment(client: TestClient) -> None:
    asset = _create_asset(client)
    portfolio = _create_portfolio(client)
    created = client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "portfolio_id": portfolio["id"],
            "payment_type": "jcp",
            "payment_date": "2024-01-01",
            "amount": 10,
            "currency": "BRL",
        },
    ).json()

    patched = client.patch(
        f"/dividend-payments/{created['id']}",
        json={"amount": 99},
    )
    assert patched.status_code == 200
    assert patched.json()["amount"] == 99

    deleted = client.delete(f"/dividend-payments/{created['id']}")
    assert deleted.status_code == 204
    assert client.get("/dividend-payments").json() == []


def test_post_dividend_payment_requires_portfolio_id(client: TestClient) -> None:
    asset = _create_asset(client)
    response = client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "payment_type": "dividend",
            "payment_date": "2024-03-10",
            "amount": 12.0,
            "currency": "BRL",
        },
    )
    assert response.status_code in (422, 400)


def test_post_dividend_payment_rejects_unknown_portfolio(client: TestClient) -> None:
    asset = _create_asset(client)
    response = client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "portfolio_id": 9999,
            "payment_type": "dividend",
            "payment_date": "2024-03-10",
            "amount": 12.0,
            "currency": "BRL",
        },
    )
    assert response.status_code == 404
    assert "portfolio" in response.json()["detail"].lower()


def test_list_dividend_payments_filters_by_portfolio_id(client: TestClient) -> None:
    asset = _create_asset(client)
    portfolio_a = _create_portfolio(client, "Carteira A")
    portfolio_b = _create_portfolio(client, "Carteira B")

    client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "portfolio_id": portfolio_a["id"],
            "payment_type": "dividend",
            "payment_date": "2024-03-10",
            "amount": 50.0,
            "currency": "BRL",
        },
    )
    client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "portfolio_id": portfolio_b["id"],
            "payment_type": "dividend",
            "payment_date": "2024-04-10",
            "amount": 12.0,
            "currency": "BRL",
        },
    )

    all_items = client.get("/dividend-payments").json()
    assert len(all_items) == 2

    only_a = client.get(f"/dividend-payments?portfolio_id={portfolio_a['id']}").json()
    assert len(only_a) == 1
    assert only_a[0]["portfolio_id"] == portfolio_a["id"]
    assert only_a[0]["amount"] == 50.0

    only_b = client.get(f"/dividend-payments?portfolio_id={portfolio_b['id']}").json()
    assert len(only_b) == 1
    assert only_b[0]["portfolio_id"] == portfolio_b["id"]
    assert only_b[0]["amount"] == 12.0


def test_patch_dividend_payment_can_reassign_portfolio(client: TestClient) -> None:
    asset = _create_asset(client)
    portfolio_a = _create_portfolio(client, "Carteira A")
    portfolio_b = _create_portfolio(client, "Carteira B")

    created = client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "portfolio_id": portfolio_a["id"],
            "payment_type": "dividend",
            "payment_date": "2024-03-10",
            "amount": 50.0,
            "currency": "BRL",
        },
    ).json()

    response = client.patch(
        f"/dividend-payments/{created['id']}",
        json={"portfolio_id": portfolio_b["id"]},
    )
    assert response.status_code == 200
    assert response.json()["portfolio_id"] == portfolio_b["id"]

    assert client.get(f"/dividend-payments?portfolio_id={portfolio_a['id']}").json() == []
    only_b = client.get(f"/dividend-payments?portfolio_id={portfolio_b['id']}").json()
    assert len(only_b) == 1
