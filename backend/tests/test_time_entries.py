import datetime
import uuid


def _entry_payload(category_id: str, **overrides):
    base = {
        "title": "Reunião",
        "category_id": category_id,
        "date": str(datetime.date.today()),
        "start_time": "09:00",
        "end_time": "10:00",
    }
    base.update(overrides)
    return base


def test_create_entry_valid(client, auth_headers, category):
    resp = client.post("/api/v1/time-entries", json=_entry_payload(category["id"]), headers=auth_headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["duration_minutes"] == 60
    assert body["title"] == "Reunião"


def test_duration_calculated_by_backend(client, auth_headers, category):
    resp = client.post("/api/v1/time-entries", json=_entry_payload(category["id"], start_time="08:00", end_time="09:30"), headers=auth_headers)
    assert resp.status_code == 201
    assert resp.json()["duration_minutes"] == 90


def test_end_time_before_start(client, auth_headers, category):
    resp = client.post("/api/v1/time-entries", json=_entry_payload(category["id"], start_time="10:00", end_time="09:00"), headers=auth_headers)
    assert resp.status_code == 422


def test_future_date_rejected(client, auth_headers, category):
    future = str(datetime.date.today() + datetime.timedelta(days=1))
    resp = client.post("/api/v1/time-entries", json=_entry_payload(category["id"], date=future), headers=auth_headers)
    assert resp.status_code == 422


def test_category_from_other_user(client, category):
    other_data = {"name": "Other", "email": "other@example.com", "password": "outra123"}
    client.post("/api/v1/auth/register", json=other_data)
    login = client.post("/api/v1/auth/login", json={"email": other_data["email"], "password": other_data["password"]})
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    resp = client.post("/api/v1/time-entries", json=_entry_payload(category["id"]), headers=other_headers)
    assert resp.status_code == 400


def test_user_a_cannot_see_user_b_entry(client, auth_headers, category):
    entry_resp = client.post("/api/v1/time-entries", json=_entry_payload(category["id"]), headers=auth_headers)
    entry_id = entry_resp.json()["id"]

    other_data = {"name": "B", "email": "b@example.com", "password": "senha123"}
    client.post("/api/v1/auth/register", json=other_data)
    login = client.post("/api/v1/auth/login", json={"email": other_data["email"], "password": other_data["password"]})
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    resp = client.get(f"/api/v1/time-entries/{entry_id}", headers=other_headers)
    assert resp.status_code == 404


def test_user_a_cannot_delete_user_b_entry(client, auth_headers, category):
    entry_resp = client.post("/api/v1/time-entries", json=_entry_payload(category["id"]), headers=auth_headers)
    entry_id = entry_resp.json()["id"]

    other_data = {"name": "C", "email": "c@example.com", "password": "senha123"}
    client.post("/api/v1/auth/register", json=other_data)
    login = client.post("/api/v1/auth/login", json={"email": other_data["email"], "password": other_data["password"]})
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    resp = client.delete(f"/api/v1/time-entries/{entry_id}", headers=other_headers)
    assert resp.status_code == 404


def test_list_entries_paginated(client, auth_headers, category):
    for i in range(5):
        client.post("/api/v1/time-entries", json=_entry_payload(category["id"], title=f"Tarefa {i}", start_time="08:00", end_time="09:00"), headers=auth_headers)

    resp = client.get("/api/v1/time-entries?page=1&page_size=3", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 5
    assert len(body["items"]) == 3
