import logging
from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.asset import Asset
from app.models.portfolio import Portfolio
from app.models.position import Position
from app.providers.yfinance_asset_provider import AssetLookupProvider
from app.schemas.asset import AssetCreate, AssetRead, AssetUpdate
from app.schemas.portfolio import (
    COMPARE_ASSET_FIELDS,
    EXPORT_VERSION,
    ImportAssetPreviewItem,
    ImportAssetResolution,
    ImportConfirmRequest,
    ImportConfirmResponse,
    ImportConflictField,
    ImportPreviewRequest,
    ImportPreviewResponse,
    PortfolioCreate,
    PortfolioExportDocument,
    PortfolioExportMeta,
    PositionCreate,
    PositionExportItem,
    PositionUpdate,
)
from app.services.asset_service import (
    _symbol_keys,
    create_asset,
    get_asset_by_id,
    normalize_symbol,
    update_asset,
)
from app.services.portfolio_service import (
    create_portfolio,
    create_position,
    delete_portfolio,
    get_portfolio,
    resolve_unique_portfolio_name,
    update_position,
)

logger = logging.getLogger(__name__)


def _field_to_str(value: object | None) -> str | None:
    if value is None:
        return None
    return str(value)


def _find_asset_by_symbol(session: Session, symbol: str) -> Asset | None:
    keys = _symbol_keys(symbol)
    for asset in session.exec(select(Asset)).all():
        if _symbol_keys(asset.symbol) & keys:
            return asset
    return None


def _asset_snapshot(asset: Asset) -> AssetCreate:
    return AssetCreate.model_validate(
        asset.model_dump(exclude={"id", "display_class"}),
    )


def _diff_fields(base: AssetCreate, file: AssetCreate) -> list[ImportConflictField]:
    fields: list[ImportConflictField] = []
    for field_name in COMPARE_ASSET_FIELDS:
        base_val = getattr(base, field_name, None)
        file_val = getattr(file, field_name, None)
        if _field_to_str(base_val) != _field_to_str(file_val):
            fields.append(
                ImportConflictField(
                    field=field_name,
                    base_value=_field_to_str(base_val),
                    file_value=_field_to_str(file_val),
                    resolution="keep_base",
                ),
            )
    return fields


def _lookup_to_create(lookup: object, symbol: str) -> AssetCreate:
    return AssetCreate(
        symbol=symbol,
        name=lookup.name,
        asset_type=lookup.asset_type,
        market=lookup.market,
        country=lookup.country,
        currency=lookup.currency,
        sector=getattr(lookup, "sector", None),
        subsector=getattr(lookup, "subsector", None),
        segment=getattr(lookup, "segment", None),
        company_cnpj=getattr(lookup, "company_cnpj", None),
        payer_cnpj=getattr(lookup, "payer_cnpj", None),
        payer_name=getattr(lookup, "payer_name", None),
        quote_source=getattr(lookup, "quote_source", None),
        current_quote=getattr(lookup, "current_quote", None),
        notes=None,
    )


def validate_export_document(document: PortfolioExportDocument) -> None:
    if document.version != EXPORT_VERSION:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"unsupported export version: {document.version}",
        )


def build_export_document(
    portfolio: Portfolio,
    assets_by_id: dict[int, Asset],
    positions: list[Position],
) -> PortfolioExportDocument:
    asset_creates: list[AssetCreate] = []
    position_items: list[PositionExportItem] = []
    seen_symbols: set[str] = set()

    for position in positions:
        asset = assets_by_id.get(position.asset_id)
        if asset is None:
            continue
        symbol = normalize_symbol(asset.symbol)
        if symbol not in seen_symbols:
            seen_symbols.add(symbol)
            asset_creates.append(_asset_snapshot(asset))
        position_items.append(
            PositionExportItem(
                symbol=symbol,
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

    return PortfolioExportDocument(
        version=EXPORT_VERSION,
        exported_at=datetime.utcnow(),
        portfolio=PortfolioExportMeta(
            name=portfolio.name,
            description=portfolio.description,
            holder=portfolio.holder,
            objective=portfolio.objective,
            base_currency=portfolio.base_currency,
            status=portfolio.status,
            allocation_targets_json=portfolio.allocation_targets_json,
            notes=portfolio.notes,
        ),
        assets=asset_creates,
        positions=position_items,
    )


def preview_import(
    assets_session: Session,
    payload: ImportPreviewRequest,
    provider: AssetLookupProvider,
) -> ImportPreviewResponse:
    validate_export_document(payload.document)
    doc = payload.document
    logger.info(
        "import_preview portfolio_name=%s assets=%s positions=%s",
        doc.portfolio.name,
        len(doc.assets),
        len(doc.positions),
    )
    preview_assets: list[ImportAssetPreviewItem] = []
    seen: set[str] = set()

    for file_asset in doc.assets:
        symbol = normalize_symbol(file_asset.symbol)
        if symbol in seen:
            continue
        seen.add(symbol)

        existing = _find_asset_by_symbol(assets_session, symbol)
        if existing is None:
            lookup_create: AssetCreate | None = None
            try:
                lookup = provider.lookup(symbol)
                lookup_create = _lookup_to_create(lookup, symbol)
            except Exception:
                lookup_create = None
            preview_assets.append(
                ImportAssetPreviewItem(
                    symbol=symbol,
                    status="missing",
                    file_asset=file_asset,
                    lookup=lookup_create,
                ),
            )
            continue

        base = _asset_snapshot(existing)
        fields = _diff_fields(base, file_asset)
        if fields:
            preview_assets.append(
                ImportAssetPreviewItem(
                    symbol=symbol,
                    status="conflict",
                    base_asset=AssetRead.model_validate(existing),
                    file_asset=file_asset,
                    fields=fields,
                ),
            )
        else:
            preview_assets.append(
                ImportAssetPreviewItem(
                    symbol=symbol,
                    status="exists_ok",
                    base_asset=AssetRead.model_validate(existing),
                    file_asset=file_asset,
                ),
            )

    return ImportPreviewResponse(
        portfolio=doc.portfolio,
        assets=preview_assets,
        positions=doc.positions,
        target_portfolio_id=None,
    )


def _apply_field_resolutions(
    file_asset: AssetCreate,
    fields: list[ImportConflictField],
) -> AssetUpdate:
    updates: dict[str, object] = {}
    for field in fields:
        if field.resolution == "keep_base":
            continue
        if field.resolution == "custom":
            raw = field.custom_value
        elif field.resolution == "use_file":
            raw = getattr(file_asset, field.field, None)
        else:
            continue
        if field.field == "current_quote" and raw not in (None, ""):
            try:
                updates[field.field] = float(raw)
            except (TypeError, ValueError):
                updates[field.field] = getattr(file_asset, field.field, None)
        else:
            updates[field.field] = raw if raw != "" else None
    return AssetUpdate(**updates)


def _resolve_asset_id(
    assets_session: Session,
    resolution: ImportAssetResolution,
    file_by_symbol: dict[str, AssetCreate],
    provider: AssetLookupProvider,
) -> tuple[int, bool, bool]:
    """Returns (asset_id, was_created, was_updated)."""
    symbol = normalize_symbol(resolution.symbol)
    existing = _find_asset_by_symbol(assets_session, symbol)
    file_asset = resolution.asset_create or file_by_symbol.get(symbol)

    if resolution.action == "keep":
        if existing is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"asset {symbol} not in base",
            )
        return existing.id, False, False  # type: ignore[return-value]

    if resolution.action == "create":
        payload = file_asset
        if payload is None:
            try:
                lookup = provider.lookup(symbol)
                payload = _lookup_to_create(lookup, symbol)
            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"lookup failed for {symbol}: {exc}",
                ) from exc
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"asset {symbol} already exists",
            )
        asset = create_asset(assets_session, payload)
        return asset.id, True, False  # type: ignore[return-value]

    if resolution.action == "update":
        if existing is None:
            if file_asset is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"no data to update asset {symbol}",
                )
            asset = create_asset(assets_session, file_asset)
            return asset.id, True, False  # type: ignore[return-value]
        if file_asset and resolution.fields:
            patch = _apply_field_resolutions(file_asset, resolution.fields)
            if patch.model_dump(exclude_unset=True):
                updated = update_asset(assets_session, existing.id, patch)  # type: ignore[arg-type]
                return updated.id, False, True  # type: ignore[return-value]
        return existing.id, False, False  # type: ignore[return-value]

    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail=f"unknown action {resolution.action}",
    )


def default_resolution_for_preview(item: ImportAssetPreviewItem) -> ImportAssetResolution:
    if item.status == "missing":
        return ImportAssetResolution(
            symbol=item.symbol,
            action="create",
            asset_create=item.lookup or item.file_asset,
        )
    if item.status == "conflict":
        return ImportAssetResolution(
            symbol=item.symbol,
            action="update",
            asset_create=item.file_asset,
            fields=item.fields,
        )
    return ImportAssetResolution(symbol=item.symbol, action="keep")


def confirm_import(
    assets_session: Session,
    portfolios_session: Session,
    payload: ImportConfirmRequest,
    provider: AssetLookupProvider,
) -> ImportConfirmResponse:
    validate_export_document(payload.document)
    doc = payload.document
    file_by_symbol = {normalize_symbol(a.symbol): a for a in doc.assets}
    logger.info(
        "import_confirm portfolio_name=%s resolutions=%s create_new=%s target_id=%s",
        doc.portfolio.name,
        len(payload.asset_resolutions),
        payload.create_new_portfolio,
        payload.target_portfolio_id,
    )

    portfolio: Portfolio | None = None
    portfolio_created = False
    portfolio_name_adjusted = False

    try:
        if payload.target_portfolio_id is not None:
            portfolio = get_portfolio(portfolios_session, payload.target_portfolio_id)
        elif payload.create_new_portfolio:
            meta = doc.portfolio
            resolved_name, portfolio_name_adjusted = resolve_unique_portfolio_name(
                portfolios_session,
                meta.name,
            )
            portfolio = create_portfolio(
                portfolios_session,
                PortfolioCreate(
                    name=resolved_name,
                    description=meta.description,
                    holder=meta.holder,
                    objective=meta.objective,
                    base_currency=meta.base_currency,
                    status=meta.status,
                    allocation_targets_json=meta.allocation_targets_json,
                    notes=meta.notes,
                ),
            )
            portfolio_created = True
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="target_portfolio_id or create_new_portfolio required",
            )

        created = 0
        updated = 0
        symbol_to_asset_id: dict[str, int] = {}

        for resolution in payload.asset_resolutions:
            symbol = normalize_symbol(resolution.symbol)
            asset_id, was_created, was_updated = _resolve_asset_id(
                assets_session,
                resolution,
                file_by_symbol,
                provider,
            )
            symbol_to_asset_id[symbol] = asset_id
            if was_created:
                created += 1
            if was_updated:
                updated += 1

        positions_imported = 0
        for pos_item in doc.positions:
            symbol = normalize_symbol(pos_item.symbol)
            asset_id = symbol_to_asset_id.get(symbol)
            if asset_id is None:
                existing = _find_asset_by_symbol(assets_session, symbol)
                if existing is None:
                    continue
                asset_id = existing.id  # type: ignore[assignment]

            existing_pos = portfolios_session.exec(
                select(Position).where(
                    Position.portfolio_id == portfolio.id,
                    Position.asset_id == asset_id,
                ),
            ).first()
            if existing_pos is None:
                create_position(
                    portfolios_session,
                    portfolio.id,  # type: ignore[arg-type]
                    PositionCreate(
                        asset_id=asset_id,
                        quantity=pos_item.quantity,
                        average_price=pos_item.average_price,
                        invested_amount=pos_item.invested_amount,
                        current_value=pos_item.current_value,
                        contracted_yield=pos_item.contracted_yield,
                        entry_date=pos_item.entry_date,
                        custody=pos_item.custody,
                        linked_objective=pos_item.linked_objective,
                        notes=pos_item.notes,
                        status=pos_item.status,
                    ),
                )
            else:
                update_position(
                    portfolios_session,
                    portfolio.id,  # type: ignore[arg-type]
                    existing_pos.id,  # type: ignore[arg-type]
                    PositionUpdate(
                        quantity=pos_item.quantity,
                        average_price=pos_item.average_price,
                        invested_amount=pos_item.invested_amount,
                        current_value=pos_item.current_value,
                        contracted_yield=pos_item.contracted_yield,
                        entry_date=pos_item.entry_date,
                        custody=pos_item.custody,
                        linked_objective=pos_item.linked_objective,
                        notes=pos_item.notes,
                        status=pos_item.status,
                    ),
                )
            positions_imported += 1

        logger.info(
            "import_confirm_done portfolio_id=%s positions=%s assets_created=%s",
            portfolio.id,
            positions_imported,
            created,
        )
        return ImportConfirmResponse(
            portfolio_id=portfolio.id,  # type: ignore[arg-type]
            portfolio_name=portfolio.name,
            portfolio_name_adjusted=portfolio_name_adjusted,
            assets_created=created,
            assets_updated=updated,
            positions_imported=positions_imported,
        )
    except HTTPException as exc:
        if portfolio_created and portfolio is not None and portfolio.id is not None:
            try:
                delete_portfolio(portfolios_session, portfolio.id)
                logger.warning(
                    "import_rollback deleted portfolio_id=%s after failure: %s",
                    portfolio.id,
                    exc.detail,
                )
            except Exception:
                logger.exception(
                    "import_rollback failed portfolio_id=%s",
                    portfolio.id,
                )
        else:
            logger.warning("import_confirm failed: %s", exc.detail)
        raise
    except Exception:
        if portfolio_created and portfolio is not None and portfolio.id is not None:
            try:
                delete_portfolio(portfolios_session, portfolio.id)
                logger.warning("import_rollback deleted portfolio_id=%s", portfolio.id)
            except Exception:
                logger.exception(
                    "import_rollback failed portfolio_id=%s",
                    portfolio.id,
                )
        logger.exception("import_confirm unexpected error")
        raise
