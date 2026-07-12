import importlib
import pkgutil

from fastapi.testclient import TestClient


def test_budget_api_has_no_portfolio_id_in_responses(client: TestClient):
    created = client.post("/budget/profiles", json={"name": "Isolado"})
    profile_id = created.json()["id"]
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    assert "portfolio_id" not in snapshot
    for key in snapshot:
        assert "portfolio" not in key.lower()


def test_profiles_are_isolated(client: TestClient):
    a = client.post("/budget/profiles", json={"name": "Perfil A"}).json()["id"]
    b = client.post("/budget/profiles", json={"name": "Perfil B"}).json()["id"]
    snap_a = client.get(f"/budget/profiles/{a}/months/2026-07").json()
    cat_a = snap_a["categories"][0]["category_id"]
    client.post(
        f"/budget/profiles/{a}/months/2026-07/transactions",
        json={
            "transaction_type": "expense",
            "event_date": "2026-07-01",
            "description": "Só A",
            "amount_brl": 99,
            "category_id": cat_a,
        },
    )
    snap_b = client.get(f"/budget/profiles/{b}/months/2026-07").json()
    snap_a = client.get(f"/budget/profiles/{a}/months/2026-07").json()
    assert snap_b["expense_total_brl"] == 0
    assert snap_a["expense_total_brl"] == 99


def test_budget_services_do_not_import_portfolio_modules():
    import app.services.budget.budget_service as budget_service

    budget_path = budget_service.__file__
    assert budget_path is not None
    with open(budget_path, encoding="utf-8") as handle:
        content = handle.read()
    assert "portfolio_service" not in content
    assert "portfolio_patrimony" not in content
    if "from app.models.portfolio import AppPreference" in content:
        content = content.replace("from app.models.portfolio import AppPreference", "")
    assert "from app.models.portfolio" not in content

    package = importlib.import_module("app.services.budget")
    for _, name, _ in pkgutil.walk_packages(package.__path__, package.__name__ + "."):
        module = importlib.import_module(name)
        source_path = getattr(module, "__file__", None)
        if not source_path or source_path.endswith("__init__.py"):
            continue
        with open(source_path, encoding="utf-8") as handle:
            text = handle.read()
        assert "from app.services.portfolio" not in text
        if "from app.models.portfolio import AppPreference" in text:
            text = text.replace("from app.models.portfolio import AppPreference", "")
        assert "from app.models.portfolio" not in text
        assert "Portfolio" not in text
