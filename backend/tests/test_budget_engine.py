import pytest

from app.services.budget.budget_engine import (
    build_category_kpi,
    list_timeline_months,
    list_year_months,
    list_year_months_between,
    parse_year_month,
    shift_year_month,
    target_amount_brl,
)


def test_parse_year_month():
    assert parse_year_month("2026-07") == (2026, 7)


def test_shift_year_month():
    assert shift_year_month("2026-01", -1) == "2025-12"
    assert shift_year_month("2026-12", 1) == "2027-01"


def test_list_year_months():
    assert list_year_months("2026-03", 3) == ["2026-01", "2026-02", "2026-03"]


def test_list_timeline_months_symmetric_around_focus():
    assert list_timeline_months("2026-07", 3, 3) == [
        "2026-04",
        "2026-05",
        "2026-06",
        "2026-07",
        "2026-08",
        "2026-09",
        "2026-10",
    ]
    assert len(list_timeline_months("2026-07", 6, 6)) == 13


def test_list_year_months_between_inclusive():
    assert list_year_months_between("2026-01", "2026-03") == ["2026-01", "2026-02", "2026-03"]


def test_list_year_months_between_rejects_inverted_range():
    with pytest.raises(ValueError):
        list_year_months_between("2026-03", "2026-01")


def test_target_amount_brl():
    assert target_amount_brl(10000, 35) == 3500.0


def test_build_category_kpi_exceeded():
    kpi = build_category_kpi(
        category_id=1,
        category_name="Custos fixos",
        color="#000",
        percent=10,
        planned_income_brl=1000,
        spent_brl=150,
        transaction_count=2,
    )
    assert kpi.exceeded is True
    assert kpi.usage_percent == 150.0


def test_invalid_year_month():
    with pytest.raises(ValueError):
        parse_year_month("2026-13")
