"""Flags de finalidade de objetivo (investimento, reserva, rebalanceamento)."""

from app.models.objective import Objective


def normalize_objective_purpose_flags(
    *,
    exclude_from_rebalance: bool,
    is_emergency_reserve: bool,
) -> tuple[bool, bool]:
    if is_emergency_reserve:
        return True, True
    return exclude_from_rebalance, is_emergency_reserve


def apply_objective_purpose_flags(
    objective: Objective,
    *,
    exclude_from_rebalance: bool | None = None,
    is_emergency_reserve: bool | None = None,
) -> None:
    exclude = (
        objective.exclude_from_rebalance
        if exclude_from_rebalance is None
        else exclude_from_rebalance
    )
    emergency = (
        objective.is_emergency_reserve
        if is_emergency_reserve is None
        else is_emergency_reserve
    )
    exclude, emergency = normalize_objective_purpose_flags(
        exclude_from_rebalance=exclude,
        is_emergency_reserve=emergency,
    )
    objective.exclude_from_rebalance = exclude
    objective.is_emergency_reserve = emergency
