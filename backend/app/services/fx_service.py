"""Cotação USD/BRL para conversão apresentacional (cache em AppPreference)."""

from __future__ import annotations

import json
import logging
from datetime import datetime
from math import isfinite
from typing import Any

import yfinance as yf
from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.portfolio import AppPreference

logger = logging.getLogger(__name__)

USD_BRL_FX_KEY = "usd_brl_fx"
_YFIN_TICKER = "USDBRL=X"


def fetch_usd_brl_spot() -> float:
    """Busca a última cotação disponível do par no Yahoo Finance."""
    ticker = yf.Ticker(_YFIN_TICKER)
    hist = ticker.history(period="5d")
    if hist is None or hist.empty:
        raise ValueError("empty history for USDBRL=X")
    close = float(hist["Close"].iloc[-1])
    if not (isfinite(close) and close > 0):
        raise ValueError("invalid rate for USDBRL=X")
    return close


def _parse_stored_payload(raw: str) -> tuple[float | None, datetime | None]:
    try:
        data: dict[str, Any] = json.loads(raw)
    except json.JSONDecodeError:
        return None, None
    rate_raw = data.get("rate")
    ts_raw = data.get("refreshed_at")
    rate: float | None
    try:
        rate = float(rate_raw) if rate_raw is not None else None
    except (TypeError, ValueError):
        rate = None
    refreshed_at: datetime | None
    if isinstance(ts_raw, str):
        try:
            refreshed_at = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
        except ValueError:
            refreshed_at = None
    else:
        refreshed_at = None
    if rate is not None and not (rate > 0):
        rate = None
    return rate, refreshed_at


def get_usd_brl_state(session: Session) -> tuple[float | None, datetime | None]:
    pref = session.get(AppPreference, USD_BRL_FX_KEY)
    if pref is None:
        return None, None
    return _parse_stored_payload(pref.value)


def refresh_usd_brl(session: Session) -> tuple[float, datetime]:
    try:
        rate = fetch_usd_brl_spot()
    except Exception as exc:
        logger.warning("usd_brl_fetch_failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="could not fetch USD/BRL rate",
        ) from exc

    refreshed_at = datetime.utcnow()
    payload = json.dumps(
        {"rate": rate, "refreshed_at": refreshed_at.isoformat()},
        ensure_ascii=False,
    )
    existing = session.get(AppPreference, USD_BRL_FX_KEY)
    if existing:
        existing.value = payload
        session.add(existing)
    else:
        session.add(AppPreference(key=USD_BRL_FX_KEY, value=payload))
    session.commit()
    return rate, refreshed_at
