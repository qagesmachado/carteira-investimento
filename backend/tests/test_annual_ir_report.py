from datetime import date

import pytest
from sqlmodel import Session, SQLModel, create_engine

from app.db.session import ALL_TABLES, _ensure_asset_columns
from app.models.asset import AssetMarket, AssetType
from app.models.dividend_payment import DividendPaymentType
from app.schemas.asset import AssetCreate
from app.schemas.dividend_payment import DividendPaymentCreate
from app.schemas.portfolio import PortfolioCreate, PositionCreate
from app.schemas.year_snapshot import YearSnapshotCreate
from app.models.asset import DisplayClass
from app.schemas.annual_ir_report import (
    AnnualIrPaymentRow,
    AnnualIrPositionRow,
    AnnualIrReportRead,
    AnnualIrSummaryByAsset,
)
from app.services.annual_ir_report_service import build_annual_ir_report, export_annual_ir_report_csv
from app.services.asset_service import create_asset
from app.services.dividend_payment_service import create_dividend_payment
from app.services.portfolio_service import create_portfolio, create_position
from app.services.year_snapshot_service import create_year_snapshot


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


def _setup_portfolio_with_data(session: Session):
    portfolio = create_portfolio(session, PortfolioCreate(name="Carteira IR", base_currency="BRL"))
    asset = create_asset(
        session,
        AssetCreate(
            symbol="BBSE3",
            name="BB Seguridade",
            asset_type=AssetType.STOCK,
            market=AssetMarket.NATIONAL,
            country="BR",
            currency="BRL",
            company_cnpj="00.000.000/0001-91",
            payer_cnpj="11.111.111/0001-11",
            payer_name="Fonte Pagadora SA",
        ),
    )
    portfolio_id = portfolio.id  # type: ignore[assignment]
    asset_id = asset.id  # type: ignore[assignment]

    create_dividend_payment(
        session,
        DividendPaymentCreate(
            asset_id=asset_id,
            portfolio_id=portfolio_id,
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 3, 10),
            amount=100.0,
            currency="BRL",
        ),
    )
    create_dividend_payment(
        session,
        DividendPaymentCreate(
            asset_id=asset_id,
            portfolio_id=portfolio_id,
            payment_type=DividendPaymentType.JCP,
            payment_date=date(2024, 9, 1),
            amount=30.0,
            currency="BRL",
        ),
    )
    create_dividend_payment(
        session,
        DividendPaymentCreate(
            asset_id=asset_id,
            portfolio_id=portfolio_id,
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2023, 6, 1),
            amount=999.0,
            currency="BRL",
        ),
    )
    create_position(
        session,
        portfolio_id,
        PositionCreate(asset_id=asset_id, quantity=80, average_price=28.0),
    )
    create_year_snapshot(session, portfolio_id, YearSnapshotCreate(year=2024))
    return portfolio_id


def test_annual_ir_report_filters_by_year_and_summarizes(db_session: Session):
    portfolio_id = _setup_portfolio_with_data(db_session)
    report = build_annual_ir_report(db_session, portfolio_id, 2024)

    assert report.year == 2024
    assert len(report.payments) == 2
    assert report.summary_by_asset[0].totals_by_type["dividend"] == 100.0
    assert report.summary_by_asset[0].totals_by_type["jcp"] == 30.0
    assert report.has_position_snapshot is True
    assert report.positions[0].quantity == 80


def test_annual_ir_report_rolls_up_fiscal_fields_from_asset(db_session: Session):
    portfolio_id = _setup_portfolio_with_data(db_session)
    report = build_annual_ir_report(db_session, portfolio_id, 2024)

    payment = report.payments[0]
    assert payment.company_cnpj == "00.000.000/0001-91"
    assert payment.payer_cnpj == "11.111.111/0001-11"
    assert payment.payer_name == "Fonte Pagadora SA"


def test_annual_ir_report_excludes_fixed_income_and_pension_positions(db_session: Session):
    portfolio_id = _setup_portfolio_with_data(db_session)
    rf_asset = create_asset(
        db_session,
        AssetCreate(
            symbol="CDB-TEST",
            name="CDB Teste",
            asset_type=AssetType.FIXED_INCOME,
            market=AssetMarket.NATIONAL,
            country="BR",
            currency="BRL",
        ),
    )
    pension_asset = create_asset(
        db_session,
        AssetCreate(
            symbol="PREV-TEST",
            name="Previdência BTG",
            asset_type=AssetType.PENSION,
            market=AssetMarket.NATIONAL,
            country="BR",
            currency="BRL",
        ),
    )
    create_position(
        db_session,
        portfolio_id,
        PositionCreate(asset_id=rf_asset.id, quantity=0, average_price=0),  # type: ignore[arg-type]
    )
    create_position(
        db_session,
        portfolio_id,
        PositionCreate(asset_id=pension_asset.id, quantity=0, average_price=0),  # type: ignore[arg-type]
    )
    create_year_snapshot(db_session, portfolio_id, YearSnapshotCreate(year=2024, replace=True))

    report = build_annual_ir_report(db_session, portfolio_id, 2024)
    assert len(report.positions) == 1
    assert report.positions[0].asset_type == AssetType.STOCK
    assert report.payments[0].asset_type == AssetType.STOCK


def test_export_annual_ir_report_csv_contains_sections(db_session: Session):
    portfolio_id = _setup_portfolio_with_data(db_session)
    report = build_annual_ir_report(db_session, portfolio_id, 2024)
    csv_content = export_annual_ir_report_csv(report)

    assert "# DETALHADO" in csv_content
    assert "# RESUMO" in csv_content
    assert "# POSICOES" in csv_content
    assert "BBSE3" in csv_content


def test_export_annual_ir_report_csv_rounds_money_values():
    report = AnnualIrReportRead(
        year=2024,
        portfolio_id=1,
        has_position_snapshot=False,
        payments=[
            AnnualIrPaymentRow(
                symbol="BBDC3.SA",
                asset_name="Bradesco",
                asset_type=AssetType.STOCK,
                display_class=DisplayClass.STOCKS,
                market=AssetMarket.NATIONAL,
                payment_type=DividendPaymentType.JCP,
                payment_date=date(2024, 5, 10),
                amount=38.17999999999999,
                currency="BRL",
            )
        ],
        summary_by_asset=[
            AnnualIrSummaryByAsset(
                asset_id=1,
                symbol="BBDC3.SA",
                asset_name="Bradesco",
                asset_type=AssetType.STOCK,
                display_class=DisplayClass.STOCKS,
                market=AssetMarket.NATIONAL,
                totals_by_type={
                    DividendPaymentType.DIVIDEND.value: 0.0,
                    DividendPaymentType.JCP.value: 38.17999999999999,
                    DividendPaymentType.CREDIT.value: 0.0,
                    DividendPaymentType.FRACTION.value: 0.0,
                    DividendPaymentType.REDEMPTION.value: 0.0,
                    DividendPaymentType.OTHER.value: 0.0,
                },
                total_by_currency={"BRL": 38.17999999999999},
            )
        ],
        positions=[
            AnnualIrPositionRow(
                symbol="HGLG11.SA",
                asset_name="CSHG Logística",
                asset_type=AssetType.FII,
                display_class=DisplayClass.FUNDS,
                market=AssetMarket.NATIONAL,
                quantity=10,
                average_price=52.800000000000004,
                currency="BRL",
                invested_amount=528.0000000000001,
            )
        ],
        grand_totals_by_type={},
    )

    csv_content = export_annual_ir_report_csv(report)

    assert "38.18" in csv_content
    assert "999999" not in csv_content
    assert "52.8" in csv_content or "52.80" in csv_content


def test_annual_ir_report_includes_market_on_summary_and_positions(db_session: Session):
    portfolio = create_portfolio(db_session, PortfolioCreate(name="IR Intl", base_currency="BRL"))
    national = create_asset(
        db_session,
        AssetCreate(
            symbol="BBSE3",
            name="BB Seguridade",
            asset_type=AssetType.STOCK,
            market=AssetMarket.NATIONAL,
            country="BR",
            currency="BRL",
        ),
    )
    international = create_asset(
        db_session,
        AssetCreate(
            symbol="VOO",
            name="Vanguard S&P 500",
            asset_type=AssetType.ETF,
            market=AssetMarket.INTERNATIONAL,
            country="US",
            currency="USD",
        ),
    )
    portfolio_id = portfolio.id  # type: ignore[assignment]
    national_id = national.id  # type: ignore[assignment]
    international_id = international.id  # type: ignore[assignment]

    create_dividend_payment(
        db_session,
        DividendPaymentCreate(
            asset_id=national_id,
            portfolio_id=portfolio_id,
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 3, 10),
            amount=100.0,
            currency="BRL",
        ),
    )
    create_dividend_payment(
        db_session,
        DividendPaymentCreate(
            asset_id=international_id,
            portfolio_id=portfolio_id,
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 4, 1),
            amount=25.0,
            currency="USD",
        ),
    )
    create_position(
        db_session,
        portfolio_id,
        PositionCreate(asset_id=national_id, quantity=10, average_price=30.0),
    )
    create_position(
        db_session,
        portfolio_id,
        PositionCreate(asset_id=international_id, quantity=5, average_price=400.0),
    )
    create_year_snapshot(db_session, portfolio_id, YearSnapshotCreate(year=2024))

    report = build_annual_ir_report(db_session, portfolio_id, 2024)

    markets_by_symbol = {row.symbol: row.market for row in report.summary_by_asset}
    assert markets_by_symbol["BBSE3"] == AssetMarket.NATIONAL
    assert markets_by_symbol["VOO"] == AssetMarket.INTERNATIONAL

    position_markets = {row.symbol: row.market for row in report.positions}
    assert position_markets["BBSE3"] == AssetMarket.NATIONAL
    assert position_markets["VOO"] == AssetMarket.INTERNATIONAL

    csv_content = export_annual_ir_report_csv(report)
    assert "international" in csv_content
    assert "# RESUMO" in csv_content
    assert "# POSICOES" in csv_content
