from datetime import date

import pytest
from fastapi import HTTPException
from sqlmodel import Session, SQLModel, create_engine

from app.db.session import ASSET_TABLES, _ensure_asset_columns
from app.models.asset import AssetMarket, AssetType, DisplayClass
from app.models.dividend_payment import DividendPaymentType
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
def catalog_session(tmp_path):
    engine = create_engine(
        f"sqlite:///{(tmp_path / 'catalog.db').as_posix()}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine, tables=ASSET_TABLES)
    _ensure_asset_columns(engine)
    with Session(engine) as session:
        yield session


def _asset(session: Session, symbol: str = "BBSE3", market: AssetMarket = AssetMarket.NATIONAL):
    return create_asset(
        session,
        AssetCreate(
            symbol=symbol,
            name=f"Ativo {symbol}",
            asset_type=AssetType.STOCK,
            market=market,
            country="BR" if market == AssetMarket.NATIONAL else "US",
            currency="BRL" if market == AssetMarket.NATIONAL else "USD",
        ),
    )


def _payment_payload(asset_id: int, **kwargs) -> DividendPaymentCreate:
    defaults = {
        "asset_id": asset_id,
        "payment_type": DividendPaymentType.DIVIDEND,
        "payment_date": date(2024, 6, 15),
        "amount": 120.5,
        "currency": "BRL",
    }
    defaults.update(kwargs)
    return DividendPaymentCreate(**defaults)


def test_create_and_list_dividend_payment(catalog_session: Session):
    asset = _asset(catalog_session)
    created = create_dividend_payment(
        catalog_session,
        _payment_payload(asset.id),  # type: ignore[arg-type]
    )
    assert created.symbol == "BBSE3"
    assert created.payment_type == DividendPaymentType.DIVIDEND
    assert created.market == AssetMarket.NATIONAL

    items = list_dividend_payments(catalog_session)
    assert len(items) == 1
    assert items[0].amount == 120.5


def test_create_rejects_missing_asset(catalog_session: Session):
    with pytest.raises(HTTPException) as exc:
        create_dividend_payment(
            catalog_session,
            _payment_payload(999),
        )
    assert exc.value.status_code == 404


def test_create_rejects_non_positive_amount(catalog_session: Session):
    asset = _asset(catalog_session)
    with pytest.raises(HTTPException) as exc:
        create_dividend_payment(
            catalog_session,
            _payment_payload(asset.id, amount=0),  # type: ignore[arg-type]
        )
    assert exc.value.status_code == 422


def test_filter_by_market_and_payment_type(catalog_session: Session):
    national = _asset(catalog_session, "BBSE3")
    international = _asset(catalog_session, "VOO", AssetMarket.INTERNATIONAL)
    create_dividend_payment(
        catalog_session,
        _payment_payload(national.id, payment_type=DividendPaymentType.DIVIDEND),  # type: ignore[arg-type]
    )
    create_dividend_payment(
        catalog_session,
        _payment_payload(
            international.id,  # type: ignore[arg-type]
            payment_type=DividendPaymentType.JCP,
            currency="USD",
        ),
    )

    national_only = list_dividend_payments(
        catalog_session,
        market=AssetMarket.NATIONAL,
    )
    assert len(national_only) == 1
    assert national_only[0].symbol == "BBSE3"

    jcp_only = list_dividend_payments(
        catalog_session,
        payment_type=DividendPaymentType.JCP,
    )
    assert len(jcp_only) == 1
    assert jcp_only[0].symbol == "VOO"


def test_update_and_delete_dividend_payment(catalog_session: Session):
    asset = _asset(catalog_session)
    created = create_dividend_payment(
        catalog_session,
        _payment_payload(asset.id),  # type: ignore[arg-type]
    )
    updated = update_dividend_payment(
        catalog_session,
        created.id,
        DividendPaymentUpdate(amount=200.0),
    )
    assert updated.amount == 200.0

    delete_dividend_payment(catalog_session, created.id)
    assert list_dividend_payments(catalog_session) == []
