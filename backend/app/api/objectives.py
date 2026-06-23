from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.objective import (
    ObjectiveAllocationPurposeUpdate,
    ObjectiveAllocationsReplace,
    ObjectiveCreate,
    ObjectivesSnapshotRead,
    ObjectiveRead,
    ObjectiveUpdate,
    PensionYearCreate,
    PensionYearUpdate,
)
from app.services.objective_service import (
    add_pension_year,
    build_objectives_snapshot,
    create_objective,
    delete_objective,
    delete_pension_year,
    replace_objective_allocations,
    update_allocation_purpose,
    update_objective,
    upsert_pension_year,
)
from app.services.portfolio_service import get_portfolio

router = APIRouter(prefix="/portfolios/{portfolio_id}/objectives", tags=["objectives"])


def _to_objective_read_from_snapshot(
    snapshot: ObjectivesSnapshotRead,
    objective_id: int,
) -> ObjectiveRead:
    for objective in snapshot.objectives:
        if objective.id == objective_id:
            return objective
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="objective not found")


@router.get("", response_model=ObjectivesSnapshotRead)
def get_objectives_snapshot(
    portfolio_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> ObjectivesSnapshotRead:
    get_portfolio(session, portfolio_id)
    return build_objectives_snapshot(session, portfolio_id)


@router.post("", response_model=ObjectiveRead, status_code=status.HTTP_201_CREATED)
def post_objective(
    portfolio_id: int,
    payload: ObjectiveCreate,
    session: Annotated[Session, Depends(get_session)],
) -> ObjectiveRead:
    objective = create_objective(session, portfolio_id, payload)
    assert objective.id is not None
    snapshot = build_objectives_snapshot(session, portfolio_id)
    return _to_objective_read_from_snapshot(snapshot, objective.id)


@router.patch("/{objective_id}", response_model=ObjectiveRead)
def patch_objective(
    portfolio_id: int,
    objective_id: int,
    payload: ObjectiveUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> ObjectiveRead:
    update_objective(session, portfolio_id, objective_id, payload)
    snapshot = build_objectives_snapshot(session, portfolio_id)
    return _to_objective_read_from_snapshot(snapshot, objective_id)


@router.delete("/{objective_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_objective(
    portfolio_id: int,
    objective_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_objective(session, portfolio_id, objective_id)


@router.put("/{objective_id}/allocations", response_model=ObjectiveRead)
def put_objective_allocations(
    portfolio_id: int,
    objective_id: int,
    payload: ObjectiveAllocationsReplace,
    session: Annotated[Session, Depends(get_session)],
) -> ObjectiveRead:
    replace_objective_allocations(session, portfolio_id, objective_id, payload.allocations)
    snapshot = build_objectives_snapshot(session, portfolio_id)
    return _to_objective_read_from_snapshot(snapshot, objective_id)


@router.patch(
    "/{objective_id}/allocations/{allocation_id}/purpose",
    response_model=ObjectiveRead,
)
def patch_allocation_purpose(
    portfolio_id: int,
    objective_id: int,
    allocation_id: int,
    payload: ObjectiveAllocationPurposeUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> ObjectiveRead:
    update_allocation_purpose(session, portfolio_id, objective_id, allocation_id, payload)
    snapshot = build_objectives_snapshot(session, portfolio_id)
    return _to_objective_read_from_snapshot(snapshot, objective_id)


@router.post("/{objective_id}/pension-years", response_model=ObjectiveRead, status_code=status.HTTP_201_CREATED)
def post_pension_year(
    portfolio_id: int,
    objective_id: int,
    payload: PensionYearCreate,
    session: Annotated[Session, Depends(get_session)],
) -> ObjectiveRead:
    add_pension_year(session, portfolio_id, objective_id, payload)
    snapshot = build_objectives_snapshot(session, portfolio_id)
    return _to_objective_read_from_snapshot(snapshot, objective_id)


@router.put("/{objective_id}/pension-years/{plan_year}", response_model=ObjectiveRead)
def put_pension_year(
    portfolio_id: int,
    objective_id: int,
    plan_year: int,
    payload: PensionYearUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> ObjectiveRead:
    upsert_pension_year(session, portfolio_id, objective_id, plan_year, payload)
    snapshot = build_objectives_snapshot(session, portfolio_id)
    return _to_objective_read_from_snapshot(snapshot, objective_id)


@router.delete("/{objective_id}/pension-years/{plan_year}", response_model=ObjectiveRead)
def remove_pension_year(
    portfolio_id: int,
    objective_id: int,
    plan_year: int,
    session: Annotated[Session, Depends(get_session)],
) -> ObjectiveRead:
    delete_pension_year(session, portfolio_id, objective_id, plan_year)
    snapshot = build_objectives_snapshot(session, portfolio_id)
    return _to_objective_read_from_snapshot(snapshot, objective_id)
