"""Contratos HTTP de objetivos financeiros."""

from fastapi.testclient import TestClient

from app.models.objective import DEFAULT_OBJECTIVE_NAME


def test_get_objectives_404_unknown_portfolio(client: TestClient) -> None:
    response = client.get("/portfolios/99999/objectives")
    assert response.status_code == 404


def test_cannot_update_default_objective(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "OBJ HTTP"}).json()["id"]
    snapshot = client.get(f"/portfolios/{portfolio_id}/objectives").json()
    default_id = snapshot["objectives"][0]["id"]
    response = client.patch(
        f"/portfolios/{portfolio_id}/objectives/{default_id}",
        json={"name": "Outro"},
    )
    assert response.status_code == 422


def test_cannot_delete_default_objective(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "OBJ HTTP 2"}).json()["id"]
    default_id = client.get(f"/portfolios/{portfolio_id}/objectives").json()["objectives"][0]["id"]
    response = client.delete(f"/portfolios/{portfolio_id}/objectives/{default_id}")
    assert response.status_code == 422


def test_reserved_name_rejected(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "OBJ HTTP 3"}).json()["id"]
    response = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={"name": DEFAULT_OBJECTIVE_NAME},
    )
    assert response.status_code == 422


def test_objectives_isolated_by_portfolio(client: TestClient) -> None:
    p1 = client.post("/portfolios", json={"name": "P1 OBJ"}).json()["id"]
    p2 = client.post("/portfolios", json={"name": "P2 OBJ"}).json()["id"]
    client.post(f"/portfolios/{p1}/objectives", json={"name": "Reserva P1"})

    snap1 = client.get(f"/portfolios/{p1}/objectives").json()
    snap2 = client.get(f"/portfolios/{p2}/objectives").json()
    assert len(snap1["objectives"]) == 2
    assert len(snap2["objectives"]) == 1
