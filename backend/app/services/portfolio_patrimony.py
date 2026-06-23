from sqlmodel import Session

from app.services.asset_service import get_asset_by_id
from app.services.fx_service import get_usd_brl_state
from app.services.portfolio_service import list_positions
from app.services.position_metrics import position_current_value, value_in_brl


def compute_portfolio_patrimony_brl(session: Session, portfolio_id: int) -> float:
    """Soma o valor atual de todas as posições da carteira em BRL."""
    positions = list_positions(session, portfolio_id)
    usd_brl_rate, _ = get_usd_brl_state(session)
    patrimony_brl = 0.0
    for position in positions:
        asset = get_asset_by_id(session, position.asset_id)
        full_value = position_current_value(position, asset)
        brl = value_in_brl(full_value, asset.currency, usd_brl_rate)
        if brl is not None:
            patrimony_brl += brl
    return patrimony_brl
