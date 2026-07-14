"""Export/import centralizado para página /dados."""

from __future__ import annotations

import csv
import io
from datetime import datetime

from sqlmodel import Session, select

from app.models.asset import Asset
from app.models.dividend_payment import DividendPayment
from app.models.portfolio import AppPreference, Portfolio
from app.models.position import Position
from app.schemas.asset import AssetCreate
from app.schemas.data import AppPreferenceExport, AssetsExportDocument, FullBackupDocument
from app.schemas.portfolio import (
    DividendPaymentExportItem,
    PortfolioExportMeta,
    PositionExportItem,
)
from app.services.asset_service import list_assets, normalize_symbol
from app.services.import_service import _asset_snapshot
from app.services.portfolio_service import list_portfolios


def export_assets_document(session: Session) -> AssetsExportDocument:
    assets = list_assets(session)
    return AssetsExportDocument(
        exported_at=datetime.utcnow(),
        assets=[
            AssetCreate.model_validate(
                asset.model_dump(exclude={"id", "display_class"}),
            )
            for asset in assets
        ],
    )


def export_dividends_csv(session: Session, portfolio_id: int) -> str:
    payments = session.exec(
        select(DividendPayment)
        .where(DividendPayment.portfolio_id == portfolio_id)
        .order_by(DividendPayment.payment_date.desc()),
    ).all()
    asset_ids = {p.asset_id for p in payments}
    assets = {
        a.id: a
        for a in session.exec(select(Asset).where(Asset.id.in_(asset_ids))).all()
    }

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "symbol",
            "payment_type",
            "payment_date",
            "amount",
            "currency",
            "notes",
            "company_cnpj",
            "payer_cnpj",
            "payer_name",
        ],
    )
    for payment in payments:
        asset = assets.get(payment.asset_id)
        if asset is None:
            continue
        writer.writerow(
            [
                asset.symbol,
                payment.payment_type.value,
                payment.payment_date.isoformat(),
                payment.amount,
                payment.currency,
                payment.notes or "",
                payment.company_cnpj or "",
                payment.payer_cnpj or "",
                payment.payer_name or "",
            ],
        )
    return buffer.getvalue()


def export_full_backup(session: Session) -> FullBackupDocument:
    portfolios = list_portfolios(session)
    assets = list_assets(session)
    positions = session.exec(select(Position)).all()
    payments = session.exec(select(DividendPayment)).all()
    prefs = session.exec(select(AppPreference)).all()

    assets_by_id = {a.id: a for a in assets if a.id is not None}
    portfolio_by_id = {p.id: p for p in portfolios if p.id is not None}

    position_items: list[PositionExportItem] = []
    for position in positions:
        asset = assets_by_id.get(position.asset_id)
        if asset is None:
            continue
        position_items.append(
            PositionExportItem(
                symbol=normalize_symbol(asset.symbol),
                quantity=position.quantity,
                average_price=position.average_price,
                invested_amount=position.invested_amount,
                current_value=position.current_value,
                contracted_yield=position.contracted_yield,
                entry_date=position.entry_date,
                custody=position.custody,
                linked_objective=position.linked_objective,
                notes=position.notes,
                status=position.status,
            ),
        )

    dividend_items: list[DividendPaymentExportItem] = []
    for payment in payments:
        asset = assets_by_id.get(payment.asset_id)
        portfolio = portfolio_by_id.get(payment.portfolio_id)
        if asset is None or portfolio is None:
            continue
        dividend_items.append(
            DividendPaymentExportItem(
                symbol=normalize_symbol(asset.symbol),
                payment_type=payment.payment_type,
                payment_date=payment.payment_date,
                amount=payment.amount,
                currency=payment.currency,
                notes=payment.notes,
                company_cnpj=payment.company_cnpj,
                payer_cnpj=payment.payer_cnpj,
                payer_name=payment.payer_name,
            ),
        )

    return FullBackupDocument(
        exported_at=datetime.utcnow(),
        portfolios=[
            PortfolioExportMeta(
                name=p.name,
                description=p.description,
                holder=p.holder,
                objective=p.objective,
                base_currency=p.base_currency,
                status=p.status,
                allocation_targets_json=p.allocation_targets_json,
                notes=p.notes,
                delete_locked=p.delete_locked,
            )
            for p in portfolios
        ],
        assets=[_asset_snapshot(a) for a in assets],
        positions=position_items,
        dividend_payments=dividend_items,
        app_preferences=[AppPreferenceExport(key=p.key, value=p.value) for p in prefs],
    )
