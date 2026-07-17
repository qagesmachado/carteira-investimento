from fastapi.testclient import TestClient

_PROFILE_SLUGS = {
    "stock_br": "stock-br",
    "fii_br": "fii-br",
    "etf_intl": "etf-intl",
    "crypto": "crypto",
}


def set_methodology(
    client: TestClient,
    portfolio_id: int,
    methodology: str,
    *profiles: str,
) -> None:
    for profile in profiles or _PROFILE_SLUGS.keys():
        slug = _PROFILE_SLUGS[profile]
        response = client.put(
            f"/analysis/profiles/{slug}/methodology",
            json={"portfolio_id": portfolio_id, "methodology": methodology},
        )
        assert response.status_code == 200, response.text


def set_methodology_auvp(client: TestClient, portfolio_id: int, *profiles: str) -> None:
    set_methodology(client, portfolio_id, "auvp", *profiles)


def create_portfolio(client: TestClient, name: str) -> int:
    response = client.post("/portfolios", json={"name": name})
    assert response.status_code == 201
    return response.json()["id"]


def create_portfolio_auvp(client: TestClient, name: str) -> int:
    portfolio_id = create_portfolio(client, name)
    set_methodology_auvp(client, portfolio_id, "stock_br", "fii_br")
    return portfolio_id
