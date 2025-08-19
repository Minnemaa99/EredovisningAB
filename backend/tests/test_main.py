def test_create_company(client):
    """
    Test creating a new company and checking for duplicates.
    """
    # 1. Create a new company
    response = client.post(
        "/companies/",
        json={"orgnummer": "556677-8899", "name": "Testbolaget AB", "address_info": "Testgatan 1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Testbolaget AB"
    assert data["orgnummer"] == "556677-8899"
    assert "id" in data

    # 2. Try to create a company with the same orgnummer
    response_duplicate = client.post(
        "/companies/",
        json={"orgnummer": "556677-8899", "name": "Duplicate Test AB"},
    )
    assert response_duplicate.status_code == 400
    assert response_duplicate.json()["detail"] == "Company with this orgnummer already registered"

def test_read_companies_unauthenticated(client):
    """
    Test that reading companies requires authentication.
    """
    response = client.get("/companies/")
    # Our placeholder auth returns 401 if no token is provided
    assert response.status_code == 401

def test_read_companies_authenticated(client):
    """
    Test that reading companies succeeds with a valid (fake) token.
    """
    response = client.get(
        "/companies/",
        headers={"Authorization": "Bearer fake-jwt-token"}
    )
    assert response.status_code == 200
    # The response should be a list, even if it's empty
    assert isinstance(response.json(), list)
