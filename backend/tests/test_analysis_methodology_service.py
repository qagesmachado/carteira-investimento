from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from app.models.analysis import PortfolioAnalysisMethodology
from app.models.portfolio import Portfolio
from app.schemas.portfolio import PortfolioCreate
from app.services.analysis_defaults import (
    METHODOLOGY_SIMPLES,
    PROFILE_CRYPTO,
    PROFILE_ETF_INTL,
    PROFILE_FII_BR,
    PROFILE_STOCK_BR,
)
from app.services.analysis_methodology_service import (
    get_portfolio_methodology,
    seed_portfolio_analysis_methodologies,
    set_portfolio_methodology,
    sync_stocks_split_unified_for_simples_stock_br,
)
from app.services.portfolio_service import create_portfolio, delete_portfolio


def _session() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    PortfolioAnalysisMethodology.metadata.create_all(engine)
    Portfolio.metadata.create_all(engine)
    return Session(engine)


def test_seed_portfolio_analysis_methodologies() -> None:
    with _session() as session:
        portfolio = create_portfolio(session, PortfolioCreate(name="Nova"))
        for profile in (PROFILE_STOCK_BR, PROFILE_FII_BR, PROFILE_ETF_INTL, PROFILE_CRYPTO):
            assert get_portfolio_methodology(session, portfolio.id, profile) == METHODOLOGY_SIMPLES


def test_set_portfolio_methodology_upsert() -> None:
    with _session() as session:
        portfolio = Portfolio(name="Manual")
        session.add(portfolio)
        session.commit()
        session.refresh(portfolio)
        seed_portfolio_analysis_methodologies(session, portfolio.id)
        set_portfolio_methodology(session, portfolio.id, PROFILE_STOCK_BR, "auvp")
        assert get_portfolio_methodology(session, portfolio.id, PROFILE_STOCK_BR) == "auvp"
        assert get_portfolio_methodology(session, portfolio.id, PROFILE_FII_BR) == METHODOLOGY_SIMPLES


def test_recreated_portfolio_resets_methodology_seed() -> None:
    with _session() as session:
        first = create_portfolio(session, PortfolioCreate(name="Recycle"))
        set_portfolio_methodology(session, first.id, PROFILE_STOCK_BR, "auvp")
        delete_portfolio(session, first.id, cascade=True)

        second = create_portfolio(session, PortfolioCreate(name="Recycle 2"))
        assert second.id == first.id
        assert get_portfolio_methodology(session, second.id, PROFILE_STOCK_BR) == METHODOLOGY_SIMPLES


def test_sync_stocks_split_unified_for_simples() -> None:
    import json

    from app.services.rebalance_engine import parse_allocation_targets

    with _session() as session:
        portfolio = create_portfolio(session, PortfolioCreate(name="Split sync"))
        portfolio.allocation_targets_json = json.dumps(
            {
                "classes": {
                    "stocks": 30,
                    "funds": 5,
                    "international": 20,
                    "fixed_income": 40,
                    "crypto": 5,
                },
                "stocks_split": {"etf": 70, "stock": 30},
                "stocks_split_mode": "by_subtype",
            },
            ensure_ascii=False,
        )
        session.add(portfolio)
        session.commit()
        session.refresh(portfolio)

        changed = sync_stocks_split_unified_for_simples_stock_br(session, portfolio.id)
        session.commit()
        session.refresh(portfolio)

        assert changed is True
        targets = parse_allocation_targets(portfolio.allocation_targets_json)
        assert targets.stocks_split_mode == "unified"
