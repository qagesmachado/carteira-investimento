from pydantic import BaseModel, Field


class AppInfo(BaseModel):
    app_version: str
    schema_version: int
    db_user_version: int
    db_up_to_date: bool
    python_version: str
    database_path: str
    lookup_mode: str
    released_at: str | None = None
    release_notes: list[str] = Field(default_factory=list)
