from fastapi.testclient import TestClient


def _create_profile(client: TestClient, name: str = "Casa") -> int:
    response = client.post("/budget/profiles", json={"name": name, "description": "Teste"})
    assert response.status_code == 201
    return response.json()["id"]


def _category_ids(client: TestClient, profile_id: int) -> list[int]:
    listed = client.get(f"/budget/profiles/{profile_id}/categories")
    assert listed.status_code == 200
    return [c["id"] for c in listed.json()]


def test_list_categories_returns_seeded_defaults(client: TestClient):
    profile_id = _create_profile(client)
    listed = client.get(f"/budget/profiles/{profile_id}/categories").json()
    assert len(listed) == 6
    assert listed[0]["name"] == "Custos fixos"


def test_create_category(client: TestClient):
    profile_id = _create_profile(client)
    created = client.post(
        f"/budget/profiles/{profile_id}/categories",
        json={"name": "Viagens", "color": "#0ea5e9"},
    )
    assert created.status_code == 201
    body = created.json()
    assert body["name"] == "Viagens"
    assert body["color"] == "#0ea5e9"
    assert len(_category_ids(client, profile_id)) == 7


def test_create_category_rejects_duplicate_name(client: TestClient):
    profile_id = _create_profile(client)
    client.post(f"/budget/profiles/{profile_id}/categories", json={"name": "Viagens"})
    clash = client.post(f"/budget/profiles/{profile_id}/categories", json={"name": "Viagens"})
    assert clash.status_code == 409


def test_categories_are_isolated_per_profile(client: TestClient):
    a = _create_profile(client, "Perfil A")
    b = _create_profile(client, "Perfil B")
    client.post(f"/budget/profiles/{a}/categories", json={"name": "Só do A"})
    names_b = [c["name"] for c in client.get(f"/budget/profiles/{b}/categories").json()]
    assert "Só do A" not in names_b


def test_update_category_all_scope(client: TestClient):
    profile_id = _create_profile(client)
    category_id = _category_ids(client, profile_id)[0]
    updated = client.patch(
        f"/budget/profiles/{profile_id}/categories/{category_id}",
        json={"name": "Essenciais", "color": "#111827", "scope": "all"},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Essenciais"
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    names = [c["category_name"] for c in snapshot["categories"]]
    assert "Essenciais" in names


def test_delete_category_without_expenses(client: TestClient):
    profile_id = _create_profile(client)
    created = client.post(
        f"/budget/profiles/{profile_id}/categories", json={"name": "Descartável"}
    )
    category_id = created.json()["id"]
    deleted = client.delete(f"/budget/profiles/{profile_id}/categories/{category_id}")
    assert deleted.status_code == 204
    assert category_id not in _category_ids(client, profile_id)


def test_delete_category_with_expense_is_blocked(client: TestClient):
    profile_id = _create_profile(client)
    category_id = _category_ids(client, profile_id)[0]
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
    blocked = client.delete(f"/budget/profiles/{profile_id}/categories/{category_id}")
    assert blocked.status_code == 409
    assert category_id in _category_ids(client, profile_id)


def test_delete_category_with_recurring_expense_is_blocked(client: TestClient):
    profile_id = _create_profile(client)
    category_id = _category_ids(client, profile_id)[0]
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Assinatura",
            "event_date": "2026-07-05",
            "amount_brl": 40,
            "category_id": category_id,
            "recurring": True,
            "indefinite": True,
        },
    )
    blocked = client.delete(f"/budget/profiles/{profile_id}/categories/{category_id}")
    assert blocked.status_code == 409


def test_targets_subset_and_inheritance_between_months(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    cat_ids = [c["category_id"] for c in snapshot["categories"]]
    targets = [
        {"category_id": cat_ids[0], "percent": 60},
        {"category_id": cat_ids[1], "percent": 40},
    ]
    saved = client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/targets",
        json={"planned_income_brl": 10000, "targets": targets},
    ).json()
    assert len(saved["categories"]) == 2
    assert saved["targets_inherited"] is False

    # Mês seguinte, sem metas próprias, herda o conjunto de julho.
    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08?view=targets").json()
    assert len(august["categories"]) == 2
    assert august["targets_inherited"] is True
    by_id = {c["category_id"]: c["percent"] for c in august["categories"]}
    assert by_id[cat_ids[0]] == 60
    assert by_id[cat_ids[1]] == 40


def test_editing_later_month_does_not_change_previous(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    cat_ids = [c["category_id"] for c in snapshot["categories"]]

    client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/targets",
        json={"targets": [{"category_id": cat_ids[0], "percent": 100}]},
    )
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-09/targets",
        json={
            "targets": [
                {"category_id": cat_ids[0], "percent": 30},
                {"category_id": cat_ids[1], "percent": 70},
            ]
        },
    )

    july = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=targets").json()
    assert len(july["categories"]) == 1
    assert july["categories"][0]["percent"] == 100
    # Agosto (entre julho e setembro) herda julho, não setembro.
    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08?view=targets").json()
    assert len(august["categories"]) == 1
    assert august["categories"][0]["percent"] == 100


def test_propagate_category_to_following_months_with_own_targets(client: TestClient):
    """Ao salvar com propagate_category_ids, meses seguintes customizados recebem a meta (0%)."""
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    cat_ids = [c["category_id"] for c in snapshot["categories"]]
    base = [
        {"category_id": cat_ids[0], "percent": 60},
        {"category_id": cat_ids[1], "percent": 40},
    ]
    client.put(f"/budget/profiles/{profile_id}/months/2026-06/targets", json={"targets": base})
    client.put(f"/budget/profiles/{profile_id}/months/2026-08/targets", json={"targets": base})

    created = client.post(
        f"/budget/profiles/{profile_id}/categories",
        json={"name": "Propagada", "color": "#111111"},
    ).json()
    new_id = created["id"]
    july_targets = [
        {"category_id": cat_ids[0], "percent": 50},
        {"category_id": cat_ids[1], "percent": 47},
        {"category_id": new_id, "percent": 3},
    ]
    saved = client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/targets",
        json={"targets": july_targets, "propagate_category_ids": [new_id]},
    ).json()
    assert any(c["category_id"] == new_id for c in saved["categories"])

    june = client.get(f"/budget/profiles/{profile_id}/months/2026-06?view=targets").json()
    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08?view=targets").json()
    june_ids = {c["category_id"] for c in june["categories"]}
    august_by_id = {c["category_id"]: c["percent"] for c in august["categories"]}
    assert new_id not in june_ids
    assert new_id in august_by_id
    assert august_by_id[new_id] == 0
    assert abs(sum(august_by_id.values()) - 100) < 0.01


def test_without_propagate_following_months_keep_own_set(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    cat_ids = [c["category_id"] for c in snapshot["categories"]]
    base = [
        {"category_id": cat_ids[0], "percent": 60},
        {"category_id": cat_ids[1], "percent": 40},
    ]
    client.put(f"/budget/profiles/{profile_id}/months/2026-08/targets", json={"targets": base})
    created = client.post(
        f"/budget/profiles/{profile_id}/categories",
        json={"name": "Só julho"},
    ).json()
    new_id = created["id"]
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/targets",
        json={
            "targets": [
                {"category_id": cat_ids[0], "percent": 97},
                {"category_id": new_id, "percent": 3},
            ]
        },
    )
    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08?view=targets").json()
    assert new_id not in {c["category_id"] for c in august["categories"]}


def test_apply_to_following_months_copies_full_target_set(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    cat_ids = [c["category_id"] for c in snapshot["categories"]]
    base = [
        {"category_id": cat_ids[0], "percent": 60},
        {"category_id": cat_ids[1], "percent": 40},
    ]
    client.put(f"/budget/profiles/{profile_id}/months/2026-08/targets", json={"targets": base})

    july = [
        {"category_id": cat_ids[0], "percent": 70},
        {"category_id": cat_ids[1], "percent": 30},
    ]
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-07/targets",
        json={"targets": july, "apply_to_following_months": True},
    )
    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08?view=targets").json()
    by_id = {c["category_id"]: c["percent"] for c in august["categories"]}
    assert by_id[cat_ids[0]] == 70
    assert by_id[cat_ids[1]] == 30


def test_remove_category_from_following_months(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    cat_ids = [c["category_id"] for c in snapshot["categories"]]
    base = [
        {"category_id": cat_ids[0], "percent": 50},
        {"category_id": cat_ids[1], "percent": 30},
        {"category_id": cat_ids[2], "percent": 20},
    ]
    client.put(f"/budget/profiles/{profile_id}/months/2026-07/targets", json={"targets": base})
    client.put(f"/budget/profiles/{profile_id}/months/2026-08/targets", json={"targets": base})
    client.put(f"/budget/profiles/{profile_id}/months/2026-06/targets", json={"targets": base})

    removed = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/targets/remove-categories",
        json={
            "category_ids": [cat_ids[2]],
            "apply_to_current": True,
            "apply_to_following_months": True,
        },
    )
    assert removed.status_code == 200

    june = client.get(f"/budget/profiles/{profile_id}/months/2026-06?view=targets").json()
    july = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=targets").json()
    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08?view=targets").json()
    assert cat_ids[2] in {c["category_id"] for c in june["categories"]}
    assert cat_ids[2] not in {c["category_id"] for c in july["categories"]}
    assert cat_ids[2] not in {c["category_id"] for c in august["categories"]}


def test_remove_from_month_blocked_when_category_has_expense(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    cat_ids = [c["category_id"] for c in snapshot["categories"]]
    base = [
        {"category_id": cat_ids[0], "percent": 50},
        {"category_id": cat_ids[1], "percent": 50},
    ]
    client.put(f"/budget/profiles/{profile_id}/months/2026-07/targets", json={"targets": base})
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/transactions",
        json={
            "transaction_type": "expense",
            "event_date": "2026-07-15",
            "description": "Energia",
            "amount_brl": 200,
            "category_id": cat_ids[0],
        },
    )
    blocked = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/targets/remove-categories",
        json={
            "category_ids": [cat_ids[0]],
            "apply_to_current": True,
            "apply_to_following_months": False,
        },
    )
    assert blocked.status_code == 409
    july = client.get(f"/budget/profiles/{profile_id}/months/2026-07?view=targets").json()
    assert cat_ids[0] in {c["category_id"] for c in july["categories"]}


def test_remove_from_month_blocked_when_category_has_recurring(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-07").json()
    cat_ids = [c["category_id"] for c in snapshot["categories"]]
    base = [
        {"category_id": cat_ids[0], "percent": 50},
        {"category_id": cat_ids[1], "percent": 50},
    ]
    client.put(f"/budget/profiles/{profile_id}/months/2026-07/targets", json={"targets": base})
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Assinatura",
            "event_date": "2026-07-05",
            "amount_brl": 40,
            "category_id": cat_ids[0],
            "recurring": True,
            "indefinite": True,
        },
    )
    blocked = client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/targets/remove-categories",
        json={
            "category_ids": [cat_ids[0]],
            "apply_to_current": True,
            "apply_to_following_months": False,
        },
    )
    assert blocked.status_code == 409


def test_rename_from_month_keeps_previous_months(client: TestClient):
    profile_id = _create_profile(client)
    snapshot = client.get(f"/budget/profiles/{profile_id}/months/2026-06").json()
    cat_ids = [c["category_id"] for c in snapshot["categories"]]
    category_id = cat_ids[0]

    base_targets = [
        {"category_id": cat_ids[0], "percent": 50},
        {"category_id": cat_ids[1], "percent": 50},
    ]
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-06/targets",
        json={"targets": base_targets},
    )
    client.put(
        f"/budget/profiles/{profile_id}/months/2026-08/targets",
        json={"targets": base_targets},
    )

    renamed = client.patch(
        f"/budget/profiles/{profile_id}/categories/{category_id}",
        json={"name": "Renomeado", "scope": "from_month", "year_month": "2026-08"},
    )
    assert renamed.status_code == 200

    june = client.get(f"/budget/profiles/{profile_id}/months/2026-06?view=targets").json()
    august = client.get(f"/budget/profiles/{profile_id}/months/2026-08?view=targets").json()
    june_name = {c["category_id"]: c["category_name"] for c in june["categories"]}[category_id]
    august_name = {c["category_id"]: c["category_name"] for c in august["categories"]}[category_id]
    assert june_name != "Renomeado"
    assert august_name == "Renomeado"


def test_categories_usage_lists_counts_and_can_delete(client: TestClient):
    profile_id = _create_profile(client)
    cat_ids = _category_ids(client, profile_id)
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/transactions",
        json={
            "transaction_type": "expense",
            "event_date": "2026-07-15",
            "description": "Energia",
            "amount_brl": 200,
            "category_id": cat_ids[0],
        },
    )
    usage = client.get(f"/budget/profiles/{profile_id}/categories/usage").json()
    by_id = {row["id"]: row for row in usage}
    assert by_id[cat_ids[0]]["transaction_count"] == 1
    assert by_id[cat_ids[0]]["can_delete"] is False
    assert by_id[cat_ids[1]]["transaction_count"] == 0
    assert by_id[cat_ids[1]]["can_delete"] is True


def test_delete_category_expenses_clears_and_allows_delete(client: TestClient):
    profile_id = _create_profile(client)
    created = client.post(
        f"/budget/profiles/{profile_id}/categories",
        json={"name": "Descartável Histórico"},
    ).json()
    category_id = created["id"]
    client.post(
        f"/budget/profiles/{profile_id}/months/2026-07/expenses",
        json={
            "description": "Assinatura",
            "event_date": "2026-07-05",
            "amount_brl": 40,
            "category_id": category_id,
            "recurring": True,
            "indefinite": True,
        },
    )
    detail = client.get(f"/budget/profiles/{profile_id}/categories/{category_id}/usage").json()
    assert detail["can_delete"] is False
    assert detail["transaction_count"] >= 1
    assert detail["recurring_count"] == 1

    cleared = client.delete(f"/budget/profiles/{profile_id}/categories/{category_id}/expenses")
    assert cleared.status_code == 200
    body = cleared.json()
    assert body["transaction_count"] == 0
    assert body["recurring_count"] == 0
    assert body["can_delete"] is True

    deleted = client.delete(f"/budget/profiles/{profile_id}/categories/{category_id}")
    assert deleted.status_code == 204
    assert category_id not in _category_ids(client, profile_id)
