"""Testes **unitários** da função ``resolve_yahoo_symbol`` (só strings, sem HTTP e sem banco).

Para validar os **endpoints** FastAPI sem usar o arquivo ``carteira.db`` da pasta
``backend/``:

- Use o fixture ``client`` em ``conftest.py``: SQLite **em memória** (`sqlite://`),
  banco descartado ao fim dos testes.
- O lookup em rede é desativado via ``FakeAssetLookupProvider`` nas dependências.

Exemplos: ``test_assets_http.py`` (contratos HTTP), ``test_assets.py`` (regras de
domínio e CRUD via API).
"""

import pytest

from app.providers.yfinance_asset_provider import YFinanceAssetProvider, resolve_yahoo_symbol


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("BBSE3", "BBSE3.SA"),
        ("bbse3", "BBSE3.SA"),
        ("  petr4  ", "PETR4.SA"),
        ("PETR4.SA", "PETR4.SA"),
        ("petr4.sa", "PETR4.SA"),
        ("HGLG11", "HGLG11.SA"),
        ("VOO", "VOO"),
        ("AAPL", "AAPL"),
        ("BTC-USD", "BTC-USD"),
        ("BRK.B", "BRK.B"),
    ],
)
def test_resolve_yahoo_symbol(raw: str, expected: str) -> None:
    assert resolve_yahoo_symbol(raw) == expected


def test_asset_type_fundo_de_indice_is_etf_not_fii() -> None:
    provider = YFinanceAssetProvider()
    asset_type = provider._asset_type_from_quote_type(
        "EQUITY",
        "AUVP11.SA",
        "Btg Pactual Teva Auvp Acoes Fundamentos Fundo De Indice",
    )
    assert asset_type == "etf"


def test_ensure_quote_found_rejects_empty_yfinance_payload() -> None:
    with pytest.raises(ValueError, match="quote not found"):
        YFinanceAssetProvider._ensure_quote_found({}, "INVALIDO_XYZ")

    with pytest.raises(ValueError, match="quote not found"):
        YFinanceAssetProvider._ensure_quote_found({"symbol": "ZZZZ3.SA"}, "ZZZZ3.SA")


def test_ensure_quote_found_accepts_minimal_valid_payload() -> None:
    YFinanceAssetProvider._ensure_quote_found(
        {"quoteType": "EQUITY", "longName": "Petrobras"},
        "PETR4.SA",
    )
