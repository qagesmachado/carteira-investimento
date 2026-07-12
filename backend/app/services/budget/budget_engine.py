"""Pure budget calculations — no portfolio imports."""

from dataclasses import dataclass


DEFAULT_CATEGORY_SEED: list[tuple[str, str]] = [
    ("Custos fixos", "#3b82f6"),
    ("Conforto", "#ec4899"),
    ("Metas", "#6366f1"),
    ("Prazeres", "#f97316"),
    ("Liberdade Financeira", "#a855f7"),
    ("Conhecimento", "#eab308"),
]

DEFAULT_TARGET_PERCENTS: list[float] = [21.0, 10.0, 5.0, 24.0, 35.0, 5.0]
RECURRING_INCOME_MONTHS = 12
RECURRING_EXPENSE_HORIZON = 12
# Default legado; o painel passa forward = months (3/6/12).
DASHBOARD_FORWARD_MONTHS = 6


def parse_year_month(value: str) -> tuple[int, int]:
    parts = value.split("-")
    if len(parts) != 2:
        raise ValueError(f"invalid year_month: {value}")
    year, month = int(parts[0]), int(parts[1])
    if month < 1 or month > 12:
        raise ValueError(f"invalid month in year_month: {value}")
    return year, month


def shift_year_month(year_month: str, delta_months: int) -> str:
    year, month = parse_year_month(year_month)
    total = year * 12 + (month - 1) + delta_months
    new_year = total // 12
    new_month = total % 12 + 1
    return f"{new_year:04d}-{new_month:02d}"


def list_year_months(end_year_month: str, count: int) -> list[str]:
    return [shift_year_month(end_year_month, -i) for i in range(count - 1, -1, -1)]


def year_month_index(year_month: str) -> int:
    year, month = parse_year_month(year_month)
    return year * 12 + (month - 1)


def compare_year_months(left: str, right: str) -> int:
    return year_month_index(left) - year_month_index(right)


def list_timeline_months(center_year_month: str, past_count: int, forward_count: int) -> list[str]:
    """Meses: `past_count` antes do foco, o mês foco, e `forward_count` depois."""
    start = shift_year_month(center_year_month, -past_count)
    return [shift_year_month(start, offset) for offset in range(past_count + 1 + forward_count)]


def list_year_months_between(from_year_month: str, to_year_month: str) -> list[str]:
    """Lista inclusiva de YYYY-MM de `from` até `to` (exige from <= to)."""
    if compare_year_months(from_year_month, to_year_month) > 0:
        raise ValueError("from_year_month must be <= to_year_month")
    months: list[str] = []
    current = from_year_month
    while compare_year_months(current, to_year_month) <= 0:
        months.append(current)
        current = shift_year_month(current, 1)
    return months


def event_date_for_day(year_month: str, day_of_month: int) -> "date":
    import calendar
    from datetime import date

    year, month = parse_year_month(year_month)
    last_day = calendar.monthrange(year, month)[1]
    safe_day = min(max(1, day_of_month), last_day)
    return date(year, month, safe_day)


def round_money(value: float) -> float:
    return round(value, 2)


def target_amount_brl(planned_income_brl: float | None, percent: float) -> float:
    if planned_income_brl is None or planned_income_brl <= 0:
        return 0.0
    return round_money(planned_income_brl * percent / 100.0)


def percent_from_amount(planned_income_brl: float | None, amount_brl: float) -> float:
    if planned_income_brl is None or planned_income_brl <= 0:
        return 0.0
    return round_money(amount_brl / planned_income_brl * 100.0)


def usage_percent(spent_brl: float, target_brl: float) -> float:
    if target_brl <= 0:
        return 0.0 if spent_brl <= 0 else 100.0
    return round_money(spent_brl / target_brl * 100.0)


def is_exceeded(spent_brl: float, target_brl: float) -> bool:
    return spent_brl > target_brl and target_brl > 0


@dataclass(frozen=True)
class CategoryKpi:
    category_id: int
    category_name: str
    color: str
    percent: float
    target_brl: float
    spent_brl: float
    remaining_brl: float
    usage_percent: float
    exceeded: bool
    transaction_count: int


def build_category_kpi(
    *,
    category_id: int,
    category_name: str,
    color: str,
    percent: float,
    planned_income_brl: float | None,
    spent_brl: float,
    transaction_count: int,
) -> CategoryKpi:
    target = target_amount_brl(planned_income_brl, percent)
    remaining = round_money(target - spent_brl)
    return CategoryKpi(
        category_id=category_id,
        category_name=category_name,
        color=color,
        percent=percent,
        target_brl=target,
        spent_brl=round_money(spent_brl),
        remaining_brl=remaining,
        usage_percent=usage_percent(spent_brl, target),
        exceeded=is_exceeded(spent_brl, target),
        transaction_count=transaction_count,
    )
