from app.models.asset import Asset, AssetType
from app.models.position import Position


def uses_manual_position_values(asset_type: AssetType) -> bool:
    return asset_type in (AssetType.FIXED_INCOME, AssetType.PENSION)


def position_invested_value(position: Position, asset: Asset) -> float | None:
    if uses_manual_position_values(asset.asset_type):
        return position.invested_amount
    return position.quantity * position.average_price


def position_current_value(position: Position, asset: Asset) -> float | None:
    if uses_manual_position_values(asset.asset_type):
        return position.current_value
    if asset.current_quote is None:
        return None
    return position.quantity * asset.current_quote


def value_in_brl(
    amount: float | None,
    currency: str | None,
    usd_brl_rate: float | None,
) -> float | None:
    if amount is None:
        return None
    code = (currency or "").strip().upper()
    if not code:
        return None
    if code == "BRL":
        return amount
    if code == "USD":
        if usd_brl_rate is None or usd_brl_rate <= 0:
            return None
        return amount * usd_brl_rate
    return None
