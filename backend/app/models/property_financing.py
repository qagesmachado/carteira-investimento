from datetime import date, datetime
from enum import StrEnum

from sqlmodel import Field, SQLModel, UniqueConstraint


class PropertyType(StrEnum):
    CASA = "casa"
    LOTE = "lote"
    APARTAMENTO = "apartamento"
    GALPAO = "galpao"
    SALA_COMERCIAL = "sala_comercial"


class PropertyFinancingEntryType(StrEnum):
    INCOME = "income"
    EXPENSE = "expense"


class PropertyFinancingEventCategory(StrEnum):
    ALUGUEL = "aluguel"
    FINANCIAMENTO = "financiamento"
    OUTRAS_TAXAS = "outras_taxas"
    ENTRADA_FINANCIAMENTO = "entrada_financiamento"


class PropertyFinancing(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("profile_id", "name"),)

    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="budgetprofile.id", index=True)
    name: str = Field(index=True)
    property_type: PropertyType
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PropertyFinancingEntry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    financing_id: int = Field(foreign_key="propertyfinancing.id", index=True)
    event_date: date = Field(index=True)
    entry_type: PropertyFinancingEntryType
    event_category: PropertyFinancingEventCategory
    description: str
    amount_brl: float
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PropertyFinancingEntryTemplate(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("financing_id", "name"),)

    id: int | None = Field(default=None, primary_key=True)
    financing_id: int = Field(foreign_key="propertyfinancing.id", index=True)
    name: str = Field(index=True)
    entry_type: PropertyFinancingEntryType
    event_category: PropertyFinancingEventCategory
    description: str
    amount_brl: float
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
