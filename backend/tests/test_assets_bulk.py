from fastapi.testclient import TestClient

from app.api.assets import get_asset_lookup_provider
from app.main import app
from app.providers.yfinance_asset_provider import AssetLookupResult


class NotFoundLookupProvider:
    def lookup(self, symbol: str) -> AssetLookupResult:
        if symbol.upper() == "GUAR3":
            raise ValueError("quote not found for GUAR3.SA")
        return AssetLookupResult(
            symbol=symbol.upper(),
            name="BB Seguridade Participações S.A.",
            asset_type="stock",
            market="national",
            country="BR",
            currency="BRL",
            sector="Serviços financeiros",
            current_quote=38.5,
        )


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
    assert items["BBSE3"]["lookup"]["name"] == "Petrobras PN"


def test_bulk_preview_continues_when_symbol_not_found(client: TestClient) -> None:
    original = app.dependency_overrides.get(get_asset_lookup_provider)
    app.dependency_overrides[get_asset_lookup_provider] = lambda: NotFoundLookupProvider()
    try:
        response = client.post(
            "/assets/bulk/preview",
            json={"symbols": ["GUAR3", "BBSE3"]},
        )
    finally:
        if original is not None:
            app.dependency_overrides[get_asset_lookup_provider] = original

    assert response.status_code == 200
    body = response.json()
    assert body["warnings"]
    assert "GUAR3" in body["warnings"][0]

    items = {item["symbol"]: item for item in body["items"]}
    assert len(items) == 2
    assert items["GUAR3"]["lookup"] is None
    assert "não encontrado" in items["GUAR3"]["error"].lower()
    assert items["BBSE3"]["lookup"] is not None


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
