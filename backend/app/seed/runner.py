from dataclasses import dataclass
from pathlib import Path

from sqlmodel import Session, select

from app.db.session import assets_engine, init_db
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate
from app.seed.loader import load_seed_payloads, save_assets_json
from app.services.asset_service import (
    _symbol_keys,
    create_asset,
    list_assets,
    normalize_symbol,
    update_asset,
)


@dataclass
class SeedStats:
    created: int = 0
    updated: int = 0
    skipped: int = 0


def find_asset_by_symbol(session: Session, symbol: str) -> Asset | None:
    keys = _symbol_keys(symbol)
    for asset in session.exec(select(Asset)).all():
        if _symbol_keys(asset.symbol) & keys:
            return asset
    return None


def clear_all_assets(session: Session) -> None:
    for asset in session.exec(select(Asset)).all():
        session.delete(asset)
    session.commit()


def upsert_assets(session: Session, payloads: list[AssetCreate]) -> SeedStats:
    stats = SeedStats()
    for payload in payloads:
        existing = find_asset_by_symbol(session, payload.symbol)
        if existing is None:
            create_asset(session, payload)
            stats.created += 1
        else:
            update_asset(
                session,
                existing.id,
                AssetUpdate(**payload.model_dump()),
            )
            stats.updated += 1
    return stats


def seed_assets(
    *,
    base_path: Path | None = None,
    fresh: bool = False,
    include_local: bool = True,
) -> tuple[SeedStats, list[Path]]:
    init_db()
    payloads, sources = load_seed_payloads(base_path=base_path, include_local=include_local)

    with Session(assets_engine) as session:
        if fresh:
            clear_all_assets(session)
            stats = SeedStats()
            for payload in payloads:
                create_asset(session, payload)
                stats.created += 1
            return stats, sources
        return upsert_assets(session, payloads), sources


def seed_assets_file(path: Path, *, fresh: bool = False) -> SeedStats:
    stats, _ = seed_assets(base_path=path, fresh=fresh, include_local=False)
    return stats


def export_assets_file(path: Path) -> int:
    init_db()
    with Session(assets_engine) as session:
        assets = list_assets(session)

    payloads = [
        AssetCreate.model_validate(
            asset.model_dump(exclude={"id", "display_class"}),
        )
        for asset in assets
    ]
    payloads.sort(key=lambda p: normalize_symbol(p.symbol))
    save_assets_json(path, payloads)
    return len(payloads)
