def test_create_category(client, auth_headers):
    resp = client.post("/api/v1/categories", json={"name": "Estudo", "color": "#10B981"}, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.json()["name"] == "Estudo"


def test_create_duplicate_category(client, auth_headers, category):
    resp = client.post("/api/v1/categories", json={"name": category["name"], "color": "#FF0000"}, headers=auth_headers)
    assert resp.status_code == 409


def test_list_categories(client, auth_headers, category):
    resp = client.get("/api/v1/categories", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_delete_category_no_entries(client, auth_headers, category):
    resp = client.delete(f"/api/v1/categories/{category['id']}", headers=auth_headers)
    assert resp.status_code == 204


def test_delete_category_with_entries(client, auth_headers, category):
    import datetime
    client.post("/api/v1/time-entries", json={
        "title": "Teste",
        "category_id": category["id"],
        "date": str(datetime.date.today()),
        "start_time": "09:00",
        "end_time": "10:00",
    }, headers=auth_headers)
    resp = client.delete(f"/api/v1/categories/{category['id']}", headers=auth_headers)
    assert resp.status_code == 409
    assert resp.json()["error"]["code"] == "CATEGORY_IN_USE"


def test_category_not_found(client, auth_headers):
    import uuid
    resp = client.get(f"/api/v1/categories/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404
