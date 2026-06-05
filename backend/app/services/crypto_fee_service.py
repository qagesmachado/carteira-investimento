from datetime import date

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.asset import Asset, AssetType
from app.models.crypto_fee import CryptoFee, CryptoFeeType
from app.models.portfolio import Portfolio
from app.models.position import Position
from app.schemas.crypto_fee import (
    BitcoinPositionSummary,
    BitcoinRebalanceSummary,
    BitcoinSnapshotRead,
    CryptoFeeCreate,
    CryptoFeeRead,
    CryptoFeeUpdate,
)
from app.services.asset_service import get_asset_by_id
from app.services.crypto_fee_engine import (
    compute_fee_percent,
    compute_fee_value_brl,
    compute_fee_value_usd,
    compute_final_quantity_after_fee,
    sum_transfer_ledger_final_btc,
)
from app.services.fx_service import get_usd_brl_state
from app.services.portfolio_service import get_portfolio, list_positions
from app.services.position_metrics import position_current_value, position_invested_value, value_in_brl
from app.services.rebalance_service import build_rebalance_snapshot


def _ensure_portfolio_exists(session: Session, portfolio_id: int) -> None:
    if session.get(Portfolio, portfolio_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="portfolio not found",
        )


def _ensure_crypto_asset(session: Session, asset_id: int) -> Asset:
    asset = get_asset_by_id(session, asset_id)
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="asset not found",
        )
    if asset.asset_type != AssetType.CRYPTO:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="asset must be crypto",
        )
    return asset


def validate_crypto_fee_payload(payload: CryptoFeeCreate) -> None:
    if payload.quantity_moved <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="quantity_moved must be greater than zero",
        )
    if payload.fee_quantity_btc < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="fee_quantity_btc must be zero or greater",
        )
    if payload.fee_quantity_btc > payload.quantity_moved:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="fee_quantity_btc cannot exceed quantity_moved",
        )
    if payload.quote_brl <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="quote_brl must be greater than zero",
        )
    if payload.fx_rate <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="fx_rate must be greater than zero",
        )


def to_crypto_fee_read(fee: CryptoFee, asset: Asset) -> CryptoFeeRead:
    fee_value_brl = compute_fee_value_brl(fee.fee_quantity_btc, fee.quote_brl)
    return CryptoFeeRead(
        id=fee.id,  # type: ignore[arg-type]
        portfolio_id=fee.portfolio_id,
        asset_id=fee.asset_id,
        fee_type=fee.fee_type,
        fee_date=fee.fee_date,
        quantity_moved=fee.quantity_moved,
        fee_quantity_btc=fee.fee_quantity_btc,
        quote_brl=fee.quote_brl,
        fx_rate=fee.fx_rate,
        notes=fee.notes,
        symbol=asset.symbol,
        asset_name=asset.name,
        final_quantity_after_fee=compute_final_quantity_after_fee(
            fee.quantity_moved, fee.fee_quantity_btc
        ),
        fee_value_brl=fee_value_brl,
        fee_value_usd=compute_fee_value_usd(fee_value_brl, fee.fx_rate),
        fee_percent=compute_fee_percent(fee.quantity_moved, fee.fee_quantity_btc),
    )


def list_crypto_fees(
    session: Session,
    *,
    portfolio_id: int | None = None,
    asset_id: int | None = None,
    fee_type: CryptoFeeType | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
) -> list[CryptoFeeRead]:
    statement = select(CryptoFee).order_by(
        CryptoFee.fee_date.desc(),
        CryptoFee.id.desc(),
    )
    if portfolio_id is not None:
        statement = statement.where(CryptoFee.portfolio_id == portfolio_id)
    if asset_id is not None:
        statement = statement.where(CryptoFee.asset_id == asset_id)
    if fee_type is not None:
        statement = statement.where(CryptoFee.fee_type == fee_type)
    if from_date is not None:
        statement = statement.where(CryptoFee.fee_date >= from_date)
    if to_date is not None:
        statement = statement.where(CryptoFee.fee_date <= to_date)

    fees = session.exec(statement).all()
    if not fees:
        return []

    asset_ids = {fee.asset_id for fee in fees}
    assets = {
        asset.id: asset
        for asset in session.exec(select(Asset).where(Asset.id.in_(asset_ids))).all()
    }

    results: list[CryptoFeeRead] = []
    for fee in fees:
        asset = assets.get(fee.asset_id)
        if asset is None:
            continue
        results.append(to_crypto_fee_read(fee, asset))
    return results


def create_crypto_fee(session: Session, payload: CryptoFeeCreate) -> CryptoFeeRead:
    _ensure_portfolio_exists(session, payload.portfolio_id)
    asset = _ensure_crypto_asset(session, payload.asset_id)
    validate_crypto_fee_payload(payload)
    fee = CryptoFee(**payload.model_dump())
    session.add(fee)
    session.commit()
    session.refresh(fee)
    return to_crypto_fee_read(fee, asset)


def get_crypto_fee_read(session: Session, fee_id: int) -> CryptoFeeRead:
    fee = session.get(CryptoFee, fee_id)
    if fee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="crypto fee not found",
        )
    asset = get_asset_by_id(session, fee.asset_id)
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="asset not found",
        )
    return to_crypto_fee_read(fee, asset)


def update_crypto_fee(
    session: Session,
    fee_id: int,
    payload: CryptoFeeUpdate,
) -> CryptoFeeRead:
    fee = session.get(CryptoFee, fee_id)
    if fee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="crypto fee not found",
        )

    data = payload.model_dump(exclude_unset=True)
    if "portfolio_id" in data and data["portfolio_id"] is not None:
        _ensure_portfolio_exists(session, data["portfolio_id"])
    if "asset_id" in data and data["asset_id"] is not None:
        _ensure_crypto_asset(session, data["asset_id"])

    for key, value in data.items():
        setattr(fee, key, value)

    merged = CryptoFeeCreate(
        portfolio_id=fee.portfolio_id,
        asset_id=fee.asset_id,
        fee_type=fee.fee_type,
        fee_date=fee.fee_date,
        quantity_moved=fee.quantity_moved,
        fee_quantity_btc=fee.fee_quantity_btc,
        quote_brl=fee.quote_brl,
        fx_rate=fee.fx_rate,
        notes=fee.notes,
    )
    validate_crypto_fee_payload(merged)

    session.add(fee)
    session.commit()
    session.refresh(fee)
    asset = get_asset_by_id(session, fee.asset_id)
    assert asset is not None
    return to_crypto_fee_read(fee, asset)


def delete_crypto_fee(session: Session, fee_id: int) -> None:
    fee = session.get(CryptoFee, fee_id)
    if fee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="crypto fee not found",
        )
    session.delete(fee)
    session.commit()


def _find_crypto_position(
    session: Session,
    portfolio_id: int,
    asset_id: int | None = None,
) -> tuple[Position, Asset] | None:
    positions = list_positions(session, portfolio_id)
    for position in positions:
        asset = get_asset_by_id(session, position.asset_id)
        if asset is None or asset.asset_type != AssetType.CRYPTO:
            continue
        if asset_id is not None and asset.id != asset_id:
            continue
        return position, asset
    return None


def sum_crypto_fees(
    session: Session,
    *,
    portfolio_id: int,
    asset_id: int | None = None,
) -> tuple[float, float]:
    fees = list_crypto_fees(session, portfolio_id=portfolio_id, asset_id=asset_id)
    return sum_crypto_fees_from_reads(fees)


def sum_crypto_fees_from_reads(fees: list[CryptoFeeRead]) -> tuple[float, float]:
    total_brl = sum(fee.fee_value_brl for fee in fees)
    total_usd = sum(fee.fee_value_usd for fee in fees)
    return total_brl, total_usd


def sum_transfer_ledger_from_reads(fees: list[CryptoFeeRead]) -> tuple[float, int]:
    transfer_fees = [fee for fee in fees if fee.fee_type == CryptoFeeType.TRANSFER]
    return sum_transfer_ledger_final_btc(
        [fee.final_quantity_after_fee for fee in transfer_fees]
    )


def build_bitcoin_snapshot(
    assets_session: Session,
    portfolios_session: Session,
    portfolio_id: int,
    asset_id: int | None = None,
) -> BitcoinSnapshotRead:
    get_portfolio(portfolios_session, portfolio_id)
    usd_brl_rate, _ = get_usd_brl_state(portfolios_session)
    pair = _find_crypto_position(portfolios_session, portfolio_id, asset_id=asset_id)

    position_summary = BitcoinPositionSummary()
    rebalance_summary = BitcoinRebalanceSummary()
    fees = list_crypto_fees(
        assets_session,
        portfolio_id=portfolio_id,
        asset_id=asset_id,
    )
    total_fees_brl, total_fees_usd = sum_crypto_fees_from_reads(fees)
    transfer_ledger_final_btc, transfer_ledger_count = sum_transfer_ledger_from_reads(fees)

    if pair is not None:
        position, asset = pair
        invested_native = position_invested_value(position, asset)
        current_native = position_current_value(position, asset)
        invested_brl = value_in_brl(invested_native, asset.currency, usd_brl_rate)
        current_brl = value_in_brl(current_native, asset.currency, usd_brl_rate)
        quote_usd = asset.current_quote
        quote_brl = (
            quote_usd * usd_brl_rate
            if quote_usd is not None and usd_brl_rate is not None
            else None
        )
        avg_usd = position.average_price if asset.currency == "USD" else None
        avg_brl = (
            position.average_price * usd_brl_rate
            if avg_usd is not None and usd_brl_rate is not None
            else position.average_price
            if asset.currency == "BRL"
            else None
        )
        profit_brl = (
            current_brl - invested_brl
            if current_brl is not None and invested_brl is not None
            else None
        )
        profit_percent = (
            (profit_brl / invested_brl) * 100.0
            if profit_brl is not None and invested_brl and invested_brl > 0
            else None
        )

        position_summary = BitcoinPositionSummary(
            asset_id=asset.id,
            symbol=asset.symbol,
            name=asset.name,
            quantity=position.quantity,
            average_price_brl=avg_brl,
            average_price_usd=avg_usd,
            total_invested_brl=invested_brl,
            quote_brl=quote_brl,
            quote_usd=quote_usd,
            current_value_brl=current_brl,
            profit_brl=profit_brl,
            profit_percent=profit_percent,
        )

        rebalance = build_rebalance_snapshot(
            assets_session, portfolios_session, portfolio_id
        )
        crypto_row = next(
            (row for row in rebalance.classes if row.display_class == "crypto"),
            None,
        )
        if crypto_row is not None:
            missing = max(0.0, crypto_row.target_value_brl - crypto_row.current_value_brl)
            above = max(0.0, crypto_row.current_value_brl - crypto_row.target_value_brl)
            action = "COMPRAR" if missing > 0 else "MANTER"
            rebalance_summary = BitcoinRebalanceSummary(
                target_value_brl=crypto_row.target_value_brl,
                missing_value_brl=missing if missing > 0 else 0.0,
                above_target_brl=above if above > 0 else 0.0,
                rebalance_action=action,
            )

    profit_after_fees = (
        position_summary.profit_brl - total_fees_brl
        if position_summary.profit_brl is not None
        else None
    )
    appreciation_after_fees = (
        (profit_after_fees / position_summary.total_invested_brl) * 100.0
        if profit_after_fees is not None
        and position_summary.total_invested_brl
        and position_summary.total_invested_brl > 0
        else None
    )

    return BitcoinSnapshotRead(
        portfolio_id=portfolio_id,
        position=position_summary,
        rebalance=rebalance_summary,
        total_fees_brl=total_fees_brl,
        total_fees_usd=total_fees_usd,
        profit_after_fees_brl=profit_after_fees,
        appreciation_after_fees_percent=appreciation_after_fees,
        transfer_ledger_final_btc=transfer_ledger_final_btc,
        transfer_ledger_count=transfer_ledger_count,
    )
