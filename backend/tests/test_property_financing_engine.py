from datetime import date

import pytest

from app.services.property_financing_engine import (
    EntryInput,
    aggregate_monthly_timeline,
    aggregate_monthly_timeline_all_years,
    aggregate_annual_timeline,
    compute_financing_metrics,
    event_category_matches_entry_type,
)


def test_compute_financing_metrics_profit():
    entries = [
        EntryInput(date(2026, 6, 1), "income", 2_500.0),
        EntryInput(date(2026, 6, 5), "expense", 3_000.0),
        EntryInput(date(2026, 6, 10), "expense", 600.0),
    ]
    metrics = compute_financing_metrics(entries)
    assert metrics.total_income_brl == 2_500.0
    assert metrics.total_expenses_brl == 3_600.0
    assert metrics.profit_brl == -1_100.0
    assert metrics.capital_invested_brl == 3_600.0


def test_monthly_timeline_groups_by_month():
    entries = [
        EntryInput(date(2026, 6, 1), "income", 1_000.0),
        EntryInput(date(2026, 6, 15), "expense", 500.0),
        EntryInput(date(2026, 7, 1), "expense", 200.0),
    ]
    rows = aggregate_monthly_timeline(entries, 2026)
    assert len(rows) == 12
    assert rows[5].income_brl == 1_000.0
    assert rows[5].expenses_brl == 500.0
    assert rows[6].expenses_brl == 200.0
    assert rows[0].income_brl == 0.0


def test_annual_timeline_groups_by_year():
    entries = [
        EntryInput(date(2025, 12, 1), "expense", 1_000.0),
        EntryInput(date(2026, 1, 1), "income", 2_000.0),
    ]
    rows = aggregate_annual_timeline(entries)
    assert len(rows) == 2
    assert rows[0].year == 2025
    assert rows[0].expenses_brl == 1_000.0
    assert rows[1].income_brl == 2_000.0


def test_event_category_matches_entry_type():
    assert event_category_matches_entry_type("income", "aluguel")
    assert event_category_matches_entry_type("expense", "financiamento")
    assert event_category_matches_entry_type("expense", "entrada_financiamento")
    assert not event_category_matches_entry_type("income", "financiamento")
    assert not event_category_matches_entry_type("expense", "aluguel")


def test_monthly_timeline_all_years_keeps_year_separate():
    entries = [
        EntryInput(date(2025, 11, 7), "expense", 66000.0),
        EntryInput(date(2026, 1, 8), "expense", 1810.0),
    ]
    rows = aggregate_monthly_timeline_all_years(entries)
    nov2025 = next(row for row in rows if row.year == 2025 and row.month == 11)
    nov2026 = next(row for row in rows if row.year == 2026 and row.month == 11)
    jan2026 = next(row for row in rows if row.year == 2026 and row.month == 1)
    assert nov2025.expenses_brl == 66000.0
    assert nov2026.expenses_brl == 0.0
    assert jan2026.expenses_brl == 1810.0


def test_empty_entries_zero_metrics():
    metrics = compute_financing_metrics([])
    assert metrics.total_income_brl == 0.0
    assert metrics.total_expenses_brl == 0.0
    assert metrics.profit_brl == 0.0
