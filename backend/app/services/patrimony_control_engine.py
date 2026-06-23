from app.models.manual_patrimony_item import ManualPatrimonyCategory, ManualPatrimonyItem


def aggregate_manual_totals(items: list[ManualPatrimonyItem]) -> float:
    """Soma itens manuais (todos em emergency_reserve após migração)."""
    return sum(
        item.amount_brl
        for item in items
        if item.category
        in (ManualPatrimonyCategory.EMERGENCY_RESERVE, ManualPatrimonyCategory.CASH)
    )


def pct_of_total(value: float, total: float) -> float | None:
    if total <= 0:
        return None
    return (value / total) * 100.0
