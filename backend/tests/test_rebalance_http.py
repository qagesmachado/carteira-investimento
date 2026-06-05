"""Contratos HTTP de rebalanceamento."""

import json

from fastapi.testclient import TestClient

from app.services.analysis_engine import VIABILIDADE_CODE


def _create_stock(
    client: TestClient,
    symbol: str = "BBSE3",
    *,
    asset_type: str = "stock",
    etf_subtype: str | None = None,
    current_quote: float = 40.0,
) -> int:
    payload: dict = {
        "symbol": symbol,
        "name": f"Ativo {symbol}",
        "asset_type": asset_type,
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "current_quote": current_quote,
    }
    if etf_subtype:
        payload["etf_subtype"] = etf_subtype
    response = client.post("/assets", json=payload)
    assert response.status_code == 201
    return response.json()["id"]


def _set_scores(client: TestClient, asset_id: int, scores: dict[str, int]) -> None:
    response = client.put(f"/analysis/assets/{asset_id}/scores", json={"scores": scores})
    assert response.status_code == 200


def _minimal_scores(**overrides: int) -> dict[str, int]:
    base = {
        "lucros": 5,
        "divida": 5,
        "tag_along": 5,
        "segmento": 5,
        VIABILIDADE_CODE: 2,
        "roe": 1,
        "cagr": 1,
    }
    base.update(overrides)
    return base


def _minimal_fii_scores(**overrides: int) -> dict[str, int]:
    base = {
        "vacancia": 5,
        "qtd_ativos": 5,
        "alavancagem": 5,
        "segmento_fii": 5,
        VIABILIDADE_CODE: 2,
        "localizacao": 1,
        "pvp": -1,
    }
    base.update(overrides)
    return base


def _set_fii_scores(client: TestClient, asset_id: int, scores: dict[str, int]) -> None:
    response = client.put(
        f"/analysis/assets/{asset_id}/scores?profile=fii_br",
        json={"scores": scores},
    )
    assert response.status_code == 200


def test_get_rebalance_empty_portfolio(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Vazia"}).json()["id"]
    response = client.get(f"/portfolios/{portfolio_id}/rebalance")
    assert response.status_code == 200
    body = response.json()
    assert body["patrimony_brl"] == 0.0
    assert len(body["classes"]) == 5
    assert body["classes"][0]["display_class"] == "stocks"
    assert body["classes"][0]["target_percent"] == 30.0


def test_get_rebalance_with_positions_and_scores(client: TestClient) -> None:
    stock_a = _create_stock(client, "AAA3", current_quote=100.0)
    stock_b = _create_stock(client, "BBB3", current_quote=50.0)
    etf_id = _create_stock(client, "BOVA11", asset_type="etf", etf_subtype="variable_income", current_quote=100.0)
    rf_id = _create_stock(client, "CDB1", asset_type="fixed_income", current_quote=1.0)

    _set_scores(client, stock_a, _minimal_scores())
    _set_scores(client, stock_b, _minimal_scores(lucros=3))
    _set_scores(client, etf_id, _minimal_scores(roe=2, cagr=2))

    portfolio_id = client.post("/portfolios", json={"name": "Rebalance"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock_a, "quantity": 100, "average_price": 80},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock_b, "quantity": 100, "average_price": 40},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": etf_id, "quantity": 100, "average_price": 90},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={
            "asset_id": rf_id,
            "invested_amount": 40_000,
            "current_value": 40_000,
        },
    )

    response = client.get(f"/portfolios/{portfolio_id}/rebalance")
    assert response.status_code == 200
    body = response.json()
    assert body["patrimony_brl"] == 65_000.0
    stocks = next(c for c in body["classes"] if c["display_class"] == "stocks")
    assert stocks["current_value_brl"] == 25_000.0
    rf = next(c for c in body["classes"] if c["display_class"] == "fixed_income")
    assert rf["current_value_brl"] == 40_000.0
    assert len(body["stocks_sub_types"]) == 2
    assert len(body["stock_assets"]) == 3
    scored = [a for a in body["stock_assets"] if a["score_included"]]
    assert len(scored) == 3
    assert body["assets_without_score_count"] == 0


def test_patch_allocation_targets_validates_sum(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Metas"}).json()["id"]
    bad = json.dumps(
        {
            "classes": {
                "stocks": 30,
                "funds": 5,
                "international": 20,
                "fixed_income": 40,
                "crypto": 10,
            },
            "stocks_split": {"etf": 70, "stock": 30},
        }
    )
    response = client.patch(
        f"/portfolios/{portfolio_id}",
        json={"allocation_targets_json": bad},
    )
    assert response.status_code == 422

    good = json.dumps(
        {
            "classes": {
                "stocks": 25,
                "funds": 10,
                "international": 15,
                "fixed_income": 45,
                "crypto": 5,
            },
            "stocks_split": {"etf": 60, "stock": 40},
        }
    )
    ok = client.patch(
        f"/portfolios/{portfolio_id}",
        json={"allocation_targets_json": good},
    )
    assert ok.status_code == 200
    rebalance = client.get(f"/portfolios/{portfolio_id}/rebalance").json()
    stocks = next(c for c in rebalance["classes"] if c["display_class"] == "stocks")
    assert stocks["target_percent"] == 25.0


def test_get_rebalance_portfolio_not_found(client: TestClient) -> None:
    response = client.get("/portfolios/9999/rebalance")
    assert response.status_code == 404


def test_get_rebalance_excludes_pension_from_patrimony(client: TestClient) -> None:
    stock_id = _create_stock(client, "STK1", current_quote=100.0)
    pension_id = client.post(
        "/assets",
        json={
            "symbol": "PREV-E2E",
            "name": "Previdência E2E",
            "asset_type": "pension",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
        },
    )
    assert pension_id.status_code == 201
    pension_asset_id = pension_id.json()["id"]

    portfolio_id = client.post("/portfolios", json={"name": "Com previdência"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock_id, "quantity": 10, "average_price": 80},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={
            "asset_id": pension_asset_id,
            "invested_amount": 50_000,
            "current_value": 50_000,
        },
    )

    response = client.get(f"/portfolios/{portfolio_id}/rebalance")
    assert response.status_code == 200
    body = response.json()
    assert body["patrimony_brl"] == 1_000.0
    stocks = next(c for c in body["classes"] if c["display_class"] == "stocks")
    assert stocks["current_value_brl"] == 1_000.0


def test_get_rebalance_includes_international_and_fii_assets(client: TestClient) -> None:
    voo_id = client.post(
        "/assets",
        json={
            "symbol": "VOO",
            "name": "Vanguard S&P 500",
            "asset_type": "etf",
            "market": "international",
            "country": "US",
            "currency": "USD",
            "current_quote": 400,
        },
    ).json()["id"]
    fii_id = client.post(
        "/assets",
        json={
            "symbol": "HGLG11",
            "name": "CSHG Logística",
            "asset_type": "fii",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
            "current_quote": 150,
        },
    ).json()["id"]

    portfolio_id = client.post("/portfolios", json={"name": "Mix classes"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": voo_id, "quantity": 10, "average_price": 380},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": fii_id, "quantity": 20, "average_price": 140},
    )
    fx = client.post("/fx/usd-brl/refresh")

    response = client.get(f"/portfolios/{portfolio_id}/rebalance")
    assert response.status_code == 200
    body = response.json()
    assert len(body["fund_assets"]) == 1
    assert body["fund_assets"][0]["symbol"] == "HGLG11"
    assert body["fund_assets"][0]["target_percent"] is None
    if fx.status_code == 200:
        assert len(body["international_assets"]) == 1
        assert body["international_assets"][0]["symbol"] == "VOO"
        assert body["international_assets"][0]["target_percent"] is None


def test_get_rebalance_international_with_allocation(client: TestClient) -> None:
    voo_id = client.post(
        "/assets",
        json={
            "symbol": "VOO",
            "name": "Vanguard S&P 500",
            "asset_type": "etf",
            "market": "international",
            "country": "US",
            "currency": "USD",
            "current_quote": 400,
        },
    ).json()["id"]

    portfolio_id = client.post("/portfolios", json={"name": "Intl alloc"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": voo_id, "quantity": 10, "average_price": 380},
    )
    alloc = client.put(
        "/analysis/profiles/etf-intl/allocations",
        json={"allocations": [{"asset_id": voo_id, "target_percent": 100}]},
    )
    assert alloc.status_code == 200
    fx = client.post("/fx/usd-brl/refresh")

    response = client.get(f"/portfolios/{portfolio_id}/rebalance")
    assert response.status_code == 200
    body = response.json()
    if fx.status_code == 200:
        assert len(body["international_assets"]) == 1
        assert body["international_assets"][0]["symbol"] == "VOO"
        assert body["international_assets"][0]["target_percent"] == 100.0


def test_get_rebalance_fii_assets_with_scores(client: TestClient) -> None:
    fii_a = client.post(
        "/assets",
        json={
            "symbol": "HGLG11",
            "name": "CSHG Logística",
            "asset_type": "fii",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
            "current_quote": 150,
        },
    ).json()["id"]
    fii_b = client.post(
        "/assets",
        json={
            "symbol": "XPLG11",
            "name": "XP Log",
            "asset_type": "fii",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
            "current_quote": 100,
        },
    ).json()["id"]

    _set_fii_scores(client, fii_a, _minimal_fii_scores())
    _set_fii_scores(client, fii_b, _minimal_fii_scores(vacancia=3))

    portfolio_id = client.post("/portfolios", json={"name": "FIIs scored"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": fii_a, "quantity": 20, "average_price": 140},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": fii_b, "quantity": 10, "average_price": 90},
    )

    response = client.get(f"/portfolios/{portfolio_id}/rebalance")
    assert response.status_code == 200
    body = response.json()
    assert len(body["fund_assets"]) == 2
    scored = [a for a in body["fund_assets"] if a["score_included"]]
    assert len(scored) == 2
    assert body["fund_assets_without_score_count"] == 0
    hglg = next(a for a in body["fund_assets"] if a["symbol"] == "HGLG11")
    xplg = next(a for a in body["fund_assets"] if a["symbol"] == "XPLG11")
    assert hglg["target_percent"] is not None
    assert xplg["target_percent"] is not None
    assert hglg["sum_score"] is not None
    assert hglg["target_percent"] > xplg["target_percent"]
