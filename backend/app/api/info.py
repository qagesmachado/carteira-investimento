import platform

from fastapi import APIRouter

from app.core.config import settings
from app.core.release_notes import release_notes_for
from app.core.version import APP_VERSION
from app.db.session import SCHEMA_VERSION, engine, read_user_version
from app.schemas.info import AppInfo

router = APIRouter(prefix="/info", tags=["info"])


@router.get("", response_model=AppInfo)
def get_info() -> AppInfo:
    db_user_version = read_user_version(engine)
    notes = release_notes_for(APP_VERSION)
    return AppInfo(
        app_version=APP_VERSION,
        schema_version=SCHEMA_VERSION,
        db_user_version=db_user_version,
        db_up_to_date=db_user_version >= SCHEMA_VERSION,
        python_version=platform.python_version(),
        database_path=str(engine.url.database or ""),
        lookup_mode=settings.asset_lookup_mode,
        released_at=notes.released_at if notes else None,
        release_notes=notes.notes if notes else [],
    )
