from datetime import date

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.asset import Asset, AssetMarket
from app.models.dividend_payment import DividendPayment, DividendPaymentType
from app.models.portfolio import Portfolio
from app.schemas.dividend_payment import (
    BulkDividendCreateItemResult,
    BulkDividendCreateResponse,
    BulkDividendImportRow,
    BulkDividendPreviewItem,
    BulkDividendPreviewResponse,
    DividendPaymentCreate,
    DividendPaymentRead,
    DividendPaymentUpdate,
)
from app.services.asset_service import get_asset_by_id, get_asset_by_symbol, normalize_symbol


def _ensure_portfolio_exists(session: Session, portfolio_id: int | None) -> None:
    if portfolio_id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="portfolio_id is required",
        )
    if session.get(Portfolio, portfolio_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="portfolio not found",
        )


def _normalize_amount_fields(data: dict, *, prefer_amount: bool = False) -> dict:
    gross = data.get("gross_amount")
    tax = data.get("tax_withheld")
    amount = data.get("amount")

    if prefer_amount and amount is not None:
        amount_val = float(amount)
        if amount_val <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="amount must be greater than zero",
            )
        data["amount"] = amount_val
        data["gross_amount"] = amount_val
        data["tax_withheld"] = 0.0 if tax is None else float(tax)
        return data

    if gross is not None:
        gross_val = float(gross)
        tax_val = 0.0 if tax is None else float(tax)
        if gross_val <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="gross_amount must be greater than zero",
            )
        if tax_val < 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="tax_withheld cannot be negative",
            )
        if tax_val > gross_val:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="tax_withheld cannot exceed gross_amount",
            )
        net = gross_val - tax_val
        if net <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="amount must be greater than zero",
            )
        data["amount"] = net
        data["gross_amount"] = gross_val
        data["tax_withheld"] = tax_val
        return data

    if amount is not None:
        amount_val = float(amount)
        if amount_val <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="amount must be greater than zero",
            )
        data["amount"] = amount_val
        if gross is None:
            data["gross_amount"] = amount_val
        if tax is None:
            data["tax_withheld"] = 0.0

    return data


def validate_dividend_payment(
    session: Session,
    payload: DividendPaymentCreate,
) -> None:
    _ensure_portfolio_exists(session, payload.portfolio_id)


def to_dividend_payment_read(payment: DividendPayment, asset: Asset) -> DividendPaymentRead:
    return DividendPaymentRead(
        id=payment.id,  # type: ignore[arg-type]
        asset_id=payment.asset_id,
        portfolio_id=payment.portfolio_id,
        payment_type=payment.payment_type,
        payment_date=payment.payment_date,
        amount=payment.amount,
        gross_amount=payment.gross_amount,
        tax_withheld=payment.tax_withheld,
        currency=payment.currency,
        notes=payment.notes,
        company_cnpj=payment.company_cnpj,
        payer_cnpj=payment.payer_cnpj,
        payer_name=payment.payer_name,
        symbol=asset.symbol,
        asset_name=asset.name,
        market=asset.market,
        display_class=asset.display_class,
    )


def _asset_matches_symbol(asset: Asset, symbol_query: str) -> bool:
    query = symbol_query.upper()
    return query in asset.symbol.upper() or query in asset.name.upper()


def list_dividend_payments(
    session: Session,
    *,
    asset_id: int | None = None,
    portfolio_id: int | None = None,
    payment_type: DividendPaymentType | None = None,
    market: AssetMarket | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    symbol: str | None = None,
) -> list[DividendPaymentRead]:
    statement = select(DividendPayment).order_by(
        DividendPayment.payment_date.desc(),
        DividendPayment.id.desc(),
    )
    if asset_id is not None:
        statement = statement.where(DividendPayment.asset_id == asset_id)
    if portfolio_id is not None:
        statement = statement.where(DividendPayment.portfolio_id == portfolio_id)
    if payment_type is not None:
        statement = statement.where(DividendPayment.payment_type == payment_type)
    if from_date is not None:
        statement = statement.where(DividendPayment.payment_date >= from_date)
    if to_date is not None:
        statement = statement.where(DividendPayment.payment_date <= to_date)

    payments = session.exec(statement).all()
    if not payments:
        return []

    asset_ids = {payment.asset_id for payment in payments}
    assets = {
        asset.id: asset
        for asset in session.exec(select(Asset).where(Asset.id.in_(asset_ids))).all()
    }

    symbol_query = normalize_symbol(symbol) if symbol and symbol.strip() else None
    results: list[DividendPaymentRead] = []
    for payment in payments:
        asset = assets.get(payment.asset_id)
        if asset is None:
            continue
        if market is not None and asset.market != market:
            continue
        if symbol_query is not None and not _asset_matches_symbol(asset, symbol_query):
            continue
        results.append(to_dividend_payment_read(payment, asset))

    return results


def get_dividend_payment_by_id(session: Session, payment_id: int) -> DividendPayment | None:
    return session.get(DividendPayment, payment_id)


def get_dividend_payment_read(session: Session, payment_id: int) -> DividendPaymentRead:
    payment = get_dividend_payment_by_id(session, payment_id)
    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="dividend payment not found",
        )
    asset = get_asset_by_id(session, payment.asset_id)
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="asset not found",
        )
    return to_dividend_payment_read(payment, asset)


def create_dividend_payment(
    session: Session,
    payload: DividendPaymentCreate,
    *,
    commit: bool = True,
) -> DividendPaymentRead:
    validate_dividend_payment(session, payload)
    asset = get_asset_by_id(session, payload.asset_id)
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="asset not found",
        )

    data = _normalize_amount_fields(payload.model_dump())
    if not data.get("currency"):
        data["currency"] = asset.currency

    payment = DividendPayment(**data)
    session.add(payment)
    if commit:
        session.commit()
        session.refresh(payment)
    else:
        session.flush()
    return to_dividend_payment_read(payment, asset)


def update_dividend_payment(
    session: Session,
    payment_id: int,
    payload: DividendPaymentUpdate,
) -> DividendPaymentRead:
    payment = get_dividend_payment_by_id(session, payment_id)
    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="dividend payment not found",
        )

    updates = payload.model_dump(exclude_unset=True)
    amount_fields = {"amount", "gross_amount", "tax_withheld"}
    if amount_fields.intersection(updates):
        merged = payment.model_dump()
        merged.update(updates)
        touched = amount_fields.intersection(updates.keys())
        prefer_amount = touched == {"amount"}
        merged = _normalize_amount_fields(merged, prefer_amount=prefer_amount)
        for key in amount_fields:
            updates[key] = merged[key]

    if "portfolio_id" in updates:
        _ensure_portfolio_exists(session, updates["portfolio_id"])

    asset_id = updates.get("asset_id", payment.asset_id)
    asset = get_asset_by_id(session, asset_id)
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="asset not found",
        )

    for key, value in updates.items():
        setattr(payment, key, value)

    if not payment.currency:
        payment.currency = asset.currency

    session.add(payment)
    session.commit()
    session.refresh(payment)
    return to_dividend_payment_read(payment, asset)


def delete_dividend_payment(session: Session, payment_id: int) -> None:
    payment = get_dividend_payment_by_id(session, payment_id)
    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="dividend payment not found",
        )
    session.delete(payment)
    session.commit()


def delete_dividend_payments_for_portfolio(session: Session, portfolio_id: int) -> int:
    payments = session.exec(
        select(DividendPayment).where(DividendPayment.portfolio_id == portfolio_id),
    ).all()
    for payment in payments:
        session.delete(payment)
    return len(payments)


def _build_create_payload(
    row: BulkDividendImportRow,
    asset: Asset,
    portfolio_id: int | None,
) -> DividendPaymentCreate:
    currency = (row.currency or "").strip() or asset.currency
    return DividendPaymentCreate(
        asset_id=asset.id,  # type: ignore[arg-type]
        portfolio_id=portfolio_id,  # type: ignore[arg-type]
        payment_type=row.payment_type,
        payment_date=row.payment_date,
        amount=row.amount,
        currency=currency,
        notes=row.notes,
        company_cnpj=row.company_cnpj,
        payer_cnpj=row.payer_cnpj,
        payer_name=row.payer_name,
    )


def preview_bulk_dividend_payments(
    session: Session,
    items: list[BulkDividendImportRow],
    portfolio_id: int | None = None,
) -> BulkDividendPreviewResponse:
    if portfolio_id is not None:
        _ensure_portfolio_exists(session, portfolio_id)

    results: list[BulkDividendPreviewItem] = []

    for row in items:
        symbol = normalize_symbol(row.symbol)
        if not symbol:
            results.append(
                BulkDividendPreviewItem(
                    row_index=row.row_index,
                    symbol=row.symbol,
                    status="error",
                    detail="ticker inválido ou vazio",
                )
            )
            continue

        if row.amount <= 0:
            results.append(
                BulkDividendPreviewItem(
                    row_index=row.row_index,
                    symbol=symbol,
                    status="error",
                    detail="amount must be greater than zero",
                )
            )
            continue

        asset = get_asset_by_symbol(session, symbol)
        if asset is None:
            results.append(
                BulkDividendPreviewItem(
                    row_index=row.row_index,
                    symbol=symbol,
                    status="error",
                    detail="asset not found",
                )
            )
            continue

        payload = _build_create_payload(row, asset, portfolio_id)
        results.append(
            BulkDividendPreviewItem(
                row_index=row.row_index,
                symbol=asset.symbol,
                status="ready",
                payload=payload,
            )
        )

    return BulkDividendPreviewResponse(items=results)


def create_bulk_dividend_payments(
    session: Session,
    payloads: list[DividendPaymentCreate],
    portfolio_id: int | None = None,
) -> BulkDividendCreateResponse:
    if portfolio_id is None and any(p.portfolio_id is None for p in payloads):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="portfolio_id is required for bulk import",
        )

    results: list[BulkDividendCreateItemResult] = []

    for payload in payloads:
        symbol = "?"
        try:
            effective_payload = (
                payload.model_copy(update={"portfolio_id": portfolio_id})
                if portfolio_id is not None
                else payload
            )
            validate_dividend_payment(session, effective_payload)
            asset = get_asset_by_id(session, effective_payload.asset_id)
            if asset is None:
                results.append(
                    BulkDividendCreateItemResult(
                        symbol=symbol,
                        status="error",
                        detail="asset not found",
                    )
                )
                continue

            symbol = asset.symbol
            payment = create_dividend_payment(session, effective_payload)
            results.append(
                BulkDividendCreateItemResult(
                    symbol=symbol,
                    status="created",
                    payment=payment,
                )
            )
        except HTTPException as exc:
            results.append(
                BulkDividendCreateItemResult(
                    symbol=symbol,
                    status="error",
                    detail=str(exc.detail),
                )
            )
        except Exception as exc:
            results.append(
                BulkDividendCreateItemResult(
                    symbol=symbol,
                    status="error",
                    detail=str(exc),
                )
            )

    return BulkDividendCreateResponse(results=results)
