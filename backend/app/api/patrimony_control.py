from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.patrimony_control import (
    ManualPatrimonyItemCreate,
    ManualPatrimonyItemRead,
    ManualPatrimonyItemUpdate,
    PatrimonyControlSnapshotRead,
)
from app.services.patrimony_control_service import (
    build_patrimony_control_snapshot,
    create_manual_patrimony_item,
    delete_manual_patrimony_item,
    update_manual_patrimony_item,
    _item_to_read,
)

router = APIRouter(
    prefix="/portfolios/{portfolio_id}",
    tags=["patrimony-control"],
)


@router.get("/patrimony-control", response_model=PatrimonyControlSnapshotRead)
def get_patrimony_control_snapshot(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> PatrimonyControlSnapshotRead:
    return build_patrimony_control_snapshot(session, portfolio_id)


@router.post(
    "/manual-patrimony-items",
    response_model=ManualPatrimonyItemRead,
    status_code=status.HTTP_201_CREATED,
)
def post_manual_patrimony_item(
    portfolio_id: int,
    payload: ManualPatrimonyItemCreate,
    session: Annotated[Session, Depends(get_session)],
) -> ManualPatrimonyItemRead:
    item = create_manual_patrimony_item(session, portfolio_id, payload)
    return _item_to_read(item)


@router.patch(
    "/manual-patrimony-items/{item_id}",
    response_model=ManualPatrimonyItemRead,
)
def patch_manual_patrimony_item(
    portfolio_id: int,
    item_id: int,
    payload: ManualPatrimonyItemUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> ManualPatrimonyItemRead:
    item = update_manual_patrimony_item(session, portfolio_id, item_id, payload)
    return _item_to_read(item)


@router.delete("/manual-patrimony-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_manual_patrimony_item(
    portfolio_id: int,
    item_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_manual_patrimony_item(session, portfolio_id, item_id)
