from datetime import date

import pytest
from fastapi import HTTPException
from sqlmodel import Session, SQLModel, create_engine

from app.db.session import ALL_TABLES, _ensure_asset_columns
from app.models.asset import AssetMarket, AssetType
from app.models.dividend_payment import DividendPaymentType
from app.models.portfolio import Portfolio
from app.schemas.asset import AssetCreate
from app.schemas.dividend_payment import DividendPaymentCreate, DividendPaymentUpdate
from app.services.asset_service import create_asset
from app.services.dividend_payment_service import (
    create_dividend_payment,
    delete_dividend_payment,
    list_dividend_payments,
    update_dividend_payment,
)


@pytest.fixture
def db_session(tmp_path):
    engine = create_engine(
        f"sqlite:///{(tmp_path / 'carteira.db').as_posix()}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine, tables=ALL_TABLES)
    _ensure_asset_columns(engine)
    with Session(engine) as session:
        yield session


def _asset(session: Session, symbol: str = "BBSE3") -> int:
    asset = create_asset(
        session,
        AssetCreate(
            symbol=symbol,
            name="Ativo teste",
            asset_type=AssetType.STOCK,
            market=AssetMarket.NATIONAL,
            country="BR",
            currency="BRL",
        ),
    )
    return asset.id  # type: ignore[return-value]


def _portfolio(session: Session, name: str = "Carteira teste") -> Portfolio:
    portfolio = Portfolio(name=name, base_currency="BRL")
    session.add(portfolio)
    session.commit()
    session.refresh(portfolio)
    return portfolio


def test_create_and_list_dividend_payment(db_session: Session):
    asset_id = _asset(db_session)
    portfolio = _portfolio(db_session)
    payload = DividendPaymentCreate(
        asset_id=asset_id,
        portfolio_id=portfolio.id,  # type: ignore[arg-type]
        payment_type=DividendPaymentType.DIVIDEND,
        payment_date=date(2024, 6, 1),
        amount=100.0,
        currency="BRL",
    )
    created = create_dividend_payment(db_session, payload)
    assert created.symbol == "BBSE3"
    listed = list_dividend_payments(db_session, portfolio_id=portfolio.id)
    assert len(listed) == 1


def test_create_rejects_missing_asset(db_session: Session):
    portfolio = _portfolio(db_session)
    with pytest.raises(HTTPException) as exc:
        create_dividend_payment(
            db_session,
            DividendPaymentCreate(
                asset_id=9999,
                portfolio_id=portfolio.id,  # type: ignore[arg-type]
                payment_type=DividendPaymentType.DIVIDEND,
                payment_date=date(2024, 6, 1),
                amount=10.0,
                currency="BRL",
            ),
        )
    assert exc.value.status_code == 404


def test_create_rejects_missing_portfolio(db_session: Session):
    asset_id = _asset(db_session)
    with pytest.raises(HTTPException) as exc:
        create_dividend_payment(
            db_session,
            DividendPaymentCreate(
                asset_id=asset_id,
                portfolio_id=9999,
                payment_type=DividendPaymentType.DIVIDEND,
                payment_date=date(2024, 6, 1),
                amount=10.0,
                currency="BRL",
            ),
        )
    assert exc.value.status_code == 404


def test_create_rejects_non_positive_amount(db_session: Session):
    asset_id = _asset(db_session)
    portfolio = _portfolio(db_session)
    with pytest.raises(HTTPException) as exc:
        create_dividend_payment(
            db_session,
            DividendPaymentCreate(
                asset_id=asset_id,
                portfolio_id=portfolio.id,  # type: ignore[arg-type]
                payment_type=DividendPaymentType.DIVIDEND,
                payment_date=date(2024, 6, 1),
                amount=0,
                currency="BRL",
            ),
        )
    assert exc.value.status_code == 422


def test_filter_by_market_and_payment_type(db_session: Session):
    asset_br = _asset(db_session, "BBSE3")
    asset_us = create_asset(
        db_session,
        AssetCreate(
            symbol="VOO",
            name="Vanguard",
            asset_type=AssetType.STOCK,
            market=AssetMarket.INTERNATIONAL,
            country="US",
            currency="USD",
        ),
    )
    portfolio = _portfolio(db_session)
    create_dividend_payment(
        db_session,
        DividendPaymentCreate(
            asset_id=asset_br,
            portfolio_id=portfolio.id,  # type: ignore[arg-type]
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 1, 1),
            amount=50.0,
            currency="BRL",
        ),
    )
    create_dividend_payment(
        db_session,
        DividendPaymentCreate(
            asset_id=asset_us.id,  # type: ignore[arg-type]
            portfolio_id=portfolio.id,  # type: ignore[arg-type]
            payment_type=DividendPaymentType.JCP,
            payment_date=date(2024, 2, 1),
            amount=20.0,
            currency="USD",
        ),
    )
    br_only = list_dividend_payments(
        db_session,
        market=AssetMarket.NATIONAL,
        payment_type=DividendPaymentType.DIVIDEND,
    )
    assert len(br_only) == 1
    assert br_only[0].symbol == "BBSE3"


def test_filter_by_portfolio_id(db_session: Session):
    asset_id = _asset(db_session)
    portfolio_a = _portfolio(db_session, "Carteira A")
    portfolio_b = _portfolio(db_session, "Carteira B")
    create_dividend_payment(
        db_session,
        DividendPaymentCreate(
            asset_id=asset_id,
            portfolio_id=portfolio_a.id,  # type: ignore[arg-type]
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 3, 1),
            amount=30.0,
            currency="BRL",
        ),
    )
    create_dividend_payment(
        db_session,
        DividendPaymentCreate(
            asset_id=asset_id,
            portfolio_id=portfolio_b.id,  # type: ignore[arg-type]
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 4, 1),
            amount=40.0,
            currency="BRL",
        ),
    )
    assert len(list_dividend_payments(db_session, portfolio_id=portfolio_a.id)) == 1


def test_update_and_delete_dividend_payment(db_session: Session):
    asset_id = _asset(db_session)
    portfolio = _portfolio(db_session)
    created = create_dividend_payment(
        db_session,
        DividendPaymentCreate(
            asset_id=asset_id,
            portfolio_id=portfolio.id,  # type: ignore[arg-type]
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 5, 1),
            amount=80.0,
            currency="BRL",
        ),
    )
    updated = update_dividend_payment(
        db_session,
        created.id,
        DividendPaymentUpdate(amount=90.0),
    )
    assert updated.amount == 90.0
    delete_dividend_payment(db_session, created.id)
    assert list_dividend_payments(db_session) == []


def test_update_can_reassign_portfolio(db_session: Session):
    asset_id = _asset(db_session)
    portfolio_a = _portfolio(db_session, "Carteira A")
    portfolio_b = _portfolio(db_session, "Carteira B")
    created = create_dividend_payment(
        db_session,
        DividendPaymentCreate(
            asset_id=asset_id,
            portfolio_id=portfolio_a.id,  # type: ignore[arg-type]
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 6, 1),
            amount=15.0,
            currency="BRL",
        ),
    )
    updated = update_dividend_payment(
        db_session,
        created.id,
        DividendPaymentUpdate(portfolio_id=portfolio_b.id),
    )
    assert updated.portfolio_id == portfolio_b.id
