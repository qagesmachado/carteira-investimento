def compute_final_quantity_after_fee(quantity_moved: float, fee_quantity_btc: float) -> float:
    return quantity_moved - fee_quantity_btc


def compute_fee_value_brl(fee_quantity_btc: float, quote_brl: float) -> float:
    return fee_quantity_btc * quote_brl


def compute_fee_value_usd(fee_value_brl: float, fx_rate: float) -> float:
    return fee_value_brl / fx_rate


def compute_fee_percent(quantity_moved: float, fee_quantity_btc: float) -> float:
    if quantity_moved <= 0:
        return 0.0
    return (fee_quantity_btc / quantity_moved) * 100.0


def sum_transfer_ledger_final_btc(
    final_quantities: list[float],
) -> tuple[float, int]:
    """Soma Final (BTC) de lançamentos transfer (Ledger)."""
    if not final_quantities:
        return 0.0, 0
    return sum(final_quantities), len(final_quantities)
