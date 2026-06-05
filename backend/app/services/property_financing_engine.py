from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class EntryInput:
    event_date: date
    entry_type: str
    amount_brl: float


@dataclass(frozen=True)
class FinancingMetrics:
    total_income_brl: float
    total_expenses_brl: float
    profit_brl: float
    capital_invested_brl: float


@dataclass(frozen=True)
class TimelineRow:
    label: str
    year: int
    month: int | None
    income_brl: float
    expenses_brl: float


MONTH_LABELS_SHORT = (
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
)

INCOME_EVENT_CATEGORIES = frozenset({"aluguel"})
EXPENSE_EVENT_CATEGORIES = frozenset(
    {"financiamento", "outras_taxas", "entrada_financiamento"}
)


def compute_financing_metrics(entries: list[EntryInput]) -> FinancingMetrics:
    total_income = sum(
        e.amount_brl for e in entries if e.entry_type == "income"
    )
    total_expenses = sum(
        e.amount_brl for e in entries if e.entry_type == "expense"
    )
    return FinancingMetrics(
        total_income_brl=total_income,
        total_expenses_brl=total_expenses,
        profit_brl=total_income - total_expenses,
        capital_invested_brl=total_expenses,
    )


def aggregate_monthly_timeline(
    entries: list[EntryInput],
    year: int,
) -> list[TimelineRow]:
    by_month: dict[int, tuple[float, float]] = {month: (0.0, 0.0) for month in range(1, 13)}
    for entry in entries:
        if entry.event_date.year != year:
            continue
        income, expenses = by_month[entry.event_date.month]
        if entry.entry_type == "income":
            income += entry.amount_brl
        else:
            expenses += entry.amount_brl
        by_month[entry.event_date.month] = (income, expenses)
    return [
        TimelineRow(
            label=MONTH_LABELS_SHORT[month - 1],
            year=year,
            month=month,
            income_brl=values[0],
            expenses_brl=values[1],
        )
        for month, values in sorted(by_month.items())
    ]


def aggregate_monthly_timeline_all_years(entries: list[EntryInput]) -> list[TimelineRow]:
    years = sorted({entry.event_date.year for entry in entries})
    rows: list[TimelineRow] = []
    for year in years:
        rows.extend(aggregate_monthly_timeline(entries, year))
    return rows


def aggregate_annual_timeline(entries: list[EntryInput]) -> list[TimelineRow]:
    by_year: dict[int, tuple[float, float]] = {}
    for entry in entries:
        income, expenses = by_year.get(entry.event_date.year, (0.0, 0.0))
        if entry.entry_type == "income":
            income += entry.amount_brl
        else:
            expenses += entry.amount_brl
        by_year[entry.event_date.year] = (income, expenses)
    return [
        TimelineRow(
            label=str(year),
            year=year,
            month=None,
            income_brl=values[0],
            expenses_brl=values[1],
        )
        for year, values in sorted(by_year.items())
    ]


def event_category_matches_entry_type(entry_type: str, event_category: str) -> bool:
    if entry_type == "income":
        return event_category in INCOME_EVENT_CATEGORIES
    if entry_type == "expense":
        return event_category in EXPENSE_EVENT_CATEGORIES
    return False
