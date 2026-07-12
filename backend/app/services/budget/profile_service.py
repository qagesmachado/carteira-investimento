from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.budget import BudgetProfile
from app.models.portfolio import AppPreference


def get_budget_profile(session: Session, profile_id: int) -> BudgetProfile:
    profile = session.get(BudgetProfile, profile_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="budget profile not found")
    return profile


ACTIVE_BUDGET_PROFILE_KEY = "active_budget_profile_id"


def get_active_budget_profile_id(session: Session) -> int | None:
    pref = session.get(AppPreference, ACTIVE_BUDGET_PROFILE_KEY)
    if pref is None or not pref.value.strip():
        return None
    try:
        return int(pref.value)
    except ValueError:
        return None


def set_active_budget_profile_id(session: Session, profile_id: int | None) -> int | None:
    if profile_id is not None:
        get_budget_profile(session, profile_id)
    value = "" if profile_id is None else str(profile_id)
    pref = session.get(AppPreference, ACTIVE_BUDGET_PROFILE_KEY)
    if pref is None:
        pref = AppPreference(key=ACTIVE_BUDGET_PROFILE_KEY, value=value)
    else:
        pref.value = value
    session.add(pref)
    session.commit()
    return profile_id


def list_budget_profiles(session: Session) -> list[BudgetProfile]:
    return list(session.exec(select(BudgetProfile).order_by(BudgetProfile.name)).all())
