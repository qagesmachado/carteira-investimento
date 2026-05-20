"""Importação/exportação de carteira com resolução de ativos."""

import json
from pathlib import Path

from fastapi.testclient import TestClient

FIXTURE = Path(__file__).parent / "fixtures" / "portfolio-export-v1.json"


def _load_fixture() -> dict:
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


def test_import_preview_missing_asset(client: TestClient) -> None:
    doc = _load_fixture()
    response = client.post("/portfolios/import/preview", json={"document": doc})
    assert response.status_code == 200
    assets = response.json()["assets"]
    assert any(item["status"] == "missing" for item in assets)


def test_import_confirm_creates_portfolio_and_asset(client: TestClient) -> None:
    doc = _load_fixture()
    preview = client.post("/portfolios/import/preview", json={"document": doc}).json()
    resolutions = []
    for item in preview["assets"]:
        if item["status"] == "missing":
            resolutions.append(
                {
                    "symbol": item["symbol"],
                    "action": "create",
                    "asset_create": item["file_asset"] or item["lookup"],
                },
            )
        else:
            resolutions.append({"symbol": item["symbol"], "action": "keep"})

    confirm = client.post(
        "/portfolios/import",
        json={
            "document": doc,
            "asset_resolutions": resolutions,
            "create_new_portfolio": True,
        },
    )
    assert confirm.status_code == 200
    body = confirm.json()
    assert body["assets_created"] >= 1
    assert body["positions_imported"] == 1
    assert client.get("/assets").json()  # asset in base


def _resolutions_from_preview(preview: dict) -> list[dict]:
    resolutions = []
    for item in preview["assets"]:
        if item["status"] == "missing":
            resolutions.append(
                {
                    "symbol": item["symbol"],
                    "action": "create",
                    "asset_create": item["file_asset"] or item["lookup"],
                },
            )
        else:
            resolutions.append({"symbol": item["symbol"], "action": "keep"})
    return resolutions


def test_import_confirm_duplicate_portfolio_name_gets_suffix(client: TestClient) -> None:
    doc = _load_fixture()
    portfolio_name = doc["portfolio"]["name"]
    client.post("/portfolios", json={"name": portfolio_name})

    preview = client.post("/portfolios/import/preview", json={"document": doc}).json()
    confirm = client.post(
        "/portfolios/import",
        json={
            "document": doc,
            "asset_resolutions": _resolutions_from_preview(preview),
            "create_new_portfolio": True,
        },
    )
    assert confirm.status_code == 200
    body = confirm.json()
    assert body["portfolio_name_adjusted"] is True
    assert body["portfolio_name"] == f"{portfolio_name} (2)"


def test_import_confirm_second_import_increments_suffix(client: TestClient) -> None:
    doc = _load_fixture()
    portfolio_name = doc["portfolio"]["name"]
    client.post("/portfolios", json={"name": portfolio_name})

    preview = client.post("/portfolios/import/preview", json={"document": doc}).json()
    resolutions = _resolutions_from_preview(preview)
    first = client.post(
        "/portfolios/import",
        json={
            "document": doc,
            "asset_resolutions": resolutions,
            "create_new_portfolio": True,
        },
    )
    assert first.status_code == 200
    assert first.json()["portfolio_name"] == f"{portfolio_name} (2)"

    preview2 = client.post("/portfolios/import/preview", json={"document": doc}).json()
    second = client.post(
        "/portfolios/import",
        json={
            "document": doc,
            "asset_resolutions": _resolutions_from_preview(preview2),
            "create_new_portfolio": True,
        },
    )
    assert second.status_code == 200
    assert second.json()["portfolio_name"] == f"{portfolio_name} (3)"


def test_import_preview_conflict(client: TestClient) -> None:
    client.post(
        "/assets",
        json={
            "symbol": "IMPT1",
            "name": "Base Name",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )
    doc = _load_fixture()
    preview = client.post("/portfolios/import/preview", json={"document": doc}).json()
    conflict = next(a for a in preview["assets"] if a["symbol"] == "IMPT1")
    assert conflict["status"] == "conflict"
    assert len(conflict["fields"]) >= 1
