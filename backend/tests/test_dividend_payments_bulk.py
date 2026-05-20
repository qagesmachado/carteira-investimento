from fastapi.testclient import TestClient


def _create_asset(client: TestClient, symbol: str = "BBSE3") -> dict:
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


def test_bulk_preview_ready_and_errors(client: TestClient) -> None:
    _create_asset(client, "ITSA4")

    response = client.post(
        "/dividend-payments/bulk/preview",
        json={
            "items": [
                {
                    "row_index": 1,
                    "symbol": "ITSA4",
                    "payment_type": "dividend",
                    "payment_date": "2024-05-10",
                    "amount": 12.5,
                },
                {
                    "row_index": 2,
                    "symbol": "MISSING",
                    "payment_type": "dividend",
                    "payment_date": "2024-05-10",
                    "amount": 1,
                },
                {
                    "row_index": 3,
                    "symbol": "ITSA4",
                    "payment_type": "dividend",
                    "payment_date": "2024-05-10",
                    "amount": 0,
                },
            ]
        },
    )

    assert response.status_code == 200
    by_index = {item["row_index"]: item for item in response.json()["items"]}
    assert by_index[1]["status"] == "ready"
    assert by_index[1]["payload"]["amount"] == 12.5
    assert by_index[2]["status"] == "error"
    assert by_index[3]["status"] == "error"


def test_bulk_preview_keeps_identical_rows_ready(client: TestClient) -> None:
    asset = _create_asset(client, "PETR4")
    client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "payment_type": "dividend",
            "payment_date": "2024-01-15",
            "amount": 50,
            "currency": "BRL",
        },
    )

    response = client.post(
        "/dividend-payments/bulk/preview",
        json={
            "items": [
                {
                    "row_index": 1,
                    "symbol": "PETR4",
                    "payment_type": "dividend",
                    "payment_date": "2024-01-15",
                    "amount": 50,
                },
                {
                    "row_index": 2,
                    "symbol": "PETR4",
                    "payment_type": "dividend",
                    "payment_date": "2024-01-15",
                    "amount": 50,
                },
            ]
        },
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 2
    assert all(item["status"] == "ready" for item in items)


def test_bulk_create_imports_all_payloads_including_identical(client: TestClient) -> None:
    asset = _create_asset(client, "VALE3")
    client.post(
        "/dividend-payments",
        json={
            "asset_id": asset["id"],
            "payment_type": "dividend",
            "payment_date": "2024-02-01",
            "amount": 20,
            "currency": "BRL",
        },
    )

    response = client.post(
        "/dividend-payments/bulk",
        json={
            "payments": [
                {
                    "asset_id": asset["id"],
                    "payment_type": "dividend",
                    "payment_date": "2024-02-01",
                    "amount": 20,
                    "currency": "BRL",
                },
                {
                    "asset_id": asset["id"],
                    "payment_type": "dividend",
                    "payment_date": "2024-02-01",
                    "amount": 20,
                    "currency": "BRL",
                },
                {
                    "asset_id": asset["id"],
                    "payment_type": "jcp",
                    "payment_date": "2024-03-01",
                    "amount": 15,
                    "currency": "BRL",
                },
            ]
        },
    )

    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 3
    assert all(r["status"] == "created" for r in results)
    assert client.get("/dividend-payments").json().__len__() == 4
