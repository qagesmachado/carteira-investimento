from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.db.session import get_session
from app.models.asset import Asset
from app.schemas.analysis import (
    AnalysisConfigRead,
    AnalysisConfigUpdate,
    AnalysisSummaryRead,
    AssetAnalysisRead,
    AssetScoresUpdate,
    BlockSummaryRead,
    CriterionDefinitionRead,
    ScoreOptionRead,
    ViabilityBandRead,
    ViabilityRuleRead,
    ViabilityResultRead,
    TableDisplaySettingsRead,
    TableSumColumnSettingsRead,
)
from app.services.analysis_defaults import PROFILE_STOCK_BR
from app.services.analysis_service import (
    build_asset_analysis_read,
    get_profile_config,
    get_profile_table_display,
    list_assets_with_analysis,
    reset_stock_br_config,
    save_asset_scores,
    save_profile_config,
)
from app.services.asset_service import infer_display_class

router = APIRouter(prefix="/analysis", tags=["analysis"])


def _viability_to_read(v) -> ViabilityResultRead | None:
    if not v:
        return None
    return ViabilityResultRead(
        block=v.block,
        score=v.score,
        band_id=v.band_id,
        label=v.label,
        color=v.color,
    )


def _summary_to_read(summary) -> AnalysisSummaryRead:
    def block(b):
        v = b.viability
        return BlockSummaryRead(
            score=b.score,
            viability=_viability_to_read(v),
        )

    return AnalysisSummaryRead(
        fundamental=block(summary.fundamental),
        diagrama=block(summary.diagrama),
        viabilidade=_viability_to_read(summary.viabilidade),
    )


def _config_to_read(profile: str, criteria, rules, table_display) -> AnalysisConfigRead:
    return AnalysisConfigRead(
        profile=profile,
        criteria=[
            CriterionDefinitionRead(
                code=c.code,
                block=c.block.value if hasattr(c.block, "value") else str(c.block),
                label=c.label,
                help_text=c.help_text,
                weight=c.weight,
                sort_order=c.sort_order,
                input_type=c.input_type,
                score_options=[ScoreOptionRead(**o.model_dump()) for o in c.score_options],
            )
            for c in criteria
        ],
        rules=[
            ViabilityRuleRead(
                block=r.block.value if hasattr(r.block, "value") else str(r.block),
                method=r.method,
                bands=[ViabilityBandRead(**b.model_dump()) for b in r.bands],
            )
            for r in rules
        ],
        table_display=TableDisplaySettingsRead(
            sum_column=TableSumColumnSettingsRead(**table_display.sum_column.model_dump())
        ),
    )


@router.get("/profiles/stock-br/config", response_model=AnalysisConfigRead)
def get_stock_br_config(session: Annotated[Session, Depends(get_session)]) -> AnalysisConfigRead:
    criteria, rules = get_profile_config(session, PROFILE_STOCK_BR)
    table_display = get_profile_table_display(session, PROFILE_STOCK_BR)
    return _config_to_read(PROFILE_STOCK_BR, criteria, rules, table_display)


@router.put("/profiles/stock-br/config", response_model=AnalysisConfigRead)
def put_stock_br_config(
    payload: AnalysisConfigUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> AnalysisConfigRead:
    save_profile_config(
        session,
        PROFILE_STOCK_BR,
        payload.criteria,
        payload.rules,
        payload.table_display,
    )
    criteria, rules = get_profile_config(session, PROFILE_STOCK_BR)
    table_display = get_profile_table_display(session, PROFILE_STOCK_BR)
    return _config_to_read(PROFILE_STOCK_BR, criteria, rules, table_display)


@router.post("/profiles/stock-br/config/reset", response_model=AnalysisConfigRead)
def post_stock_br_config_reset(
    session: Annotated[Session, Depends(get_session)],
) -> AnalysisConfigRead:
    reset_stock_br_config(session)
    criteria, rules = get_profile_config(session, PROFILE_STOCK_BR)
    table_display = get_profile_table_display(session, PROFILE_STOCK_BR)
    return _config_to_read(PROFILE_STOCK_BR, criteria, rules, table_display)


@router.get("/assets", response_model=list[AssetAnalysisRead])
def get_analysis_assets(
    session: Annotated[Session, Depends(get_session)],
    profile: str = Query(default=PROFILE_STOCK_BR),
) -> list[AssetAnalysisRead]:
    rows = list_assets_with_analysis(session, profile)
    return [
        AssetAnalysisRead(
            asset_id=asset.id,
            symbol=asset.symbol,
            name=asset.name,
            asset_type=asset.asset_type.value,
            display_class=infer_display_class(
                asset.asset_type, asset.market, asset.etf_subtype
            ).value,
            scores=scores,
            summary=_summary_to_read(summary),
        )
        for asset, scores, summary in rows
    ]


@router.get("/assets/{asset_id}", response_model=AssetAnalysisRead)
def get_analysis_asset(
    asset_id: int,
    session: Annotated[Session, Depends(get_session)],
    profile: str = Query(default=PROFILE_STOCK_BR),
) -> AssetAnalysisRead:
    asset = session.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    scores, summary, _, _ = build_asset_analysis_read(session, asset, profile)
    return AssetAnalysisRead(
        asset_id=asset.id,
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type.value,
        display_class=infer_display_class(asset.asset_type, asset.market, asset.etf_subtype).value,
        scores=scores,
        summary=_summary_to_read(summary),
    )


@router.put("/assets/{asset_id}/scores", response_model=AssetAnalysisRead)
def put_analysis_asset_scores(
    asset_id: int,
    payload: AssetScoresUpdate,
    session: Annotated[Session, Depends(get_session)],
    profile: str = Query(default=PROFILE_STOCK_BR),
) -> AssetAnalysisRead:
    asset = session.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    save_asset_scores(session, asset_id, payload.scores)
    scores, summary, _, _ = build_asset_analysis_read(session, asset, profile)
    return AssetAnalysisRead(
        asset_id=asset.id,
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type.value,
        display_class=infer_display_class(asset.asset_type, asset.market, asset.etf_subtype).value,
        scores=scores,
        summary=_summary_to_read(summary),
    )
