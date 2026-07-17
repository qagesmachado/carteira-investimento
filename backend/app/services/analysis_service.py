import json
from datetime import datetime

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.analysis import (
    AnalysisCriterionDefinition,
    AnalysisProfileSettings,
    AnalysisSegmentCatalog,
    AnalysisViabilityRule,
    AssetAnalysisScore,
    PortfolioAssetAllocation,
)
from app.models.asset import Asset, DisplayClass
from app.services.analysis_defaults import (
    ANALYSIS_LINK_CODE,
    METHODOLOGY_SIMPLES,
    PROFILE_CRYPTO,
    PROFILE_ETF_INTL,
    PROFILE_FII_BR,
    PROFILE_STOCK_BR,
    TARGET_PERCENT_CODE,
    SegmentCatalogEntry,
    default_crypto_criteria,
    default_crypto_table_display,
    default_etf_intl_criteria,
    default_etf_intl_table_display,
    default_fii_br_criteria,
    default_fii_br_segments,
    default_fii_br_table_display,
    default_fii_br_viability_rules,
    default_stock_br_criteria,
    default_stock_br_table_display,
    default_stock_br_viability_rules,
)
from app.services.analysis_engine import (
    AnalysisBlock,
    AnalysisSummary,
    CriterionDefinition,
    PVP_DESCARTE_CODE,
    SEGMENTO_FII_CODE,
    ScoreOption,
    TableDisplaySettings,
    TableSumColumnSettings,
    ViabilidadeWeightSettings,
    ViabilityBand,
    ViabilityRule,
    score_option_dropdown_label,
    summarize_analysis,
)
from app.services.analysis_pending_service import get_pending_asset_ids
from app.services.analysis_methodology_service import is_allocation_methodology
from app.services.asset_service import infer_display_class


_ALLOCATION_PROFILES = frozenset(
    {PROFILE_CRYPTO, PROFILE_ETF_INTL, PROFILE_STOCK_BR, PROFILE_FII_BR}
)

_PROFILE_REQUIRED_DISPLAY_CLASS: dict[str, DisplayClass] = {
    PROFILE_STOCK_BR: DisplayClass.STOCKS,
    PROFILE_FII_BR: DisplayClass.FUNDS,
    PROFILE_ETF_INTL: DisplayClass.INTERNATIONAL,
    PROFILE_CRYPTO: DisplayClass.CRYPTO,
}


def _format_target_percent_value(target_percent: float) -> str:
    return f"{target_percent:.4f}".rstrip("0").rstrip(".")


def _allocation_refs_from_row(row: PortfolioAssetAllocation | None) -> dict[str, str | None]:
    if row is None:
        return {}
    return {
        TARGET_PERCENT_CODE: _format_target_percent_value(row.target_percent),
        ANALYSIS_LINK_CODE: row.analysis_link,
    }


def get_portfolio_allocation(
    session: Session,
    portfolio_id: int,
    asset_id: int,
    profile: str,
) -> PortfolioAssetAllocation | None:
    return session.exec(
        select(PortfolioAssetAllocation).where(
            PortfolioAssetAllocation.portfolio_id == portfolio_id,
            PortfolioAssetAllocation.asset_id == asset_id,
            PortfolioAssetAllocation.profile == profile,
        )
    ).first()


def get_portfolio_allocation_refs(
    session: Session,
    portfolio_id: int,
    asset_id: int,
    profile: str,
) -> dict[str, str | None]:
    row = get_portfolio_allocation(session, portfolio_id, asset_id, profile)
    return _allocation_refs_from_row(row)


def merge_score_refs_for_profile(
    session: Session,
    asset_id: int,
    profile: str,
    score_refs: dict[str, str | None],
    portfolio_id: int | None,
) -> dict[str, str | None]:
    uses_allocation = profile in (PROFILE_ETF_INTL, PROFILE_CRYPTO) or (
        portfolio_id is not None
        and profile in (PROFILE_STOCK_BR, PROFILE_FII_BR)
        and is_allocation_methodology(session, portfolio_id, profile)
    )
    if not uses_allocation or portfolio_id is None:
        return score_refs
    allocation_refs = get_portfolio_allocation_refs(session, portfolio_id, asset_id, profile)
    merged = {
        key: value
        for key, value in score_refs.items()
        if key not in (TARGET_PERCENT_CODE, ANALYSIS_LINK_CODE)
    }
    merged.update(allocation_refs)
    return merged


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
    special_input_types = {
        PVP_DESCARTE_CODE: "flag",
        SEGMENTO_FII_CODE: "segment",
        TARGET_PERCENT_CODE: "percent",
        ANALYSIS_LINK_CODE: "url",
    }
    if row.code in special_input_types:
        input_type = special_input_types[row.code]
    elif not score_options:
        input_type = "yes_no"
    else:
        input_type = "select"
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


def _merge_profile_criteria(
    stored: list[CriterionDefinition],
    defaults_fn,
) -> list[CriterionDefinition]:
    stored_by_code = {c.code: c for c in stored}
    merged: list[CriterionDefinition] = []

    for default in defaults_fn():
        existing = stored_by_code.get(default.code)
        if existing is None:
            merged.append(default)
            continue

        if default.input_type in ("yes_no", "flag", "segment"):
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


def _merge_fii_br_criteria(stored: list[CriterionDefinition]) -> list[CriterionDefinition]:
    return _merge_profile_criteria(stored, default_fii_br_criteria)


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


def seed_etf_intl_config(session: Session) -> None:
    rows = session.exec(
        select(AnalysisCriterionDefinition).where(
            AnalysisCriterionDefinition.profile == PROFILE_ETF_INTL
        )
    ).all()
    if not rows:
        for c in default_etf_intl_criteria():
            session.add(_criterion_to_db(c, PROFILE_ETF_INTL))
        _ensure_profile_table_display(session, PROFILE_ETF_INTL, default_etf_intl_table_display)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()


def seed_crypto_config(session: Session) -> None:
    rows = session.exec(
        select(AnalysisCriterionDefinition).where(
            AnalysisCriterionDefinition.profile == PROFILE_CRYPTO
        )
    ).all()
    if not rows:
        for c in default_crypto_criteria():
            session.add(_criterion_to_db(c, PROFILE_CRYPTO))
        _ensure_profile_table_display(session, PROFILE_CRYPTO, default_crypto_table_display)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()


def seed_fii_br_config(session: Session) -> None:
    rows = session.exec(
        select(AnalysisCriterionDefinition).where(AnalysisCriterionDefinition.profile == PROFILE_FII_BR)
    ).all()
    if not rows:
        for c in default_fii_br_criteria():
            session.add(_criterion_to_db(c, PROFILE_FII_BR))
        for r in default_fii_br_viability_rules():
            session.add(_rule_to_db(r, PROFILE_FII_BR))
        _ensure_profile_table_display(session, PROFILE_FII_BR, default_fii_br_table_display)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
        _seed_fii_br_segments(session)
        return

    stored = [_criterion_from_db(row) for row in rows]
    merged = _merge_fii_br_criteria(stored)
    if _criteria_needs_upgrade(stored, merged):
        for row in rows:
            session.delete(row)
        session.flush()
        for criterion in merged:
            session.add(_criterion_to_db(criterion, PROFILE_FII_BR))
        session.commit()
    _seed_fii_br_segments(session)


def _seed_fii_br_segments(session: Session) -> None:
    rows = session.exec(
        select(AnalysisSegmentCatalog).where(AnalysisSegmentCatalog.profile == PROFILE_FII_BR)
    ).all()
    if rows:
        return
    for segment in default_fii_br_segments():
        session.add(_segment_to_db(segment, PROFILE_FII_BR))
    try:
        session.commit()
    except IntegrityError:
        session.rollback()


def _segment_to_db(entry: SegmentCatalogEntry, profile: str) -> AnalysisSegmentCatalog:
    return AnalysisSegmentCatalog(
        profile=profile,
        slug=entry.slug,
        name=entry.name,
        score=entry.score,
        weight=entry.weight,
        help_text=entry.help_text,
        color=entry.color,
        sort_order=entry.sort_order,
    )


def _segment_from_db(row: AnalysisSegmentCatalog) -> SegmentCatalogEntry:
    return SegmentCatalogEntry(
        slug=row.slug,
        name=row.name,
        score=row.score,
        weight=row.weight,
        help_text=row.help_text,
        color=row.color,
        sort_order=row.sort_order,
    )


def get_profile_segments(session: Session, profile: str) -> list[SegmentCatalogEntry]:
    if profile == PROFILE_FII_BR:
        seed_fii_br_config(session)
    rows = session.exec(
        select(AnalysisSegmentCatalog)
        .where(AnalysisSegmentCatalog.profile == profile)
        .order_by(AnalysisSegmentCatalog.sort_order)
    ).all()
    return [_segment_from_db(row) for row in rows]


def save_profile_segments(
    session: Session,
    profile: str,
    segments: list[SegmentCatalogEntry],
) -> None:
    for row in session.exec(
        select(AnalysisSegmentCatalog).where(AnalysisSegmentCatalog.profile == profile)
    ).all():
        session.delete(row)
    session.flush()
    for segment in segments:
        session.add(_segment_to_db(segment, profile))
    session.commit()


def reset_fii_br_segments(session: Session) -> None:
    for row in session.exec(
        select(AnalysisSegmentCatalog).where(AnalysisSegmentCatalog.profile == PROFILE_FII_BR)
    ).all():
        session.delete(row)
    session.commit()
    _seed_fii_br_segments(session)


def reset_fii_br_config(session: Session) -> None:
    for row in session.exec(
        select(AnalysisCriterionDefinition).where(AnalysisCriterionDefinition.profile == PROFILE_FII_BR)
    ).all():
        session.delete(row)
    for row in session.exec(
        select(AnalysisViabilityRule).where(AnalysisViabilityRule.profile == PROFILE_FII_BR)
    ).all():
        session.delete(row)
    settings_row = session.get(AnalysisProfileSettings, PROFILE_FII_BR)
    if settings_row:
        session.delete(settings_row)
    session.commit()
    seed_fii_br_config(session)
    reset_fii_br_segments(session)


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


def _ensure_profile_table_display(
    session: Session,
    profile: str,
    defaults_fn=default_stock_br_table_display,
) -> None:
    existing = session.get(AnalysisProfileSettings, profile)
    if existing:
        return
    session.add(
        AnalysisProfileSettings(
            profile=profile,
            settings_json=json.dumps(defaults_fn().model_dump()),
        )
    )


def _table_display_defaults_for_profile(profile: str):
    if profile == PROFILE_FII_BR:
        return default_fii_br_table_display
    if profile == PROFILE_ETF_INTL:
        return default_etf_intl_table_display
    if profile == PROFILE_CRYPTO:
        return default_crypto_table_display
    return default_stock_br_table_display


def _normalize_table_display_settings(payload: dict, profile: str = PROFILE_STOCK_BR) -> TableDisplaySettings:
    defaults = _table_display_defaults_for_profile(profile)()
    sum_col = payload.get("sum_column")
    if not isinstance(sum_col, dict):
        return defaults

    merged_sum = defaults.sum_column.model_copy()
    if "use_fundamental" in sum_col:
        merged_sum.use_fundamental = bool(sum_col["use_fundamental"])
    elif "enabled" in sum_col:
        merged_sum.use_fundamental = True
    if "use_diagram" in sum_col:
        merged_sum.use_diagram = bool(sum_col["use_diagram"])
    elif "enabled" in sum_col:
        merged_sum.use_diagram = bool(sum_col["enabled"])
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


def validate_table_display_settings(table_display: TableDisplaySettings) -> None:
    settings = table_display.sum_column
    if not settings.use_fundamental and not settings.use_diagram:
        raise ValueError("Ative Fundamental, Diagrama ou ambos para a metodologia de análise.")
    settings.label = "Soma"


def get_profile_table_display(session: Session, profile: str) -> TableDisplaySettings:
    if profile == PROFILE_STOCK_BR:
        seed_stock_br_config(session)
    elif profile == PROFILE_FII_BR:
        seed_fii_br_config(session)
    elif profile == PROFILE_ETF_INTL:
        seed_etf_intl_config(session)
    elif profile == PROFILE_CRYPTO:
        seed_crypto_config(session)

    row = session.get(AnalysisProfileSettings, profile)
    if not row:
        _ensure_profile_table_display(session, profile, _table_display_defaults_for_profile(profile))
        session.commit()
        row = session.get(AnalysisProfileSettings, profile)

    if not row or not row.settings_json:
        return _table_display_defaults_for_profile(profile)()

    payload = json.loads(row.settings_json)
    return _normalize_table_display_settings(payload, profile)


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
    elif profile == PROFILE_FII_BR:
        seed_fii_br_config(session)
    elif profile == PROFILE_ETF_INTL:
        seed_etf_intl_config(session)
    elif profile == PROFILE_CRYPTO:
        seed_crypto_config(session)

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
    elif profile == PROFILE_FII_BR:
        criteria = _merge_fii_br_criteria(criteria)

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
        validate_table_display_settings(table_display)
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
    if profile == PROFILE_FII_BR:
        return [
            a
            for a in assets
            if infer_display_class(a.asset_type, a.market, a.etf_subtype) == DisplayClass.FUNDS
        ]
    if profile == PROFILE_ETF_INTL:
        return [
            a
            for a in assets
            if infer_display_class(a.asset_type, a.market, a.etf_subtype)
            == DisplayClass.INTERNATIONAL
        ]
    if profile == PROFILE_CRYPTO:
        return [
            a
            for a in assets
            if infer_display_class(a.asset_type, a.market, a.etf_subtype)
            == DisplayClass.CRYPTO
        ]
    return list(assets)


def get_asset_scores(session: Session, asset_id: int) -> tuple[dict[str, int | None], dict[str, str | None]]:
    rows = session.exec(
        select(AssetAnalysisScore).where(AssetAnalysisScore.asset_id == asset_id)
    ).all()
    scores = {r.criterion_code: r.score for r in rows}
    score_refs = {r.criterion_code: r.value_text for r in rows if r.value_text}
    return scores, score_refs


def save_asset_scores(
    session: Session,
    asset_id: int,
    scores: dict[str, int | None],
    score_refs: dict[str, str | None] | None = None,
) -> None:
    refs = score_refs or {}
    for code, value in scores.items():
        existing = session.exec(
            select(AssetAnalysisScore).where(
                AssetAnalysisScore.asset_id == asset_id,
                AssetAnalysisScore.criterion_code == code,
            )
        ).first()
        ref = refs.get(code)
        if existing:
            existing.score = value
            if code in refs:
                existing.value_text = ref
            elif value is None:
                existing.value_text = None
            existing.updated_at = datetime.utcnow()
            session.add(existing)
        else:
            session.add(
                AssetAnalysisScore(
                    asset_id=asset_id,
                    criterion_code=code,
                    score=value,
                    value_text=ref,
                )
            )
    session.commit()


class EtfIntlAllocationError(ValueError):
    pass


class CryptoAllocationError(ValueError):
    pass


class ProfileAllocationError(ValueError):
    pass


def _upsert_portfolio_allocation(
    session: Session,
    portfolio_id: int,
    asset_id: int,
    profile: str,
    target_percent: float,
    analysis_link: str | None,
) -> None:
    existing = get_portfolio_allocation(session, portfolio_id, asset_id, profile)
    if existing:
        existing.target_percent = target_percent
        existing.analysis_link = analysis_link
        existing.updated_at = datetime.utcnow()
        session.add(existing)
    else:
        session.add(
            PortfolioAssetAllocation(
                portfolio_id=portfolio_id,
                asset_id=asset_id,
                profile=profile,
                target_percent=target_percent,
                analysis_link=analysis_link,
            )
        )


def save_profile_allocations(
    session: Session,
    portfolio_id: int,
    profile: str,
    allocations: list[dict],
) -> None:
    if profile not in _PROFILE_REQUIRED_DISPLAY_CLASS:
        raise ProfileAllocationError(f"Invalid allocation profile: {profile}")
    if not allocations:
        raise ProfileAllocationError("At least one allocation is required")

    pending_ids = get_pending_asset_ids(session, portfolio_id)
    active_allocations = [
        item for item in allocations if int(item["asset_id"]) not in pending_ids
    ]
    if not active_allocations:
        raise ProfileAllocationError("At least one non-pending allocation is required")

    total = sum(float(item["target_percent"]) for item in active_allocations)
    if abs(total - 100.0) > 0.01:
        raise ProfileAllocationError("target_percent allocations must sum to 100")

    required_display_class = _PROFILE_REQUIRED_DISPLAY_CLASS[profile]
    for item in allocations:
        asset_id = int(item["asset_id"])
        asset = session.get(Asset, asset_id)
        if asset is None:
            raise ProfileAllocationError(f"Asset not found: {asset_id}")
        display_class = infer_display_class(asset.asset_type, asset.market, asset.etf_subtype)
        if display_class != required_display_class:
            raise ProfileAllocationError(
                f"Asset {asset_id} is not eligible for profile {profile}"
            )

        target_pct = float(item["target_percent"])
        if target_pct < 0 or target_pct > 100:
            raise ProfileAllocationError(f"Invalid target_percent for asset {asset_id}")

        link = item.get("analysis_link")
        link_text = link.strip() if isinstance(link, str) and link.strip() else None

        _upsert_portfolio_allocation(
            session,
            portfolio_id,
            asset_id,
            profile,
            target_pct,
            link_text,
        )

    session.commit()


def save_etf_intl_allocations(
    session: Session,
    portfolio_id: int,
    allocations: list[dict],
) -> None:
    try:
        save_profile_allocations(session, portfolio_id, PROFILE_ETF_INTL, allocations)
    except ProfileAllocationError as exc:
        raise EtfIntlAllocationError(str(exc)) from exc


def save_crypto_allocations(
    session: Session,
    portfolio_id: int,
    allocations: list[dict],
) -> None:
    try:
        save_profile_allocations(session, portfolio_id, PROFILE_CRYPTO, allocations)
    except ProfileAllocationError as exc:
        raise CryptoAllocationError(str(exc)) from exc


def save_stock_br_allocations(
    session: Session,
    portfolio_id: int,
    allocations: list[dict],
) -> None:
    save_profile_allocations(session, portfolio_id, PROFILE_STOCK_BR, allocations)


def save_fii_br_allocations(
    session: Session,
    portfolio_id: int,
    allocations: list[dict],
) -> None:
    save_profile_allocations(session, portfolio_id, PROFILE_FII_BR, allocations)


def parse_target_percent_from_refs(score_refs: dict[str, str | None]) -> float | None:
    raw = score_refs.get(TARGET_PERCENT_CODE)
    if raw is None:
        return None
    stripped = raw.strip()
    if not stripped:
        return None
    try:
        return float(stripped.replace(",", "."))
    except ValueError:
        return None


def _upsert_score_ref(
    session: Session,
    asset_id: int,
    criterion_code: str,
    value_text: str | None,
) -> None:
    existing = session.exec(
        select(AssetAnalysisScore).where(
            AssetAnalysisScore.asset_id == asset_id,
            AssetAnalysisScore.criterion_code == criterion_code,
        )
    ).first()
    if existing:
        existing.score = None
        existing.value_text = value_text
        existing.updated_at = datetime.utcnow()
        session.add(existing)
    else:
        session.add(
            AssetAnalysisScore(
                asset_id=asset_id,
                criterion_code=criterion_code,
                score=None,
                value_text=value_text,
            )
        )


def build_asset_analysis_read(
    session: Session,
    asset: Asset,
    profile: str,
    portfolio_id: int | None = None,
) -> tuple[dict[str, int | None], dict[str, str | None], AnalysisSummary, list[CriterionDefinition], list[ViabilityRule]]:
    criteria, rules = get_profile_config(session, profile)
    scores, score_refs = get_asset_scores(session, asset.id)
    score_refs = merge_score_refs_for_profile(session, asset.id, profile, score_refs, portfolio_id)
    summary = summarize_analysis(scores, criteria, rules)
    return scores, score_refs, summary, criteria, rules


def list_assets_with_analysis(
    session: Session,
    profile: str,
    portfolio_id: int | None = None,
) -> list[tuple[Asset, dict[str, int | None], dict[str, str | None], AnalysisSummary]]:
    criteria, rules = get_profile_config(session, profile)
    assets = list_eligible_assets(session, profile)
    result: list[tuple[Asset, dict[str, int | None], dict[str, str | None], AnalysisSummary]] = []
    for asset in assets:
        scores, score_refs = get_asset_scores(session, asset.id)
        score_refs = merge_score_refs_for_profile(session, asset.id, profile, score_refs, portfolio_id)
        summary = summarize_analysis(scores, criteria, rules)
        result.append((asset, scores, score_refs, summary))
    return result
