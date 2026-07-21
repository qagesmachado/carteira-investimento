from datetime import date, datetime

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.property_financing import (
    PropertyFinancing,
    PropertyFinancingEntry,
    PropertyFinancingEntryTemplate,
    PropertyFinancingEntryType,
    PropertyFinancingEventCategory,
    PropertyType,
)
from app.schemas.property_financing import (
    FinancingSummaryMetricsRead,
    PropertyFinancingConsolidatedRead,
    PropertyFinancingCreate,
    PropertyFinancingEntryCreate,
    PropertyFinancingEntryRead,
    PropertyFinancingEntryTemplateCreate,
    PropertyFinancingEntryTemplateRead,
    PropertyFinancingEntryTemplateUpdate,
    PropertyFinancingEntryUpdate,
    PropertyFinancingRead,
    PropertyFinancingSnapshotRead,
    PropertyFinancingUpdate,
    TimelineRowRead,
)
from app.services.budget.profile_service import get_budget_profile
from app.services.property_financing_engine import (
    EntryInput,
    aggregate_annual_timeline,
    aggregate_monthly_timeline_all_years,
    compute_financing_metrics,
    event_category_matches_entry_type,
)


def _parse_event_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"invalid event_date: {value}",
        ) from exc


def _validate_property_type(value: str) -> PropertyType:
    try:
        return PropertyType(value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"invalid property_type: {value}",
        ) from exc


def _validate_entry_type(value: str) -> PropertyFinancingEntryType:
    try:
        return PropertyFinancingEntryType(value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"invalid entry_type: {value}",
        ) from exc


def _validate_event_category(value: str) -> PropertyFinancingEventCategory:
    try:
        return PropertyFinancingEventCategory(value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"invalid event_category: {value}",
        ) from exc


def _validate_entry_type_category(
    entry_type: PropertyFinancingEntryType,
    event_category: PropertyFinancingEventCategory,
) -> None:
    if not event_category_matches_entry_type(entry_type.value, event_category.value):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="event_category does not match entry_type",
        )


def _get_financing(session: Session, profile_id: int, financing_id: int) -> PropertyFinancing:
    financing = session.get(PropertyFinancing, financing_id)
    if financing is None or financing.profile_id != profile_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="financing not found")
    return financing


def _get_entry_with_financing(
    session: Session,
    profile_id: int,
    entry_id: int,
) -> tuple[PropertyFinancingEntry, PropertyFinancing]:
    entry = session.get(PropertyFinancingEntry, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="entry not found")
    financing = _get_financing(session, profile_id, entry.financing_id)
    return entry, financing


def _load_entries(session: Session, financing_id: int) -> list[PropertyFinancingEntry]:
    return list(
        session.exec(
            select(PropertyFinancingEntry)
            .where(PropertyFinancingEntry.financing_id == financing_id)
            .order_by(PropertyFinancingEntry.event_date.desc(), PropertyFinancingEntry.id.desc())
        ).all()
    )


def _load_entry_templates(
    session: Session,
    financing_id: int,
) -> list[PropertyFinancingEntryTemplate]:
    return list(
        session.exec(
            select(PropertyFinancingEntryTemplate)
            .where(PropertyFinancingEntryTemplate.financing_id == financing_id)
            .order_by(
                PropertyFinancingEntryTemplate.sort_order,
                PropertyFinancingEntryTemplate.name,
            )
        ).all()
    )


def _entry_to_input(entry: PropertyFinancingEntry) -> EntryInput:
    return EntryInput(
        event_date=entry.event_date,
        entry_type=entry.entry_type.value,
        amount_brl=entry.amount_brl,
    )


def _metrics_to_read(metrics) -> FinancingSummaryMetricsRead:
    return FinancingSummaryMetricsRead(
        total_income_brl=metrics.total_income_brl,
        total_expenses_brl=metrics.total_expenses_brl,
        profit_brl=metrics.profit_brl,
        capital_invested_brl=metrics.capital_invested_brl,
    )


def _entry_to_read(entry: PropertyFinancingEntry) -> PropertyFinancingEntryRead:
    return PropertyFinancingEntryRead(
        id=entry.id,  # type: ignore[arg-type]
        event_date=entry.event_date.isoformat(),
        entry_type=entry.entry_type.value,
        event_category=entry.event_category.value,
        description=entry.description,
        amount_brl=entry.amount_brl,
    )


def _template_to_read(
    template: PropertyFinancingEntryTemplate,
) -> PropertyFinancingEntryTemplateRead:
    return PropertyFinancingEntryTemplateRead(
        id=template.id,  # type: ignore[arg-type]
        name=template.name,
        entry_type=template.entry_type.value,
        event_category=template.event_category.value,
        description=template.description,
        amount_brl=template.amount_brl,
        sort_order=template.sort_order,
    )


def _get_template_with_financing(
    session: Session,
    profile_id: int,
    template_id: int,
) -> tuple[PropertyFinancingEntryTemplate, PropertyFinancing]:
    template = session.get(PropertyFinancingEntryTemplate, template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="template not found")
    financing = _get_financing(session, profile_id, template.financing_id)
    return template, financing


def _financing_to_read(
    session: Session,
    financing: PropertyFinancing,
) -> PropertyFinancingRead:
    assert financing.id is not None
    entries = _load_entries(session, financing.id)
    templates = _load_entry_templates(session, financing.id)
    metrics = compute_financing_metrics([_entry_to_input(e) for e in entries])
    return PropertyFinancingRead(
        id=financing.id,
        profile_id=financing.profile_id,
        name=financing.name,
        property_type=financing.property_type.value,
        description=financing.description,
        entries=[_entry_to_read(e) for e in entries],
        entry_templates=[_template_to_read(t) for t in templates],
        metrics=_metrics_to_read(metrics),
    )


def build_property_financing_snapshot(
    session: Session,
    profile_id: int,
    reference_date: date | None = None,
) -> PropertyFinancingSnapshotRead:
    get_budget_profile(session, profile_id)
    ref = reference_date or date.today()
    financings = list(
        session.exec(
            select(PropertyFinancing)
            .where(PropertyFinancing.profile_id == profile_id)
            .order_by(PropertyFinancing.name)
        ).all()
    )
    financing_reads = [_financing_to_read(session, f) for f in financings]

    all_inputs: list[EntryInput] = []
    for financing in financings:
        assert financing.id is not None
        for entry in _load_entries(session, financing.id):
            all_inputs.append(_entry_to_input(entry))

    consolidated_metrics = compute_financing_metrics(all_inputs)
    monthly = aggregate_monthly_timeline_all_years(all_inputs)
    annual = aggregate_annual_timeline(all_inputs)

    return PropertyFinancingSnapshotRead(
        profile_id=profile_id,
        financings=financing_reads,
        consolidated=PropertyFinancingConsolidatedRead(
            financing_count=len(financing_reads),
            metrics=_metrics_to_read(consolidated_metrics),
            monthly_timeline=[
                TimelineRowRead(
                    label=row.label,
                    year=row.year,
                    month=row.month,
                    income_brl=row.income_brl,
                    expenses_brl=row.expenses_brl,
                )
                for row in monthly
            ],
            annual_timeline=[
                TimelineRowRead(
                    label=row.label,
                    year=row.year,
                    month=row.month,
                    income_brl=row.income_brl,
                    expenses_brl=row.expenses_brl,
                )
                for row in annual
            ],
        ),
    )


def create_property_financing(
    session: Session,
    profile_id: int,
    payload: PropertyFinancingCreate,
) -> PropertyFinancing:
    get_budget_profile(session, profile_id)
    property_type = _validate_property_type(payload.property_type)
    existing = session.exec(
        select(PropertyFinancing).where(
            PropertyFinancing.profile_id == profile_id,
            PropertyFinancing.name == payload.name,
        )
    ).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="financing name already exists in profile",
        )
    financing = PropertyFinancing(
        profile_id=profile_id,
        name=payload.name,
        property_type=property_type,
        description=payload.description,
    )
    session.add(financing)
    session.commit()
    session.refresh(financing)
    return financing


def update_property_financing(
    session: Session,
    profile_id: int,
    financing_id: int,
    payload: PropertyFinancingUpdate,
) -> PropertyFinancing:
    financing = _get_financing(session, profile_id, financing_id)
    if payload.name is not None and payload.name != financing.name:
        duplicate = session.exec(
            select(PropertyFinancing).where(
                PropertyFinancing.profile_id == profile_id,
                PropertyFinancing.name == payload.name,
            )
        ).first()
        if duplicate is not None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="financing name already exists in profile",
            )
        financing.name = payload.name
    if payload.property_type is not None:
        financing.property_type = _validate_property_type(payload.property_type)
    if payload.description is not None:
        financing.description = payload.description
    financing.updated_at = datetime.utcnow()
    session.add(financing)
    session.commit()
    session.refresh(financing)
    return financing


def delete_property_financings_for_profile(session: Session, profile_id: int) -> None:
    financings = list(
        session.exec(
            select(PropertyFinancing).where(PropertyFinancing.profile_id == profile_id)
        ).all()
    )
    for financing in financings:
        assert financing.id is not None
        delete_property_financing(session, profile_id, financing.id)


def delete_property_financing(
    session: Session,
    profile_id: int,
    financing_id: int,
) -> None:
    _get_financing(session, profile_id, financing_id)
    entries = list(
        session.exec(
            select(PropertyFinancingEntry).where(
                PropertyFinancingEntry.financing_id == financing_id
            )
        ).all()
    )
    for entry in entries:
        session.delete(entry)
    templates = list(
        session.exec(
            select(PropertyFinancingEntryTemplate).where(
                PropertyFinancingEntryTemplate.financing_id == financing_id
            )
        ).all()
    )
    for template in templates:
        session.delete(template)
    financing = session.get(PropertyFinancing, financing_id)
    assert financing is not None
    session.delete(financing)
    session.commit()


def create_property_financing_entry(
    session: Session,
    profile_id: int,
    financing_id: int,
    payload: PropertyFinancingEntryCreate,
) -> PropertyFinancingEntry:
    _get_financing(session, profile_id, financing_id)
    entry_type = _validate_entry_type(payload.entry_type)
    event_category = _validate_event_category(payload.event_category)
    _validate_entry_type_category(entry_type, event_category)
    event_date = _parse_event_date(payload.event_date)
    entry = PropertyFinancingEntry(
        financing_id=financing_id,
        event_date=event_date,
        entry_type=entry_type,
        event_category=event_category,
        description=payload.description.strip(),
        amount_brl=payload.amount_brl,
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


def update_property_financing_entry(
    session: Session,
    profile_id: int,
    entry_id: int,
    payload: PropertyFinancingEntryUpdate,
) -> PropertyFinancingEntry:
    entry, _ = _get_entry_with_financing(session, profile_id, entry_id)
    entry_type = entry.entry_type
    event_category = entry.event_category
    if payload.entry_type is not None:
        entry_type = _validate_entry_type(payload.entry_type)
        entry.entry_type = entry_type
    if payload.event_category is not None:
        event_category = _validate_event_category(payload.event_category)
        entry.event_category = event_category
    _validate_entry_type_category(entry_type, event_category)
    if payload.event_date is not None:
        entry.event_date = _parse_event_date(payload.event_date)
    if payload.description is not None:
        entry.description = payload.description.strip()
    if payload.amount_brl is not None:
        entry.amount_brl = payload.amount_brl
    entry.updated_at = datetime.utcnow()
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


def delete_property_financing_entry(
    session: Session,
    profile_id: int,
    entry_id: int,
) -> None:
    entry, _ = _get_entry_with_financing(session, profile_id, entry_id)
    session.delete(entry)
    session.commit()


def create_property_financing_entry_template(
    session: Session,
    profile_id: int,
    financing_id: int,
    payload: PropertyFinancingEntryTemplateCreate,
) -> PropertyFinancingEntryTemplate:
    _get_financing(session, profile_id, financing_id)
    entry_type = _validate_entry_type(payload.entry_type)
    event_category = _validate_event_category(payload.event_category)
    _validate_entry_type_category(entry_type, event_category)
    existing = session.exec(
        select(PropertyFinancingEntryTemplate).where(
            PropertyFinancingEntryTemplate.financing_id == financing_id,
            PropertyFinancingEntryTemplate.name == payload.name.strip(),
        )
    ).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="template name already exists for financing",
        )
    template = PropertyFinancingEntryTemplate(
        financing_id=financing_id,
        name=payload.name.strip(),
        entry_type=entry_type,
        event_category=event_category,
        description=payload.description.strip(),
        amount_brl=payload.amount_brl,
    )
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


def update_property_financing_entry_template(
    session: Session,
    profile_id: int,
    template_id: int,
    payload: PropertyFinancingEntryTemplateUpdate,
) -> PropertyFinancingEntryTemplate:
    template, financing = _get_template_with_financing(session, profile_id, template_id)
    entry_type = template.entry_type
    event_category = template.event_category
    if payload.entry_type is not None:
        entry_type = _validate_entry_type(payload.entry_type)
        template.entry_type = entry_type
    if payload.event_category is not None:
        event_category = _validate_event_category(payload.event_category)
        template.event_category = event_category
    _validate_entry_type_category(entry_type, event_category)
    if payload.name is not None and payload.name.strip() != template.name:
        duplicate = session.exec(
            select(PropertyFinancingEntryTemplate).where(
                PropertyFinancingEntryTemplate.financing_id == financing.id,
                PropertyFinancingEntryTemplate.name == payload.name.strip(),
            )
        ).first()
        if duplicate is not None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="template name already exists for financing",
            )
        template.name = payload.name.strip()
    if payload.description is not None:
        template.description = payload.description.strip()
    if payload.amount_brl is not None:
        template.amount_brl = payload.amount_brl
    template.updated_at = datetime.utcnow()
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


def delete_property_financing_entry_template(
    session: Session,
    profile_id: int,
    template_id: int,
) -> None:
    template, _ = _get_template_with_financing(session, profile_id, template_id)
    session.delete(template)
    session.commit()
