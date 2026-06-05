from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlmodel import Session, select

from app.api.assets import get_asset_lookup_provider
from app.db.session import get_session
from app.models.dividend_payment import DividendPayment
from app.providers.yfinance_asset_provider import AssetLookupProvider
from app.schemas.crypto_fee import BitcoinSnapshotRead
from app.schemas.portfolio import (
    ActivePortfolioRead,
    ImportConfirmRequest,
    ImportConfirmResponse,
    ImportPreviewRequest,
    ImportPreviewResponse,
    PortfolioCreate,
    PortfolioExportDocument,
    PortfolioRead,
    PortfolioUpdate,
    PositionCreate,
    PositionRead,
    PositionUpdate,
    QuoteRefreshResponse,
    SetActivePortfolioRequest,
)
from app.schemas.rebalance import RebalanceSnapshotRead
from app.services.asset_service import get_asset_by_id, list_assets
from app.services.crypto_fee_service import build_bitcoin_snapshot
from app.services.import_service import (
    build_export_document,
    confirm_import,
    preview_import,
)
from app.services.quote_refresh_service import refresh_portfolio_quotes
from app.services.portfolio_service import (
    create_portfolio,
    create_position,
    delete_portfolio,
    delete_position,
    get_active_portfolio_id,
    get_portfolio,
    list_portfolios,
    list_positions,
    set_active_portfolio_id,
    to_portfolio_read,
    to_position_read,
    update_portfolio,
    update_position,
)
from app.services.rebalance_service import build_rebalance_snapshot

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("", response_model=list[PortfolioRead])
def get_portfolios(
    session: Annotated[Session, Depends(get_session)],
) -> list[PortfolioRead]:
    return [to_portfolio_read(p) for p in list_portfolios(session)]


@router.post("", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
def post_portfolio(
    payload: PortfolioCreate,
    session: Annotated[Session, Depends(get_session)],
) -> PortfolioRead:
    return to_portfolio_read(create_portfolio(session, payload))


@router.get("/active", response_model=ActivePortfolioRead)
def get_active_portfolio(
    session: Annotated[Session, Depends(get_session)],
) -> ActivePortfolioRead:
    return ActivePortfolioRead(portfolio_id=get_active_portfolio_id(session))


@router.put("/active", response_model=ActivePortfolioRead)
def put_active_portfolio(
    payload: SetActivePortfolioRequest,
    session: Annotated[Session, Depends(get_session)],
) -> ActivePortfolioRead:
    portfolio_id = set_active_portfolio_id(session, payload.portfolio_id)
    return ActivePortfolioRead(portfolio_id=portfolio_id)


@router.get("/{portfolio_id}", response_model=PortfolioRead)
def get_portfolio_by_id(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> PortfolioRead:
    return to_portfolio_read(get_portfolio(session, portfolio_id))


@router.patch("/{portfolio_id}", response_model=PortfolioRead)
def patch_portfolio(
    portfolio_id: int,
    payload: PortfolioUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> PortfolioRead:
    return to_portfolio_read(update_portfolio(session, portfolio_id, payload))


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_portfolio(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
    cascade: str | None = Query(default=None),
) -> Response:
    delete_portfolio(session, portfolio_id, cascade=cascade == "all")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{portfolio_id}/rebalance", response_model=RebalanceSnapshotRead)
def get_portfolio_rebalance(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> RebalanceSnapshotRead:
    get_portfolio(session, portfolio_id)
    return build_rebalance_snapshot(session, session, portfolio_id)


@router.get("/{portfolio_id}/bitcoin-snapshot", response_model=BitcoinSnapshotRead)
def get_portfolio_bitcoin_snapshot(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
    asset_id: int | None = Query(default=None),
) -> BitcoinSnapshotRead:
    get_portfolio(session, portfolio_id)
    return build_bitcoin_snapshot(session, session, portfolio_id, asset_id=asset_id)


@router.get("/{portfolio_id}/positions", response_model=list[PositionRead])
def get_positions(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> list[PositionRead]:
    return [to_position_read(p) for p in list_positions(session, portfolio_id)]


@router.post(
    "/{portfolio_id}/positions",
    response_model=PositionRead,
    status_code=status.HTTP_201_CREATED,
)
def post_position(
    portfolio_id: int,
    payload: PositionCreate,
    session: Annotated[Session, Depends(get_session)],
) -> PositionRead:
    if get_asset_by_id(session, payload.asset_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="asset not found")
    return to_position_read(create_position(session, portfolio_id, payload))


@router.patch("/{portfolio_id}/positions/{position_id}", response_model=PositionRead)
def patch_position(
    portfolio_id: int,
    position_id: int,
    payload: PositionUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> PositionRead:
    return to_position_read(update_position(session, portfolio_id, position_id, payload))


@router.delete(
    "/{portfolio_id}/positions/{position_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_position(
    portfolio_id: int,
    position_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> Response:
    delete_position(session, portfolio_id, position_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{portfolio_id}/quotes/refresh", response_model=QuoteRefreshResponse)
def post_refresh_portfolio_quotes(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
    provider: Annotated[AssetLookupProvider, Depends(get_asset_lookup_provider)],
) -> QuoteRefreshResponse:
    return refresh_portfolio_quotes(
        session,
        session,
        portfolio_id,
        provider,
    )


@router.get("/{portfolio_id}/export", response_model=PortfolioExportDocument)
def export_portfolio(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> PortfolioExportDocument:
    portfolio = get_portfolio(session, portfolio_id)
    positions = list_positions(session, portfolio_id)
    dividends = list(
        session.exec(
            select(DividendPayment).where(DividendPayment.portfolio_id == portfolio_id),
        ).all(),
    )
    assets_by_id: dict[int, object] = {}
    for asset in list_assets(session):
        if asset.id is not None:
            assets_by_id[asset.id] = asset
    return build_export_document(
        portfolio,
        assets_by_id,  # type: ignore[arg-type]
        positions,
        dividends,
    )


@router.post("/import/preview", response_model=ImportPreviewResponse)
def post_import_preview(
    payload: ImportPreviewRequest,
    session: Annotated[Session, Depends(get_session)],
    provider: Annotated[AssetLookupProvider, Depends(get_asset_lookup_provider)],
) -> ImportPreviewResponse:
    return preview_import(session, payload, provider)


@router.post("/import", response_model=ImportConfirmResponse)
def post_import_confirm(
    payload: ImportConfirmRequest,
    session: Annotated[Session, Depends(get_session)],
    provider: Annotated[AssetLookupProvider, Depends(get_asset_lookup_provider)],
) -> ImportConfirmResponse:
    return confirm_import(session, payload, provider)
