"""Compara benchmark Financeiro em tres estagios: antes, pos-P0 e pos-P1."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def _load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--antes", default="test-reports/financeiro-benchmark-antes.json")
    parser.add_argument("--pos-p0", default="test-reports/financeiro-benchmark-pos-p0.json")
    parser.add_argument("--pos-p1", default="test-reports/financeiro-benchmark-pos-p1.json")
    parser.add_argument("--out", default="test-reports/financeiro-benchmark-comparativo.md")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[2]
    antes = _load(root / args.antes)
    pos_p0 = _load(root / args.pos_p0)
    pos_p1 = _load(root / args.pos_p1)

    antes_by_page = {row["page"]: row for row in antes["pages"]}
    p0_by_page = {row["page"]: row for row in pos_p0["pages"]}
    p1_by_page = {row["page"]: row for row in pos_p1["pages"]}

    lines = [
        "# Benchmark Financeiro — antes / pos-P0 / pos-P1",
        "",
        f"- Antes (baseline): `{args.antes}`",
        f"- Pos-P0 (timeline + sync unico): `{args.pos_p0}`",
        f"- Pos-P1 (views leves + eager load): `{args.pos_p1}`",
        f"- Repeticoes por pagina: {antes['repeats_per_call']}",
        "",
        "| Pagina | Antes (ms) | Pos-P0 (ms) | Pos-P1 (ms) | Delta P1 vs antes |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]

    for page in antes_by_page:
        a = antes_by_page[page]["ms_median"]
        p0 = p0_by_page.get(page, {}).get("ms_median", 0.0)
        p1 = p1_by_page.get(page, {}).get("ms_median", 0.0)
        delta = round(p1 - a, 2)
        lines.append(f"| {page} | {a:.2f} | {p0:.2f} | {p1:.2f} | {delta:+.2f} |")

    a_total = antes["total_ms_median"]
    p0_total = pos_p0["total_ms_median"]
    p1_total = pos_p1["total_ms_median"]
    lines.extend(
        [
            f"| **TOTAL** | **{a_total:.2f}** | **{p0_total:.2f}** | **{p1_total:.2f}** | **{p1_total - a_total:+.2f}** |",
            "",
            "## Escopo medido",
            "",
            "Tempo das chamadas de API equivalentes ao carregamento inicial de cada rota do modulo Financeiro.",
            "",
            "### Pos-P0 (Painel)",
            "",
            "1. Timeline via agregacao SQL (`GROUP BY year_month`).",
            "2. `sync_recurring_expenses_for_month` uma unica vez no ultimo mes da timeline.",
            "",
            "### Pos-P1 (demais paginas + Painel)",
            "",
            "1. Snapshots leves por rota: `view=targets` (Metas), `incomes` (Renda), `expenses` (Despesas), `dashboard` (Painel).",
            "2. Eager load de categorias, tags e fontes de renda; KPIs calculados em passagem unica sobre transacoes.",
        ]
    )

    out_path = root / args.out
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Relatorio salvo em {out_path}")


if __name__ == "__main__":
    main()
