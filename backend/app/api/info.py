from fastapi import APIRouter

from app.db.session import SCHEMA_VERSION, engine, read_user_version
from app.schemas.info import AppInfo

router = APIRouter(prefix="/info", tags=["info"])


@router.get("", response_model=AppInfo)
def get_info() -> AppInfo:
    db_user_version = read_user_version(engine)
    return AppInfo(
        db_user_version=db_user_version,
        db_up_to_date=db_user_version >= SCHEMA_VERSION,
        database_path=str(engine.url.database or ""),
    )
