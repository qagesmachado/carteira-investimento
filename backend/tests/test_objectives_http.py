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


def _create_pension_objective(client: TestClient, portfolio_id: int, name: str = "Previdência") -> int:
    response = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={
            "name": name,
            "mode": "pension_contribution",
            "plan_year": 2026,
            "annual_gross_income_brl": 120_000.0,
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_create_pension_contribution_objective(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Pension OBJ"}).json()["id"]
    response = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={
            "name": "Previdência IR",
            "mode": "pension_contribution",
            "plan_year": 2026,
            "annual_gross_income_brl": 120_000.0,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["mode"] == "pension_contribution"
    pension = body["pension_contribution"]
    assert pension["consolidated_total_brl"] == 0.0
    assert len(pension["years"]) == 1
    assert pension["years"][0]["target_annual_brl"] == 14_400.0
    assert body["total_value_brl"] == 0.0


def test_put_pension_year_fields(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Pension PATCH"}).json()["id"]
    objective_id = _create_pension_objective(client, portfolio_id)

    response = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/pension-years/2026",
        json={"contributed_ytd_brl": 6_000.0},
    )
    assert response.status_code == 200
    pension = response.json()["pension_contribution"]
    year_2026 = pension["years"][0]
    assert year_2026["contributed_ytd_brl"] == 6_000.0
    assert year_2026["remaining_brl"] == 8_400.0
    assert pension["consolidated_total_brl"] == 6_000.0


def test_add_second_pension_year(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Pension YEARS"}).json()["id"]
    objective_id = _create_pension_objective(client, portfolio_id)

    response = client.post(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/pension-years",
        json={
            "plan_year": 2025,
            "annual_gross_income_brl": 100_000.0,
            "contributed_ytd_brl": 12_000.0,
        },
    )
    assert response.status_code == 201
    pension = response.json()["pension_contribution"]
    assert len(pension["years"]) == 2
    assert [row["plan_year"] for row in pension["years"]] == [2026, 2025]
    assert pension["consolidated_total_brl"] == 12_000.0
    years = {row["plan_year"]: row for row in pension["years"]}
    assert years[2025]["contributed_ytd_brl"] == 12_000.0
    assert years[2026]["contributed_ytd_brl"] == 0.0


def test_duplicate_pension_objective_rejected(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Pension DUP"}).json()["id"]
    _create_pension_objective(client, portfolio_id, name="Previdência 1")
    response = client.post(
        f"/portfolios/{portfolio_id}/objectives",
        json={
            "name": "Previdência 2",
            "mode": "pension_contribution",
            "plan_year": 2026,
            "annual_gross_income_brl": 100_000.0,
        },
    )
    assert response.status_code == 422


def test_duplicate_pension_year_rejected(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Pension YEAR DUP"}).json()["id"]
    objective_id = _create_pension_objective(client, portfolio_id)
    response = client.post(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/pension-years",
        json={"plan_year": 2026, "annual_gross_income_brl": 100_000.0},
    )
    assert response.status_code == 422


def test_delete_pension_year(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Pension DEL YEAR"}).json()["id"]
    objective_id = _create_pension_objective(client, portfolio_id)
    client.post(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/pension-years",
        json={"plan_year": 2025, "annual_gross_income_brl": 100_000.0},
    )

    response = client.delete(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/pension-years/2025",
    )
    assert response.status_code == 200
    pension = response.json()["pension_contribution"]
    assert len(pension["years"]) == 1
    assert pension["years"][0]["plan_year"] == 2026


def test_cannot_delete_last_pension_year(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Pension LAST YEAR"}).json()["id"]
    objective_id = _create_pension_objective(client, portfolio_id)

    response = client.delete(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/pension-years/2026",
    )
    assert response.status_code == 422


def test_pension_objective_rejects_allocations(client: TestClient) -> None:
    portfolio_id = client.post("/portfolios", json={"name": "Pension ALLOC"}).json()["id"]
    objective_id = _create_pension_objective(client, portfolio_id)

    response = client.put(
        f"/portfolios/{portfolio_id}/objectives/{objective_id}/allocations",
        json={"allocations": []},
    )
    assert response.status_code == 422
