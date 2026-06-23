from app.providers.yfinance_asset_provider import AssetLookupProvider, AssetLookupResult

_INVALID_SYMBOL = "INVALIDO_XYZ"

_FAKE_LOOKUPS: dict[str, dict] = {
    "BBSE3": {
        "symbol": "BBSE3",
        "name": "BB Seguridade Participações S.A.",
        "asset_type": "stock",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Serviços financeiros",
        "current_quote": 38.5,
    },
    "FESA4": {
        "symbol": "FESA4",
        "name": "Fertilizantes Heringer S.A.",
        "asset_type": "stock",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Materiais básicos",
        "current_quote": 12.1,
    },
    "FLRY3": {
        "symbol": "FLRY3",
        "name": "Fleury S.A.",
        "asset_type": "stock",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Saúde",
        "current_quote": 15.2,
    },
    "ITSA4": {
        "symbol": "ITSA4",
        "name": "Itaúsa S.A.",
        "asset_type": "stock",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Serviços financeiros",
        "current_quote": 10.8,
    },
    "PETR4": {
        "symbol": "PETR4",
        "name": "Petrobras PN",
        "asset_type": "stock",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Energia",
        "current_quote": 38.5,
    },
    "KLBN4": {
        "symbol": "KLBN4",
        "name": "Klabin S.A.",
        "asset_type": "stock",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Materiais básicos",
        "current_quote": 4.2,
    },
    "AUPO11": {
        "symbol": "AUPO11",
        "name": "BTG Pactual Crédito Imobiliário",
        "asset_type": "etf",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Financeiro",
        "current_quote": 100.0,
    },
    "AUVP11": {
        "symbol": "AUVP11",
        "name": "BTG Pactual Teva AUVP Ações Fundamentos",
        "asset_type": "etf",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Financeiro",
        "current_quote": 95.0,
    },
    "VOO": {
        "symbol": "VOO",
        "name": "Vanguard S&P 500 ETF",
        "asset_type": "etf",
        "market": "international",
        "country": "US",
        "currency": "USD",
        "sector": None,
        "current_quote": 450.0,
    },
    "ABTC11": {
        "symbol": "ABTC11",
        "name": "ETF Bitcoin",
        "asset_type": "etf",
        "market": "national",
        "country": "BR",
        "currency": "BRL",
        "sector": "Financeiro",
        "etf_subtype": "crypto",
        "current_quote": 50.0,
    },
    "BTC-USD": {
        "symbol": "BTC-USD",
        "name": "Bitcoin USD",
        "asset_type": "crypto",
        "market": "international",
        "country": "US",
        "currency": "USD",
        "sector": None,
        "current_quote": 65000.0,
    },
}

_FALLBACK = {
    "name": "Petrobras PN",
    "asset_type": "stock",
    "market": "national",
    "country": "BR",
    "currency": "BRL",
    "sector": "Energia",
    "current_quote": 38.5,
}


class FakeAssetLookupProvider:
    """Lookup determinístico para testes de integração (sem rede)."""

    def lookup(self, symbol: str) -> AssetLookupResult:
        normalized = symbol.strip().upper().removesuffix(".SA")
        if normalized == _INVALID_SYMBOL:
            raise ValueError(f"fake lookup failed for {normalized}")

        data = _FAKE_LOOKUPS.get(normalized)
        if data is None:
            data = {**_FALLBACK, "symbol": normalized}

        return AssetLookupResult(
            symbol=data["symbol"],
            name=data["name"],
            asset_type=data["asset_type"],
            market=data["market"],
            country=data["country"],
            currency=data["currency"],
            etf_subtype=data.get("etf_subtype"),
            sector=data.get("sector"),
            quote_source="fake",
            current_quote=data.get("current_quote"),
        )


def create_asset_lookup_provider() -> AssetLookupProvider:
    from app.core.config import settings

    if settings.asset_lookup_mode == "fake":
        return FakeAssetLookupProvider()
    from app.providers.yfinance_asset_provider import YFinanceAssetProvider

    return YFinanceAssetProvider()
