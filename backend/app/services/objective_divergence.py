from dataclasses import dataclass
from enum import StrEnum


class DivergenceStatus(StrEnum):
    OK = "ok"
    OVER_TOTAL = "over_total"
    INVALID = "invalid"


@dataclass(frozen=True)
class DivergenceResult:
    total: float
    allocated_explicit: float
    free: float
    delta: float
    status: DivergenceStatus


def compute_divergence(total: float | None, allocated_explicit: float) -> DivergenceResult:
    if total is None or total < 0:
        return DivergenceResult(
            total=0.0,
            allocated_explicit=allocated_explicit,
            free=0.0,
            delta=0.0,
            status=DivergenceStatus.INVALID,
        )

    free = total - allocated_explicit
    if allocated_explicit > total + 1e-9:
        return DivergenceResult(
            total=total,
            allocated_explicit=allocated_explicit,
            free=free,
            delta=total - allocated_explicit,
            status=DivergenceStatus.OVER_TOTAL,
        )

    return DivergenceResult(
        total=total,
        allocated_explicit=allocated_explicit,
        free=max(0.0, free),
        delta=0.0,
        status=DivergenceStatus.OK,
    )
