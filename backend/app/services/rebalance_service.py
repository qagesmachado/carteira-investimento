from sqlmodel import Session

from app.models.asset import Asset, AssetType, DisplayClass
from app.models.portfolio import Portfolio
from app.models.position import Position
from app.schemas.rebalance import (
    AssetRebalanceRowRead,
    ClassRebalanceRowRead,
    REBALANCE_CLASS_KEYS,
    RebalanceSnapshotRead,
    StocksSubTypeRebalanceRowRead,
)
from app.services.analysis_defaults import PROFILE_CRYPTO, PROFILE_ETF_INTL, PROFILE_FII_BR, PROFILE_STOCK_BR
from app.services.analysis_engine import compute_table_sum_score
from app.services.analysis_service import (
    build_asset_analysis_read,
    get_profile_table_display,
    parse_target_percent_from_refs,
)
from app.services.asset_service import get_asset_by_id, infer_display_class
from app.services.fx_service import get_usd_brl_state
from app.services.objective_investment import (
    compute_excluded_rebalance_by_asset,
    compute_rebalance_value_brl,
)
from app.services.portfolio_service import get_portfolio, list_positions
from app.services.position_metrics import position_current_value, value_in_brl
from app.services.rebalance_engine import (
    compute_class_rows,
    compute_crypto_asset_rows,
    compute_fund_asset_rows,
    compute_international_asset_rows,
    compute_stock_asset_rows,
    compute_stocks_sub_rows,
    parse_allocation_targets,
)

_REBALANCE_CLASSES = frozenset(REBALANCE_CLASS_KEYS)


def _position_value_brl(
    position: Position,
    asset: Asset,
    usd_brl_rate: float | None,
) -> float | None:
    current = position_current_value(position, asset)
    return value_in_brl(current, asset.currency, usd_brl_rate)


def build_rebalance_snapshot(
    assets_session: Session,
    portfolios_session: Session,
    portfolio_id: int,
) -> RebalanceSnapshotRead:
    portfolio = get_portfolio(portfolios_session, portfolio_id)
    targets = parse_allocation_targets(portfolio.allocation_targets_json)
    usd_brl_rate, _ = get_usd_brl_state(portfolios_session)
    positions = list_positions(portfolios_session, portfolio_id)
    excluded_by_asset = compute_excluded_rebalance_by_asset(
        portfolios_session,
        portfolio_id,
        usd_brl_rate=usd_brl_rate,
    )

    current_by_class: dict[str, float] = {}
    current_by_sub: dict[str, float] = {"etf": 0.0, "stock": 0.0}
    patrimony_brl = 0.0
    stock_assets_input: list[dict] = []
    international_assets_input: list[dict] = []
    fund_assets_input: list[dict] = []
    crypto_assets_input: list[dict] = []

    table_display = get_profile_table_display(assets_session, PROFILE_STOCK_BR)
    sum_settings = table_display.sum_column
    fii_table_display = get_profile_table_display(assets_session, PROFILE_FII_BR)
    fii_sum_settings = fii_table_display.sum_column

    for position in positions:
        asset = get_asset_by_id(assets_session, position.asset_id)
        if asset is None:
            continue
        brl = _position_value_brl(position, asset, usd_brl_rate)
        if brl is None:
            continue
        brl = compute_rebalance_value_brl(
            position,
            asset,
            usd_brl_rate=usd_brl_rate,
            excluded_brl=excluded_by_asset.get(position.asset_id, 0.0),
        )
        if brl is None or brl <= 1e-9:
            continue
        display_class = infer_display_class(
            asset.asset_type, asset.market, asset.etf_subtype
        ).value
        if display_class not in _REBALANCE_CLASSES:
            continue
        patrimony_brl += brl
        current_by_class[display_class] = current_by_class.get(display_class, 0.0) + brl

        if display_class == DisplayClass.STOCKS.value:
            if asset.asset_type == AssetType.ETF:
                current_by_sub["etf"] += brl
            elif asset.asset_type == AssetType.STOCK:
                current_by_sub["stock"] += brl

            scores, score_refs, summary, _, _ = build_asset_analysis_read(
                assets_session, asset, PROFILE_STOCK_BR
            )
            sum_score = compute_table_sum_score(
                scores, summary, sum_settings, PROFILE_STOCK_BR
            )
            stock_assets_input.append(
                {
                    "asset_id": asset.id,
                    "symbol": asset.symbol,
                    "name": asset.name,
                    "asset_type": asset.asset_type.value,
                    "current_brl": brl,
                    "sum_score": sum_score,
                }
            )
        elif display_class == DisplayClass.INTERNATIONAL.value:
            scores, score_refs, _, _, _ = build_asset_analysis_read(
                assets_session, asset, PROFILE_ETF_INTL
            )
            target_percent = parse_target_percent_from_refs(score_refs)
            international_assets_input.append(
                {
                    "asset_id": asset.id,
                    "symbol": asset.symbol,
                    "name": asset.name,
                    "asset_type": asset.asset_type.value,
                    "current_brl": brl,
                    "target_percent": target_percent,
                }
            )
        elif display_class == DisplayClass.FUNDS.value:
            scores, score_refs, summary, _, _ = build_asset_analysis_read(
                assets_session, asset, PROFILE_FII_BR
            )
            sum_score = compute_table_sum_score(
                scores, summary, fii_sum_settings, PROFILE_FII_BR
            )
            fund_assets_input.append(
                {
                    "asset_id": asset.id,
                    "symbol": asset.symbol,
                    "name": asset.name,
                    "asset_type": asset.asset_type.value,
                    "current_brl": brl,
                    "sum_score": sum_score,
                }
            )
        elif display_class == DisplayClass.CRYPTO.value:
            scores, score_refs, _, _, _ = build_asset_analysis_read(
                assets_session, asset, PROFILE_CRYPTO
            )
            target_percent = parse_target_percent_from_refs(score_refs)
            crypto_assets_input.append(
                {
                    "asset_id": asset.id,
                    "symbol": asset.symbol,
                    "name": asset.name,
                    "asset_type": asset.asset_type.value,
                    "current_brl": brl,
                    "target_percent": target_percent,
                }
            )

    class_rows = compute_class_rows(patrimony_brl, current_by_class, targets)
    stocks_current = current_by_class.get(DisplayClass.STOCKS.value, 0.0)
    sub_rows = compute_stocks_sub_rows(
        patrimony_brl, stocks_current, current_by_sub, targets
    )
    asset_rows = compute_stock_asset_rows(patrimony_brl, stock_assets_input, targets)
    international_rows = compute_international_asset_rows(
        patrimony_brl, international_assets_input, targets
    )
    fund_rows = compute_fund_asset_rows(patrimony_brl, fund_assets_input, targets)
    crypto_rows = compute_crypto_asset_rows(patrimony_brl, crypto_assets_input, targets)
    total_gap = sum(r.gap_brl for r in class_rows)
    without_score = sum(1 for r in asset_rows if not r.score_included)
    fund_without_score = sum(1 for r in fund_rows if not r.score_included)
    crypto_without_allocation = sum(1 for r in crypto_rows if not r.score_included)

    return RebalanceSnapshotRead(
        portfolio_id=portfolio_id,
        patrimony_brl=round(patrimony_brl, 2),
        usd_brl_rate=usd_brl_rate,
        classes=[
            ClassRebalanceRowRead(
                display_class=r.display_class,
                label=r.label,
                current_value_brl=r.current_value_brl,
                current_percent=r.current_percent,
                target_percent=r.target_percent,
                target_value_brl=r.target_value_brl,
                gap_brl=r.gap_brl,
            )
            for r in class_rows
        ],
        stocks_sub_types=[
            StocksSubTypeRebalanceRowRead(
                sub_type=r.sub_type,
                label=r.label,
                current_value_brl=r.current_value_brl,
                current_percent_of_stocks=r.current_percent_of_stocks,
                target_percent_of_stocks=r.target_percent_of_stocks,
                target_value_brl=r.target_value_brl,
                gap_brl=r.gap_brl,
            )
            for r in sub_rows
        ],
        stock_assets=[
            AssetRebalanceRowRead(
                asset_id=r.asset_id,
                symbol=r.symbol,
                name=r.name,
                asset_type=r.asset_type,
                current_value_brl=r.current_value_brl,
                current_percent=r.current_percent,
                target_percent=r.target_percent,
                target_value_brl=r.target_value_brl,
                gap_brl=r.gap_brl,
                sum_score=r.sum_score,
                score_included=r.score_included,
            )
            for r in asset_rows
        ],
        international_assets=[
            AssetRebalanceRowRead(
                asset_id=r.asset_id,
                symbol=r.symbol,
                name=r.name,
                asset_type=r.asset_type,
                current_value_brl=r.current_value_brl,
                current_percent=r.current_percent,
                target_percent=r.target_percent,
                target_value_brl=r.target_value_brl,
                gap_brl=r.gap_brl,
                sum_score=r.sum_score,
                score_included=r.score_included,
            )
            for r in international_rows
        ],
        fund_assets=[
            AssetRebalanceRowRead(
                asset_id=r.asset_id,
                symbol=r.symbol,
                name=r.name,
                asset_type=r.asset_type,
                current_value_brl=r.current_value_brl,
                current_percent=r.current_percent,
                target_percent=r.target_percent,
                target_value_brl=r.target_value_brl,
                gap_brl=r.gap_brl,
                sum_score=r.sum_score,
                score_included=r.score_included,
            )
            for r in fund_rows
        ],
        crypto_assets=[
            AssetRebalanceRowRead(
                asset_id=r.asset_id,
                symbol=r.symbol,
                name=r.name,
                asset_type=r.asset_type,
                current_value_brl=r.current_value_brl,
                current_percent=r.current_percent,
                target_percent=r.target_percent,
                target_value_brl=r.target_value_brl,
                gap_brl=r.gap_brl,
                sum_score=r.sum_score,
                score_included=r.score_included,
            )
            for r in crypto_rows
        ],
        total_gap_brl=round(total_gap, 2),
        assets_without_score_count=without_score,
        fund_assets_without_score_count=fund_without_score,
        crypto_assets_without_allocation_count=crypto_without_allocation,
    )
