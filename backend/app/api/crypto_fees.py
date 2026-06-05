from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlmodel import Session

from app.db.session import get_session
from app.models.crypto_fee import CryptoFeeType
from app.schemas.crypto_fee import (
    CryptoFeeCreate,
    CryptoFeeRead,
    CryptoFeeUpdate,
)
from app.services.crypto_fee_service import (
    create_crypto_fee,
    delete_crypto_fee,
    get_crypto_fee_read,
    list_crypto_fees,
    update_crypto_fee,
)

router = APIRouter(prefix="/crypto-fees", tags=["crypto-fees"])


@router.get("", response_model=list[CryptoFeeRead])
def get_crypto_fees(
    session: Annotated[Session, Depends(get_session)],
    portfolio_id: int | None = None,
    asset_id: int | None = None,
    fee_type: CryptoFeeType | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
) -> list[CryptoFeeRead]:
    return list_crypto_fees(
        session,
        portfolio_id=portfolio_id,
        asset_id=asset_id,
        fee_type=fee_type,
        from_date=from_date,
        to_date=to_date,
    )


@router.post("", response_model=CryptoFeeRead, status_code=status.HTTP_201_CREATED)
def post_crypto_fee(
    payload: CryptoFeeCreate,
    session: Annotated[Session, Depends(get_session)],
) -> CryptoFeeRead:
    return create_crypto_fee(session, payload)


@router.get("/{fee_id}", response_model=CryptoFeeRead)
def get_crypto_fee(
    fee_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> CryptoFeeRead:
    return get_crypto_fee_read(session, fee_id)


@router.patch("/{fee_id}", response_model=CryptoFeeRead)
def patch_crypto_fee(
    fee_id: int,
    payload: CryptoFeeUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> CryptoFeeRead:
    return update_crypto_fee(session, fee_id, payload)


@router.delete("/{fee_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_crypto_fee(
    fee_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> Response:
    delete_crypto_fee(session, fee_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
