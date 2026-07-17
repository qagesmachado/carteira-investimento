from datetime import date

import pytest

from app.services.pension_contribution_engine import (
    compute_pension_contribution_metrics,
    months_remaining_in_year,
)


def test_target_is_12_percent_of_income():
    metrics = compute_pension_contribution_metrics(
        plan_year=2026,
        annual_gross_income_brl=120_000.0,
        contributed_ytd_brl=0.0,
        reference_date=date(2026, 5, 28),
    )
    assert metrics.target_annual_brl == 14_400.0


def test_remaining_and_monthly_needed():
    metrics = compute_pension_contribution_metrics(
        plan_year=2026,
        annual_gross_income_brl=120_000.0,
        contributed_ytd_brl=6_000.0,
        reference_date=date(2026, 5, 28),
    )
    assert metrics.remaining_brl == 8_400.0
    assert metrics.months_remaining == 8
    assert metrics.monthly_needed_brl == 1_050.0


def test_progress_percent():
    metrics = compute_pension_contribution_metrics(
        plan_year=2026,
        annual_gross_income_brl=120_000.0,
        contributed_ytd_brl=6_000.0,
        reference_date=date(2026, 5, 28),
    )
    assert metrics.progress_percent == pytest.approx(41.666666666666664)


def test_target_reached_when_contributed_exceeds_target():
    metrics = compute_pension_contribution_metrics(
        plan_year=2026,
        annual_gross_income_brl=120_000.0,
        contributed_ytd_brl=15_000.0,
        reference_date=date(2026, 5, 28),
    )
    assert metrics.remaining_brl == 0.0
    assert metrics.target_reached is True
    assert metrics.progress_percent == 100.0


def test_future_year_has_12_months_remaining():
    assert months_remaining_in_year(2027, date(2026, 5, 28)) == 12


def test_past_year_has_zero_months_remaining():
    assert months_remaining_in_year(2025, date(2026, 5, 28)) == 0
    metrics = compute_pension_contribution_metrics(
        plan_year=2025,
        annual_gross_income_brl=120_000.0,
        contributed_ytd_brl=6_000.0,
        reference_date=date(2026, 5, 28),
    )
    assert metrics.monthly_needed_brl is None


def test_july_monthly_needed_divides_remaining_by_months_until_december():
    metrics = compute_pension_contribution_metrics(
        plan_year=2026,
        annual_gross_income_brl=216_000.0,
        contributed_ytd_brl=12_800.0,
        reference_date=date(2026, 7, 16),
    )
    assert metrics.remaining_brl == 13_120.0
    assert metrics.months_remaining == 6
    assert metrics.monthly_needed_brl == pytest.approx(13_120.0 / 6)


def test_higher_contributions_lower_monthly_needed():
    ref = date(2026, 7, 16)
    low = compute_pension_contribution_metrics(2026, 216_000.0, 6_000.0, ref)
    high = compute_pension_contribution_metrics(2026, 216_000.0, 20_000.0, ref)
    assert high.remaining_brl < low.remaining_brl
    assert high.monthly_needed_brl < low.monthly_needed_brl


def test_zero_income_gives_zero_target():
    metrics = compute_pension_contribution_metrics(
        plan_year=2026,
        annual_gross_income_brl=None,
        contributed_ytd_brl=1_000.0,
        reference_date=date(2026, 5, 28),
    )
    assert metrics.target_annual_brl == 0.0
    assert metrics.progress_percent == 0.0
    assert metrics.target_reached is False
