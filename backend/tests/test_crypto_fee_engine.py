import pytest

from app.services.crypto_fee_engine import (
    compute_fee_percent,
    compute_fee_value_brl,
    compute_fee_value_usd,
    compute_final_quantity_after_fee,
    sum_transfer_ledger_final_btc,
)


def test_compute_final_quantity_after_fee() -> None:
    assert compute_final_quantity_after_fee(0.00084, 8.4e-07) == pytest.approx(0.00083916)


def test_compute_fee_value_brl() -> None:
    assert compute_fee_value_brl(8.4e-07, 590_867.0) == pytest.approx(0.4963278, rel=1e-6)


def test_compute_fee_value_usd() -> None:
    assert compute_fee_value_usd(0.49632828, 5.54) == pytest.approx(0.08958994224, rel=1e-6)


def test_compute_fee_percent() -> None:
    assert compute_fee_percent(0.00084, 8.4e-07) == pytest.approx(0.1)


def test_sum_transfer_ledger_final_btc() -> None:
    total, count = sum_transfer_ledger_final_btc([0.00080916, 0.0005])
    assert total == pytest.approx(0.00130916)
    assert count == 2


def test_sum_transfer_ledger_final_btc_empty() -> None:
    total, count = sum_transfer_ledger_final_btc([])
    assert total == 0.0
    assert count == 0
