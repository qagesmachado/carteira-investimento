from datetime import datetime

from sqlmodel import Session, select

from app.models.analysis import PortfolioAssetAllocation, PortfolioAssetAnalysisStatus


def get_pending_asset_ids(session: Session, portfolio_id: int) -> set[int]:
    rows = session.exec(
        select(PortfolioAssetAnalysisStatus).where(
            PortfolioAssetAnalysisStatus.portfolio_id == portfolio_id,
            PortfolioAssetAnalysisStatus.is_pending.is_(True),
        )
    ).all()
    return {row.asset_id for row in rows}


def is_asset_pending(session: Session, portfolio_id: int, asset_id: int) -> bool:
    row = session.exec(
        select(PortfolioAssetAnalysisStatus).where(
            PortfolioAssetAnalysisStatus.portfolio_id == portfolio_id,
            PortfolioAssetAnalysisStatus.asset_id == asset_id,
        )
    ).first()
    return row is not None and row.is_pending


def _zero_portfolio_allocations(session: Session, portfolio_id: int, asset_id: int) -> None:
    rows = session.exec(
        select(PortfolioAssetAllocation).where(
            PortfolioAssetAllocation.portfolio_id == portfolio_id,
            PortfolioAssetAllocation.asset_id == asset_id,
        )
    ).all()
    for row in rows:
        row.target_percent = 0.0
        row.updated_at = datetime.utcnow()


def set_asset_pending(
    session: Session,
    portfolio_id: int,
    asset_id: int,
    is_pending: bool,
) -> bool:
    row = session.exec(
        select(PortfolioAssetAnalysisStatus).where(
            PortfolioAssetAnalysisStatus.portfolio_id == portfolio_id,
            PortfolioAssetAnalysisStatus.asset_id == asset_id,
        )
    ).first()

    if is_pending:
        if row is None:
            session.add(
                PortfolioAssetAnalysisStatus(
                    portfolio_id=portfolio_id,
                    asset_id=asset_id,
                    is_pending=True,
                )
            )
        else:
            row.is_pending = True
            row.updated_at = datetime.utcnow()
        _zero_portfolio_allocations(session, portfolio_id, asset_id)
        session.commit()
        return True

    if row is None:
        return False
    if row.is_pending:
        row.is_pending = False
        row.updated_at = datetime.utcnow()
        session.commit()
    return False


def delete_portfolio_analysis_status_and_allocations(
    session: Session, portfolio_id: int
) -> None:
    """Remove status pendente e alocações manuais da carteira (FK portfolio)."""
    for row in session.exec(
        select(PortfolioAssetAnalysisStatus).where(
            PortfolioAssetAnalysisStatus.portfolio_id == portfolio_id
        )
    ).all():
        session.delete(row)
    for row in session.exec(
        select(PortfolioAssetAllocation).where(
            PortfolioAssetAllocation.portfolio_id == portfolio_id
        )
    ).all():
        session.delete(row)
