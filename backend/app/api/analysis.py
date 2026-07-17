from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.db.session import get_session
from app.models.asset import Asset
from app.schemas.analysis import (
    AnalysisConfigRead,
    AnalysisConfigUpdate,
    AnalysisMethodologyRead,
    AnalysisMethodologyUpdate,
    AnalysisPortfolioPendingRead,
    AnalysisPortfolioSummaryRead,
    AnalysisSummaryRead,
    AssetAnalysisRead,
    AssetPendingUpdate,
    AssetScoresUpdate,
    BlockSummaryRead,
    CriterionDefinitionRead,
    CryptoAllocationsBulkUpdate,
    EtfIntlAllocationsBulkUpdate,
    FiiBrAllocationsBulkUpdate,
    ScoreOptionRead,
    SegmentCatalogEntryRead,
    SegmentCatalogUpdate,
    StockBrAllocationsBulkUpdate,
    TableDisplaySettingsRead,
    TableSumColumnSettingsRead,
    ViabilityBandRead,
    ViabilityRuleRead,
    ViabilityResultRead,
)
from app.services.analysis_defaults import PROFILE_CRYPTO, PROFILE_ETF_INTL, PROFILE_FII_BR, PROFILE_STOCK_BR
from app.services.analysis_methodology_service import (
    AnalysisMethodologyError,
    get_portfolio_methodology,
    profile_from_slug,
    set_portfolio_methodology,
)
from app.services.analysis_pending_service import (
    get_pending_asset_ids,
    is_asset_pending,
    set_asset_pending,
)
from app.services.analysis_summary_service import (
    build_portfolio_analysis_summary,
    list_portfolio_pending_assets,
)
from app.services.analysis_service import (
    build_asset_analysis_read,
    get_profile_config,
    get_profile_segments,
    get_profile_table_display,
    list_assets_with_analysis,
    reset_fii_br_config,
    reset_fii_br_segments,
    reset_stock_br_config,
    save_asset_scores,
    save_crypto_allocations,
    save_etf_intl_allocations,
    save_fii_br_allocations,
    save_stock_br_allocations,
    save_profile_config,
    save_profile_segments,
)
from app.services.analysis_service import (
    CryptoAllocationError,
    EtfIntlAllocationError,
    ProfileAllocationError,
)
from app.services.asset_service import infer_display_class
from app.services.portfolio_service import get_portfolio

router = APIRouter(prefix="/analysis", tags=["analysis"])


def _require_portfolio_for_allocation_profile(
    session: Session,
    profile: str,
    portfolio_id: int | None,
) -> None:
    if portfolio_id is None and profile in (PROFILE_ETF_INTL, PROFILE_CRYPTO):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="portfolio_id is required for allocation profiles",
        )


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


def _asset_analysis_to_read(
    asset: Asset,
    scores,
    score_refs,
    summary,
    *,
    is_pending: bool = False,
) -> AssetAnalysisRead:
    return AssetAnalysisRead(
        asset_id=asset.id,
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type.value,
        display_class=infer_display_class(
            asset.asset_type, asset.market, asset.etf_subtype
        ).value,
        scores=scores,
        score_refs=score_refs,
        summary=_summary_to_read(summary),
        is_pending=is_pending,
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
    try:
        save_profile_config(
            session,
            PROFILE_STOCK_BR,
            payload.criteria,
            payload.rules,
            payload.table_display,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
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


@router.get("/profiles/fii-br/config", response_model=AnalysisConfigRead)
def get_fii_br_config(session: Annotated[Session, Depends(get_session)]) -> AnalysisConfigRead:
    criteria, rules = get_profile_config(session, PROFILE_FII_BR)
    table_display = get_profile_table_display(session, PROFILE_FII_BR)
    return _config_to_read(PROFILE_FII_BR, criteria, rules, table_display)


@router.put("/profiles/fii-br/config", response_model=AnalysisConfigRead)
def put_fii_br_config(
    payload: AnalysisConfigUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> AnalysisConfigRead:
    try:
        save_profile_config(
            session,
            PROFILE_FII_BR,
            payload.criteria,
            payload.rules,
            payload.table_display,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    criteria, rules = get_profile_config(session, PROFILE_FII_BR)
    table_display = get_profile_table_display(session, PROFILE_FII_BR)
    return _config_to_read(PROFILE_FII_BR, criteria, rules, table_display)


@router.post("/profiles/fii-br/config/reset", response_model=AnalysisConfigRead)
def post_fii_br_config_reset(
    session: Annotated[Session, Depends(get_session)],
) -> AnalysisConfigRead:
    reset_fii_br_config(session)
    criteria, rules = get_profile_config(session, PROFILE_FII_BR)
    table_display = get_profile_table_display(session, PROFILE_FII_BR)
    return _config_to_read(PROFILE_FII_BR, criteria, rules, table_display)


@router.get("/profiles/fii-br/segments", response_model=list[SegmentCatalogEntryRead])
def get_fii_br_segments(
    session: Annotated[Session, Depends(get_session)],
) -> list[SegmentCatalogEntryRead]:
    segments = get_profile_segments(session, PROFILE_FII_BR)
    return [SegmentCatalogEntryRead(**s.model_dump()) for s in segments]


@router.put("/profiles/fii-br/segments", response_model=list[SegmentCatalogEntryRead])
def put_fii_br_segments(
    payload: SegmentCatalogUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> list[SegmentCatalogEntryRead]:
    from app.services.analysis_defaults import SegmentCatalogEntry

    segments = [SegmentCatalogEntry(**s.model_dump()) for s in payload.segments]
    save_profile_segments(session, PROFILE_FII_BR, segments)
    saved = get_profile_segments(session, PROFILE_FII_BR)
    return [SegmentCatalogEntryRead(**s.model_dump()) for s in saved]


@router.post("/profiles/fii-br/segments/reset", response_model=list[SegmentCatalogEntryRead])
def post_fii_br_segments_reset(
    session: Annotated[Session, Depends(get_session)],
) -> list[SegmentCatalogEntryRead]:
    reset_fii_br_segments(session)
    segments = get_profile_segments(session, PROFILE_FII_BR)
    return [SegmentCatalogEntryRead(**s.model_dump()) for s in segments]


_ANALYSIS_PROFILES = (PROFILE_STOCK_BR, PROFILE_FII_BR, PROFILE_ETF_INTL, PROFILE_CRYPTO)


@router.get("/profiles/crypto/config", response_model=AnalysisConfigRead)
def get_crypto_config(session: Annotated[Session, Depends(get_session)]) -> AnalysisConfigRead:
    criteria, rules = get_profile_config(session, PROFILE_CRYPTO)
    table_display = get_profile_table_display(session, PROFILE_CRYPTO)
    return _config_to_read(PROFILE_CRYPTO, criteria, rules, table_display)


@router.put("/profiles/crypto/allocations", response_model=list[AssetAnalysisRead])
def put_crypto_allocations(
    payload: CryptoAllocationsBulkUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> list[AssetAnalysisRead]:
    get_portfolio(session, payload.portfolio_id)
    try:
        save_crypto_allocations(
            session,
            payload.portfolio_id,
            [a.model_dump() for a in payload.allocations],
        )
    except CryptoAllocationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    asset_ids = {a.asset_id for a in payload.allocations}
    pending_ids = get_pending_asset_ids(session, payload.portfolio_id)
    rows = list_assets_with_analysis(session, PROFILE_CRYPTO, payload.portfolio_id)
    return [
        _asset_analysis_to_read(
            asset,
            scores,
            score_refs,
            summary,
            is_pending=asset.id in pending_ids,
        )
        for asset, scores, score_refs, summary in rows
        if asset.id in asset_ids
    ]


@router.put("/profiles/etf-intl/allocations", response_model=list[AssetAnalysisRead])
def put_etf_intl_allocations(
    payload: EtfIntlAllocationsBulkUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> list[AssetAnalysisRead]:
    get_portfolio(session, payload.portfolio_id)
    try:
        save_etf_intl_allocations(
            session,
            payload.portfolio_id,
            [a.model_dump() for a in payload.allocations],
        )
    except EtfIntlAllocationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    asset_ids = {a.asset_id for a in payload.allocations}
    pending_ids = get_pending_asset_ids(session, payload.portfolio_id)
    rows = list_assets_with_analysis(session, PROFILE_ETF_INTL, payload.portfolio_id)
    return [
        _asset_analysis_to_read(
            asset,
            scores,
            score_refs,
            summary,
            is_pending=asset.id in pending_ids,
        )
        for asset, scores, score_refs, summary in rows
        if asset.id in asset_ids
    ]


@router.get("/profiles/etf-intl/config", response_model=AnalysisConfigRead)
def get_etf_intl_config(session: Annotated[Session, Depends(get_session)]) -> AnalysisConfigRead:
    criteria, rules = get_profile_config(session, PROFILE_ETF_INTL)
    table_display = get_profile_table_display(session, PROFILE_ETF_INTL)
    return _config_to_read(PROFILE_ETF_INTL, criteria, rules, table_display)


def _allocation_response(
    session: Session,
    profile: str,
    portfolio_id: int,
    asset_ids: set[int],
) -> list[AssetAnalysisRead]:
    pending_ids = get_pending_asset_ids(session, portfolio_id)
    rows = list_assets_with_analysis(session, profile, portfolio_id)
    return [
        _asset_analysis_to_read(
            asset,
            scores,
            score_refs,
            summary,
            is_pending=asset.id in pending_ids,
        )
        for asset, scores, score_refs, summary in rows
        if asset.id in asset_ids
    ]


@router.put("/profiles/stock-br/allocations", response_model=list[AssetAnalysisRead])
def put_stock_br_allocations(
    payload: StockBrAllocationsBulkUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> list[AssetAnalysisRead]:
    get_portfolio(session, payload.portfolio_id)
    try:
        save_stock_br_allocations(
            session,
            payload.portfolio_id,
            [a.model_dump() for a in payload.allocations],
        )
    except ProfileAllocationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    asset_ids = {a.asset_id for a in payload.allocations}
    return _allocation_response(session, PROFILE_STOCK_BR, payload.portfolio_id, asset_ids)


@router.put("/profiles/fii-br/allocations", response_model=list[AssetAnalysisRead])
def put_fii_br_allocations(
    payload: FiiBrAllocationsBulkUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> list[AssetAnalysisRead]:
    get_portfolio(session, payload.portfolio_id)
    try:
        save_fii_br_allocations(
            session,
            payload.portfolio_id,
            [a.model_dump() for a in payload.allocations],
        )
    except ProfileAllocationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    asset_ids = {a.asset_id for a in payload.allocations}
    return _allocation_response(session, PROFILE_FII_BR, payload.portfolio_id, asset_ids)


@router.get("/profiles/{profile_slug}/methodology", response_model=AnalysisMethodologyRead)
def get_analysis_methodology(
    profile_slug: str,
    session: Annotated[Session, Depends(get_session)],
    portfolio_id: int = Query(...),
) -> AnalysisMethodologyRead:
    try:
        profile = profile_from_slug(profile_slug)
    except AnalysisMethodologyError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    get_portfolio(session, portfolio_id)
    methodology = get_portfolio_methodology(session, portfolio_id, profile)
    return AnalysisMethodologyRead(
        portfolio_id=portfolio_id,
        profile=profile,
        methodology=methodology,
    )


@router.put("/profiles/{profile_slug}/methodology", response_model=AnalysisMethodologyRead)
def put_analysis_methodology(
    profile_slug: str,
    payload: AnalysisMethodologyUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> AnalysisMethodologyRead:
    get_portfolio(session, payload.portfolio_id)
    try:
        profile = profile_from_slug(profile_slug)
        methodology = set_portfolio_methodology(
            session, payload.portfolio_id, profile, payload.methodology
        )
    except AnalysisMethodologyError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return AnalysisMethodologyRead(
        portfolio_id=payload.portfolio_id,
        profile=profile,
        methodology=methodology,
    )


@router.get("/portfolio-pending", response_model=AnalysisPortfolioPendingRead)
def get_analysis_portfolio_pending(
    session: Annotated[Session, Depends(get_session)],
    portfolio_id: int = Query(...),
) -> AnalysisPortfolioPendingRead:
    get_portfolio(session, portfolio_id)
    return list_portfolio_pending_assets(session, session, portfolio_id)


@router.get("/portfolio-summary", response_model=AnalysisPortfolioSummaryRead)
def get_analysis_portfolio_summary(
    session: Annotated[Session, Depends(get_session)],
    portfolio_id: int = Query(...),
) -> AnalysisPortfolioSummaryRead:
    get_portfolio(session, portfolio_id)
    return build_portfolio_analysis_summary(session, session, portfolio_id)


@router.get("/assets", response_model=list[AssetAnalysisRead])
def get_analysis_assets(
    session: Annotated[Session, Depends(get_session)],
    profile: str = Query(default=PROFILE_STOCK_BR),
    portfolio_id: int | None = Query(default=None),
) -> list[AssetAnalysisRead]:
    if profile not in _ANALYSIS_PROFILES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile")
    _require_portfolio_for_allocation_profile(session, profile, portfolio_id)
    if portfolio_id is not None:
        get_portfolio(session, portfolio_id)
    pending_ids = get_pending_asset_ids(session, portfolio_id) if portfolio_id is not None else set()
    rows = list_assets_with_analysis(session, profile, portfolio_id)
    return [
        _asset_analysis_to_read(
            asset,
            scores,
            score_refs,
            summary,
            is_pending=portfolio_id is not None and asset.id in pending_ids,
        )
        for asset, scores, score_refs, summary in rows
    ]


@router.get("/assets/{asset_id}", response_model=AssetAnalysisRead)
def get_analysis_asset(
    asset_id: int,
    session: Annotated[Session, Depends(get_session)],
    profile: str = Query(default=PROFILE_STOCK_BR),
    portfolio_id: int | None = Query(default=None),
) -> AssetAnalysisRead:
    if profile not in _ANALYSIS_PROFILES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile")
    _require_portfolio_for_allocation_profile(session, profile, portfolio_id)
    if portfolio_id is not None:
        get_portfolio(session, portfolio_id)
    asset = session.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    scores, score_refs, summary, _, _ = build_asset_analysis_read(
        session, asset, profile, portfolio_id
    )
    is_pending = (
        is_asset_pending(session, portfolio_id, asset_id)
        if portfolio_id is not None
        else False
    )
    return _asset_analysis_to_read(
        asset, scores, score_refs, summary, is_pending=is_pending
    )


@router.put("/assets/{asset_id}/pending", response_model=AssetAnalysisRead)
def put_analysis_asset_pending(
    asset_id: int,
    payload: AssetPendingUpdate,
    session: Annotated[Session, Depends(get_session)],
    profile: str = Query(default=PROFILE_STOCK_BR),
) -> AssetAnalysisRead:
    if profile not in _ANALYSIS_PROFILES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile")
    get_portfolio(session, payload.portfolio_id)
    asset = session.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    set_asset_pending(session, payload.portfolio_id, asset_id, payload.is_pending)
    scores, score_refs, summary, _, _ = build_asset_analysis_read(
        session, asset, profile, payload.portfolio_id
    )
    return _asset_analysis_to_read(
        asset,
        scores,
        score_refs,
        summary,
        is_pending=payload.is_pending,
    )


@router.put("/assets/{asset_id}/scores", response_model=AssetAnalysisRead)
def put_analysis_asset_scores(
    asset_id: int,
    payload: AssetScoresUpdate,
    session: Annotated[Session, Depends(get_session)],
    profile: str = Query(default=PROFILE_STOCK_BR),
) -> AssetAnalysisRead:
    if profile not in _ANALYSIS_PROFILES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile")
    asset = session.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    save_asset_scores(session, asset_id, payload.scores, payload.score_refs)
    scores, score_refs, summary, _, _ = build_asset_analysis_read(session, asset, profile)
    return _asset_analysis_to_read(asset, scores, score_refs, summary)
