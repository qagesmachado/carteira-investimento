from datetime import datetime

from sqlmodel import SQLModel


class UsdBrlRead(SQLModel):
    rate: float | None = None
    refreshed_at: datetime | None = None


class UsdBrlRefreshResponse(SQLModel):
    rate: float
    refreshed_at: datetime
