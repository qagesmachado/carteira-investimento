"""Contratos HTTP de ``/fx/usd-brl``."""

from datetime import datetime

import pytest
from fastapi.testclient import TestClient

import app.services.fx_service as fx_service


def test_get_usd_brl_empty(client: TestClient) -> None:
    response = client.get("/fx/usd-brl")
    assert response.status_code == 200
    body = response.json()
    assert body["rate"] is None
    assert body["refreshed_at"] is None


def test_post_refresh_usd_brl_persists_and_get_returns_values(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def fake_spot() -> float:
        return 5.4321

    monkeypatch.setattr(fx_service, "fetch_usd_brl_spot", fake_spot)

    post = client.post("/fx/usd-brl/refresh")
    assert post.status_code == 200
    body = post.json()
    assert body["rate"] == 5.4321
    assert "refreshed_at" in body
    datetime.fromisoformat(body["refreshed_at"].replace("Z", "+00:00"))

    get = client.get("/fx/usd-brl")
    assert get.status_code == 200
    got = get.json()
    assert got["rate"] == 5.4321
    assert got["refreshed_at"] is not None


def test_post_refresh_usd_brl_fails_when_fetch_raises(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    def boom() -> float:
        raise RuntimeError("network")

    monkeypatch.setattr(fx_service, "fetch_usd_brl_spot", boom)

    response = client.post("/fx/usd-brl/refresh")
    assert response.status_code == 502
    assert "USD/BRL" in response.json()["detail"]
