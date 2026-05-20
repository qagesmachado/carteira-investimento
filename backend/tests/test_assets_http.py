"""Contratos HTTP dos endpoints de ``/assets`` (status, JSON, headers).

Usa o fixture ``client`` de ``conftest.py`` (SQLite em memória, sem ``carteira.db``).
"""

from fastapi.testclient import TestClient


def test_get_assets_returns_json_list(client: TestClient) -> None:
    response = client.get("/assets")

    assert response.status_code == 200
    assert response.headers.get("content-type", "").startswith("application/json")
    assert response.json() == []


def test_get_assets_lookup_requires_symbol_query(client: TestClient) -> None:
    response = client.get("/assets/lookup")

    assert response.status_code == 422


def test_get_assets_lookup_returns_json_and_expected_keys(client: TestClient) -> None:
    response = client.get("/assets/lookup", params={"symbol": "bbse3"})

    assert response.status_code == 200
    assert response.headers.get("content-type", "").startswith("application/json")
    body = response.json()
    assert set(body.keys()) >= {
        "symbol",
        "name",
        "asset_type",
        "market",
        "currency",
        "quote_source",
    }
    assert body["symbol"] == "BBSE3"


def test_post_assets_returns_201_and_json(client: TestClient) -> None:
    response = client.post(
        "/assets",
        json={
            "symbol": "XPTO1",
            "name": "X",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )

    assert response.status_code == 201
    assert response.headers.get("content-type", "").startswith("application/json")
    data = response.json()
    assert data["symbol"] == "XPTO1"
    assert "id" in data
    assert "display_class" in data
