"""Motor de cálculo para controle de aporte previdenciário (PGBL)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date


PGBL_DEDUCTION_RATE = 0.12


@dataclass(frozen=True)
class PensionContributionMetrics:
    plan_year: int
    annual_gross_income_brl: float | None
    contributed_ytd_brl: float
    target_annual_brl: float
    remaining_brl: float
    months_remaining: int
    monthly_needed_brl: float | None
    progress_percent: float
    target_reached: bool


def months_remaining_in_year(plan_year: int, reference_date: date | None = None) -> int:
    reference_date = reference_date or date.today()
    if plan_year > reference_date.year:
        return 12
    if plan_year < reference_date.year:
        return 0
    return 12 - reference_date.month + 1


def compute_pension_contribution_metrics(
    plan_year: int,
    annual_gross_income_brl: float | None,
    contributed_ytd_brl: float,
    reference_date: date | None = None,
) -> PensionContributionMetrics:
    reference_date = reference_date or date.today()
    income = annual_gross_income_brl or 0.0
    contributed = max(0.0, contributed_ytd_brl)
    target = income * PGBL_DEDUCTION_RATE
    remaining = max(0.0, target - contributed)
    months = months_remaining_in_year(plan_year, reference_date)
    monthly_needed = remaining / months if months > 0 else None
    progress = min(100.0, (contributed / target * 100.0) if target > 0 else 0.0)

    return PensionContributionMetrics(
        plan_year=plan_year,
        annual_gross_income_brl=annual_gross_income_brl,
        contributed_ytd_brl=contributed,
        target_annual_brl=target,
        remaining_brl=remaining,
        months_remaining=months,
        monthly_needed_brl=monthly_needed,
        progress_percent=progress,
        target_reached=target > 0 and contributed >= target,
    )
