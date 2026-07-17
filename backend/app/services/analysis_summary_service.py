from sqlmodel import Session

from app.models.asset import DisplayClass
from app.schemas.analysis import (
    AnalysisPortfolioPendingRead,
    AnalysisPortfolioSummaryRead,
    AnalysisProfileSummaryRead,
    PendingAssetRead,
    PendingAssetsGroupRead,
)
from app.services.analysis_defaults import (
    METHODOLOGY_SIMPLES,
    PROFILE_CRYPTO,
    PROFILE_ETF_INTL,
    PROFILE_FII_BR,
    PROFILE_STOCK_BR,
)
from app.services.analysis_engine import compute_table_sum_score
from app.services.analysis_methodology_service import get_portfolio_methodology
from app.services.analysis_pending_service import get_pending_asset_ids
from app.services.analysis_service import (
    build_asset_analysis_read,
    get_profile_table_display,
    parse_target_percent_from_refs,
)
from app.services.asset_service import get_asset_by_id, infer_display_class
from app.services.portfolio_service import get_portfolio, list_positions

_ANALYSIS_PROFILE_BY_CLASS: dict[str, str] = {
    DisplayClass.STOCKS.value: PROFILE_STOCK_BR,
    DisplayClass.FUNDS.value: PROFILE_FII_BR,
    DisplayClass.INTERNATIONAL.value: PROFILE_ETF_INTL,
    DisplayClass.CRYPTO.value: PROFILE_CRYPTO,
}

_ANALYSIS_CLASSES = frozenset(_ANALYSIS_PROFILE_BY_CLASS.keys())

_PROFILE_ORDER = (
    PROFILE_STOCK_BR,
    PROFILE_FII_BR,
    PROFILE_ETF_INTL,
    PROFILE_CRYPTO,
)


def _is_classified_for_profile(
    profile: str,
    methodology: str,
    sum_score: float | None,
    target_percent: float,
) -> bool:
    if methodology == METHODOLOGY_SIMPLES or profile in (PROFILE_CRYPTO, PROFILE_ETF_INTL):
        return target_percent > 0
    return sum_score is not None and sum_score > 0


def build_portfolio_analysis_summary(
    assets_session: Session,
    portfolios_session: Session,
    portfolio_id: int,
) -> AnalysisPortfolioSummaryRead:
    get_portfolio(portfolios_session, portfolio_id)
    pending_ids = get_pending_asset_ids(portfolios_session, portfolio_id)
    positions = list_positions(portfolios_session, portfolio_id)

    stock_sum_settings = get_profile_table_display(assets_session, PROFILE_STOCK_BR).sum_column
    fii_sum_settings = get_profile_table_display(assets_session, PROFILE_FII_BR).sum_column

    profile_counts: dict[str, dict[str, int]] = {
        profile: {"total": 0, "classified": 0, "pending": 0}
        for profile in _ANALYSIS_PROFILE_BY_CLASS.values()
    }

    for position in positions:
        asset = get_asset_by_id(assets_session, position.asset_id)
        if asset is None:
            continue
        display_class = infer_display_class(
            asset.asset_type, asset.market, asset.etf_subtype
        ).value
        if display_class not in _ANALYSIS_CLASSES:
            continue

        profile = _ANALYSIS_PROFILE_BY_CLASS[display_class]
        methodology = get_portfolio_methodology(portfolios_session, portfolio_id, profile)
        profile_counts[profile]["total"] += 1

        if asset.id in pending_ids:
            profile_counts[profile]["pending"] += 1
            continue

        sum_score: float | None = None
        target_percent = 0.0
        uses_allocation = methodology == METHODOLOGY_SIMPLES or profile in (
            PROFILE_CRYPTO,
            PROFILE_ETF_INTL,
        )

        if uses_allocation:
            _, score_refs, _, _, _ = build_asset_analysis_read(
                assets_session, asset, profile, portfolio_id
            )
            target_percent = parse_target_percent_from_refs(score_refs) or 0.0
        else:
            scores, _, summary, _, _ = build_asset_analysis_read(
                assets_session, asset, profile
            )
            sum_settings = stock_sum_settings if profile == PROFILE_STOCK_BR else fii_sum_settings
            sum_score = compute_table_sum_score(scores, summary, sum_settings, profile)

        if _is_classified_for_profile(profile, methodology, sum_score, target_percent):
            profile_counts[profile]["classified"] += 1

    profiles = [
        AnalysisProfileSummaryRead(
            profile=profile,
            total=counts["total"],
            classified=counts["classified"],
            pending=counts["pending"],
        )
        for profile, counts in profile_counts.items()
        if counts["total"] > 0
    ]

    classified_count = sum(p.classified for p in profiles)
    pending_count = sum(p.pending for p in profiles)

    return AnalysisPortfolioSummaryRead(
        portfolio_id=portfolio_id,
        classified_count=classified_count,
        pending_count=pending_count,
        profiles=profiles,
    )


def list_portfolio_pending_assets(
    assets_session: Session,
    portfolios_session: Session,
    portfolio_id: int,
) -> AnalysisPortfolioPendingRead:
    get_portfolio(portfolios_session, portfolio_id)
    pending_ids = get_pending_asset_ids(portfolios_session, portfolio_id)
    if not pending_ids:
        return AnalysisPortfolioPendingRead(portfolio_id=portfolio_id, groups=[])

    positions = list_positions(portfolios_session, portfolio_id)
    by_profile: dict[str, list[PendingAssetRead]] = {profile: [] for profile in _PROFILE_ORDER}

    for position in positions:
        if position.asset_id not in pending_ids:
            continue
        asset = get_asset_by_id(assets_session, position.asset_id)
        if asset is None:
            continue
        display_class = infer_display_class(
            asset.asset_type, asset.market, asset.etf_subtype
        ).value
        if display_class not in _ANALYSIS_CLASSES:
            continue
        profile = _ANALYSIS_PROFILE_BY_CLASS[display_class]
        by_profile[profile].append(
            PendingAssetRead(
                asset_id=asset.id,
                symbol=asset.symbol,
                name=asset.name,
                asset_type=asset.asset_type.value,
                profile=profile,
            )
        )

    groups = [
        PendingAssetsGroupRead(
            profile=profile,
            assets=sorted(by_profile[profile], key=lambda item: item.symbol),
        )
        for profile in _PROFILE_ORDER
        if by_profile[profile]
    ]
    return AnalysisPortfolioPendingRead(portfolio_id=portfolio_id, groups=groups)
