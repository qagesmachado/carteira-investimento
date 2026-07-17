import json
from dataclasses import dataclass

from pydantic import ValidationError

from app.schemas.rebalance import (
    DEFAULT_CLASS_TARGETS,
    DEFAULT_STOCKS_SPLIT,
    AllocationTargets,
    ClassTargets,
    REBALANCE_CLASS_KEYS,
    StocksSplitTargets,
)

REBALANCE_CLASS_LABELS: dict[str, str] = {
    "stocks": "Ações/ETF BR",
    "funds": "Fundos",
    "international": "Internacional",
    "fixed_income": "Renda fixa",
    "crypto": "Criptomoeda",
}

STOCKS_SUB_TYPE_LABELS: dict[str, str] = {
    "etf": "ETF",
    "stock": "Ação",
}


@dataclass(frozen=True)
class ClassRebalanceRow:
    display_class: str
    label: str
    current_value_brl: float
    current_percent: float
    target_percent: float
    target_value_brl: float
    gap_brl: float


@dataclass(frozen=True)
class StocksSubTypeRebalanceRow:
    sub_type: str
    label: str
    current_value_brl: float
    current_percent_of_stocks: float
    target_percent_of_stocks: float
    target_value_brl: float
    gap_brl: float


@dataclass(frozen=True)
class AssetRebalanceRow:
    asset_id: int
    symbol: str
    name: str
    asset_type: str
    current_value_brl: float | None
    current_percent: float | None
    target_percent: float | None
    target_value_brl: float | None
    gap_brl: float | None
    sum_score: float | None
    score_included: bool


def _default_targets() -> AllocationTargets:
    return AllocationTargets(
        classes=ClassTargets(**DEFAULT_CLASS_TARGETS),
        stocks_split=StocksSplitTargets(**DEFAULT_STOCKS_SPLIT),
    )


def parse_allocation_targets(raw: str | None) -> AllocationTargets:
    if raw is None or not raw.strip():
        return _default_targets()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("allocation_targets_json must be valid JSON") from exc
    try:
        targets = AllocationTargets.model_validate(data)
    except ValidationError as exc:
        raise ValueError(f"invalid allocation targets: {exc}") from exc
    targets.validate_sums()
    return targets


def validate_allocation_targets_json(raw: str) -> AllocationTargets:
    return parse_allocation_targets(raw)


def serialize_allocation_targets(targets: AllocationTargets) -> str:
    targets.validate_sums()
    return json.dumps(targets.model_dump(), ensure_ascii=False)


def compute_class_rows(
    patrimony_brl: float,
    current_by_class: dict[str, float],
    targets: AllocationTargets,
) -> list[ClassRebalanceRow]:
    rows: list[ClassRebalanceRow] = []
    for key in REBALANCE_CLASS_KEYS:
        target_pct = getattr(targets.classes, key)
        current = current_by_class.get(key, 0.0)
        target_value = patrimony_brl * target_pct / 100.0 if patrimony_brl > 0 else 0.0
        current_pct = (current / patrimony_brl * 100.0) if patrimony_brl > 0 else 0.0
        gap = max(0.0, target_value - current)
        rows.append(
            ClassRebalanceRow(
                display_class=key,
                label=REBALANCE_CLASS_LABELS[key],
                current_value_brl=round(current, 2),
                current_percent=round(current_pct, 4),
                target_percent=target_pct,
                target_value_brl=round(target_value, 2),
                gap_brl=round(gap, 2),
            )
        )
    return rows


def compute_stocks_sub_rows(
    patrimony_brl: float,
    stocks_current_brl: float,
    current_by_sub_type: dict[str, float],
    targets: AllocationTargets,
) -> list[StocksSubTypeRebalanceRow]:
    if targets.stocks_split_mode != "by_subtype":
        return []
    class_target_pct = targets.classes.stocks
    stocks_pool = patrimony_brl * class_target_pct / 100.0 if patrimony_brl > 0 else 0.0
    rows: list[StocksSubTypeRebalanceRow] = []
    for sub_type in ("etf", "stock"):
        sub_pct = getattr(targets.stocks_split, sub_type)
        current = current_by_sub_type.get(sub_type, 0.0)
        target_value = stocks_pool * sub_pct / 100.0
        current_pct_of_stocks = (
            (current / stocks_current_brl * 100.0) if stocks_current_brl > 0 else 0.0
        )
        gap = max(0.0, target_value - current)
        rows.append(
            StocksSubTypeRebalanceRow(
                sub_type=sub_type,
                label=STOCKS_SUB_TYPE_LABELS[sub_type],
                current_value_brl=round(current, 2),
                current_percent_of_stocks=round(current_pct_of_stocks, 4),
                target_percent_of_stocks=sub_pct,
                target_value_brl=round(target_value, 2),
                gap_brl=round(gap, 2),
            )
        )
    return rows


def _stock_sub_type(asset_type: str) -> str | None:
    if asset_type == "stock":
        return "stock"
    if asset_type == "etf":
        return "etf"
    return None


def _asset_is_pending(asset: dict) -> bool:
    return bool(asset.get("is_pending"))


def _non_pending_assets(assets: list[dict]) -> list[dict]:
    return [asset for asset in assets if not _asset_is_pending(asset)]


def compute_stock_asset_rows(
    patrimony_brl: float,
    assets: list[dict],
    targets: AllocationTargets,
) -> list[AssetRebalanceRow]:
    if targets.stocks_split_mode == "unified":
        return _compute_stock_asset_rows_unified(patrimony_brl, assets, targets)
    return _compute_stock_asset_rows_by_subtype(patrimony_brl, assets, targets)


def _compute_stock_asset_rows_unified(
    patrimony_brl: float,
    assets: list[dict],
    targets: AllocationTargets,
) -> list[AssetRebalanceRow]:
    """Distribui a meta de Ações/ETF BR entre todos os ativos pela coluna Soma."""
    class_target_pct = targets.classes.stocks
    active_assets = _non_pending_assets(assets)
    score_sum = sum(
        float(asset["sum_score"])
        for asset in active_assets
        if _stock_sub_type(asset["asset_type"]) is not None
        and asset.get("sum_score") is not None
        and float(asset["sum_score"]) > 0
    )
    group_current_total = sum(float(asset["current_brl"]) for asset in active_assets)

    rows: list[AssetRebalanceRow] = []
    for asset in assets:
        sub = _stock_sub_type(asset["asset_type"])
        if sub is None:
            continue
        current = float(asset["current_brl"])
        current_pct = (
            (current / group_current_total * 100.0) if group_current_total > 0 else 0.0
        )
        score = asset.get("sum_score")
        score_val = float(score) if score is not None else None

        target_pct: float | None = None
        target_value: float | None = None
        gap: float | None = None
        included = False

        if not _asset_is_pending(asset) and score_val is not None and score_val > 0 and score_sum > 0:
            included = True
            weight = score_val / score_sum
            target_pct = weight * 100.0
            portfolio_target_pct = weight * class_target_pct
            target_value = patrimony_brl * portfolio_target_pct / 100.0 if patrimony_brl > 0 else 0.0
            gap = max(0.0, target_value - current)

        rows.append(
            AssetRebalanceRow(
                asset_id=int(asset["asset_id"]),
                symbol=str(asset["symbol"]),
                name=str(asset["name"]),
                asset_type=str(asset["asset_type"]),
                current_value_brl=round(current, 2),
                current_percent=round(current_pct, 4),
                target_percent=round(target_pct, 4) if target_pct is not None else None,
                target_value_brl=round(target_value, 2) if target_value is not None else None,
                gap_brl=round(gap, 2) if gap is not None else None,
                sum_score=score_val,
                score_included=included,
            )
        )

    rows.sort(key=lambda r: (r.asset_type, r.symbol))
    return rows


def _compute_stock_asset_rows_by_subtype(
    patrimony_brl: float,
    assets: list[dict],
    targets: AllocationTargets,
) -> list[AssetRebalanceRow]:
    class_target_pct = targets.classes.stocks
    scores_by_sub: dict[str, list[tuple[dict, float]]] = {"etf": [], "stock": []}

    for asset in _non_pending_assets(assets):
        sub = _stock_sub_type(asset["asset_type"])
        if sub is None:
            continue
        score = asset.get("sum_score")
        if score is not None and score > 0:
            scores_by_sub[sub].append((asset, float(score)))

    active_assets = _non_pending_assets(assets)
    group_current_total = sum(float(asset["current_brl"]) for asset in active_assets)

    rows: list[AssetRebalanceRow] = []
    for asset in assets:
        sub = _stock_sub_type(asset["asset_type"])
        if sub is None:
            continue
        current = float(asset["current_brl"])
        current_pct = (
            (current / group_current_total * 100.0) if group_current_total > 0 else 0.0
        )
        score = asset.get("sum_score")
        score_val = float(score) if score is not None else None
        sub_pct = getattr(targets.stocks_split, sub)
        scored = scores_by_sub[sub]
        score_sum = sum(s for _, s in scored)

        target_pct: float | None = None
        target_value: float | None = None
        gap: float | None = None
        included = False

        if not _asset_is_pending(asset) and score_val is not None and score_val > 0 and score_sum > 0:
            included = True
            weight = score_val / score_sum
            pct_of_stocks_class = weight * sub_pct
            target_pct = pct_of_stocks_class
            portfolio_target_pct = pct_of_stocks_class * class_target_pct / 100.0
            target_value = patrimony_brl * portfolio_target_pct / 100.0 if patrimony_brl > 0 else 0.0
            gap = max(0.0, target_value - current)

        rows.append(
            AssetRebalanceRow(
                asset_id=int(asset["asset_id"]),
                symbol=str(asset["symbol"]),
                name=str(asset["name"]),
                asset_type=str(asset["asset_type"]),
                current_value_brl=round(current, 2),
                current_percent=round(current_pct, 4),
                target_percent=round(target_pct, 4) if target_pct is not None else None,
                target_value_brl=round(target_value, 2) if target_value is not None else None,
                gap_brl=round(gap, 2) if gap is not None else None,
                sum_score=score_val,
                score_included=included,
            )
        )

    rows.sort(key=lambda r: (r.asset_type, r.symbol))
    return rows


def compute_fund_asset_rows(
    patrimony_brl: float,
    assets: list[dict],
    targets: AllocationTargets,
) -> list[AssetRebalanceRow]:
    """Distribui % desejada entre FIIs proporcional à coluna Soma (fii_br)."""
    return _compute_asset_rows_by_soma(patrimony_brl, assets, targets.classes.funds)


def compute_fund_asset_rows_by_allocation(
    patrimony_brl: float,
    assets: list[dict],
    targets: AllocationTargets,
) -> list[AssetRebalanceRow]:
    """Distribui % desejada entre FIIs via alocação manual (metodologia Simples)."""
    return compute_asset_rows_by_target_allocation(
        patrimony_brl, assets, targets.classes.funds
    )


def compute_stock_asset_rows_by_allocation(
    patrimony_brl: float,
    assets: list[dict],
    targets: AllocationTargets,
) -> list[AssetRebalanceRow]:
    """Distribui % desejada entre ações/ETF BR via alocação manual (metodologia Simples)."""
    return compute_asset_rows_by_target_allocation(
        patrimony_brl, assets, targets.classes.stocks
    )


def compute_asset_rows_by_target_allocation(
    patrimony_brl: float,
    assets: list[dict],
    class_target_pct: float,
) -> list[AssetRebalanceRow]:
    active_assets = _non_pending_assets(assets)
    group_current_total = sum(float(asset["current_brl"]) for asset in active_assets)

    rows: list[AssetRebalanceRow] = []
    for asset in assets:
        current = float(asset["current_brl"])
        current_pct = (
            (current / group_current_total * 100.0) if group_current_total > 0 else 0.0
        )
        target_pct_group = asset.get("target_percent")
        target_pct_val = (
            float(target_pct_group) if target_pct_group is not None else None
        )

        target_pct: float | None = None
        target_value: float | None = None
        gap: float | None = None
        included = False

        if not _asset_is_pending(asset) and target_pct_val is not None and target_pct_val > 0:
            included = True
            target_pct = target_pct_val
            portfolio_target_pct = target_pct * class_target_pct / 100.0
            target_value = (
                patrimony_brl * portfolio_target_pct / 100.0 if patrimony_brl > 0 else 0.0
            )
            gap = max(0.0, target_value - current)

        rows.append(
            AssetRebalanceRow(
                asset_id=int(asset["asset_id"]),
                symbol=str(asset["symbol"]),
                name=str(asset["name"]),
                asset_type=str(asset["asset_type"]),
                current_value_brl=round(current, 2),
                current_percent=round(current_pct, 4),
                target_percent=round(target_pct, 4) if target_pct is not None else None,
                target_value_brl=round(target_value, 2) if target_value is not None else None,
                gap_brl=round(gap, 2) if gap is not None else None,
                sum_score=target_pct_val,
                score_included=included,
            )
        )

    rows.sort(key=lambda r: (r.asset_type, r.symbol))
    return rows


def _compute_asset_rows_by_soma(
    patrimony_brl: float,
    assets: list[dict],
    class_target_pct: float,
) -> list[AssetRebalanceRow]:
    active_assets = _non_pending_assets(assets)
    score_sum = sum(
        float(asset["sum_score"])
        for asset in active_assets
        if asset.get("sum_score") is not None and float(asset["sum_score"]) > 0
    )
    group_current_total = sum(float(asset["current_brl"]) for asset in active_assets)

    rows: list[AssetRebalanceRow] = []
    for asset in assets:
        current = float(asset["current_brl"])
        current_pct = (
            (current / group_current_total * 100.0) if group_current_total > 0 else 0.0
        )
        score = asset.get("sum_score")
        score_val = float(score) if score is not None else None

        target_pct: float | None = None
        target_value: float | None = None
        gap: float | None = None
        included = False

        if not _asset_is_pending(asset) and score_val is not None and score_val > 0 and score_sum > 0:
            included = True
            weight = score_val / score_sum
            target_pct = weight * 100.0
            portfolio_target_pct = weight * class_target_pct
            target_value = patrimony_brl * portfolio_target_pct / 100.0 if patrimony_brl > 0 else 0.0
            gap = max(0.0, target_value - current)

        rows.append(
            AssetRebalanceRow(
                asset_id=int(asset["asset_id"]),
                symbol=str(asset["symbol"]),
                name=str(asset["name"]),
                asset_type=str(asset["asset_type"]),
                current_value_brl=round(current, 2),
                current_percent=round(current_pct, 4),
                target_percent=round(target_pct, 4) if target_pct is not None else None,
                target_value_brl=round(target_value, 2) if target_value is not None else None,
                gap_brl=round(gap, 2) if gap is not None else None,
                sum_score=score_val,
                score_included=included,
            )
        )

    rows.sort(key=lambda r: r.symbol)
    return rows


def compute_international_asset_rows(
    patrimony_brl: float,
    assets: list[dict],
    targets: AllocationTargets,
) -> list[AssetRebalanceRow]:
    """Distribui % desejada entre ETFs internacionais via alocação manual (etf_intl)."""
    class_target_pct = targets.classes.international
    active_assets = _non_pending_assets(assets)
    group_current_total = sum(float(asset["current_brl"]) for asset in active_assets)

    rows: list[AssetRebalanceRow] = []
    for asset in assets:
        current = float(asset["current_brl"])
        current_pct = (
            (current / group_current_total * 100.0) if group_current_total > 0 else 0.0
        )
        target_pct_group = asset.get("target_percent")
        target_pct_val = (
            float(target_pct_group) if target_pct_group is not None else None
        )

        target_pct: float | None = None
        target_value: float | None = None
        gap: float | None = None
        included = False

        if not _asset_is_pending(asset) and target_pct_val is not None and target_pct_val > 0:
            included = True
            target_pct = target_pct_val
            portfolio_target_pct = target_pct * class_target_pct / 100.0
            target_value = (
                patrimony_brl * portfolio_target_pct / 100.0 if patrimony_brl > 0 else 0.0
            )
            gap = max(0.0, target_value - current)

        rows.append(
            AssetRebalanceRow(
                asset_id=int(asset["asset_id"]),
                symbol=str(asset["symbol"]),
                name=str(asset["name"]),
                asset_type=str(asset["asset_type"]),
                current_value_brl=round(current, 2),
                current_percent=round(current_pct, 4),
                target_percent=round(target_pct, 4) if target_pct is not None else None,
                target_value_brl=round(target_value, 2) if target_value is not None else None,
                gap_brl=round(gap, 2) if gap is not None else None,
                sum_score=target_pct_val,
                score_included=included,
            )
        )

    rows.sort(key=lambda r: r.symbol)
    return rows


def compute_crypto_asset_rows(
    patrimony_brl: float,
    assets: list[dict],
    targets: AllocationTargets,
) -> list[AssetRebalanceRow]:
    """Distribui % desejada entre ativos da estratégia cripto via alocação manual."""
    class_target_pct = targets.classes.crypto
    active_assets = _non_pending_assets(assets)
    group_current_total = sum(
        float(asset["current_brl"])
        for asset in active_assets
        if asset.get("current_brl") is not None
    )

    rows: list[AssetRebalanceRow] = []
    for asset in assets:
        current_raw = asset.get("current_brl")
        if current_raw is None:
            current: float | None = None
            current_pct: float | None = None
        else:
            current = float(current_raw)
            current_pct = (
                (current / group_current_total * 100.0) if group_current_total > 0 else 0.0
            )
        target_pct_group = asset.get("target_percent")
        target_pct_val = (
            float(target_pct_group) if target_pct_group is not None else None
        )

        target_pct: float | None = None
        target_value: float | None = None
        gap: float | None = None
        included = False

        if not _asset_is_pending(asset) and target_pct_val is not None and target_pct_val > 0:
            included = True
            target_pct = target_pct_val
            portfolio_target_pct = target_pct * class_target_pct / 100.0
            target_value = (
                patrimony_brl * portfolio_target_pct / 100.0 if patrimony_brl > 0 else 0.0
            )
            effective_current = current if current is not None else 0.0
            gap = max(0.0, target_value - effective_current)

        rows.append(
            AssetRebalanceRow(
                asset_id=int(asset["asset_id"]),
                symbol=str(asset["symbol"]),
                name=str(asset["name"]),
                asset_type=str(asset["asset_type"]),
                current_value_brl=round(current, 2) if current is not None else None,
                current_percent=round(current_pct, 4) if current_pct is not None else None,
                target_percent=round(target_pct, 4) if target_pct is not None else None,
                target_value_brl=round(target_value, 2) if target_value is not None else None,
                gap_brl=round(gap, 2) if gap is not None else None,
                sum_score=target_pct_val,
                score_included=included,
            )
        )

    rows.sort(key=lambda r: r.symbol)
    return rows


def compute_position_asset_rows(
    patrimony_brl: float,
    assets: list[dict],
) -> list[AssetRebalanceRow]:
    """Posições da classe sem motor de score (% desejada pendente de análise)."""
    group_current_total = sum(float(asset["current_brl"]) for asset in assets)
    rows: list[AssetRebalanceRow] = []
    for asset in assets:
        current = float(asset["current_brl"])
        current_pct = (
            (current / group_current_total * 100.0) if group_current_total > 0 else 0.0
        )
        rows.append(
            AssetRebalanceRow(
                asset_id=int(asset["asset_id"]),
                symbol=str(asset["symbol"]),
                name=str(asset["name"]),
                asset_type=str(asset["asset_type"]),
                current_value_brl=round(current, 2),
                current_percent=round(current_pct, 4),
                target_percent=None,
                target_value_brl=None,
                gap_brl=None,
                sum_score=None,
                score_included=False,
            )
        )
    rows.sort(key=lambda r: r.symbol)
    return rows
