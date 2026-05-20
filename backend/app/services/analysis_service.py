import json
from datetime import datetime

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.analysis import (
    AnalysisCriterionDefinition,
    AnalysisProfileSettings,
    AnalysisViabilityRule,
    AssetAnalysisScore,
)
from app.models.asset import Asset, DisplayClass
from app.services.analysis_defaults import (
    PROFILE_STOCK_BR,
    default_stock_br_criteria,
    default_stock_br_table_display,
    default_stock_br_viability_rules,
)
from app.services.analysis_engine import (
    AnalysisBlock,
    AnalysisSummary,
    CriterionDefinition,
    ScoreOption,
    TableDisplaySettings,
    TableSumColumnSettings,
    ViabilidadeWeightSettings,
    ViabilityBand,
    ViabilityRule,
    score_option_dropdown_label,
    summarize_analysis,
)
from app.services.asset_service import infer_display_class


def _criterion_to_db(c: CriterionDefinition, profile: str) -> AnalysisCriterionDefinition:
    return AnalysisCriterionDefinition(
        profile=profile,
        block=c.block.value if isinstance(c.block, AnalysisBlock) else str(c.block),
        code=c.code,
        label=c.label,
        help_text=c.help_text,
        weight=c.weight,
        sort_order=c.sort_order,
        score_options_json=json.dumps([o.model_dump() for o in c.score_options]),
    )


def _criterion_from_db(row: AnalysisCriterionDefinition) -> CriterionDefinition:
    raw = json.loads(row.score_options_json or "[]")
    score_options = [ScoreOption(**o) for o in raw]
    input_type = "yes_no" if not score_options else "select"
    return CriterionDefinition(
        code=row.code,
        block=AnalysisBlock(row.block),
        label=row.label,
        help_text=row.help_text,
        weight=row.weight,
        sort_order=row.sort_order,
        input_type=input_type,
        score_options=score_options,
    )


def _rule_to_db(r: ViabilityRule, profile: str) -> AnalysisViabilityRule:
    return AnalysisViabilityRule(
        profile=profile,
        block=r.block.value if isinstance(r.block, AnalysisBlock) else str(r.block),
        method=r.method,
        rules_json=json.dumps({"bands": [b.model_dump() for b in r.bands]}),
    )


def _rule_from_db(row: AnalysisViabilityRule) -> ViabilityRule:
    payload = json.loads(row.rules_json or "{}")
    bands = [ViabilityBand(**b) for b in payload.get("bands", [])]
    return ViabilityRule(block=row.block, method=row.method, bands=bands)


def _merge_stock_br_criteria(stored: list[CriterionDefinition]) -> list[CriterionDefinition]:
    stored_by_code = {c.code: c for c in stored}
    merged: list[CriterionDefinition] = []

    for default in default_stock_br_criteria():
        existing = stored_by_code.get(default.code)
        if existing is None:
            merged.append(default)
            continue

        if default.input_type == "yes_no":
            merged.append(
                default.model_copy(
                    update={
                        "weight": existing.weight,
                        "sort_order": existing.sort_order,
                        "label": existing.label,
                        "help_text": default.help_text,
                    }
                )
            )
            continue

        stored_by_value = {option.value: option for option in existing.score_options}
        options: list[ScoreOption] = []
        for default_option in default.score_options:
            stored_option = stored_by_value.get(default_option.value)
            if stored_option is None or not stored_option.characteristic:
                options.append(default_option)
                continue
            options.append(
                default_option.model_copy(
                    update={
                        "seal": stored_option.seal or default_option.seal,
                        "characteristic": stored_option.characteristic,
                        "color": stored_option.color or default_option.color,
                        "label": score_option_dropdown_label(stored_option),
                    }
                )
            )

        merged.append(
            existing.model_copy(
                update={
                    "input_type": default.input_type,
                    "score_options": options,
                    "help_text": existing.help_text or default.help_text,
                }
            )
        )

    return merged


def _criteria_needs_upgrade(stored: list[CriterionDefinition], merged: list[CriterionDefinition]) -> bool:
    if {c.code for c in stored} != {c.code for c in merged}:
        return True

    stored_by_code = {c.code: c for c in stored}
    for merged_criterion in merged:
        stored_criterion = stored_by_code.get(merged_criterion.code)
        if stored_criterion is None:
            return True
        if stored_criterion.input_type != merged_criterion.input_type:
            return True
        if stored_criterion.help_text != merged_criterion.help_text:
            return True
        if len(stored_criterion.score_options) != len(merged_criterion.score_options):
            return True
        for stored_option, merged_option in zip(
            stored_criterion.score_options,
            merged_criterion.score_options,
            strict=True,
        ):
            if (
                stored_option.label != merged_option.label
                or stored_option.characteristic != merged_option.characteristic
                or stored_option.seal != merged_option.seal
            ):
                return True
    return False


def seed_stock_br_config(session: Session) -> None:
    rows = session.exec(
        select(AnalysisCriterionDefinition).where(AnalysisCriterionDefinition.profile == PROFILE_STOCK_BR)
    ).all()
    if not rows:
        for c in default_stock_br_criteria():
            session.add(_criterion_to_db(c, PROFILE_STOCK_BR))
        for r in default_stock_br_viability_rules():
            session.add(_rule_to_db(r, PROFILE_STOCK_BR))
        _ensure_profile_table_display(session, PROFILE_STOCK_BR)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
        return

    stored = [_criterion_from_db(row) for row in rows]
    merged = _merge_stock_br_criteria(stored)
    if not _criteria_needs_upgrade(stored, merged):
        return

    for row in rows:
        session.delete(row)
    session.flush()
    for criterion in merged:
        session.add(_criterion_to_db(criterion, PROFILE_STOCK_BR))
    session.commit()


def reset_stock_br_config(session: Session) -> None:
    for row in session.exec(
        select(AnalysisCriterionDefinition).where(AnalysisCriterionDefinition.profile == PROFILE_STOCK_BR)
    ).all():
        session.delete(row)
    for row in session.exec(
        select(AnalysisViabilityRule).where(AnalysisViabilityRule.profile == PROFILE_STOCK_BR)
    ).all():
        session.delete(row)
    settings_row = session.get(AnalysisProfileSettings, PROFILE_STOCK_BR)
    if settings_row:
        session.delete(settings_row)
    session.commit()
    seed_stock_br_config(session)


def _ensure_profile_table_display(session: Session, profile: str) -> None:
    existing = session.get(AnalysisProfileSettings, profile)
    if existing:
        return
    session.add(
        AnalysisProfileSettings(
            profile=profile,
            settings_json=json.dumps(default_stock_br_table_display().model_dump()),
        )
    )


def _normalize_table_display_settings(payload: dict) -> TableDisplaySettings:
    defaults = default_stock_br_table_display()
    sum_col = payload.get("sum_column")
    if not isinstance(sum_col, dict):
        return defaults

    merged_sum = defaults.sum_column.model_copy()
    if "enabled" in sum_col:
        merged_sum.enabled = bool(sum_col["enabled"])
    if "label" in sum_col:
        merged_sum.label = str(sum_col["label"])
    if "diagram_multiplier" in sum_col:
        merged_sum.diagram_multiplier = float(sum_col["diagram_multiplier"])

    weights_payload = sum_col.get("viabilidade_weights")
    if isinstance(weights_payload, dict):
        merged_weights = merged_sum.viabilidade_weights.model_copy()
        for key in ("azulim", "viavel", "atencao", "bomba"):
            if key in weights_payload:
                setattr(merged_weights, key, float(weights_payload[key]))
        merged_sum.viabilidade_weights = merged_weights

    return TableDisplaySettings(sum_column=merged_sum)


def get_profile_table_display(session: Session, profile: str) -> TableDisplaySettings:
    if profile == PROFILE_STOCK_BR:
        seed_stock_br_config(session)

    row = session.get(AnalysisProfileSettings, profile)
    if not row:
        _ensure_profile_table_display(session, profile)
        session.commit()
        row = session.get(AnalysisProfileSettings, profile)

    if not row or not row.settings_json:
        return default_stock_br_table_display()

    payload = json.loads(row.settings_json)
    return _normalize_table_display_settings(payload)


def save_profile_table_display(
    session: Session,
    profile: str,
    table_display: TableDisplaySettings,
) -> None:
    row = session.get(AnalysisProfileSettings, profile)
    if row:
        row.settings_json = json.dumps(table_display.model_dump())
        session.add(row)
    else:
        session.add(
            AnalysisProfileSettings(
                profile=profile,
                settings_json=json.dumps(table_display.model_dump()),
            )
        )
    session.commit()


def get_profile_config(session: Session, profile: str) -> tuple[list[CriterionDefinition], list[ViabilityRule]]:
    if profile == PROFILE_STOCK_BR:
        seed_stock_br_config(session)

    criteria_rows = session.exec(
        select(AnalysisCriterionDefinition)
        .where(AnalysisCriterionDefinition.profile == profile)
        .order_by(AnalysisCriterionDefinition.sort_order)
    ).all()
    rule_rows = session.exec(
        select(AnalysisViabilityRule).where(AnalysisViabilityRule.profile == profile)
    ).all()

    criteria = [_criterion_from_db(r) for r in criteria_rows]
    rules = [_rule_from_db(r) for r in rule_rows]
    if profile == PROFILE_STOCK_BR:
        criteria = _merge_stock_br_criteria(criteria)

    return (criteria, rules)


def save_profile_config(
    session: Session,
    profile: str,
    criteria: list[CriterionDefinition],
    rules: list[ViabilityRule],
    table_display: TableDisplaySettings | None = None,
) -> None:
    for row in session.exec(
        select(AnalysisCriterionDefinition).where(AnalysisCriterionDefinition.profile == profile)
    ).all():
        session.delete(row)
    for row in session.exec(
        select(AnalysisViabilityRule).where(AnalysisViabilityRule.profile == profile)
    ).all():
        session.delete(row)

    session.flush()

    for c in criteria:
        session.add(_criterion_to_db(c, profile))
    for r in rules:
        session.add(_rule_to_db(r, profile))
    if table_display is not None:
        save_profile_table_display(session, profile, table_display)
    else:
        session.commit()


def list_eligible_assets(session: Session, profile: str) -> list[Asset]:
    assets = session.exec(select(Asset)).all()
    if profile == PROFILE_STOCK_BR:
        return [
            a
            for a in assets
            if infer_display_class(a.asset_type, a.market, a.etf_subtype) == DisplayClass.STOCKS
        ]
    return list(assets)


def get_asset_scores(session: Session, asset_id: int) -> dict[str, int | None]:
    rows = session.exec(
        select(AssetAnalysisScore).where(AssetAnalysisScore.asset_id == asset_id)
    ).all()
    return {r.criterion_code: r.score for r in rows}


def save_asset_scores(
    session: Session,
    asset_id: int,
    scores: dict[str, int | None],
) -> None:
    for code, value in scores.items():
        existing = session.exec(
            select(AssetAnalysisScore).where(
                AssetAnalysisScore.asset_id == asset_id,
                AssetAnalysisScore.criterion_code == code,
            )
        ).first()
        if existing:
            existing.score = value
            existing.updated_at = datetime.utcnow()
            session.add(existing)
        else:
            session.add(
                AssetAnalysisScore(
                    asset_id=asset_id,
                    criterion_code=code,
                    score=value,
                )
            )
    session.commit()


def build_asset_analysis_read(
    session: Session,
    asset: Asset,
    profile: str,
) -> tuple[dict[str, int | None], AnalysisSummary, list[CriterionDefinition], list[ViabilityRule]]:
    criteria, rules = get_profile_config(session, profile)
    scores = get_asset_scores(session, asset.id)
    summary = summarize_analysis(scores, criteria, rules)
    return scores, summary, criteria, rules


def list_assets_with_analysis(session: Session, profile: str) -> list[tuple[Asset, dict[str, int | None], AnalysisSummary]]:
    criteria, rules = get_profile_config(session, profile)
    assets = list_eligible_assets(session, profile)
    result: list[tuple[Asset, dict[str, int | None], AnalysisSummary]] = []
    for asset in assets:
        scores = get_asset_scores(session, asset.id)
        summary = summarize_analysis(scores, criteria, rules)
        result.append((asset, scores, summary))
    return result
