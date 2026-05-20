"""Fixtures compartilhadas para testes de API.

Dois bancos SQLite em memória: ativos e carteiras (espelha produção).
"""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.assets import get_asset_lookup_provider
from app.db.session import (
    ASSET_TABLES,
    PORTFOLIO_TABLES,
    get_portfolios_session,
    get_session,
)
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
    assets_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    portfolios_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(assets_engine, tables=ASSET_TABLES)
    SQLModel.metadata.create_all(portfolios_engine, tables=PORTFOLIO_TABLES)

    def override_assets_session() -> Generator[Session, None, None]:
        with Session(assets_engine) as session:
            yield session

    def override_portfolios_session() -> Generator[Session, None, None]:
        with Session(portfolios_engine) as session:
            yield session

    def override_lookup_provider() -> AssetLookupProvider:
        return FakeAssetLookupProvider()

    app.dependency_overrides[get_session] = override_assets_session
    app.dependency_overrides[get_portfolios_session] = override_portfolios_session
    app.dependency_overrides[get_asset_lookup_provider] = override_lookup_provider

    yield TestClient(app)

    app.dependency_overrides.clear()
