from app.models.manual_patrimony_item import ManualPatrimonyCategory, ManualPatrimonyItem

from app.services.patrimony_control_engine import aggregate_manual_totals, pct_of_total


def test_aggregate_manual_totals() -> None:
    items = [
        ManualPatrimonyItem(
            portfolio_id=1,
            category=ManualPatrimonyCategory.EMERGENCY_RESERVE,
            name="A",
            amount_brl=5_000.0,
            location="banco",
        ),
        ManualPatrimonyItem(
            portfolio_id=1,
            category=ManualPatrimonyCategory.EMERGENCY_RESERVE,
            name="B",
            amount_brl=500.0,
            location="dinheiro_especie",
        ),
    ]
    assert aggregate_manual_totals(items) == 5_500.0


def test_pct_of_total() -> None:
    assert pct_of_total(250.0, 1_000.0) == 25.0
    assert pct_of_total(0.0, 0.0) is None
