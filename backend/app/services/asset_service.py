from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.asset import Asset, AssetMarket, AssetType, DisplayClass, EtfSubtype
from app.providers.yfinance_asset_provider import AssetLookupProvider
from app.schemas.asset import (
    AssetCreate,
    AssetLookupRead,
    AssetRead,
    AssetUpdate,
    BulkCreateItemResult,
    BulkCreateResponse,
    BulkPreviewItem,
    BulkPreviewResponse,
)


def normalize_symbol(symbol: str) -> str:
    return symbol.strip().upper()


def infer_display_class(
    asset_type: AssetType,
    market: AssetMarket,
    etf_subtype: EtfSubtype | None,
) -> DisplayClass:
    if asset_type == AssetType.ETF and market == AssetMarket.NATIONAL:
        if etf_subtype == EtfSubtype.FIXED_INCOME:
            return DisplayClass.FIXED_INCOME
        return DisplayClass.STOCKS

    if asset_type == AssetType.ETF and market == AssetMarket.INTERNATIONAL:
        return DisplayClass.INTERNATIONAL

    match asset_type:
        case AssetType.STOCK:
            return DisplayClass.STOCKS
        case AssetType.FII:
            return DisplayClass.FUNDS
        case AssetType.FIXED_INCOME:
            return DisplayClass.FIXED_INCOME
        case AssetType.CRYPTO:
            return DisplayClass.CRYPTO
        case AssetType.PENSION:
            return DisplayClass.PENSION
        case _:
            return DisplayClass.OTHER


def validate_asset(payload: AssetCreate) -> None:
    if payload.market == AssetMarket.INTERNATIONAL and not payload.country:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="country is required for international assets",
        )

    if (
        payload.asset_type == AssetType.ETF
        and payload.market == AssetMarket.NATIONAL
        and payload.etf_subtype is None
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="etf_subtype is required for national ETFs",
        )


def create_asset(session: Session, payload: AssetCreate) -> Asset:
    validate_asset(payload)

    normalized_symbol = normalize_symbol(payload.symbol)
    if symbol_exists_in_db(session, normalized_symbol):
        _raise_duplicate_symbol(normalized_symbol)

    data = payload.model_dump()
    data["symbol"] = normalized_symbol
    data["country"] = payload.country or ("BR" if payload.market == AssetMarket.NATIONAL else None)
    data["display_class"] = infer_display_class(
        payload.asset_type,
        payload.market,
        payload.etf_subtype,
    )
    asset = Asset(**data)

    session.add(asset)

    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="asset already exists",
        ) from exc

    session.refresh(asset)
    return asset


def list_assets(session: Session) -> list[Asset]:
    return list(session.exec(select(Asset).order_by(Asset.symbol)).all())


def _symbol_keys(symbol: str) -> set[str]:
    norm = normalize_symbol(symbol)
    keys = {norm}
    if norm.endswith(".SA"):
        keys.add(norm[:-3])
    else:
        keys.add(f"{norm}.SA")
    return keys


def symbol_exists_in_db(
    session: Session,
    symbol: str,
    *,
    exclude_asset_id: int | None = None,
) -> bool:
    keys = _symbol_keys(symbol)
    for asset in session.exec(select(Asset)).all():
        if exclude_asset_id is not None and asset.id == exclude_asset_id:
            continue
        if _symbol_keys(asset.symbol) & keys:
            return True
    return False


def _raise_duplicate_symbol(symbol: str) -> None:
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="asset already exists",
    )


def _lookup_result_to_read(result: object) -> AssetLookupRead:
    return AssetLookupRead(
        symbol=result.symbol,
        name=result.name,
        asset_type=result.asset_type,
        market=result.market,
        country=result.country,
        currency=result.currency,
        sector=result.sector,
        subsector=result.subsector,
        segment=result.segment,
        company_cnpj=result.company_cnpj,
        payer_cnpj=result.payer_cnpj,
        payer_name=result.payer_name,
        quote_source=result.quote_source,
        current_quote=result.current_quote,
    )


def _is_lookup_not_found_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return any(token in message for token in ("not found", "quote not found", "404"))


def _lookup_not_found_message(symbol: str) -> str:
    return f"Ativo não encontrado no yfinance: {symbol}"


def _build_not_found_warning(symbols: list[str]) -> str:
    max_listed = 15
    if len(symbols) <= max_listed:
        listed = ", ".join(symbols)
    else:
        listed = ", ".join(symbols[:max_listed]) + f" e mais {len(symbols) - max_listed}"
    return (
        "Alguns tickers não foram encontrados no yfinance (podem ter sido descontinuados): "
        f"{listed}."
    )


def preview_bulk_assets(
    session: Session,
    symbols: list[str],
    provider: AssetLookupProvider,
) -> BulkPreviewResponse:
    seen: set[str] = set()
    items: list[BulkPreviewItem] = []
    not_found_symbols: list[str] = []

    for raw in symbols:
        symbol = normalize_symbol(raw)
        if not symbol or symbol in seen:
            continue
        seen.add(symbol)

        already_in_db = symbol_exists_in_db(session, symbol)
        if already_in_db:
            items.append(
                BulkPreviewItem(symbol=symbol, already_in_db=True),
            )
            continue

        try:
            lookup = _lookup_result_to_read(provider.lookup(symbol))
            items.append(BulkPreviewItem(symbol=symbol, lookup=lookup, already_in_db=False))
        except Exception as exc:
            if _is_lookup_not_found_error(exc):
                not_found_symbols.append(symbol)
                items.append(
                    BulkPreviewItem(
                        symbol=symbol,
                        error=_lookup_not_found_message(symbol),
                        already_in_db=False,
                    ),
                )
                continue

            items.append(
                BulkPreviewItem(
                    symbol=symbol,
                    error=str(exc) or "lookup failed",
                    already_in_db=False,
                ),
            )

    warnings: list[str] = []
    if not_found_symbols:
        warnings.append(_build_not_found_warning(not_found_symbols))

    return BulkPreviewResponse(items=items, warnings=warnings)


def create_bulk_assets(session: Session, payloads: list[AssetCreate]) -> BulkCreateResponse:
    results: list[BulkCreateItemResult] = []

    for payload in payloads:
        symbol = normalize_symbol(payload.symbol)
        if symbol_exists_in_db(session, symbol):
            results.append(
                BulkCreateItemResult(
                    symbol=symbol,
                    status="skipped",
                    detail="asset already exists",
                ),
            )
            continue

        try:
            asset = create_asset(session, payload)
            results.append(
                BulkCreateItemResult(
                    symbol=asset.symbol,
                    status="created",
                    asset=AssetRead.model_validate(asset),
                ),
            )
        except HTTPException as exc:
            results.append(
                BulkCreateItemResult(
                    symbol=symbol,
                    status="error",
                    detail=str(exc.detail),
                ),
            )
        except Exception as exc:
            results.append(
                BulkCreateItemResult(
                    symbol=symbol,
                    status="error",
                    detail=str(exc),
                ),
            )

    return BulkCreateResponse(results=results)


def get_asset_by_id(session: Session, asset_id: int) -> Asset | None:
    return session.get(Asset, asset_id)


def get_asset_by_symbol(session: Session, symbol: str) -> Asset | None:
    keys = _symbol_keys(symbol)
    for asset in session.exec(select(Asset)).all():
        if _symbol_keys(asset.symbol) & keys:
            return asset
    return None


def update_asset(session: Session, asset_id: int, payload: AssetUpdate) -> Asset:
    asset = get_asset_by_id(session, asset_id)
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="asset not found",
        )

    updates = payload.model_dump(exclude_unset=True)
    if "symbol" in updates:
        new_symbol = normalize_symbol(str(updates["symbol"]))
        if symbol_exists_in_db(session, new_symbol, exclude_asset_id=asset_id):
            _raise_duplicate_symbol(new_symbol)
        updates["symbol"] = new_symbol

    for key, value in updates.items():
        setattr(asset, key, value)

    if asset.market == AssetMarket.NATIONAL:
        asset.country = asset.country or "BR"

    asset.display_class = infer_display_class(
        asset.asset_type,
        asset.market,
        asset.etf_subtype,
    )

    merged = AssetCreate.model_validate(
        asset.model_dump(exclude={"id", "display_class"}),
    )
    validate_asset(merged)

    try:
        session.add(asset)
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="asset already exists",
        ) from exc

    session.refresh(asset)
    return asset


def delete_asset(session: Session, asset_id: int) -> None:
    asset = get_asset_by_id(session, asset_id)
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="asset not found",
        )

    session.delete(asset)
    session.commit()
