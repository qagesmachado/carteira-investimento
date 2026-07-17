"""Estratégia Criptomoeda — classificação, alocação e rebalanceamento."""

from fastapi.testclient import TestClient

from app.models.asset import AssetMarket, AssetType, DisplayClass, EtfSubtype
from app.providers.yfinance_asset_provider import (
    CRYPTO_ETF_B3_TICKERS,
    YFinanceAssetProvider,
)
from app.services.asset_service import infer_display_class


def _create_crypto_assets(client: TestClient) -> tuple[dict, dict]:
    btc = client.post(
        "/assets",
        json={
            "symbol": "BTC-USD",
            "name": "Bitcoin USD",
            "asset_type": "crypto",
            "market": "international",
            "country": "US",
            "currency": "USD",
            "current_quote": 65000,
        },
    ).json()
    abtc = client.post(
        "/assets",
        json={
            "symbol": "ABTC11",
            "name": "ETF Bitcoin",
            "asset_type": "etf",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
            "etf_subtype": "crypto",
            "current_quote": 50,
        },
    ).json()
    return btc, abtc


def test_infer_display_class_etf_crypto_subtype() -> None:
    result = infer_display_class(
        AssetType.ETF,
        AssetMarket.NATIONAL,
        EtfSubtype.CRYPTO,
    )
    assert result == DisplayClass.CRYPTO


def test_create_abtc11_display_class_crypto(client: TestClient) -> None:
    response = client.post(
        "/assets",
        json={
            "symbol": "ABTC11",
            "name": "ETF Bitcoin",
            "asset_type": "etf",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
            "etf_subtype": "crypto",
            "current_quote": 50.0,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["display_class"] == "crypto"


def test_get_crypto_config_seeds_defaults(client: TestClient) -> None:
    response = client.get("/analysis/profiles/crypto/config")
    assert response.status_code == 200
    body = response.json()
    assert body["profile"] == "crypto"
    codes = {c["code"] for c in body["criteria"]}
    assert codes == {"target_percent", "analysis_link"}


def test_put_crypto_allocations(client: TestClient) -> None:
    btc, abtc = _create_crypto_assets(client)
    portfolio_id = client.post("/portfolios", json={"name": "Crypto alloc"}).json()["id"]

    put = client.put(
        "/analysis/profiles/crypto/allocations",
        json={
            "portfolio_id": portfolio_id,
            "allocations": [
                {"asset_id": btc["id"], "target_percent": 70},
                {"asset_id": abtc["id"], "target_percent": 30},
            ],
        },
    )
    assert put.status_code == 200
    assert len(put.json()) == 2

    listed = client.get(f"/analysis/assets?profile=crypto&portfolio_id={portfolio_id}").json()
    symbols = {row["symbol"] for row in listed}
    assert symbols == {"BTC-USD", "ABTC11"}


def test_put_crypto_allocations_rejects_bad_sum(client: TestClient) -> None:
    btc = client.post(
        "/assets",
        json={
            "symbol": "BTC2-USD",
            "name": "Bitcoin USD",
            "asset_type": "crypto",
            "market": "international",
            "country": "US",
            "currency": "USD",
            "current_quote": 65000,
        },
    ).json()
    portfolio_id = client.post("/portfolios", json={"name": "Crypto bad sum"}).json()["id"]
    put = client.put(
        "/analysis/profiles/crypto/allocations",
        json={
            "portfolio_id": portfolio_id,
            "allocations": [{"asset_id": btc["id"], "target_percent": 90}],
        },
    )
    assert put.status_code == 422


def test_crypto_allocations_isolated_per_portfolio(client: TestClient) -> None:
    btc, abtc = _create_crypto_assets(client)
    portfolio_a = client.post("/portfolios", json={"name": "Controle investimento"}).json()["id"]
    portfolio_b = client.post("/portfolios", json={"name": "Carteira Gabriel"}).json()["id"]

    for portfolio_id in (portfolio_a, portfolio_b):
        client.post(
            f"/portfolios/{portfolio_id}/positions",
            json={"asset_id": btc["id"], "quantity": 0.1, "average_price": 60000},
        )
        client.post(
            f"/portfolios/{portfolio_id}/positions",
            json={"asset_id": abtc["id"], "quantity": 100, "average_price": 45},
        )

    assert client.put(
        "/analysis/profiles/crypto/allocations",
        json={
            "portfolio_id": portfolio_a,
            "allocations": [
                {"asset_id": btc["id"], "target_percent": 40},
                {"asset_id": abtc["id"], "target_percent": 60},
            ],
        },
    ).status_code == 200

    assert client.put(
        "/analysis/profiles/crypto/allocations",
        json={
            "portfolio_id": portfolio_b,
            "allocations": [{"asset_id": abtc["id"], "target_percent": 100}],
        },
    ).status_code == 200

    listed_a = client.get(f"/analysis/assets?profile=crypto&portfolio_id={portfolio_a}").json()
    listed_b = client.get(f"/analysis/assets?profile=crypto&portfolio_id={portfolio_b}").json()

    by_symbol_a = {row["symbol"]: row for row in listed_a}
    by_symbol_b = {row["symbol"]: row for row in listed_b}

    assert by_symbol_a["BTC-USD"]["score_refs"]["target_percent"] == "40"
    assert by_symbol_a["ABTC11"]["score_refs"]["target_percent"] == "60"
    assert by_symbol_b["ABTC11"]["score_refs"]["target_percent"] == "100"
    assert by_symbol_b["BTC-USD"]["score_refs"].get("target_percent") in (None, "")


def test_get_rebalance_crypto_assets_with_allocation(client: TestClient) -> None:
    btc, abtc = _create_crypto_assets(client)
    portfolio_id = client.post("/portfolios", json={"name": "Crypto alloc"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": btc["id"], "quantity": 0.1, "average_price": 60000},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": abtc["id"], "quantity": 100, "average_price": 45},
    )
    alloc = client.put(
        "/analysis/profiles/crypto/allocations",
        json={
            "portfolio_id": portfolio_id,
            "allocations": [
                {"asset_id": btc["id"], "target_percent": 70},
                {"asset_id": abtc["id"], "target_percent": 30},
            ],
        },
    )
    assert alloc.status_code == 200
    fx = client.post("/fx/usd-brl/refresh")

    response = client.get(f"/portfolios/{portfolio_id}/rebalance")
    assert response.status_code == 200
    body = response.json()
    crypto_class = next(c for c in body["classes"] if c["display_class"] == "crypto")
    assert crypto_class["label"] == "Criptomoeda"
    assert len(body["crypto_assets"]) == 2
    if fx.status_code == 200:
        by_symbol = {row["symbol"]: row for row in body["crypto_assets"]}
        assert by_symbol["BTC-USD"]["target_percent"] == 70.0
        assert by_symbol["ABTC11"]["target_percent"] == 30.0


def test_get_rebalance_crypto_assets_without_quote(client: TestClient) -> None:
    """Posição cripto sem cotação aparece no rebalance com valores atuais nulos."""
    btc = client.post(
        "/assets",
        json={
            "symbol": "BTC-USD",
            "name": "Bitcoin USD",
            "asset_type": "crypto",
            "market": "international",
            "country": "US",
            "currency": "USD",
            "current_quote": 65000,
        },
    ).json()
    abtc = client.post(
        "/assets",
        json={
            "symbol": "ABTC11",
            "name": "ETF Bitcoin",
            "asset_type": "etf",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
            "etf_subtype": "crypto",
        },
    ).json()
    portfolio_id = client.post("/portfolios", json={"name": "Crypto no quote"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": btc["id"], "quantity": 0.1, "average_price": 60000},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": abtc["id"], "quantity": 1, "average_price": 1},
    )
    alloc = client.put(
        "/analysis/profiles/crypto/allocations",
        json={
            "portfolio_id": portfolio_id,
            "allocations": [
                {"asset_id": btc["id"], "target_percent": 40},
                {"asset_id": abtc["id"], "target_percent": 60},
            ],
        },
    )
    assert alloc.status_code == 200
    client.post("/fx/usd-brl/refresh")

    response = client.get(f"/portfolios/{portfolio_id}/rebalance")
    assert response.status_code == 200
    body = response.json()
    assert len(body["crypto_assets"]) == 2
    by_symbol = {row["symbol"]: row for row in body["crypto_assets"]}
    assert by_symbol["ABTC11"]["current_value_brl"] is None
    assert by_symbol["ABTC11"]["current_percent"] is None
    assert by_symbol["ABTC11"]["target_percent"] == 60.0
    assert by_symbol["BTC-USD"]["current_value_brl"] is not None
    assert by_symbol["BTC-USD"]["current_value_brl"] > 0


def test_crypto_snapshot_endpoint_alias(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Snap"}).json()["id"]
    for path in ("bitcoin-snapshot", "crypto-snapshot"):
        response = client.get(f"/portfolios/{portfolio_id}/{path}")
        assert response.status_code == 200
        assert response.json()["portfolio_id"] == portfolio_id


def test_yfinance_crypto_etf_ticker_classification() -> None:
    provider = YFinanceAssetProvider()
    for ticker in CRYPTO_ETF_B3_TICKERS:
        assert provider._asset_type_from_quote_type("EQUITY", f"{ticker}.SA", "ETF Bitcoin") == "etf"
        assert provider._infer_etf_subtype(f"{ticker}.SA", "ETF Bitcoin", "etf", True) == "crypto"
