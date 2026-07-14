from dataclasses import dataclass

from sqlmodel import Session

from app.services.asset_service import get_asset_by_id
from app.services.fx_service import get_usd_brl_state
from app.services.portfolio_service import get_active_portfolio_id, list_portfolios, list_positions
from app.services.position_metrics import (
    position_current_value,
    position_invested_value,
    value_in_brl,
)


@dataclass(frozen=True)
class PortfolioFinancialSummary:
    portfolio_id: int
    invested_brl: float
    current_brl: float
    profit_brl: float
    profit_pct: float | None
    position_count: int
    is_active: bool


def compute_portfolio_patrimony_brl(session: Session, portfolio_id: int) -> float:
    """Soma o valor atual de todas as posições da carteira em BRL."""
    summary = compute_portfolio_financial_summary_brl(session, portfolio_id)
    return summary.current_brl


def compute_portfolio_financial_summary_brl(
    session: Session,
    portfolio_id: int,
    *,
    usd_brl_rate: float | None = None,
    active_portfolio_id: int | None = None,
) -> PortfolioFinancialSummary:
    positions = list_positions(session, portfolio_id)
    if usd_brl_rate is None:
        usd_brl_rate, _ = get_usd_brl_state(session)
    if active_portfolio_id is None:
        active_portfolio_id = get_active_portfolio_id(session)

    invested_brl = 0.0
    current_brl = 0.0
    for position in positions:
        asset = get_asset_by_id(session, position.asset_id)
        invested = position_invested_value(position, asset)
        invested_converted = value_in_brl(invested, asset.currency, usd_brl_rate)
        if invested_converted is not None:
            invested_brl += invested_converted

        current = position_current_value(position, asset)
        current_converted = value_in_brl(current, asset.currency, usd_brl_rate)
        if current_converted is not None:
            current_brl += current_converted

    profit_brl = current_brl - invested_brl
    profit_pct: float | None = None
    if invested_brl > 0:
        profit_pct = (profit_brl / invested_brl) * 100.0

    return PortfolioFinancialSummary(
        portfolio_id=portfolio_id,
        invested_brl=invested_brl,
        current_brl=current_brl,
        profit_brl=profit_brl,
        profit_pct=profit_pct,
        position_count=len(positions),
        is_active=active_portfolio_id == portfolio_id,
    )


def list_portfolio_summaries(session: Session) -> list[PortfolioFinancialSummary]:
    usd_brl_rate, _ = get_usd_brl_state(session)
    active_portfolio_id = get_active_portfolio_id(session)
    return [
        compute_portfolio_financial_summary_brl(
            session,
            portfolio.id,
            usd_brl_rate=usd_brl_rate,
            active_portfolio_id=active_portfolio_id,
        )
        for portfolio in list_portfolios(session)
    ]
