import json

import pytest

from app.models.asset import AssetType, DisplayClass
from app.schemas.rebalance import AllocationTargets, ClassTargets, StocksSplitTargets
from app.services.rebalance_engine import (
    REBALANCE_CLASS_LABELS,
    compute_class_rows,
    compute_fund_asset_rows,
    compute_position_asset_rows,
    compute_stock_asset_rows,
    compute_stocks_sub_rows,
    parse_allocation_targets,
    serialize_allocation_targets,
    validate_allocation_targets_json,
)


def test_parse_allocation_targets_defaults_when_null() -> None:
    targets = parse_allocation_targets(None)
    assert targets.classes.stocks == 30.0
    assert targets.stocks_split.etf == 70.0


def test_parse_allocation_targets_from_json() -> None:
    raw = json.dumps(
        {
            "classes": {
                "stocks": 25,
                "funds": 10,
                "international": 15,
                "fixed_income": 45,
                "crypto": 5,
            },
            "stocks_split": {"etf": 60, "stock": 40},
        }
    )
    targets = parse_allocation_targets(raw)
    assert targets.classes.stocks == 25.0
    assert targets.stocks_split.stock == 40.0


def test_validate_allocation_targets_json_rejects_bad_sum() -> None:
    raw = json.dumps(
        {
            "classes": {
                "stocks": 30,
                "funds": 5,
                "international": 20,
                "fixed_income": 40,
                "crypto": 10,
            },
            "stocks_split": {"etf": 70, "stock": 30},
        }
    )
    with pytest.raises(ValueError, match="class targets must sum to 100"):
        validate_allocation_targets_json(raw)


def test_serialize_roundtrip() -> None:
    targets = AllocationTargets(
        classes=ClassTargets(stocks=30, funds=5, international=20, fixed_income=40, crypto=5),
        stocks_split=StocksSplitTargets(etf=70, stock=30),
    )
    raw = serialize_allocation_targets(targets)
    parsed = parse_allocation_targets(raw)
    assert parsed.model_dump() == targets.model_dump()


def test_compute_class_rows() -> None:
    targets = parse_allocation_targets(None)
    current = {
        DisplayClass.STOCKS.value: 48_000.0,
        DisplayClass.FUNDS.value: 8_000.0,
        DisplayClass.INTERNATIONAL.value: 32_000.0,
        DisplayClass.FIXED_INCOME.value: 64_000.0,
        DisplayClass.CRYPTO.value: 8_000.0,
    }
    rows = compute_class_rows(160_000.0, current, targets)
    assert len(rows) == 5
    stocks = next(r for r in rows if r.display_class == DisplayClass.STOCKS.value)
    assert stocks.target_value_brl == 48_000.0
    assert stocks.gap_brl == 0.0
    international = next(r for r in rows if r.display_class == DisplayClass.INTERNATIONAL.value)
    assert international.target_value_brl == 32_000.0
    assert international.gap_brl == pytest.approx(0.0)
    assert international.current_value_brl == 32_000.0
    assert international.gap_brl == 0.0
    # Below target example from spreadsheet: stocks at 48k vs target 48k is exact
    # Simulate international below target
    current[DisplayClass.INTERNATIONAL.value] = 11_357.16
    rows2 = compute_class_rows(160_000.0, current, targets)
    intl2 = next(r for r in rows2 if r.display_class == DisplayClass.INTERNATIONAL.value)
    assert intl2.gap_brl == pytest.approx(20_642.84, rel=1e-4)


def test_compute_stocks_sub_rows() -> None:
    targets = parse_allocation_targets(None)
    current_by_sub = {"etf": 33_600.0, "stock": 14_400.0}
    rows = compute_stocks_sub_rows(160_000.0, 48_000.0, current_by_sub, targets)
    assert len(rows) == 2
    etf = next(r for r in rows if r.sub_type == "etf")
    assert etf.target_percent_of_stocks == 70.0
    assert etf.target_value_brl == pytest.approx(33_600.0)
    assert etf.gap_brl == 0.0
    stock = next(r for r in rows if r.sub_type == "stock")
    assert stock.target_value_brl == pytest.approx(14_400.0)


def test_compute_stock_asset_rows_score_weighted() -> None:
    targets = parse_allocation_targets(None)
    assets = [
        {"asset_id": 1, "symbol": "AAA3", "name": "A", "asset_type": AssetType.STOCK.value, "current_brl": 10_000.0, "sum_score": 30.0},
        {"asset_id": 2, "symbol": "BBB3", "name": "B", "asset_type": AssetType.STOCK.value, "current_brl": 4_400.0, "sum_score": 20.0},
        {"asset_id": 3, "symbol": "BOVA11", "name": "ETF", "asset_type": AssetType.ETF.value, "current_brl": 33_600.0, "sum_score": 80.0},
    ]
    rows = compute_stock_asset_rows(160_000.0, assets, targets)
    aaa = next(r for r in rows if r.symbol == "AAA3")
    bbb = next(r for r in rows if r.symbol == "BBB3")
    # % dentro da aba Ações/ETF BR (soma dos ativos do grupo = 100%)
    assert aaa.current_percent == pytest.approx(20.8333, rel=1e-3)
    assert aaa.target_percent == pytest.approx(18.0)  # 0.6 × 30% subtipo Ação
    assert aaa.target_value_brl == pytest.approx(8_640.0)
    assert aaa.gap_brl == 0.0
    assert bbb.target_percent == pytest.approx(12.0)  # 0.4 × 30%
    assert bbb.target_value_brl == pytest.approx(5_760.0)
    assert bbb.gap_brl == pytest.approx(1_360.0)
    etf = next(r for r in rows if r.symbol == "BOVA11")
    assert etf.target_percent == pytest.approx(70.0)  # 100% do bucket ETF
    assert etf.target_value_brl == pytest.approx(33_600.0)


def test_compute_stock_asset_rows_without_score() -> None:
    targets = parse_allocation_targets(None)
    assets = [
        {"asset_id": 1, "symbol": "ZZZ3", "name": "Z", "asset_type": AssetType.STOCK.value, "current_brl": 1_000.0, "sum_score": None},
    ]
    rows = compute_stock_asset_rows(10_000.0, assets, targets)
    assert rows[0].target_percent is None
    assert rows[0].score_included is False


def test_compute_fund_asset_rows_score_weighted() -> None:
    targets = parse_allocation_targets(None)
    assets = [
        {"asset_id": 1, "symbol": "HGLG11", "name": "A", "asset_type": "fii", "current_brl": 3_000.0, "sum_score": 30.0},
        {"asset_id": 2, "symbol": "XPLG11", "name": "B", "asset_type": "fii", "current_brl": 1_000.0, "sum_score": 20.0},
    ]
    rows = compute_fund_asset_rows(100_000.0, assets, targets)
    hglg = next(r for r in rows if r.symbol == "HGLG11")
    xplg = next(r for r in rows if r.symbol == "XPLG11")
    # % dentro da aba FII (peso × 100)
    assert hglg.target_percent == pytest.approx(60.0)
    assert hglg.target_value_brl == pytest.approx(3_000.0)
    assert hglg.gap_brl == 0.0
    assert xplg.target_percent == pytest.approx(40.0)
    assert xplg.target_value_brl == pytest.approx(2_000.0)
    assert xplg.gap_brl == pytest.approx(1_000.0)


def test_compute_fund_asset_rows_without_score() -> None:
    targets = parse_allocation_targets(None)
    assets = [
        {"asset_id": 1, "symbol": "KNRI11", "name": "K", "asset_type": "fii", "current_brl": 5_000.0, "sum_score": None},
    ]
    rows = compute_fund_asset_rows(50_000.0, assets, targets)
    assert rows[0].target_percent is None
    assert rows[0].score_included is False


def test_rebalance_class_labels_cover_all_keys() -> None:
    from app.schemas.rebalance import REBALANCE_CLASS_KEYS

    for key in REBALANCE_CLASS_KEYS:
        assert key in REBALANCE_CLASS_LABELS


def test_compute_position_asset_rows_without_targets() -> None:
    assets = [
        {
            "asset_id": 1,
            "symbol": "VOO",
            "name": "Vanguard",
            "asset_type": "etf",
            "current_brl": 20_000.0,
        },
    ]
    rows = compute_position_asset_rows(100_000.0, assets)
    assert len(rows) == 1
    voo = rows[0]
    assert voo.target_percent is None
    assert voo.current_percent == 100.0
