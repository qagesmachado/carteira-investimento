"""Fixtures compartilhadas para testes de API.

Banco SQLite único em memória (espelha produção unificada).
"""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.assets import get_asset_lookup_provider
from app.db.session import ALL_TABLES, get_session
from app.main import app
from app.models.asset import Asset
from app.models.portfolio import AppPreference, Portfolio
from app.models.position import Position
from app.providers.yfinance_asset_provider import AssetLookupProvider, AssetLookupResult


class FakeAssetLookupProvider:
    def lookup(self, symbol: str) -> AssetLookupResult:
        return AssetLookupResult(
            symbol=symbol.upper(),
            name="Petrobras PN",
            asset_type="stock",
            market="national",
            country="BR",
            currency="BRL",
            sector="Energia",
            quote_source="yfinance",
            current_quote=38.5,
        )


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine, tables=ALL_TABLES)

    def override_session() -> Generator[Session, None, None]:
        with Session(engine) as session:
            yield session

    def override_lookup_provider() -> AssetLookupProvider:
        return FakeAssetLookupProvider()

    app.dependency_overrides[get_session] = override_session
    app.dependency_overrides[get_asset_lookup_provider] = override_lookup_provider

    yield TestClient(app)

    app.dependency_overrides.clear()
