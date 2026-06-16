from fastapi.testclient import TestClient

from app.core.version import APP_VERSION
from app.db.session import SCHEMA_VERSION


def test_info_returns_versions(client: TestClient) -> None:
    response = client.get("/info")

    assert response.status_code == 200
    body = response.json()
    assert body["app_version"] == APP_VERSION
    assert body["schema_version"] == SCHEMA_VERSION
    assert isinstance(body["db_user_version"], int)
    assert isinstance(body["db_up_to_date"], bool)
    assert body["python_version"]
    assert "database_path" in body
    assert body["lookup_mode"] in {"fake", "yfinance"}
    assert "released_at" in body
    assert isinstance(body["release_notes"], list)
