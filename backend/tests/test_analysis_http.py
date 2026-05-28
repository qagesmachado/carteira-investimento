from fastapi.testclient import TestClient


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
    assert body["table_display"]["sum_column"]["enabled"] is True
    assert body["table_display"]["sum_column"]["diagram_multiplier"] == 2.0
    assert body["table_display"]["sum_column"]["viabilidade_weights"]["atencao"] == -5


def test_put_table_display_persists(client: TestClient) -> None:
    config = client.get("/analysis/profiles/stock-br/config").json()
    config["table_display"]["sum_column"]["label"] = "Total"
    config["table_display"]["sum_column"]["diagram_multiplier"] = 3
    config["table_display"]["sum_column"]["viabilidade_weights"]["viavel"] = 4
    put = client.put(
        "/analysis/profiles/stock-br/config",
        json={
            "criteria": config["criteria"],
            "rules": config["rules"],
            "table_display": config["table_display"],
        },
    )
    assert put.status_code == 200
    assert put.json()["table_display"]["sum_column"]["label"] == "Total"
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
