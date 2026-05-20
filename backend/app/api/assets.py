from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlmodel import Session

from app.db.session import get_session
from app.providers.fake_asset_provider import create_asset_lookup_provider
from app.providers.yfinance_asset_provider import AssetLookupProvider
from app.schemas.asset import (
    AssetCreate,
    AssetLookupRead,
    AssetRead,
    AssetUpdate,
    BulkCreateRequest,
    BulkCreateResponse,
    BulkPreviewRequest,
    BulkPreviewResponse,
)
from app.services.asset_service import (
    create_asset,
    create_bulk_assets,
    delete_asset,
    list_assets,
    preview_bulk_assets,
    update_asset,
)

router = APIRouter(prefix="/assets", tags=["assets"])


def get_asset_lookup_provider() -> AssetLookupProvider:
    return create_asset_lookup_provider()


@router.get("", response_model=list[AssetRead])
def get_assets(session: Annotated[Session, Depends(get_session)]) -> list[AssetRead]:
    return list_assets(session)


@router.post("", response_model=AssetRead, status_code=status.HTTP_201_CREATED)
def post_asset(
    payload: AssetCreate,
    session: Annotated[Session, Depends(get_session)],
) -> AssetRead:
    return create_asset(session, payload)


@router.get("/lookup", response_model=AssetLookupRead)
def lookup_asset(
    symbol: Annotated[str, Query(min_length=1)],
    provider: Annotated[AssetLookupProvider, Depends(get_asset_lookup_provider)],
) -> AssetLookupRead:
    try:
        return provider.lookup(symbol)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/bulk/preview", response_model=BulkPreviewResponse)
def post_bulk_preview(
    payload: BulkPreviewRequest,
    session: Annotated[Session, Depends(get_session)],
    provider: Annotated[AssetLookupProvider, Depends(get_asset_lookup_provider)],
) -> BulkPreviewResponse:
    return preview_bulk_assets(session, payload.symbols, provider)


@router.post("/bulk", response_model=BulkCreateResponse)
def post_bulk_assets(
    payload: BulkCreateRequest,
    session: Annotated[Session, Depends(get_session)],
) -> BulkCreateResponse:
    return create_bulk_assets(session, payload.assets)


@router.patch("/{asset_id}", response_model=AssetRead)
def patch_asset(
    asset_id: int,
    payload: AssetUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> AssetRead:
    return update_asset(session, asset_id, payload)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_asset(
    asset_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> Response:
    delete_asset(session, asset_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
