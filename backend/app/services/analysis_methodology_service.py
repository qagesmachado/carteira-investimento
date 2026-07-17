from sqlmodel import Session, select

from app.models.analysis import PortfolioAnalysisMethodology
from app.models.portfolio import Portfolio
from app.services.analysis_defaults import (
    ANALYSIS_PROFILES_ALL,
    LEGACY_DEFAULT_METHODOLOGY_BY_PROFILE,
    METHODOLOGY_AUVP,
    METHODOLOGY_SIMPLES,
    NEW_PORTFOLIO_METHODOLOGY,
    PROFILES_AUVP_UNAVAILABLE,
    PROFILE_CRYPTO,
    PROFILE_ETF_INTL,
    PROFILE_FII_BR,
    PROFILE_STOCK_BR,
)


class AnalysisMethodologyError(ValueError):
    pass


_PROFILE_BY_SLUG: dict[str, str] = {
    "stock-br": PROFILE_STOCK_BR,
    "fii-br": PROFILE_FII_BR,
    "etf-intl": PROFILE_ETF_INTL,
    "crypto": PROFILE_CRYPTO,
}


def profile_from_slug(slug: str) -> str:
    profile = _PROFILE_BY_SLUG.get(slug)
    if profile is None:
        raise AnalysisMethodologyError(f"Invalid profile slug: {slug}")
    return profile


def profile_to_slug(profile: str) -> str:
    for slug, value in _PROFILE_BY_SLUG.items():
        if value == profile:
            return slug
    raise AnalysisMethodologyError(f"Invalid profile: {profile}")


def _validate_methodology(profile: str, methodology: str) -> None:
    if methodology not in (METHODOLOGY_SIMPLES, METHODOLOGY_AUVP):
        raise AnalysisMethodologyError(f"Invalid methodology: {methodology}")
    if profile not in ANALYSIS_PROFILES_ALL:
        raise AnalysisMethodologyError(f"Invalid profile: {profile}")
    if methodology == METHODOLOGY_AUVP and profile in PROFILES_AUVP_UNAVAILABLE:
        raise AnalysisMethodologyError(
            f"Metodologia AUVP ainda não está disponível para o perfil {profile}"
        )


def get_portfolio_methodology(session: Session, portfolio_id: int, profile: str) -> str:
    if profile not in ANALYSIS_PROFILES_ALL:
        raise AnalysisMethodologyError(f"Invalid profile: {profile}")
    row = session.exec(
        select(PortfolioAnalysisMethodology).where(
            PortfolioAnalysisMethodology.portfolio_id == portfolio_id,
            PortfolioAnalysisMethodology.profile == profile,
        )
    ).first()
    if row is not None:
        return row.methodology
    return LEGACY_DEFAULT_METHODOLOGY_BY_PROFILE[profile]


def set_portfolio_methodology(
    session: Session,
    portfolio_id: int,
    profile: str,
    methodology: str,
) -> str:
    _validate_methodology(profile, methodology)
    row = session.exec(
        select(PortfolioAnalysisMethodology).where(
            PortfolioAnalysisMethodology.portfolio_id == portfolio_id,
            PortfolioAnalysisMethodology.profile == profile,
        )
    ).first()
    if row is None:
        row = PortfolioAnalysisMethodology(
            portfolio_id=portfolio_id,
            profile=profile,
            methodology=methodology,
        )
        session.add(row)
    else:
        row.methodology = methodology
    if profile == PROFILE_STOCK_BR and methodology == METHODOLOGY_SIMPLES:
        sync_stocks_split_unified_for_simples_stock_br(session, portfolio_id)
    session.commit()
    session.refresh(row)
    return row.methodology


def sync_stocks_split_unified_for_simples_stock_br(session: Session, portfolio_id: int) -> bool:
    """Força modo conjunto único nas metas de rebalanceamento quando análise BR é Simples."""
    from app.services.rebalance_engine import parse_allocation_targets, serialize_allocation_targets

    portfolio = session.get(Portfolio, portfolio_id)
    if portfolio is None:
        return False
    targets = parse_allocation_targets(portfolio.allocation_targets_json)
    if targets.stocks_split_mode == "unified":
        return False
    targets.stocks_split_mode = "unified"
    portfolio.allocation_targets_json = serialize_allocation_targets(targets)
    session.add(portfolio)
    return True


def assert_stocks_split_allowed_for_stock_br_methodology(
    session: Session,
    portfolio_id: int,
    allocation_targets_json: str,
) -> None:
    from app.services.rebalance_engine import parse_allocation_targets

    if get_portfolio_methodology(session, portfolio_id, PROFILE_STOCK_BR) != METHODOLOGY_SIMPLES:
        return
    targets = parse_allocation_targets(allocation_targets_json)
    if targets.stocks_split_mode != "unified":
        raise AnalysisMethodologyError(
            "Com metodologia Simples em Ações/ETF BR, a relação ETF/Ação deve ser Conjunto único."
        )


def seed_portfolio_analysis_methodologies(session: Session, portfolio_id: int) -> None:
    for profile in ANALYSIS_PROFILES_ALL:
        existing = session.exec(
            select(PortfolioAnalysisMethodology).where(
                PortfolioAnalysisMethodology.portfolio_id == portfolio_id,
                PortfolioAnalysisMethodology.profile == profile,
            )
        ).first()
        if existing is not None:
            continue
        session.add(
            PortfolioAnalysisMethodology(
                portfolio_id=portfolio_id,
                profile=profile,
                methodology=NEW_PORTFOLIO_METHODOLOGY,
            )
        )
    session.commit()


def delete_portfolio_analysis_methodologies(session: Session, portfolio_id: int) -> None:
    rows = session.exec(
        select(PortfolioAnalysisMethodology).where(
            PortfolioAnalysisMethodology.portfolio_id == portfolio_id
        )
    ).all()
    for row in rows:
        session.delete(row)


def is_allocation_methodology(session: Session, portfolio_id: int, profile: str) -> bool:
    return get_portfolio_methodology(session, portfolio_id, profile) == METHODOLOGY_SIMPLES
