from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlmodel import Session

from app.db.session import get_session
from app.models.asset import AssetMarket
from app.models.dividend_payment import DividendPaymentType
from app.schemas.dividend_payment import (
    BulkDividendCreateRequest,
    BulkDividendCreateResponse,
    BulkDividendPreviewRequest,
    BulkDividendPreviewResponse,
    DividendPaymentCreate,
    DividendPaymentRead,
    DividendPaymentUpdate,
)
from app.services.dividend_payment_service import (
    create_bulk_dividend_payments,
    create_dividend_payment,
    delete_dividend_payment,
    get_dividend_payment_read,
    list_dividend_payments,
    preview_bulk_dividend_payments,
    update_dividend_payment,
)

router = APIRouter(prefix="/dividend-payments", tags=["dividend-payments"])


@router.get("", response_model=list[DividendPaymentRead])
def get_dividend_payments(
    session: Annotated[Session, Depends(get_session)],
    asset_id: int | None = None,
    portfolio_id: int | None = None,
    payment_type: DividendPaymentType | None = None,
    market: AssetMarket | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    symbol: str | None = Query(default=None, min_length=1),
) -> list[DividendPaymentRead]:
    return list_dividend_payments(
        session,
        asset_id=asset_id,
        portfolio_id=portfolio_id,
        payment_type=payment_type,
        market=market,
        from_date=from_date,
        to_date=to_date,
        symbol=symbol,
    )


@router.post("", response_model=DividendPaymentRead, status_code=status.HTTP_201_CREATED)
def post_dividend_payment(
    payload: DividendPaymentCreate,
    session: Annotated[Session, Depends(get_session)],
) -> DividendPaymentRead:
    return create_dividend_payment(session, payload)


@router.post("/bulk/preview", response_model=BulkDividendPreviewResponse)
def post_dividend_payments_bulk_preview(
    payload: BulkDividendPreviewRequest,
    session: Annotated[Session, Depends(get_session)],
) -> BulkDividendPreviewResponse:
    return preview_bulk_dividend_payments(
        session,
        payload.items,
        portfolio_id=payload.portfolio_id,
    )


@router.post("/bulk", response_model=BulkDividendCreateResponse)
def post_dividend_payments_bulk(
    payload: BulkDividendCreateRequest,
    session: Annotated[Session, Depends(get_session)],
) -> BulkDividendCreateResponse:
    return create_bulk_dividend_payments(
        session,
        payload.payments,
        portfolio_id=payload.portfolio_id,
    )


@router.get("/{payment_id}", response_model=DividendPaymentRead)
def get_dividend_payment(
    payment_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> DividendPaymentRead:
    return get_dividend_payment_read(session, payment_id)


@router.patch("/{payment_id}", response_model=DividendPaymentRead)
def patch_dividend_payment(
    payment_id: int,
    payload: DividendPaymentUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> DividendPaymentRead:
    return update_dividend_payment(session, payment_id, payload)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dividend_payment_route(
    payment_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> Response:
    delete_dividend_payment(session, payment_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
