"""Benchmark de carregamento das páginas do módulo Financeiro (API backend).

Mede o tempo das chamadas equivalentes ao load de cada rota SvelteKit.
Uso:
  cd backend
  ..\\.venv\\Scripts\\python.exe scripts/benchmark_financeiro_pages.py --label antes
  ..\\.venv\\Scripts\\python.exe scripts/benchmark_financeiro_pages.py --label depois
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
import time
from dataclasses import dataclass
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "backend") not in sys.path:
    sys.path.insert(0, str(ROOT / "backend"))

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.db.session import engine, init_db
from app.main import app
from app.schemas.budget import BudgetProfileCreate
from app.services.budget.budget_service import create_budget_profile


@dataclass
class PageBenchmark:
    page: str
    calls: list[str]
    ms_median: float
    ms_p95: float


def _seed_heavy_profile(session: Session) -> int:
    suffix = int(time.time() * 1000)
    profile = create_budget_profile(
        session, BudgetProfileCreate(name=f"Benchmark {suffix}", description=None)
    )
    profile_id = profile.id
    client = TestClient(app)

    for offset, label, amount in [
        (0, "Salário CLT", 10875.0),
        (0, "Salário PJ", 16000.0),
    ]:
        client.post(
            f"/budget/profiles/{profile_id}/months/2026-07/incomes",
            json={
                "label": label,
                "amount_brl": amount,
                "recurring_12_months": offset == 0,
            },
        )

    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    category_id = snapshot["categories"][0]["category_id"]

    recurring_specs = [
        ("Aluguel", 3200.0, True, None),
        ("Internet", 150.0, True, None),
        ("Academia", 120.0, True, "2027-06"),
        ("Supermercado", 850.0, False, None),
    ]
    for description, amount, recurring, end in recurring_specs:
        payload = {
            "description": description,
            "event_date": "2026-06-10",
            "amount_brl": amount,
            "category_id": category_id,
            "recurring": recurring,
            "indefinite": end is None,
        }
        if end:
            payload["end_year_month"] = end
        client.post(f"/budget/profiles/{profile_id}/months/2026-07/expenses", json=payload)

    return profile_id


def _timed_page(client: TestClient, calls: list[tuple[str, str]], repeats: int = 5) -> list[float]:
    samples: list[float] = []
    for _ in range(repeats):
        start = time.perf_counter()
        for method, url in calls:
            response = client.request(method, url)
            if response.status_code >= 400:
                raise RuntimeError(f"{method} {url} -> {response.status_code}: {response.text[:200]}")
        samples.append((time.perf_counter() - start) * 1000)
    return samples


def _summarize(samples: list[float]) -> tuple[float, float]:
    ordered = sorted(samples)
    median = statistics.median(ordered)
    idx = max(0, min(len(ordered) - 1, int(len(ordered) * 0.95) - 1))
    return round(median, 2), round(ordered[idx], 2)


def _month_snapshot_url(profile_id: int, year_month: str, view: str | None = None) -> str:
    base = f"/budget/profiles/{profile_id}/months/{year_month}"
    if view:
        return f"{base}?view={view}"
    return base


def run_benchmark(label: str, repeats: int) -> dict:
    init_db()
    with Session(engine) as session:
        profile_id = _seed_heavy_profile(session)

    client = TestClient(app)
    year_month = "2026-07"
    use_light_views = label == "pos-p1"
    month_url = lambda view=None: _month_snapshot_url(profile_id, year_month, view if use_light_views else None)
    pages: list[tuple[str, list[tuple[str, str]]]] = [
        (
            "Layout (perfis ativos)",
            [("GET", "/budget/profiles"), ("GET", "/budget/active")],
        ),
        (
            "Painel",
            [
                (
                    "GET",
                    f"/budget/profiles/{profile_id}/dashboard?months=6&focus={year_month}&forward=6",
                )
            ],
        ),
        ("Orçamento", [("GET", month_url())]),
        (
            "Despesas",
            [
                ("GET", month_url("expenses" if use_light_views else None)),
                ("GET", f"/budget/profiles/{profile_id}/tags"),
                ("GET", f"/budget/profiles/{profile_id}/recurring-expenses"),
            ],
        ),
        ("Metas", [("GET", month_url("targets" if use_light_views else None))]),
        ("Renda", [("GET", month_url("incomes" if use_light_views else None))]),
        ("Perfis", [("GET", "/budget/profiles")]),
        ("Metas / Tags", [("GET", f"/budget/profiles/{profile_id}/tags")]),
    ]

    results: list[PageBenchmark] = []
    for page_name, calls in pages:
        call_labels = [f"{method} {url.split('?')[0]}" for method, url in calls]
        samples = _timed_page(client, calls, repeats=repeats)
        median, p95 = _summarize(samples)
        results.append(PageBenchmark(page_name, call_labels, median, p95))

    total_median = round(sum(r.ms_median for r in results), 2)
    report = {
        "label": label,
        "generated_at": date.today().isoformat(),
        "profile_id": profile_id,
        "repeats_per_call": repeats,
        "pages": [
            {
                "page": r.page,
                "calls": r.calls,
                "ms_median": r.ms_median,
                "ms_p95": r.ms_p95,
            }
            for r in results
        ],
        "total_ms_median": total_median,
    }
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--label", required=True, help="Identificador do run (ex.: antes, depois)")
    parser.add_argument("--repeats", type=int, default=5)
    parser.add_argument(
        "--out",
        default=None,
        help="Arquivo JSON de saída (default: test-reports/financeiro-benchmark-<label>.json)",
    )
    args = parser.parse_args()

    out_path = Path(args.out or ROOT / f"test-reports/financeiro-benchmark-{args.label}.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)

    report = run_benchmark(args.label, args.repeats)
    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Benchmark Financeiro [{args.label}]")
    print(f"profile_id={report['profile_id']} repeats={report['repeats_per_call']}")
    print("-" * 72)
    for row in report["pages"]:
        print(f"{row['page']:<22} median={row['ms_median']:>8.2f} ms  p95={row['ms_p95']:>8.2f} ms")
    print("-" * 72)
    print(f"{'TOTAL (soma medianas)':<22} {report['total_ms_median']:>8.2f} ms")
    print(f"Salvo em {out_path}")


if __name__ == "__main__":
    main()
