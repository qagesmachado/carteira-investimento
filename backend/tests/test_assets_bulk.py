from fastapi.testclient import TestClient


def test_bulk_preview_marks_existing_and_lookups_new(client: TestClient) -> None:
    client.post(
        "/assets",
        json={
            "symbol": "PETR4",
            "name": "Petrobras",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )

    response = client.post(
        "/assets/bulk/preview",
        json={"symbols": ["PETR4", "BBSE3", "BBSE3"]},
    )

    assert response.status_code == 200
    items = {item["symbol"]: item for item in response.json()["items"]}
    assert len(items) == 2
    assert items["PETR4"]["already_in_db"] is True
    assert items["PETR4"]["lookup"] is None
    assert items["BBSE3"]["already_in_db"] is False
    assert items["BBSE3"]["lookup"] is not None
    assert items["BBSE3"]["lookup"]["name"] == "BB Seguridade Participações S.A."


def test_bulk_create_partial_success(client: TestClient) -> None:
    client.post(
        "/assets",
        json={
            "symbol": "AAA1",
            "name": "A",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )

    response = client.post(
        "/assets/bulk",
        json={
            "assets": [
                {
                    "symbol": "AAA1",
                    "name": "Dup",
                    "asset_type": "stock",
                    "market": "national",
                    "currency": "BRL",
                },
                {
                    "symbol": "BBB1",
                    "name": "B",
                    "asset_type": "stock",
                    "market": "national",
                    "currency": "BRL",
                },
            ]
        },
    )

    assert response.status_code == 200
    by_symbol = {r["symbol"]: r for r in response.json()["results"]}
    assert by_symbol["AAA1"]["status"] == "skipped"
    assert by_symbol["BBB1"]["status"] == "created"
    assert by_symbol["BBB1"]["asset"]["symbol"] == "BBB1"
