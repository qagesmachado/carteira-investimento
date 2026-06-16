from fastapi.testclient import TestClient

from app.db.session import SCHEMA_VERSION


def test_info_returns_database_state(client: TestClient) -> None:
    response = client.get("/info")

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body["db_user_version"], int)
    assert isinstance(body["db_up_to_date"], bool)
    assert body["db_up_to_date"] == (body["db_user_version"] >= SCHEMA_VERSION)
    assert "database_path" in body
