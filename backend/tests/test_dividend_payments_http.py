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


def test_get_dividend_payments_empty(client: TestClient) -> None:
    response = client.get("/dividend-payments")
    assert response.status_code == 200
    assert response.json() == []


def test_post_and_get_dividend_payment(client: TestClient) -> None:
    asset = _create_asset(client)
    response = client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
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
    assert "id" in body

    listed = client.get("/dividend-payments").json()
    assert len(listed) == 1


def test_patch_and_delete_dividend_payment(client: TestClient) -> None:
    asset = _create_asset(client)
    created = client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
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
