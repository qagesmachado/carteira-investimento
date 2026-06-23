"""Flags de finalidade por fatia (alocação) de objetivo."""

from app.models.objective_allocation import ObjectiveAllocation


def normalize_allocation_purpose_flags(
    *,
    exclude_from_rebalance: bool,
    is_emergency_reserve: bool,
) -> tuple[bool, bool]:
    if is_emergency_reserve:
        return True, True
    return exclude_from_rebalance, is_emergency_reserve


def apply_allocation_purpose_flags(
    allocation: ObjectiveAllocation,
    *,
    exclude_from_rebalance: bool | None = None,
    is_emergency_reserve: bool | None = None,
) -> None:
    exclude = (
        allocation.exclude_from_rebalance
        if exclude_from_rebalance is None
        else exclude_from_rebalance
    )
    emergency = (
        allocation.is_emergency_reserve
        if is_emergency_reserve is None
        else is_emergency_reserve
    )
    exclude, emergency = normalize_allocation_purpose_flags(
        exclude_from_rebalance=exclude,
        is_emergency_reserve=emergency,
    )
    allocation.exclude_from_rebalance = exclude
    allocation.is_emergency_reserve = emergency
