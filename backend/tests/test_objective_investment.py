"""Testes unitários do motor de finalidade por alocação."""

from app.models.objective_allocation import ObjectiveAllocation
from app.services.allocation_purpose import (
    apply_allocation_purpose_flags,
    normalize_allocation_purpose_flags,
)


def test_emergency_reserve_implies_exclude_from_rebalance() -> None:
    exclude, emergency = normalize_allocation_purpose_flags(
        exclude_from_rebalance=False,
        is_emergency_reserve=True,
    )
    assert exclude is True
    assert emergency is True


def test_apply_allocation_purpose_flags_on_model() -> None:
    allocation = ObjectiveAllocation(objective_id=1, slice_name="Reserva", asset_id=1)
    apply_allocation_purpose_flags(allocation, is_emergency_reserve=True)
    assert allocation.is_emergency_reserve is True
    assert allocation.exclude_from_rebalance is True
