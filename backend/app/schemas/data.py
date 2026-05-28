from datetime import datetime

from sqlmodel import SQLModel

from app.schemas.asset import AssetCreate
from app.schemas.portfolio import (
    DividendPaymentExportItem,
    PortfolioExportDocument,
    PortfolioExportMeta,
    PositionExportItem,
)

FULL_BACKUP_VERSION = 1


class AppPreferenceExport(SQLModel):
    key: str
    value: str


class FullBackupDocument(SQLModel):
    version: int = FULL_BACKUP_VERSION
    exported_at: datetime
    type: str = "full_backup"
    portfolios: list[PortfolioExportMeta]
    assets: list[AssetCreate]
    positions: list[PositionExportItem]
    dividend_payments: list[DividendPaymentExportItem] = []
    app_preferences: list[AppPreferenceExport] = []


class FullBackupImportRequest(SQLModel):
    document: FullBackupDocument


class AssetsExportDocument(SQLModel):
    version: int = 1
    exported_at: datetime
    assets: list[AssetCreate]
