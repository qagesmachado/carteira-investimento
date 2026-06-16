from pydantic import BaseModel


class AppInfo(BaseModel):
    db_user_version: int
    db_up_to_date: bool
    database_path: str
