import logging
from datetime import datetime

from app.models.asset import AssetType
from app.providers.yfinance_asset_provider import AssetLookupProvider
from app.schemas.asset import AssetUpdate
from app.schemas.portfolio import QuoteRefreshFailure, QuoteRefreshResponse
from app.services.asset_service import get_asset_by_id, update_asset
from app.services.portfolio_service import get_portfolio, list_positions
from sqlmodel import Session

logger = logging.getLogger(__name__)

_SKIP_QUOTE_REFRESH_TYPES = frozenset({AssetType.FIXED_INCOME, AssetType.PENSION})


def refresh_portfolio_quotes(
    assets_session: Session,
    portfolios_session: Session,
    portfolio_id: int,
    provider: AssetLookupProvider,
) -> QuoteRefreshResponse:
    get_portfolio(portfolios_session, portfolio_id)
    positions = list_positions(portfolios_session, portfolio_id)
    asset_ids = sorted({position.asset_id for position in positions})

    updated = 0
    skipped = 0
    failed: list[QuoteRefreshFailure] = []

    for asset_id in asset_ids:
        asset = get_asset_by_id(assets_session, asset_id)
        if asset is None:
            failed.append(
                QuoteRefreshFailure(symbol=str(asset_id), detail="asset not found in base"),
            )
            continue

        if asset.asset_type in _SKIP_QUOTE_REFRESH_TYPES:
            skipped += 1
            continue

        try:
            lookup = provider.lookup(asset.symbol)
        except Exception as exc:
            logger.warning("quote_refresh lookup failed symbol=%s: %s", asset.symbol, exc)
            failed.append(QuoteRefreshFailure(symbol=asset.symbol, detail=str(exc)))
            continue

        if lookup.current_quote is None:
            failed.append(
                QuoteRefreshFailure(
                    symbol=asset.symbol,
                    detail="no quote returned from provider",
                ),
            )
            continue

        update_asset(
            assets_session,
            asset.id,  # type: ignore[arg-type]
            AssetUpdate(
                current_quote=lookup.current_quote,
                quote_source=lookup.quote_source or "yfinance",
            ),
        )
        updated += 1

    logger.info(
        "quote_refresh_done portfolio_id=%s updated=%s skipped=%s failed=%s",
        portfolio_id,
        updated,
        skipped,
        len(failed),
    )
    return QuoteRefreshResponse(
        updated=updated,
        skipped=skipped,
        failed=failed,
        refreshed_at=datetime.utcnow(),
    )
