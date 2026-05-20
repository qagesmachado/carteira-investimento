import pytest

from app.services.analysis_defaults import default_stock_br_criteria
from app.services.analysis_engine import (
    VIABILIDADE_CODE,
    AnalysisBlock,
    AnalysisSummary,
    BlockSummary,
    CriterionDefinition,
    ScoreOption,
    TableSumColumnSettings,
    ViabilidadeWeightSettings,
    build_score_option,
    compute_block_numeric_score,
    compute_diagram_sum_score,
    compute_table_sum_score,
    resolve_manual_viability,
    summarize_analysis,
)


def test_compute_block_min_excludes_viabilidade():
    criteria = [
        CriterionDefinition(
            code="lucros",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Lucros",
            score_options=[build_score_option(5, "Viável", "Ok")],
        ),
        CriterionDefinition(
            code="divida",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Dívida",
            score_options=[build_score_option(3, "Requer atenção", "Ok")],
        ),
    ]
    assert compute_block_numeric_score({"lucros": 5, "divida": 3}, criteria, "min") == 3


def test_compute_diagram_sum():
    criteria = default_stock_br_criteria()
    diagrama = [c for c in criteria if c.block == AnalysisBlock.DIAGRAMA]
    assert compute_diagram_sum_score({"roe": 1, "cagr": -1, "dividendos": 1}, diagrama) == 1


def test_resolve_manual_viabilidade():
    criteria = default_stock_br_criteria()
    viabilidade = next(c for c in criteria if c.code == VIABILIDADE_CODE)
    result = resolve_manual_viability(2, viabilidade)
    assert result is not None
    assert result.label == "2 - VIÁVEL"
    assert result.color == "viavel"


def test_summarize_manual_viabilidade_and_diagram():
    criteria = default_stock_br_criteria()
    scores = {
        "lucros": 5,
        "divida": 5,
        "tag_along": 5,
        "segmento": 5,
        VIABILIDADE_CODE: 2,
        "roe": 1,
        "cagr": -1,
    }
    summary = summarize_analysis(scores, criteria, [])
    assert summary.fundamental.score == 5
    assert summary.viabilidade is not None
    assert summary.viabilidade.band_id == "viável"
    assert summary.diagrama.score == 0


def test_compute_table_sum():
    summary = AnalysisSummary(
        fundamental=BlockSummary(score=2, viability=None),
        diagrama=BlockSummary(score=5, viability=None),
        viabilidade=None,
    )
    scores = {
        "lucros": 5,
        "divida": 2,
        "tag_along": 5,
        "segmento": 3,
        VIABILIDADE_CODE: 3,
    }
    settings = TableSumColumnSettings(
        enabled=True,
        label="Soma",
        diagram_multiplier=2.0,
        viabilidade_weights=ViabilidadeWeightSettings(
            azulim=10,
            viavel=3,
            atencao=-5,
            bomba=-10,
        ),
    )
    assert compute_table_sum_score(scores, summary, settings) == 20


def test_unknown_method_raises():
    criteria = [
        CriterionDefinition(
            code="a",
            block=AnalysisBlock.FUNDAMENTAL,
            label="A",
            score_options=[ScoreOption(value=5, label="5")],
        )
    ]
    with pytest.raises(ValueError, match="Unknown method"):
        compute_block_numeric_score({"a": 5}, criteria, "invalid")
