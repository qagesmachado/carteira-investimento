import csv
import io
from datetime import date

from sqlmodel import Session, select

from app.models.asset import Asset, AssetType
from app.models.dividend_payment import DividendPaymentType
from app.schemas.annual_ir_report import (
    AnnualIrPaymentRow,
    AnnualIrPositionRow,
    AnnualIrReportRead,
    AnnualIrSummaryByAsset,
)
from app.services.dividend_payment_service import list_dividend_payments
from app.services.portfolio_service import get_portfolio
from app.services.year_snapshot_service import find_year_snapshot_detail

PAYMENT_TYPES = [member.value for member in DividendPaymentType]


def _round_money(value: float) -> float:
    return round(value, 2)


def _resolve_fiscal_field(payment_value: str | None, asset_value: str | None) -> str | None:
    if payment_value and payment_value.strip():
        return payment_value.strip()
    if asset_value and asset_value.strip():
        return asset_value.strip()
    return None


def build_annual_ir_report(session: Session, portfolio_id: int, year: int) -> AnnualIrReportRead:
    get_portfolio(session, portfolio_id)
    from_date = date(year, 1, 1)
    to_date = date(year, 12, 31)

    payments_read = list_dividend_payments(
        session,
        portfolio_id=portfolio_id,
        from_date=from_date,
        to_date=to_date,
    )

    payment_rows: list[AnnualIrPaymentRow] = []
    summary_map: dict[int, AnnualIrSummaryByAsset] = {}
    grand_totals: dict[str, dict[str, float]] = {
        payment_type: {} for payment_type in PAYMENT_TYPES
    }

    assets_by_id: dict[int, Asset] = {}
    for payment in payments_read:
        asset = session.get(Asset, payment.asset_id)
        if asset is None:
            continue
        assets_by_id[payment.asset_id] = asset

        payment_type = payment.payment_type.value
        currency = payment.currency.strip().upper() or "BRL"

        payment_rows.append(
            AnnualIrPaymentRow(
                symbol=payment.symbol,
                asset_name=payment.asset_name,
                asset_type=asset.asset_type,
                display_class=payment.display_class,
                market=payment.market,
                payment_type=payment.payment_type,
                payment_date=payment.payment_date,
                amount=payment.amount,
                currency=currency,
                company_cnpj=_resolve_fiscal_field(payment.company_cnpj, asset.company_cnpj),
                payer_cnpj=_resolve_fiscal_field(payment.payer_cnpj, asset.payer_cnpj),
                payer_name=_resolve_fiscal_field(payment.payer_name, asset.payer_name),
            ),
        )

        existing = summary_map.get(payment.asset_id)
        if existing is None:
            existing = AnnualIrSummaryByAsset(
                asset_id=payment.asset_id,
                symbol=payment.symbol,
                asset_name=payment.asset_name,
                asset_type=asset.asset_type,
                display_class=payment.display_class,
                totals_by_type={payment_type: 0.0 for payment_type in PAYMENT_TYPES},
                total_by_currency={},
            )
            summary_map[payment.asset_id] = existing

        existing.totals_by_type[payment_type] = (
            existing.totals_by_type.get(payment_type, 0.0) + payment.amount
        )
        existing.total_by_currency[currency] = (
            existing.total_by_currency.get(currency, 0.0) + payment.amount
        )

        grand_totals[payment_type][currency] = (
            grand_totals[payment_type].get(currency, 0.0) + payment.amount
        )

    payment_rows.sort(key=lambda row: (row.payment_date, row.symbol, row.payment_type.value))

    summary_rows = sorted(
        summary_map.values(),
        key=lambda row: row.symbol,
    )

    has_snapshot = False
    snapshot_date: date | None = None
    position_rows: list[AnnualIrPositionRow] = []

    snapshot = find_year_snapshot_detail(session, portfolio_id, year)
    if snapshot is not None:
        has_snapshot = True
        snapshot_date = snapshot.snapshot_date
        snapshot_asset_ids = {position.asset_id for position in snapshot.positions}
        snapshot_assets = {
            asset.id: asset
            for asset in session.exec(
                select(Asset).where(Asset.id.in_(snapshot_asset_ids)),
            ).all()
            if asset.id is not None
        }
        for position in snapshot.positions:
            asset = snapshot_assets.get(position.asset_id)
            if asset is None or asset.asset_type in {
                AssetType.FIXED_INCOME,
                AssetType.PENSION,
            }:
                continue
            position_rows.append(
                AnnualIrPositionRow(
                    symbol=position.symbol,
                    asset_name=position.asset_name,
                    asset_type=asset.asset_type,
                    display_class=position.display_class,
                    quantity=position.quantity,
                    average_price=position.average_price,
                    currency=position.currency,
                    invested_amount=position.invested_amount
                    if position.invested_amount is not None
                    else position.quantity * position.average_price,
                ),
            )
        position_rows.sort(key=lambda row: row.symbol)

    return AnnualIrReportRead(
        year=year,
        portfolio_id=portfolio_id,
        has_position_snapshot=has_snapshot,
        snapshot_date=snapshot_date,
        payments=payment_rows,
        summary_by_asset=summary_rows,
        positions=position_rows,
        grand_totals_by_type=grand_totals,
    )


def export_annual_ir_report_csv(report: AnnualIrReportRead) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    writer.writerow(["# DETALHADO"])
    writer.writerow(
        [
            "symbol",
            "asset_name",
            "asset_type",
            "display_class",
            "market",
            "payment_type",
            "payment_date",
            "amount",
            "currency",
            "company_cnpj",
            "payer_cnpj",
            "payer_name",
        ],
    )
    for row in report.payments:
        writer.writerow(
            [
                row.symbol,
                row.asset_name,
                row.asset_type.value,
                row.display_class.value,
                row.market.value,
                row.payment_type.value,
                row.payment_date.isoformat(),
                _round_money(row.amount),
                row.currency,
                row.company_cnpj or "",
                row.payer_cnpj or "",
                row.payer_name or "",
            ],
        )

    writer.writerow([])
    writer.writerow(["# RESUMO"])
    header = [
        "symbol",
        "asset_name",
        "asset_type",
        "display_class",
        *PAYMENT_TYPES,
        "total_currency",
        "total_amount",
    ]
    writer.writerow(header)
    for row in report.summary_by_asset:
        for currency, total in sorted(row.total_by_currency.items()):
            writer.writerow(
                [
                    row.symbol,
                    row.asset_name,
                    row.asset_type.value,
                    row.display_class.value,
                    *[
                        _round_money(row.totals_by_type.get(payment_type, 0.0))
                        for payment_type in PAYMENT_TYPES
                    ],
                    currency,
                    _round_money(total),
                ],
            )

    writer.writerow([])
    writer.writerow(["# POSICOES"])
    writer.writerow(
        [
            "symbol",
            "asset_name",
            "asset_type",
            "quantity",
            "average_price",
            "currency",
            "invested_amount",
        ],
    )
    for row in report.positions:
        writer.writerow(
            [
                row.symbol,
                row.asset_name,
                row.asset_type.value,
                row.quantity,
                _round_money(row.average_price),
                row.currency,
                _round_money(row.invested_amount)
                if row.invested_amount is not None
                else "",
            ],
        )

    return buffer.getvalue()
