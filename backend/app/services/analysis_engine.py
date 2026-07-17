from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class AnalysisBlock(StrEnum):
    FUNDAMENTAL = "fundamental"
    DIAGRAMA = "diagrama"
    ALLOCATION = "allocation"


class AnalysisProfile(StrEnum):
    STOCK_BR = "stock_br"
    FII_BR = "fii_br"
    ETF_INTL = "etf_intl"


VIABILIDADE_CODE = "viabilidade"
PVP_DESCARTE_CODE = "pvp_descarte"
SEGMENTO_FII_CODE = "segmento_fii"
SEGMENTO_FII_REF_CODE = "segmento_fii_ref"


class ScoreOption(BaseModel):
    value: int
    label: str = ""
    seal: str = ""
    characteristic: str = ""
    color: str | None = None


class CriterionDefinition(BaseModel):
    code: str
    block: AnalysisBlock
    label: str
    help_text: str = ""
    weight: float = 1.0
    sort_order: int = 0
    input_type: str = "select"
    score_options: list[ScoreOption] = Field(default_factory=list)


class ViabilityBand(BaseModel):
    id: str
    label: str
    min_score: float
    color: str | None = None


class ViabilityRule(BaseModel):
    block: AnalysisBlock | str
    method: str = "min"
    bands: list[ViabilityBand] = Field(default_factory=list)


class ViabilityResult(BaseModel):
    block: str
    score: float | None
    band_id: str | None
    label: str
    color: str | None = None


class BlockSummary(BaseModel):
    score: float | None
    viability: ViabilityResult | None = None


class AnalysisSummary(BaseModel):
    fundamental: BlockSummary
    diagrama: BlockSummary
    viabilidade: ViabilityResult | None = None


class ViabilidadeWeightSettings(BaseModel):
    azulim: float = 10.0
    viavel: float = 3.0
    atencao: float = -5.0
    bomba: float = -10.0


class TableSumColumnSettings(BaseModel):
    use_fundamental: bool = True
    use_diagram: bool = True
    label: str = "Soma"
    diagram_multiplier: float = 2.0
    viabilidade_weights: ViabilidadeWeightSettings = Field(default_factory=ViabilidadeWeightSettings)


class TableDisplaySettings(BaseModel):
    sum_column: TableSumColumnSettings = Field(default_factory=TableSumColumnSettings)


FUNDAMENTAL_SUM_CODES = ("lucros", "divida", "tag_along", "segmento")

FUNDAMENTAL_SUM_CODES_BY_PROFILE: dict[str, tuple[str, ...]] = {
    AnalysisProfile.STOCK_BR.value: ("lucros", "divida", "tag_along", "segmento"),
    AnalysisProfile.FII_BR.value: ("vacancia", "qtd_ativos", "alavancagem", SEGMENTO_FII_CODE),
}


def fundamental_sum_codes_for_profile(profile: str) -> tuple[str, ...]:
    return FUNDAMENTAL_SUM_CODES_BY_PROFILE.get(profile, FUNDAMENTAL_SUM_CODES)


def is_pvp_discarded(scores: dict[str, int | None]) -> bool:
    return scores.get(PVP_DESCARTE_CODE) == 1


def score_option_dropdown_label(option: ScoreOption) -> str:
    if option.characteristic:
        return f"{option.value} - {option.characteristic}"
    return option.label or str(option.value)


def score_option_full_label(option: ScoreOption) -> str:
    if option.seal and option.characteristic:
        return f"{option.value} - {option.seal} - {option.characteristic}"
    if option.characteristic:
        return f"{option.value} - {option.characteristic}"
    return option.label or str(option.value)


def build_score_option(
    value: int,
    seal: str,
    characteristic: str,
    color: str | None = None,
) -> ScoreOption:
    return ScoreOption(
        value=value,
        seal=seal,
        characteristic=characteristic,
        color=color,
        label=score_option_dropdown_label(
            ScoreOption(value=value, seal=seal, characteristic=characteristic)
        ),
    )


def _collect_weighted_scores(
    scores: dict[str, int | None],
    criteria: list[CriterionDefinition],
) -> list[tuple[float, float]]:
    pairs: list[tuple[float, float]] = []
    by_code = {c.code: c for c in criteria}
    for code, value in scores.items():
        if value is None:
            continue
        criterion = by_code.get(code)
        if not criterion:
            continue
        weight = criterion.weight if criterion.weight > 0 else 1.0
        pairs.append((float(value), weight))
    return pairs


def compute_block_numeric_score(
    scores: dict[str, int | None],
    criteria: list[CriterionDefinition],
    method: str,
) -> float | None:
    pairs = _collect_weighted_scores(scores, criteria)
    if not pairs:
        return None

    values = [v for v, _ in pairs]
    if method == "min":
        return min(values)
    if method == "weighted_average":
        total_w = sum(w for _, w in pairs)
        if total_w <= 0:
            return None
        return sum(v * w for v, w in pairs) / total_w
    if method == "weighted_min":
        return min(v * w for v, w in pairs)
    raise ValueError(f"Unknown method: {method}")


def compute_diagram_sum_score(
    scores: dict[str, int | None],
    criteria: list[CriterionDefinition],
) -> float | None:
    total = 0.0
    answered = 0
    for criterion in criteria:
        if criterion.input_type in ("flag",):
            continue
        value = scores.get(criterion.code)
        if value is None:
            continue
        total += float(value)
        answered += 1
    return total if answered > 0 else None


def resolve_viability(
    score: float | None,
    rule: ViabilityRule,
) -> ViabilityResult | None:
    if score is None:
        return ViabilityResult(
            block=str(rule.block),
            score=None,
            band_id="sem_dados",
            label="1 - Sem dados",
        )

    sorted_bands = sorted(rule.bands, key=lambda b: b.min_score, reverse=True)
    for band in sorted_bands:
        if score >= band.min_score:
            return ViabilityResult(
                block=str(rule.block),
                score=score,
                band_id=band.id,
                label=band.label,
                color=band.color,
            )

    if sorted_bands:
        fallback = sorted_bands[-1]
        return ViabilityResult(
            block=str(rule.block),
            score=score,
            band_id=fallback.id,
            label=fallback.label,
            color=fallback.color,
        )
    return None


def resolve_manual_viability(
    score: int | None,
    criterion: CriterionDefinition | None,
) -> ViabilityResult | None:
    if score is None or criterion is None:
        return None

    for option in criterion.score_options:
        if option.value == score:
            seal = option.seal or option.label
            return ViabilityResult(
                block="viabilidade",
                score=float(score),
                band_id=seal.lower().replace(" ", "_"),
                label=f"{option.value} - {seal.upper()}",
                color=option.color,
            )
    return None


def resolve_viabilidade_table_weight(
    score: int | None,
    weights: ViabilidadeWeightSettings,
) -> float | None:
    if score is None:
        return None
    mapping = {
        1: weights.azulim,
        2: weights.viavel,
        3: weights.atencao,
        4: weights.bomba,
    }
    if score not in mapping:
        return None
    return mapping[score]


def compute_fundamental_table_score(
    scores: dict[str, int | None],
    settings: TableSumColumnSettings,
    profile: str = AnalysisProfile.STOCK_BR.value,
) -> float | None:
    if is_pvp_discarded(scores):
        return None

    total = 0.0
    has_any = False

    for code in fundamental_sum_codes_for_profile(profile):
        value = scores.get(code)
        if value is not None:
            total += float(value)
            has_any = True

    viabilidade_weight = resolve_viabilidade_table_weight(
        scores.get(VIABILIDADE_CODE),
        settings.viabilidade_weights,
    )
    if viabilidade_weight is not None:
        total += viabilidade_weight
        has_any = True

    return total if has_any else None


def compute_combined_table_score(
    scores: dict[str, int | None],
    summary: AnalysisSummary,
    settings: TableSumColumnSettings,
    profile: str = AnalysisProfile.STOCK_BR.value,
) -> float | None:
    if is_pvp_discarded(scores):
        return None
    if not settings.use_fundamental and not settings.use_diagram:
        return None

    total: float | None = None
    has_any = False

    if settings.use_fundamental:
        fundamental = compute_fundamental_table_score(scores, settings, profile)
        if fundamental is not None:
            total = float(fundamental)
            has_any = True

    if settings.use_diagram and summary.diagrama.score is not None:
        diagram = float(summary.diagrama.score)
        weighted = (
            diagram * settings.diagram_multiplier
            if settings.use_fundamental and settings.use_diagram
            else diagram
        )
        total = (total or 0.0) + weighted
        has_any = True

    return total if has_any else None


def compute_rebalance_table_score(
    scores: dict[str, int | None],
    summary: AnalysisSummary,
    settings: TableSumColumnSettings,
    profile: str = AnalysisProfile.STOCK_BR.value,
) -> float | None:
    return compute_combined_table_score(scores, summary, settings, profile)


def compute_table_sum_score(
    scores: dict[str, int | None],
    summary: AnalysisSummary,
    settings: TableSumColumnSettings,
    profile: str = AnalysisProfile.STOCK_BR.value,
) -> float | None:
    return compute_rebalance_table_score(scores, summary, settings, profile)


def summarize_analysis(
    scores: dict[str, int | None],
    criteria: list[CriterionDefinition],
    rules: list[ViabilityRule],
) -> AnalysisSummary:
    by_block: dict[str, list[CriterionDefinition]] = {}
    for c in criteria:
        by_block.setdefault(c.block.value, []).append(c)

    fundamental_all = by_block.get(AnalysisBlock.FUNDAMENTAL.value, [])
    fundamental_criteria = [
        c
        for c in fundamental_all
        if c.code != VIABILIDADE_CODE and c.input_type in ("select", "segment")
    ]
    viabilidade_criterion = next(
        (c for c in fundamental_all if c.code == VIABILIDADE_CODE),
        None,
    )
    diagrama_criteria = by_block.get(AnalysisBlock.DIAGRAMA.value, [])

    fundamental_score = compute_block_numeric_score(scores, fundamental_criteria, "min")
    diagrama_score = compute_diagram_sum_score(scores, diagrama_criteria)
    viabilidade = resolve_manual_viability(scores.get(VIABILIDADE_CODE), viabilidade_criterion)

    return AnalysisSummary(
        fundamental=BlockSummary(score=fundamental_score, viability=None),
        diagrama=BlockSummary(score=diagrama_score, viability=None),
        viabilidade=viabilidade,
    )


def criterion_definitions_to_json(criteria: list[CriterionDefinition]) -> list[dict[str, Any]]:
    return [c.model_dump() for c in criteria]


def viability_rules_to_json(rules: list[ViabilityRule]) -> list[dict[str, Any]]:
    return [r.model_dump() for r in rules]
