import json
from pathlib import Path

from app.schemas.asset import AssetCreate
from app.services.asset_service import normalize_symbol


def seed_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "seed"


def default_seed_path() -> Path:
    return seed_dir() / "assets.json"


def default_local_seed_path() -> Path:
    return seed_dir() / "assets.local.json"


def load_assets_json(path: Path) -> list[AssetCreate]:
    if not path.is_file():
        return []
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError(f"{path.name} deve ser um array de ativos")
    return [AssetCreate.model_validate(item) for item in raw]


def merge_seed_payloads(
    base: list[AssetCreate],
    overlay: list[AssetCreate],
) -> list[AssetCreate]:
    """Overlay substitui itens com o mesmo symbol (normalizado); ordem: base depois overlay."""
    merged: dict[str, AssetCreate] = {}
    for payload in base:
        merged[normalize_symbol(payload.symbol)] = payload
    for payload in overlay:
        merged[normalize_symbol(payload.symbol)] = payload
    return sorted(merged.values(), key=lambda p: normalize_symbol(p.symbol))


def load_seed_payloads(
    *,
    base_path: Path | None = None,
    include_local: bool = True,
) -> tuple[list[AssetCreate], list[Path]]:
    base_file = base_path or default_seed_path()
    sources = [base_file]
    base = load_assets_json(base_file)

    local_file = default_local_seed_path()
    overlay: list[AssetCreate] = []
    if include_local and base_path is None and local_file.is_file():
        overlay = load_assets_json(local_file)
        sources.append(local_file)

    return merge_seed_payloads(base, overlay), sources


def save_assets_json(path: Path, payloads: list[AssetCreate]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = [payload.model_dump(mode="json") for payload in payloads]
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
