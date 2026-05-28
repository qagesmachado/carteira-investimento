from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.fx import UsdBrlRead, UsdBrlRefreshResponse
from app.services.fx_service import get_usd_brl_state, refresh_usd_brl

router = APIRouter(prefix="/fx", tags=["fx"])


@router.get("/usd-brl", response_model=UsdBrlRead)
def get_usd_brl(
    session: Annotated[Session, Depends(get_session)],
) -> UsdBrlRead:
    rate, refreshed_at = get_usd_brl_state(session)
    return UsdBrlRead(rate=rate, refreshed_at=refreshed_at)


@router.post("/usd-brl/refresh", response_model=UsdBrlRefreshResponse)
def post_refresh_usd_brl(
    session: Annotated[Session, Depends(get_session)],
) -> UsdBrlRefreshResponse:
    rate, refreshed_at = refresh_usd_brl(session)
    return UsdBrlRefreshResponse(rate=rate, refreshed_at=refreshed_at)
