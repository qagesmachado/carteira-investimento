import re
from dataclasses import dataclass
from typing import Protocol

import yfinance as yf


def resolve_yahoo_symbol(symbol: str) -> str:
    """Converte ticker digitado pelo usuário no formato esperado pelo Yahoo Finance.

    Na B3, o Yahoo usa o sufixo ``.SA``. Sem ele, símbolos como ``BBSE3`` podem
    colidir com outros papéis e voltar cotação em USD.
    """
    s = symbol.strip().upper()
    if not s:
        return s
    if s.endswith(".SA"):
        return s
    if "-" in s:
        return s
    if "." in s:
        return s
    if re.fullmatch(r"[A-Z]{4}\d{1,2}", s):
        return f"{s}.SA"
    return s


@dataclass(frozen=True)
class AssetLookupResult:
    symbol: str
    name: str
    asset_type: str
    market: str
    country: str | None
    currency: str
    sector: str | None = None
    subsector: str | None = None
    segment: str | None = None
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None
    quote_source: str | None = None
    current_quote: float | None = None


class AssetLookupProvider(Protocol):
    def lookup(self, symbol: str) -> AssetLookupResult:
        pass


class YFinanceAssetProvider:
    def lookup(self, symbol: str) -> AssetLookupResult:
        yahoo_symbol = resolve_yahoo_symbol(symbol)
        ticker = yf.Ticker(yahoo_symbol)
        info = ticker.info or {}
        self._ensure_quote_found(info, yahoo_symbol)
        quote_type = str(info.get("quoteType", "")).upper()
        is_b3 = yahoo_symbol.endswith(".SA") or self._looks_like_b3_listing(info)
        currency_raw = str(info.get("currency") or "").upper()
        if currency_raw:
            currency = currency_raw
        else:
            currency = "BRL" if is_b3 else "USD"

        name = str(info.get("longName") or info.get("shortName") or yahoo_symbol)
        return AssetLookupResult(
            symbol=yahoo_symbol,
            name=name,
            asset_type=self._asset_type_from_quote_type(quote_type, yahoo_symbol, name),
            market="national" if is_b3 else "international",
            country="BR" if is_b3 else str(info.get("country") or "US"),
            currency=currency,
            sector=info.get("sector"),
            quote_source="yfinance",
            current_quote=self._quote_from_info_static(info),
        )

    @staticmethod
    def _looks_like_b3_listing(info: dict) -> bool:
        exchange = str(info.get("exchange") or "").upper()
        if exchange in {"SAO", "BVMF"}:
            return True
        tz = str(info.get("exchangeTimezoneName") or "").upper()
        if "SAO_PAULO" in tz or "SAO PAULO" in tz:
            return True
        if str(info.get("currency") or "").upper() != "BRL":
            return False
        country = str(info.get("country") or "").lower()
        if country in {"brazil", "br"}:
            return True
        fen = str(info.get("fullExchangeName") or "").upper()
        return any(x in fen for x in ("B3", "BMF", "BOVESPA", "BRASIL"))

    @staticmethod
    def _ensure_quote_found(info: dict, yahoo_symbol: str) -> None:
        """Yahoo pode responder HTTP 404 e ainda devolver ``info`` quase vazio."""
        quote_type = str(info.get("quoteType") or "").strip()
        long_name = str(info.get("longName") or "").strip()
        short_name = str(info.get("shortName") or "").strip()
        has_price = YFinanceAssetProvider._quote_from_info_static(info) is not None
        if quote_type or long_name or short_name or has_price:
            return
        raise ValueError(f"quote not found for {yahoo_symbol}")

    def _asset_type_from_quote_type(self, quote_type: str, symbol: str, name: str = "") -> str:
        if quote_type == "ETF":
            return "etf"
        if quote_type in {"CRYPTOCURRENCY", "CRYPTO"}:
            return "crypto"
        normalized_name = name.lower()
        if "fundo de indice" in normalized_name or "fundo de índice" in normalized_name:
            return "etf"
        if symbol.endswith("11.SA"):
            return "fii"
        if quote_type in {"EQUITY", ""}:
            return "stock"
        return "other"

    @staticmethod
    def _quote_from_info_static(info: dict) -> float | None:
        value = info.get("regularMarketPrice") or info.get("currentPrice") or info.get("previousClose")
        return float(value) if value is not None else None
