from fastapi.testclient import TestClient


def _create_profile(client: TestClient, name: str = "Casa") -> int:
    response = client.post("/budget/profiles", json={"name": name, "description": "Teste"})
    assert response.status_code == 201
    return response.json()["id"]


def test_set_and_clear_active_profile(client: TestClient):
    profile_id = _create_profile(client)

    set_response = client.put("/budget/active", json={"profile_id": profile_id})
    assert set_response.status_code == 200
    assert set_response.json()["profile_id"] == profile_id
    assert client.get("/budget/active").json()["profile_id"] == profile_id

    clear_response = client.put("/budget/active", json={"profile_id": None})
    assert clear_response.status_code == 200
    assert clear_response.json()["profile_id"] is None
    assert client.get("/budget/active").json()["profile_id"] is None


def test_set_active_profile_rejects_unknown(client: TestClient):
    response = client.put("/budget/active", json={"profile_id": 9999})
    assert response.status_code == 404


def test_create_profile_seeds_categories(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07")
    assert snapshot.status_code == 200
    body = snapshot.json()
    assert len(body["categories"]) == 6
    assert body["year_month"] == "2026-07"


def test_update_targets_requires_100_percent(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    targets = [{"category_id": c["category_id"], "percent": 40} for c in snapshot["categories"][:2]]
    response = client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/targets",
        json={"planned_income_brl": 10000, "targets": targets},
    )
    assert response.status_code == 422


def test_update_targets_accepts_subset_summing_100(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    targets = [{"category_id": c["category_id"], "percent": 50} for c in snapshot["categories"][:2]]
    response = client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/targets",
        json={"planned_income_brl": 10000, "targets": targets},
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["categories"]) == 2
    assert body["targets_inherited"] is False


def test_month_flow_income_expense_snapshot(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    targets = [
        {"category_id": c["category_id"], "percent": c["percent"]} for c in snapshot["categories"]
    ]
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/targets",
        json={"planned_income_brl": 10000, "targets": targets},
    )
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"items": [{"label": "Salário CLT", "amount_brl": 6250.07}]},
    )
    category_id = snapshot["categories"][0]["category_id"]
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/transactions",
        json={
            "transaction_type": "expense",
            "event_date": "2026-07-15",
            "description": "Energia",
            "amount_brl": 200,
            "category_id": category_id,
        },
    )
    final = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    assert final["income_total_brl"] == 6250.07
    assert final["expense_total_brl"] == 200
    assert final["remaining_brl"] == 6050.07


def test_tags_crud(client: TestClient):
    profile_id = _create_profile(client)
    created = client.post(
        f"/budget/profiles/{profile_id}/tags",
        json={"name": "Alimentação", "color": "#facc15"},
    )
    assert created.status_code == 201
    tag_id = created.json()["id"]
    listed = client.get(f"/budget/profiles/{profile_id}/tags").json()
    assert len(listed) == 1
    client.delete(f"/budget/profiles/{profile_id}/tags/{tag_id}")
    assert client.get(f"/budget/profiles/{profile_id}/tags").json() == []


def test_dashboard(client: TestClient):
    profile_id = _create_profile(client)
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"items": [{"label": "Salário", "amount_brl": 5000}]},
    )
    dash = client.get(
        f"/budget/profiles/{profile_id}/dashboard?months=3&focus=2026-07&forward=3"
    )
    assert dash.status_code == 200
    body = dash.json()
    assert body["months"] == 3
    assert body["forward_months"] == 3
    assert body["focus_year_month"] == "2026-07"
    assert body["income_brl"] == 5000
    assert body["from_year_month"] is None
    assert len(body["timeline"]) == 3 + 1 + 3
    assert body["timeline"][0]["year_month"] == "2026-04"
    assert body["timeline"][3]["year_month"] == "2026-07"
    assert body["timeline"][-1]["year_month"] == "2026-10"


def test_dashboard_custom_range(client: TestClient):
    profile_id = _create_profile(client)
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"items": [{"label": "Salário", "amount_brl": 5000}]},
    )
    dash = client.get(
        f"/budget/profiles/{profile_id}/dashboard?focus=2026-07&from=2026-05&to=2026-08"
    )
    assert dash.status_code == 200
    body = dash.json()
    assert body["from_year_month"] == "2026-05"
    assert body["to_year_month"] == "2026-08"
    assert body["months"] == 4
    assert [row["year_month"] for row in body["timeline"]] == [
        "2026-05",
        "2026-06",
        "2026-07",
        "2026-08",
    ]


def test_dashboard_custom_range_rejects_inverted(client: TestClient):
    profile_id = _create_profile(client)
    dash = client.get(
        f"/budget/profiles/{profile_id}/dashboard?focus=2026-07&from=2026-08&to=2026-05"
    )
    assert dash.status_code == 422


def test_dashboard_timeline_matches_month_totals(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-06").json()
    category_id = snapshot["categories"][0]["category_id"]
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-06/expenses",
        json={
            "description": "Aluguel",
            "event_date": "2026-06-05",
            "amount_brl": 1200,
            "category_id": category_id,
            "recurring": True,
            "indefinite": True,
        },
    )
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"items": [{"label": "Salário", "amount_brl": 5000}]},
    )
    dash = client.get(
        f"/budget/profiles/{profile_id}/dashboard?months=3&focus=2026-07&forward=2"
    ).json()
    for row in dash["timeline"]:
        month = client.get(f"/budget/profiles/{profile_id}/months/{row['year_month']}").json()
        assert row["income_brl"] == month["income_total_brl"]
        assert row["expense_brl"] == month["expense_total_brl"]
    assert dash["expense_brl"] == 1200
    assert dash["income_brl"] == 5000


def test_snapshot_views_return_expected_sections(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    category_id = snapshot["categories"][0]["category_id"]
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"items": [{"label": "Salário", "amount_brl": 5000}]},
    )
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Mercado",
            "event_date": "2026-07-12",
            "amount_brl": 200,
            "category_id": category_id,
        },
    )

    targets = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=targets").json()
    assert len(targets["categories"]) == 6
    assert targets["transactions"] == []
    assert targets["incomes"] == []
    assert targets["income_total_brl"] == 5000

    incomes = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=incomes").json()
    assert len(incomes["incomes"]) == 1
    assert incomes["transactions"] == []
    assert incomes["categories"] == []

    expenses = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=expenses").json()
    assert len(expenses["transactions"]) == 1
    assert expenses["incomes"] == []
    assert expenses["expense_total_brl"] == 200


def test_recurring_income_persists_for_12_months(client: TestClient):
    profile_id = _create_profile(client)
    response = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"label": "Salário CLT", "amount_brl": 5000, "recurring_12_months": True},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["income_total_brl"] == 5000
    assert body["incomes"][0]["recurring"] is True

    months = [
        "2026-07",
        "2026-08",
        "2026-09",
        "2026-10",
        "2026-11",
        "2026-12",
        "2027-01",
        "2027-02",
        "2027-03",
        "2027-04",
        "2027-05",
        "2027-06",
    ]
    for month in months:
        snapshot = client.get(f"/budget/profiles/{profile_id}/months/{month}").json()
        assert snapshot["income_total_brl"] == 5000
        assert snapshot["incomes"][0]["label"] == "Salário CLT"


def test_ad_hoc_income_create_and_delete(client: TestClient):
    profile_id = _create_profile(client)
    created = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"label": "Freelance", "amount_brl": 1500, "recurring_12_months": False},
    )
    assert created.status_code == 200
    income_id = created.json()["incomes"][0]["id"]
    assert created.json()["incomes"][0]["recurring"] is False

    deleted = client.delete(f"/budget/profiles/{profile_id}/months/2026-07/incomes/{income_id}")
    assert deleted.status_code == 200
    assert deleted.json()["income_total_brl"] == 0


def test_recurring_expense_with_end_month(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    category_id = snapshot["categories"][0]["category_id"]
    created = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Aluguel",
            "event_date": "2026-07-05",
            "amount_brl": 1200,
            "category_id": category_id,
            "recurring": True,
            "indefinite": False,
            "end_year_month": "2026-09",
        },
    )
    assert created.status_code == 200
    assert created.json()["expense_total_brl"] == 1200
    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08").json()
    assert august["expense_total_brl"] == 1200
    october = client.get(f"/budget/profiles/{profile_id}/months/2026-10").json()
    assert october["expense_total_brl"] == 0


def test_indefinite_recurring_expense_horizon_is_12_months(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-01").json()
    category_id = snapshot["categories"][0]["category_id"]
    created = client.post(
        f"/budget/profiles/{profile_id}/months/2026-01/expenses",
        json={
            "description": "Aluguel",
            "event_date": "2026-01-05",
            "amount_brl": 1200,
            "category_id": category_id,
            "recurring": True,
            "indefinite": True,
        },
    )
    assert created.status_code == 200

    from app.services.budget.budget_engine import RECURRING_EXPENSE_HORIZON, shift_year_month

    assert RECURRING_EXPENSE_HORIZON == 12
    for offset in range(RECURRING_EXPENSE_HORIZON):
        ym = shift_year_month("2026-01", offset)
        month = client.get(f"/budget/profiles/{profile_id}/months/{ym}").json()
        assert month["expense_total_brl"] == 1200, ym

    rules = client.get(f"/budget/profiles/{profile_id}/recurring-expenses").json()
    assert len(rules) == 1
    assert rules[0]["indefinite"] is True
    assert rules[0]["end_year_month"] is None


def test_stop_recurring_expense_from_month_keeps_past(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-06").json()
    category_id = snapshot["categories"][0]["category_id"]
    created = client.post(
        f"/budget/profiles/{profile_id}/months/2026-06/expenses",
        json={
            "description": "Internet",
            "event_date": "2026-06-10",
            "amount_brl": 150,
            "category_id": category_id,
            "recurring": True,
            "indefinite": True,
        },
    )
    assert created.status_code == 200
    rules = client.get(f"/budget/profiles/{profile_id}/recurring-expenses").json()
    rule_id = rules[0]["id"]

    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08").json()
    assert august["expense_total_brl"] == 150

    stopped = client.post(
        f"/budget/profiles/{profile_id}/recurring-expenses/{rule_id}/stop-from/2026-09"
    )
    assert stopped.status_code == 200
    assert stopped.json()["end_year_month"] == "2026-08"

    june = client.get(f"/budget/profiles/{profile_id}/months/2026-06").json()
    august_after = client.get(f"/budget/profiles/{profile_id}/months/2026-08").json()
    september = client.get(f"/budget/profiles/{profile_id}/months/2026-09").json()
    assert june["expense_total_brl"] == 150
    assert august_after["expense_total_brl"] == 150
    assert september["expense_total_brl"] == 0


def test_delete_recurring_expense_removes_all_months(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-06").json()
    category_id = snapshot["categories"][0]["category_id"]
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-06/expenses",
        json={
            "description": "Internet",
            "event_date": "2026-06-10",
            "amount_brl": 150,
            "category_id": category_id,
            "recurring": True,
            "indefinite": True,
        },
    )
    rules = client.get(f"/budget/profiles/{profile_id}/recurring-expenses").json()
    rule_id = rules[0]["id"]

    deleted = client.delete(f"/budget/profiles/{profile_id}/recurring-expenses/{rule_id}")
    assert deleted.status_code == 204
    june = client.get(f"/budget/profiles/{profile_id}/months/2026-06").json()
    assert june["expense_total_brl"] == 0


def test_stop_recurring_income_from_month_keeps_past(client: TestClient):
    profile_id = _create_profile(client)
    created = client.post(
        f"/budget/profiles/{profile_id}/months/2026-06/incomes",
        json={"label": "Salário CLT", "amount_brl": 5000, "recurring_12_months": True},
    )
    assert created.status_code == 200
    source_id = created.json()["incomes"][0]["source_id"]
    assert source_id is not None

    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08").json()
    assert august["income_total_brl"] == 5000

    stopped = client.post(
        f"/budget/profiles/{profile_id}/income-sources/{source_id}/stop-from/2026-09"
    )
    assert stopped.status_code == 200

    june = client.get(f"/budget/profiles/{profile_id}/months/2026-06").json()
    august_after = client.get(f"/budget/profiles/{profile_id}/months/2026-08").json()
    september = client.get(f"/budget/profiles/{profile_id}/months/2026-09").json()
    assert june["income_total_brl"] == 5000
    assert august_after["income_total_brl"] == 5000
    assert september["income_total_brl"] == 0


def test_delete_recurring_income_removes_all_months(client: TestClient):
    profile_id = _create_profile(client)
    created = client.post(
        f"/budget/profiles/{profile_id}/months/2026-06/incomes",
        json={"label": "Salário CLT", "amount_brl": 5000, "recurring_12_months": True},
    )
    assert created.status_code == 200
    source_id = created.json()["incomes"][0]["source_id"]

    deleted = client.delete(f"/budget/profiles/{profile_id}/income-sources/{source_id}")
    assert deleted.status_code == 204
    june = client.get(f"/budget/profiles/{profile_id}/months/2026-06").json()
    assert june["income_total_brl"] == 0


def test_settlement_view_lists_only_recurring_items(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    category_id = snapshot["categories"][0]["category_id"]

    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"label": "Salário", "amount_brl": 5000, "recurring_12_months": True},
    )
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"label": "Bônus", "amount_brl": 800, "recurring_12_months": False},
    )
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Aluguel",
            "event_date": "2026-07-05",
            "amount_brl": 1200,
            "category_id": category_id,
            "recurring": True,
            "indefinite": True,
        },
    )
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Farmácia",
            "event_date": "2026-07-10",
            "amount_brl": 50,
            "category_id": category_id,
            "recurring": False,
        },
    )

    settlement = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=settlement").json()
    assert len(settlement["incomes"]) == 1
    assert settlement["incomes"][0]["label"] == "Salário"
    assert settlement["incomes"][0]["received"] is False
    assert settlement["income_total_brl"] == 5000
    assert len(settlement["transactions"]) == 1
    assert settlement["transactions"][0]["description"] == "Aluguel"
    assert settlement["transactions"][0]["settled"] is False
    assert settlement["expense_total_brl"] == 1200

    full = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    assert full["income_total_brl"] == 5800
    assert full["expense_total_brl"] == 1250


def test_mark_income_received_and_expense_settled(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    category_id = snapshot["categories"][0]["category_id"]

    income = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"label": "Salário", "amount_brl": 5000, "recurring_12_months": True},
    ).json()["incomes"][0]
    expense = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Aluguel",
            "event_date": "2026-07-05",
            "amount_brl": 1200,
            "category_id": category_id,
            "recurring": True,
            "indefinite": True,
        },
    ).json()["transactions"][0]

    marked_income = client.patch(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes/{income['id']}",
        json={"received": True},
    )
    assert marked_income.status_code == 200
    assert marked_income.json()["incomes"][0]["received"] is True
    assert marked_income.json()["income_total_brl"] == 5000

    marked_expense = client.patch(
        f"/budget/profiles/{profile_id}/transactions/{expense['id']}",
        json={"settled": True},
    )
    assert marked_expense.status_code == 200
    assert marked_expense.json()["settled"] is True
    assert marked_expense.json()["amount_brl"] == 1200

    settlement = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=settlement").json()
    assert settlement["incomes"][0]["received"] is True
    assert settlement["transactions"][0]["settled"] is True

    full = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    assert full["income_total_brl"] == 5000
    assert full["expense_total_brl"] == 1200


def test_received_and_settled_rejected_for_pontual(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    category_id = snapshot["categories"][0]["category_id"]

    income_id = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/incomes",
        json={"label": "Bônus", "amount_brl": 800, "recurring_12_months": False},
    ).json()["incomes"][0]["id"]
    expense_id = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Farmácia",
            "event_date": "2026-07-10",
            "amount_brl": 50,
            "category_id": category_id,
            "recurring": False,
        },
    ).json()["transactions"][0]["id"]

    assert (
        client.patch(
            f"/budget/profiles/{profile_id}/months/2026-07/incomes/{income_id}",
            json={"received": True},
        ).status_code
        == 422
    )
    assert (
        client.patch(
            f"/budget/profiles/{profile_id}/transactions/{expense_id}",
            json={"settled": True},
        ).status_code
        == 422
    )


def test_settled_preserved_after_recurring_expense_rematerialize(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    category_id = snapshot["categories"][0]["category_id"]

    created = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Aluguel",
            "event_date": "2026-07-05",
            "amount_brl": 1200,
            "category_id": category_id,
            "recurring": True,
            "indefinite": True,
        },
    ).json()
    tx_id = created["transactions"][0]["id"]
    rule_id = created["transactions"][0]["recurring_expense_id"]

    client.patch(
        f"/budget/profiles/{profile_id}/transactions/{tx_id}",
        json={"settled": True},
    )
    # Sync ao abrir o mês rematerializa sem apagar settled.
    again = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=settlement").json()
    assert again["transactions"][0]["id"] == tx_id
    assert again["transactions"][0]["settled"] is True

    client.patch(
        f"/budget/profiles/{profile_id}/recurring-expenses/{rule_id}",
        json={"amount_brl": 1300},
    )
    after_update = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=settlement").json()
    assert after_update["transactions"][0]["amount_brl"] == 1300
    assert after_update["transactions"][0]["settled"] is True


def test_copy_previous_incomes_resets_received_flag(client: TestClient):
    profile_id = _create_profile(client)
    june = client.post(
        f"/budget/profiles/{profile_id}/months/2026-06/incomes",
        json={"label": "Salário", "amount_brl": 5000, "recurring_12_months": True},
    ).json()["incomes"][0]
    client.patch(
        f"/budget/profiles/{profile_id}/months/2026-06/incomes/{june['id']}",
        json={"received": True},
    )

    client.post(f"/budget/profiles/{profile_id}/months/2026-07/copy-previous-incomes")
    july = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=settlement").json()
    assert len(july["incomes"]) == 1
    assert july["incomes"][0]["label"] == "Salário"
    assert july["incomes"][0]["received"] is False
