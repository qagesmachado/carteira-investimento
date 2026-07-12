from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.property_financing import (
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
)
from app.services.property_financing_service import (
    build_property_financing_snapshot,
    create_property_financing,
    create_property_financing_entry,
    create_property_financing_entry_template,
    delete_property_financing,
    delete_property_financing_entry,
    delete_property_financing_entry_template,
    update_property_financing,
    update_property_financing_entry,
    update_property_financing_entry_template,
    _entry_to_read,
    _financing_to_read,
    _template_to_read,
)

router = APIRouter(
    prefix="/portfolios/{portfolio_id}/property-financings",
    tags=["property-financings"],
)


def _to_financing_read_from_snapshot(
    snapshot: PropertyFinancingSnapshotRead,
    financing_id: int,
) -> PropertyFinancingRead:
    for financing in snapshot.financings:
        if financing.id == financing_id:
            return financing
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="financing not found")


@router.get("", response_model=PropertyFinancingSnapshotRead)
def get_property_financing_snapshot(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> PropertyFinancingSnapshotRead:
    return build_property_financing_snapshot(session, portfolio_id)


@router.post("", response_model=PropertyFinancingRead, status_code=status.HTTP_201_CREATED)
def post_property_financing(
    portfolio_id: int,
    payload: PropertyFinancingCreate,
    session: Annotated[Session, Depends(get_session)],
) -> PropertyFinancingRead:
    financing = create_property_financing(session, portfolio_id, payload)
    assert financing.id is not None
    snapshot = build_property_financing_snapshot(session, portfolio_id)
    return _to_financing_read_from_snapshot(snapshot, financing.id)


@router.patch("/{financing_id}", response_model=PropertyFinancingRead)
def patch_property_financing(
    portfolio_id: int,
    financing_id: int,
    payload: PropertyFinancingUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> PropertyFinancingRead:
    update_property_financing(session, portfolio_id, financing_id, payload)
    snapshot = build_property_financing_snapshot(session, portfolio_id)
    return _to_financing_read_from_snapshot(snapshot, financing_id)


@router.delete("/{financing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_property_financing(
    portfolio_id: int,
    financing_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_property_financing(session, portfolio_id, financing_id)


@router.post(
    "/{financing_id}/entries",
    response_model=PropertyFinancingEntryRead,
    status_code=status.HTTP_201_CREATED,
)
def post_property_financing_entry(
    portfolio_id: int,
    financing_id: int,
    payload: PropertyFinancingEntryCreate,
    session: Annotated[Session, Depends(get_session)],
) -> PropertyFinancingEntryRead:
    entry = create_property_financing_entry(session, portfolio_id, financing_id, payload)
    return _entry_to_read(entry)


@router.patch("/entries/{entry_id}", response_model=PropertyFinancingEntryRead)
def patch_property_financing_entry(
    portfolio_id: int,
    entry_id: int,
    payload: PropertyFinancingEntryUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> PropertyFinancingEntryRead:
    entry = update_property_financing_entry(session, portfolio_id, entry_id, payload)
    return _entry_to_read(entry)


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_property_financing_entry(
    portfolio_id: int,
    entry_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_property_financing_entry(session, portfolio_id, entry_id)


@router.post(
    "/{financing_id}/entry-templates",
    response_model=PropertyFinancingEntryTemplateRead,
    status_code=status.HTTP_201_CREATED,
)
def post_property_financing_entry_template(
    portfolio_id: int,
    financing_id: int,
    payload: PropertyFinancingEntryTemplateCreate,
    session: Annotated[Session, Depends(get_session)],
) -> PropertyFinancingEntryTemplateRead:
    template = create_property_financing_entry_template(
        session, portfolio_id, financing_id, payload
    )
    return _template_to_read(template)


@router.patch(
    "/entry-templates/{template_id}",
    response_model=PropertyFinancingEntryTemplateRead,
)
def patch_property_financing_entry_template(
    portfolio_id: int,
    template_id: int,
    payload: PropertyFinancingEntryTemplateUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> PropertyFinancingEntryTemplateRead:
    template = update_property_financing_entry_template(
        session, portfolio_id, template_id, payload
    )
    return _template_to_read(template)


@router.delete("/entry-templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_property_financing_entry_template(
    portfolio_id: int,
    template_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_property_financing_entry_template(session, portfolio_id, template_id)
