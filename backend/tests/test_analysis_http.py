from fastapi.testclient import TestClient

from tests.analysis_test_helpers import create_portfolio, create_portfolio_auvp, set_methodology_auvp


def _create_stock(client: TestClient, symbol: str = "BBSE3") -> dict:
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


def _create_international_etf(client: TestClient, symbol: str = "VOO") -> dict:
    response = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": f"ETF {symbol}",
            "asset_type": "etf",
            "market": "international",
            "country": "US",
            "currency": "USD",
            "current_quote": 400,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_get_stock_br_config_seeds_defaults(client: TestClient) -> None:
    response = client.get("/analysis/profiles/stock-br/config")
    assert response.status_code == 200
    body = response.json()
    assert body["profile"] == "stock_br"
    codes = {c["code"] for c in body["criteria"]}
    assert {"lucros", "divida", "tag_along", "segmento", "viabilidade", "roe", "cagr"}.issubset(codes)

    lucros = next(c for c in body["criteria"] if c["code"] == "lucros")
    assert lucros["score_options"][0]["label"] == "5 - Em 100% dos anos nos últimos 10 anos"
    assert lucros["score_options"][0]["characteristic"] == "Em 100% dos anos nos últimos 10 anos"
    assert body["table_display"]["sum_column"]["label"] == "Soma"
    assert body["table_display"]["sum_column"]["use_fundamental"] is True
    assert body["table_display"]["sum_column"]["use_diagram"] is True
    assert body["table_display"]["sum_column"]["diagram_multiplier"] == 2.0
    assert body["table_display"]["sum_column"]["viabilidade_weights"]["atencao"] == -5


def test_put_table_display_persists(client: TestClient) -> None:
    config = client.get("/analysis/profiles/stock-br/config").json()
    config["table_display"]["sum_column"]["diagram_multiplier"] = 3
    config["table_display"]["sum_column"]["viabilidade_weights"]["viavel"] = 4
    config["table_display"]["sum_column"]["label"] = "Total"
    put = client.put(
        "/analysis/profiles/stock-br/config",
        json={
            "criteria": config["criteria"],
            "rules": config["rules"],
            "table_display": config["table_display"],
        },
    )
    assert put.status_code == 200
    assert put.json()["table_display"]["sum_column"]["label"] == "Soma"
    assert put.json()["table_display"]["sum_column"]["diagram_multiplier"] == 3
    assert put.json()["table_display"]["sum_column"]["viabilidade_weights"]["viavel"] == 4


def test_get_stock_br_config_upgrades_legacy_labels(client: TestClient) -> None:
    config = client.get("/analysis/profiles/stock-br/config").json()
    legacy = config["criteria"]
    lucros = next(c for c in legacy if c["code"] == "lucros")
    lucros["score_options"] = [
        {"value": 5, "label": "5 - Viável"},
        {"value": 3, "label": "3 - Requer atenção"},
        {"value": 2, "label": "2 - Bomba"},
        {"value": 1, "label": "1 - Sem dados"},
    ]
    client.put(
        "/analysis/profiles/stock-br/config",
        json={"criteria": legacy, "rules": config["rules"]},
    )

    upgraded = client.get("/analysis/profiles/stock-br/config").json()
    lucros_upgraded = next(c for c in upgraded["criteria"] if c["code"] == "lucros")
    assert lucros_upgraded["score_options"][0]["label"].startswith("5 - Em 100%")


def test_get_stock_br_config_upgrades_legacy_diagram_help_text(client: TestClient) -> None:
    config = client.get("/analysis/profiles/stock-br/config").json()
    legacy = config["criteria"]
    endividamento = next(c for c in legacy if c["code"] == "endividamento")
    endividamento["help_text"] = "Nível e qualidade da dívida."
    client.put(
        "/analysis/profiles/stock-br/config",
        json={"criteria": legacy, "rules": config["rules"]},
    )

    upgraded = client.get("/analysis/profiles/stock-br/config").json()
    endividamento_upgraded = next(c for c in upgraded["criteria"] if c["code"] == "endividamento")
    assert (
        endividamento_upgraded["help_text"]
        == "Div. Líquida/EBITDA é menor que 2 nos últimos 5 anos?"
    )


def test_put_scores_and_list_assets(client: TestClient) -> None:
    asset = _create_stock(client)
    put = client.put(
        f"/analysis/assets/{asset['id']}/scores",
        json={
            "scores": {
                "lucros": 5,
                "divida": 5,
                "tag_along": 5,
                "segmento": 5,
                "viabilidade": 2,
                "roe": 1,
                "cagr": -1,
            }
        },
    )
    assert put.status_code == 200
    saved = put.json()
    assert saved["summary"]["viabilidade"]["label"] == "2 - VIÁVEL"
    assert saved["summary"]["diagrama"]["score"] == 0

    listed = client.get("/analysis/assets?profile=stock_br").json()
    assert len(listed) == 1
    assert listed[0]["symbol"] == "BBSE3"
    assert listed[0]["scores"]["lucros"] == 5


def test_fixed_income_not_in_analysis_list(client: TestClient) -> None:
    _create_stock(client)
    client.post(
        "/assets",
        json={
            "symbol": "CDB-E2E",
            "name": "CDB Teste",
            "asset_type": "fixed_income",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
        },
    )
    listed = client.get("/analysis/assets?profile=stock_br").json()
    symbols = {row["symbol"] for row in listed}
    assert "BBSE3" in symbols
    assert "CDB-E2E" not in symbols


def test_reset_config(client: TestClient) -> None:
    config = client.get("/analysis/profiles/stock-br/config").json()
    criteria = config["criteria"]
    criteria[0]["weight"] = 9
    client.put(
        "/analysis/profiles/stock-br/config",
        json={"criteria": criteria, "rules": config["rules"]},
    )
    reset = client.post("/analysis/profiles/stock-br/config/reset")
    assert reset.status_code == 200
    assert reset.json()["criteria"][0]["weight"] == 1.0


def _create_fii(client: TestClient, symbol: str = "HGLG11") -> dict:
    response = client.post(
        "/assets",
        json={
            "symbol": symbol,
            "name": f"FII {symbol}",
            "asset_type": "fii",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_get_fii_br_config_seeds_defaults(client: TestClient) -> None:
    response = client.get("/analysis/profiles/fii-br/config")
    assert response.status_code == 200
    body = response.json()
    assert body["profile"] == "fii_br"
    codes = {c["code"] for c in body["criteria"]}
    assert {"vacancia", "qtd_ativos", "alavancagem", "segmento_fii", "localizacao", "pvp_descarte"}.issubset(
        codes
    )
    vacancia = next(c for c in body["criteria"] if c["code"] == "vacancia")
    assert vacancia["score_options"][0]["characteristic"] == "Vacância até 5%."


def test_fii_segments_seed(client: TestClient) -> None:
    response = client.get("/analysis/profiles/fii-br/segments")
    assert response.status_code == 200
    segments = response.json()
    assert len(segments) >= 2
    names = {s["name"] for s in segments}
    assert "Shoppings" in names
    assert "Multicategoria" in names


def test_put_fii_segments_rejects_incomplete_entry(client: TestClient) -> None:
    response = client.put(
        "/analysis/profiles/fii-br/segments",
        json={
            "segments": [
                {
                    "slug": "novo",
                    "name": "",
                    "score": 3,
                    "help_text": "Texto explicativo.",
                    "sort_order": 1,
                }
            ]
        },
    )
    assert response.status_code == 422


def test_put_fii_scores_and_list(client: TestClient) -> None:
    asset = _create_fii(client)
    put = client.put(
        f"/analysis/assets/{asset['id']}/scores?profile=fii_br",
        json={
            "scores": {
                "vacancia": 5,
                "qtd_ativos": 5,
                "alavancagem": 5,
                "segmento_fii": 5,
                "viabilidade": 2,
                "localizacao": 1,
                "pvp": -1,
            },
            "score_refs": {"segmento_fii": "shoppings"},
        },
    )
    assert put.status_code == 200
    saved = put.json()
    assert saved["summary"]["viabilidade"]["label"] == "2 - VIÁVEL"
    assert saved["score_refs"]["segmento_fii"] == "shoppings"

    cleared = client.put(
        f"/analysis/assets/{asset['id']}/scores?profile=fii_br",
        json={
            "scores": {
                "vacancia": None,
                "qtd_ativos": None,
                "alavancagem": None,
                "segmento_fii": None,
                "viabilidade": None,
            },
            "score_refs": {"segmento_fii": None},
        },
    )
    assert cleared.status_code == 200
    assert cleared.json()["score_refs"].get("segmento_fii") is None

    listed = client.get("/analysis/assets?profile=fii_br").json()
    assert len(listed) == 1
    assert listed[0]["symbol"] == "HGLG11"


def test_stock_not_in_fii_list(client: TestClient) -> None:
    _create_stock(client)
    _create_fii(client, "XPLG11")
    listed = client.get("/analysis/assets?profile=fii_br").json()
    symbols = {row["symbol"] for row in listed}
    assert "XPLG11" in symbols
    assert "BBSE3" not in symbols


def test_pvp_descarte_flag(client: TestClient) -> None:
    asset = _create_fii(client, "KNRI11")
    put = client.put(
        f"/analysis/assets/{asset['id']}/scores?profile=fii_br",
        json={"scores": {"vacancia": 5, "pvp_descarte": 1}},
    )
    assert put.status_code == 200
    assert put.json()["scores"]["pvp_descarte"] == 1


def test_get_etf_intl_config_seeds_defaults(client: TestClient) -> None:
    response = client.get("/analysis/profiles/etf-intl/config")
    assert response.status_code == 200
    body = response.json()
    assert body["profile"] == "etf_intl"
    codes = {c["code"] for c in body["criteria"]}
    assert codes == {"target_percent", "analysis_link"}
    assert body["table_display"]["sum_column"]["use_fundamental"] is False
    assert body["table_display"]["sum_column"]["use_diagram"] is False


def test_put_table_display_rejects_both_components_disabled(client: TestClient) -> None:
    config = client.get("/analysis/profiles/stock-br/config").json()
    config["table_display"]["sum_column"]["use_fundamental"] = False
    config["table_display"]["sum_column"]["use_diagram"] = False
    put = client.put(
        "/analysis/profiles/stock-br/config",
        json={
            "criteria": config["criteria"],
            "rules": config["rules"],
            "table_display": config["table_display"],
        },
    )
    assert put.status_code == 422


def test_put_etf_intl_allocations(client: TestClient) -> None:
    voo = _create_international_etf(client, "VOO")
    vt = _create_international_etf(client, "VT")
    portfolio_id = client.post("/portfolios", json={"name": "Intl alloc"}).json()["id"]
    put = client.put(
        "/analysis/profiles/etf-intl/allocations",
        json={
            "portfolio_id": portfolio_id,
            "allocations": [
                {"asset_id": voo["id"], "target_percent": 60, "analysis_link": "https://example.com/voo"},
                {"asset_id": vt["id"], "target_percent": 40, "analysis_link": None},
            ],
        },
    )
    assert put.status_code == 200
    body = put.json()
    assert len(body) == 2
    voo_row = next(r for r in body if r["symbol"] == "VOO")
    assert voo_row["score_refs"]["target_percent"] == "60"
    assert voo_row["score_refs"]["analysis_link"] == "https://example.com/voo"

    listed = client.get(f"/analysis/assets?profile=etf_intl&portfolio_id={portfolio_id}").json()
    symbols = {row["symbol"] for row in listed}
    assert symbols == {"VOO", "VT"}


def test_put_etf_intl_allocations_rejects_bad_sum(client: TestClient) -> None:
    voo = _create_international_etf(client, "VOO2")
    portfolio_id = client.post("/portfolios", json={"name": "Intl bad sum"}).json()["id"]
    put = client.put(
        "/analysis/profiles/etf-intl/allocations",
        json={
            "portfolio_id": portfolio_id,
            "allocations": [{"asset_id": voo["id"], "target_percent": 90}],
        },
    )
    assert put.status_code == 422

def test_list_etf_intl_includes_pending_flag(client: TestClient) -> None:
    voo = _create_international_etf(client, "LVOO")
    portfolio_id = client.post("/portfolios", json={"name": "Intl list pending"}).json()["id"]
    client.put(
        f"/analysis/assets/{voo['id']}/pending?profile=etf_intl",
        json={"portfolio_id": portfolio_id, "is_pending": True},
    )
    listed = client.get(f"/analysis/assets?profile=etf_intl&portfolio_id={portfolio_id}").json()
    row = next(item for item in listed if item["symbol"] == "LVOO")
    assert row["is_pending"] is True


def test_set_pending_zeros_allocation_target_percent(client: TestClient) -> None:
    voo = _create_international_etf(client, "ZVOO")
    portfolio_id = client.post("/portfolios", json={"name": "Intl zero pending"}).json()["id"]
    client.put(
        "/analysis/profiles/etf-intl/allocations",
        json={
            "portfolio_id": portfolio_id,
            "allocations": [{"asset_id": voo["id"], "target_percent": 100}],
        },
    )
    pending = client.put(
        f"/analysis/assets/{voo['id']}/pending?profile=etf_intl",
        json={"portfolio_id": portfolio_id, "is_pending": True},
    )
    assert pending.status_code == 200
    assert pending.json()["score_refs"]["target_percent"] == "0"


def test_put_etf_intl_allocations_ignores_pending_in_sum(client: TestClient) -> None:
    voo = _create_international_etf(client, "PVOO")
    vt = _create_international_etf(client, "PVT")
    portfolio_id = client.post("/portfolios", json={"name": "Intl pending sum"}).json()["id"]
    client.put(
        f"/analysis/assets/{vt['id']}/pending?profile=etf_intl",
        json={"portfolio_id": portfolio_id, "is_pending": True},
    )
    put = client.put(
        "/analysis/profiles/etf-intl/allocations",
        json={
            "portfolio_id": portfolio_id,
            "allocations": [
                {"asset_id": voo["id"], "target_percent": 100},
                {"asset_id": vt["id"], "target_percent": 50},
            ],
        },
    )
    assert put.status_code == 200
    body = {row["symbol"]: row for row in put.json()}
    assert body["PVOO"]["score_refs"]["target_percent"] == "100"


def test_stock_not_in_etf_intl_list(client: TestClient) -> None:
    _create_stock(client)
    _create_international_etf(client, "VOO3")
    portfolio_id = client.post("/portfolios", json={"name": "Intl list"}).json()["id"]
    listed = client.get(f"/analysis/assets?profile=etf_intl&portfolio_id={portfolio_id}").json()
    symbols = {row["symbol"] for row in listed}
    assert "VOO3" in symbols
    assert "BBSE3" not in symbols


def test_portfolio_summary_counts_classified_and_pending(client: TestClient) -> None:
    stock = _create_stock(client, "SUM3")
    portfolio_id = client.post("/portfolios", json={"name": "Sumário"}).json()["id"]
    set_methodology_auvp(client, portfolio_id, "stock_br")
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock["id"], "quantity": 10, "average_price": 50},
    )

    empty = client.get(f"/analysis/portfolio-summary?portfolio_id={portfolio_id}")
    assert empty.status_code == 200
    assert empty.json()["classified_count"] == 0
    assert empty.json()["pending_count"] == 0

    client.put(
        f"/analysis/assets/{stock['id']}/scores?profile=stock_br",
        json={
            "scores": {
                "lucros": 5,
                "divida": 5,
                "tag_along": 5,
                "segmento": 5,
                "viabilidade": 5,
                "roe": 1,
                "cagr": 1,
            },
            "score_refs": {},
        },
    )
    classified = client.get(f"/analysis/portfolio-summary?portfolio_id={portfolio_id}").json()
    assert classified["classified_count"] == 1
    assert classified["pending_count"] == 0

    pending = client.put(
        f"/analysis/assets/{stock['id']}/pending?profile=stock_br",
        json={"portfolio_id": portfolio_id, "is_pending": True},
    )
    assert pending.status_code == 200
    assert pending.json()["is_pending"] is True

    summary = client.get(f"/analysis/portfolio-summary?portfolio_id={portfolio_id}").json()
    assert summary["classified_count"] == 0
    assert summary["pending_count"] == 1


def test_portfolio_pending_lists_assets_grouped_by_profile(client: TestClient) -> None:
    stock = _create_stock(client, "PND3")
    fii_response = client.post(
        "/assets",
        json={
            "symbol": "PND11",
            "name": "FII Pendente",
            "asset_type": "fii",
            "market": "national",
            "country": "BR",
            "currency": "BRL",
        },
    )
    assert fii_response.status_code == 201
    fii = fii_response.json()

    portfolio_id = client.post("/portfolios", json={"name": "Pendentes modal"}).json()["id"]
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock["id"], "quantity": 10, "average_price": 50},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": fii["id"], "quantity": 10, "average_price": 100},
    )

    empty = client.get(f"/analysis/portfolio-pending?portfolio_id={portfolio_id}")
    assert empty.status_code == 200
    assert empty.json()["groups"] == []

    stock_pending = client.put(
        f"/analysis/assets/{stock['id']}/pending?profile=stock_br",
        json={"portfolio_id": portfolio_id, "is_pending": True},
    )
    assert stock_pending.status_code == 200

    fii_pending = client.put(
        f"/analysis/assets/{fii['id']}/pending?profile=fii_br",
        json={"portfolio_id": portfolio_id, "is_pending": True},
    )
    assert fii_pending.status_code == 200

    body = client.get(f"/analysis/portfolio-pending?portfolio_id={portfolio_id}").json()
    assert body["portfolio_id"] == portfolio_id
    assert len(body["groups"]) == 2
    assert body["groups"][0]["profile"] == "stock_br"
    assert body["groups"][0]["assets"][0]["symbol"] == "PND3"
    assert body["groups"][1]["profile"] == "fii_br"
    assert body["groups"][1]["assets"][0]["symbol"] == "PND11"


def test_pending_asset_excluded_from_rebalance_distribution(client: TestClient) -> None:
    from tests.test_rebalance_http import _create_stock as reb_create_stock
    from tests.test_rebalance_http import _minimal_scores, _set_scores

    stock_a = reb_create_stock(client, "PAA3", current_quote=100.0)
    stock_b = reb_create_stock(client, "PBB3", current_quote=100.0)
    _set_scores(client, stock_a, _minimal_scores())
    _set_scores(client, stock_b, _minimal_scores(lucros=3))

    portfolio_id = create_portfolio(client, "Pending reb")
    set_methodology_auvp(client, portfolio_id, "stock_br")
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock_a, "quantity": 10, "average_price": 80},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock_b, "quantity": 10, "average_price": 80},
    )
    client.put(
        f"/analysis/assets/{stock_a}/pending?profile=stock_br",
        json={"portfolio_id": portfolio_id, "is_pending": True},
    )

    body = client.get(f"/portfolios/{portfolio_id}/rebalance").json()
    rows = {row["symbol"]: row for row in body["stock_assets"]}
    assert rows["PAA3"]["score_included"] is False
    assert rows["PBB3"]["score_included"] is True

def test_get_methodology_legacy_fallback_without_seed() -> None:
    from sqlmodel import Session, create_engine
    from sqlmodel.pool import StaticPool

    from app.models.analysis import PortfolioAnalysisMethodology
    from app.models.portfolio import Portfolio
    from app.services.analysis_methodology_service import get_portfolio_methodology

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    PortfolioAnalysisMethodology.metadata.create_all(engine)
    Portfolio.metadata.create_all(engine)

    with Session(engine) as session:
        portfolio = Portfolio(name="Legado")
        session.add(portfolio)
        session.commit()
        session.refresh(portfolio)
        assert get_portfolio_methodology(session, portfolio.id, "stock_br") == "auvp"
        assert get_portfolio_methodology(session, portfolio.id, "etf_intl") == "simples"


def test_new_portfolio_seeds_simples_methodology(client: TestClient) -> None:
    portfolio_id = create_portfolio(client, "Nova carteira")
    for slug in ("stock-br", "fii-br", "etf-intl", "crypto"):
        response = client.get(
            f"/analysis/profiles/{slug}/methodology?portfolio_id={portfolio_id}"
        )
        assert response.status_code == 200
        assert response.json()["methodology"] == "simples"


def test_put_methodology_persists(client: TestClient) -> None:
    portfolio_id = create_portfolio(client, "Troca metodologia")
    response = client.put(
        "/analysis/profiles/stock-br/methodology",
        json={"portfolio_id": portfolio_id, "methodology": "auvp"},
    )
    assert response.status_code == 200
    assert response.json()["methodology"] == "auvp"


def test_put_simples_methodology_forces_unified_stocks_split(client: TestClient) -> None:
    import json

    portfolio_id = create_portfolio_auvp(client, "Sync split")
    targets = {
        "classes": {
            "stocks": 30,
            "funds": 5,
            "international": 20,
            "fixed_income": 40,
            "crypto": 5,
        },
        "stocks_split": {"etf": 70, "stock": 30},
        "stocks_split_mode": "by_subtype",
    }
    patch_response = client.patch(
        f"/portfolios/{portfolio_id}",
        json={"allocation_targets_json": json.dumps(targets, ensure_ascii=False)},
    )
    assert patch_response.status_code == 200

    response = client.put(
        "/analysis/profiles/stock-br/methodology",
        json={"portfolio_id": portfolio_id, "methodology": "simples"},
    )
    assert response.status_code == 200

    portfolios = client.get("/portfolios").json()
    portfolio = next(item for item in portfolios if item["id"] == portfolio_id)
    parsed = json.loads(portfolio["allocation_targets_json"])
    assert parsed["stocks_split_mode"] == "unified"


def test_portfolio_rejects_by_subtype_when_stock_br_simples(client: TestClient) -> None:
    import json

    portfolio_id = create_portfolio(client, "Simples bloqueio split")
    targets = {
        "classes": {
            "stocks": 30,
            "funds": 5,
            "international": 20,
            "fixed_income": 40,
            "crypto": 5,
        },
        "stocks_split": {"etf": 70, "stock": 30},
        "stocks_split_mode": "by_subtype",
    }
    response = client.patch(
        f"/portfolios/{portfolio_id}",
        json={"allocation_targets_json": json.dumps(targets, ensure_ascii=False)},
    )
    assert response.status_code == 422


def test_put_auvp_rejected_for_etf_intl(client: TestClient) -> None:
    portfolio_id = create_portfolio(client, "Intl auvp")
    response = client.put(
        "/analysis/profiles/etf-intl/methodology",
        json={"portfolio_id": portfolio_id, "methodology": "auvp"},
    )
    assert response.status_code == 422


def test_stock_br_allocations_simples(client: TestClient) -> None:
    stock_a = _create_stock(client, "SBA3")
    stock_b = _create_stock(client, "SBB3")
    portfolio_id = create_portfolio(client, "Stock simples")
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock_a["id"], "quantity": 1, "average_price": 10},
    )
    client.post(
        f"/portfolios/{portfolio_id}/positions",
        json={"asset_id": stock_b["id"], "quantity": 1, "average_price": 10},
    )
    response = client.put(
        "/analysis/profiles/stock-br/allocations",
        json={
            "portfolio_id": portfolio_id,
            "allocations": [
                {"asset_id": stock_a["id"], "target_percent": 60},
                {"asset_id": stock_b["id"], "target_percent": 40},
            ],
        },
    )
    assert response.status_code == 200
    by_id = {row["asset_id"]: row for row in response.json()}
    assert by_id[stock_a["id"]]["score_refs"]["target_percent"] == "60"
    assert by_id[stock_b["id"]]["score_refs"]["target_percent"] == "40"
