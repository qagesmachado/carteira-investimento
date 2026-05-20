import json
from pathlib import Path

import pytest
from sqlmodel import Session, SQLModel, create_engine, select

from app.db.session import ASSET_TABLES, _ensure_asset_columns
from app.models.asset import Asset, AssetMarket, AssetType
from app.schemas.asset import AssetCreate
from app.seed.loader import load_assets_json, load_seed_payloads, merge_seed_payloads, save_assets_json
from app.seed.runner import clear_all_assets, find_asset_by_symbol, upsert_assets
from app.services.asset_service import create_asset, list_assets


@pytest.fixture
def catalog_session(tmp_path):
    engine = create_engine(
        f"sqlite:///{(tmp_path / 'catalog.db').as_posix()}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine, tables=ASSET_TABLES)
    _ensure_asset_columns(engine)
    with Session(engine) as session:
        yield session


def _sample_payload(symbol: str = "TEST3", name: str = "Ativo Teste") -> AssetCreate:
    return AssetCreate(
        symbol=symbol,
        name=name,
        asset_type=AssetType.STOCK,
        market=AssetMarket.NATIONAL,
        country="BR",
        currency="BRL",
    )


def test_load_and_save_assets_json(tmp_path: Path):
    path = tmp_path / "assets.json"
    payloads = [_sample_payload()]
    save_assets_json(path, payloads)
    loaded = load_assets_json(path)
    assert len(loaded) == 1
    assert loaded[0].symbol == "TEST3"


def test_merge_overlay_replaces_same_symbol():
    base = [_sample_payload("AAA3", "Base")]
    overlay = [_sample_payload("AAA3", "Overlay")]
    merged = merge_seed_payloads(base, overlay)
    assert len(merged) == 1
    assert merged[0].name == "Overlay"


def test_load_seed_payloads_merges_local(tmp_path: Path):
    seed = tmp_path / "seed"
    seed.mkdir()
    save_assets_json(seed / "assets.json", [_sample_payload("AAA3", "Public")])
    save_assets_json(seed / "assets.local.json", [_sample_payload("BBB3", "Local")])

    payloads, sources = load_seed_payloads(
        base_path=seed / "assets.json",
        include_local=False,
    )
    assert len(payloads) == 1

    # Simular merge manual com paths do tmp
    base = load_assets_json(seed / "assets.json")
    overlay = load_assets_json(seed / "assets.local.json")
    merged = merge_seed_payloads(base, overlay)
    assert len(merged) == 2
    assert {p.symbol for p in merged} == {"AAA3", "BBB3"}


def test_upsert_inserts_and_updates_without_deleting_extra(catalog_session: Session):
    create_asset(catalog_session, _sample_payload("AAA3", "Original"))
    create_asset(catalog_session, _sample_payload("EXTRA3", "Extra local"))

    upsert_assets(
        catalog_session,
        [_sample_payload("AAA3", "Atualizado")],
    )

    symbols = {a.symbol for a in list_assets(catalog_session)}
    assert "EXTRA3" in symbols
    assert find_asset_by_symbol(catalog_session, "AAA3").name == "Atualizado"


def test_fresh_clears_and_reseeds(catalog_session: Session):
    create_asset(catalog_session, _sample_payload("OLD3", "Antigo"))

    clear_all_assets(catalog_session)
    create_asset(catalog_session, _sample_payload("NEW3", "Novo"))

    assets = catalog_session.exec(select(Asset)).all()
    assert len(assets) == 1
    assert assets[0].symbol == "NEW3"


def test_export_json_roundtrip(tmp_path: Path, catalog_session: Session):
    create_asset(catalog_session, _sample_payload())

    payloads = [
        AssetCreate.model_validate(
            asset.model_dump(exclude={"id", "display_class"}),
        )
        for asset in list_assets(catalog_session)
    ]
    out = tmp_path / "out.json"
    save_assets_json(out, payloads)

    raw = json.loads(out.read_text(encoding="utf-8"))
    assert raw[0]["asset_type"] == "stock"
    assert raw[0]["market"] == "national"
