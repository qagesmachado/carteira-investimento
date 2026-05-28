from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import PlainTextResponse
from sqlmodel import Session

from app.api.assets import get_asset_lookup_provider
from app.db.session import get_session
from app.providers.yfinance_asset_provider import AssetLookupProvider
from app.schemas.asset import BulkCreateRequest, BulkCreateResponse, BulkPreviewRequest, BulkPreviewResponse
from app.schemas.data import AssetsExportDocument, FullBackupDocument
from app.schemas.dividend_payment import BulkDividendCreateRequest, BulkDividendCreateResponse, BulkDividendPreviewRequest, BulkDividendPreviewResponse
from app.services.asset_service import create_bulk_assets, preview_bulk_assets
from app.services.data_service import export_assets_document, export_dividends_csv, export_full_backup
from app.services.dividend_payment_service import create_bulk_dividend_payments, preview_bulk_dividend_payments
from app.services.portfolio_service import get_portfolio

router = APIRouter(prefix="/data", tags=["data"])


@router.get("/export/assets", response_model=AssetsExportDocument)
def get_export_assets(
    session: Annotated[Session, Depends(get_session)],
) -> AssetsExportDocument:
    return export_assets_document(session)


@router.get("/export/dividends")
def get_export_dividends(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
    format: str = Query(default="csv", pattern="^(csv|json)$"),
) -> Response:
    get_portfolio(session, portfolio_id)
    if format == "csv":
        content = export_dividends_csv(session, portfolio_id)
        return PlainTextResponse(content, media_type="text/csv")
    from app.services.dividend_payment_service import list_dividend_payments

    items = list_dividend_payments(session, portfolio_id=portfolio_id)
    return Response(
        content=__import__("json").dumps([i.model_dump(mode="json") for i in items]),
        media_type="application/json",
    )


@router.get("/export/full", response_model=FullBackupDocument)
def get_export_full(
    session: Annotated[Session, Depends(get_session)],
) -> FullBackupDocument:
    return export_full_backup(session)


@router.post("/import/assets/preview", response_model=BulkPreviewResponse)
def post_import_assets_preview(
    payload: BulkPreviewRequest,
    session: Annotated[Session, Depends(get_session)],
    provider: Annotated[AssetLookupProvider, Depends(get_asset_lookup_provider)],
) -> BulkPreviewResponse:
    return preview_bulk_assets(session, payload.symbols, provider)


@router.post("/import/assets/confirm", response_model=BulkCreateResponse)
def post_import_assets_confirm(
    payload: BulkCreateRequest,
    session: Annotated[Session, Depends(get_session)],
) -> BulkCreateResponse:
    return create_bulk_assets(session, payload.assets)


@router.post("/import/dividends/preview", response_model=BulkDividendPreviewResponse)
def post_import_dividends_preview(
    payload: BulkDividendPreviewRequest,
    session: Annotated[Session, Depends(get_session)],
) -> BulkDividendPreviewResponse:
    return preview_bulk_dividend_payments(
        session,
        payload.items,
        portfolio_id=payload.portfolio_id,
    )


@router.post("/import/dividends/confirm", response_model=BulkDividendCreateResponse)
def post_import_dividends_confirm(
    payload: BulkDividendCreateRequest,
    session: Annotated[Session, Depends(get_session)],
) -> BulkDividendCreateResponse:
    return create_bulk_dividend_payments(
        session,
        payload.payments,
        portfolio_id=payload.portfolio_id,
    )
