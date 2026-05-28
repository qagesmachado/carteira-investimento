from fastapi.testclient import TestClient


def test_create_asset_with_required_fields(client: TestClient) -> None:
    response = client.post(
        "/assets",
        json={
            "symbol": "BBSE3",
            "name": "BB Seguridade",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )

    assert response.status_code == 201
    assert response.json()["symbol"] == "BBSE3"
    assert response.json()["display_class"] == "stocks"


def test_international_asset_requires_country(client: TestClient) -> None:
    response = client.post(
        "/assets",
        json={
            "symbol": "VOO",
            "name": "Vanguard S&P 500 ETF",
            "asset_type": "etf",
            "market": "international",
            "currency": "USD",
        },
    )

    assert response.status_code == 422
    assert "country" in response.text


def test_national_etf_requires_etf_subtype(client: TestClient) -> None:
    response = client.post(
        "/assets",
        json={
            "symbol": "BOVA11",
            "name": "iShares Ibovespa",
            "asset_type": "etf",
            "market": "national",
            "currency": "BRL",
        },
    )

    assert response.status_code == 422
    assert "etf_subtype" in response.text


def test_national_fixed_income_etf_uses_fixed_income_display_class(client: TestClient) -> None:
    response = client.post(
        "/assets",
        json={
            "symbol": "AUPO11",
            "name": "AUPO11",
            "asset_type": "etf",
            "market": "national",
            "currency": "BRL",
            "etf_subtype": "fixed_income",
        },
    )

    assert response.status_code == 201
    assert response.json()["display_class"] == "fixed_income"


def test_asset_can_be_listed_after_creation(client: TestClient) -> None:
    client.post(
        "/assets",
        json={
            "symbol": "HGLG11",
            "name": "HGLG11",
            "asset_type": "fii",
            "market": "national",
            "currency": "BRL",
        },
    )

    response = client.get("/assets")

    assert response.status_code == 200
    assert [asset["symbol"] for asset in response.json()] == ["HGLG11"]


def test_lookup_asset_with_yfinance_provider(client: TestClient) -> None:
    response = client.get("/assets/lookup", params={"symbol": "petr4.sa"})

    assert response.status_code == 200
    assert response.json() == {
        "symbol": "PETR4.SA",
        "name": "Petrobras PN",
        "asset_type": "stock",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Energia",
        "subsector": None,
        "segment": None,
        "company_cnpj": None,
        "payer_cnpj": None,
        "payer_name": None,
        "quote_source": "yfinance",
        "current_quote": 38.5,
    }


def test_patch_fixed_income_asset_stores_rf_fields(client: TestClient) -> None:
    created = client.post(
        "/assets",
        json={
            "symbol": "CDBTEST1",
            "name": "CDB teste",
            "asset_type": "fixed_income",
            "market": "national",
            "currency": "BRL",
        },
    )
    assert created.status_code == 201
    asset_id = created.json()["id"]

    response = client.patch(
        f"/assets/{asset_id}",
        json={
            "fixed_income_indexer": "ipca_plus",
            "fixed_income_yield_description": "IPCA + 8%",
            "fixed_income_title_type": "cdb",
            "maturity_date": "2028-06-15",
            "purchase_date": "2024-01-10",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["fixed_income_indexer"] == "ipca_plus"
    assert data["fixed_income_yield_description"] == "IPCA + 8%"
    assert data["fixed_income_title_type"] == "cdb"
    assert data["maturity_date"] == "2028-06-15"
    assert data["purchase_date"] == "2024-01-10"


def test_patch_asset_updates_name(client: TestClient) -> None:
    created = client.post(
        "/assets",
        json={
            "symbol": "EGIE3",
            "name": "Old",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )
    assert created.status_code == 201
    asset_id = created.json()["id"]

    response = client.patch(f"/assets/{asset_id}", json={"name": "Engie Brasil"})

    assert response.status_code == 200
    assert response.json()["name"] == "Engie Brasil"
    assert response.json()["symbol"] == "EGIE3"


def test_patch_asset_returns_404_when_missing(client: TestClient) -> None:
    response = client.patch("/assets/9999", json={"name": "X"})

    assert response.status_code == 404


def test_create_asset_returns_409_on_duplicate_symbol(client: TestClient) -> None:
    payload = {
        "symbol": "BTLG11",
        "name": "BTLG11",
        "asset_type": "fii",
        "market": "national",
        "currency": "BRL",
    }
    first = client.post("/assets", json=payload)
    assert first.status_code == 201

    second = client.post("/assets", json=payload)
    assert second.status_code == 409
    assert "already exists" in second.text


def test_create_asset_returns_409_when_symbol_variants_match(client: TestClient) -> None:
    first = client.post(
        "/assets",
        json={
            "symbol": "PETR4.SA",
            "name": "Petrobras",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )
    assert first.status_code == 201

    second = client.post(
        "/assets",
        json={
            "symbol": "PETR4",
            "name": "Petrobras PN",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )
    assert second.status_code == 409


def test_patch_asset_returns_409_on_duplicate_symbol(client: TestClient) -> None:
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
    second = client.post(
        "/assets",
        json={
            "symbol": "BBB1",
            "name": "B",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )
    asset_id = second.json()["id"]

    response = client.patch(f"/assets/{asset_id}", json={"symbol": "AAA1"})

    assert response.status_code == 409


def test_delete_asset_returns_204(client: TestClient) -> None:
    created = client.post(
        "/assets",
        json={
            "symbol": "DEL1",
            "name": "To delete",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )
    asset_id = created.json()["id"]

    response = client.delete(f"/assets/{asset_id}")

    assert response.status_code == 204
    assert response.content == b""

    listed = client.get("/assets")
    assert listed.status_code == 200
    assert all(a["symbol"] != "DEL1" for a in listed.json())


def test_delete_asset_removes_orphaned_analysis_scores(client: TestClient) -> None:
    """Evita que scores (ex.: pvp_descarte FII) sobrevivam ao reuso de asset_id."""
    created = client.post(
        "/assets",
        json={
            "symbol": "FII-DEL",
            "name": "FII delete",
            "asset_type": "fii",
            "market": "national",
            "currency": "BRL",
        },
    )
    assert created.status_code == 201
    fii_id = created.json()["id"]

    saved = client.put(
        f"/analysis/assets/{fii_id}/scores?profile=fii_br",
        json={"scores": {"pvp_descarte": 1, "vacancia": 5}},
    )
    assert saved.status_code == 200

    deleted = client.delete(f"/assets/{fii_id}")
    assert deleted.status_code == 204

    recreated = client.post(
        "/assets",
        json={
            "symbol": "STK-NEW",
            "name": "Stock after delete",
            "asset_type": "stock",
            "market": "national",
            "currency": "BRL",
        },
    )
    assert recreated.status_code == 201
    stock_id = recreated.json()["id"]
    assert stock_id == fii_id

    read = client.get(f"/analysis/assets/{stock_id}?profile=stock_br")
    assert read.status_code == 200
    assert read.json()["scores"].get("pvp_descarte") is None


def test_delete_asset_returns_404_when_missing(client: TestClient) -> None:
    response = client.delete("/assets/9999")

    assert response.status_code == 404
