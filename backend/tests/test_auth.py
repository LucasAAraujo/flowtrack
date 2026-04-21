def test_register_success(client):
    resp = client.post("/api/v1/auth/register", json={
        "name": "Alice", "email": "alice@example.com", "password": "senha123"
    })
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "alice@example.com"
    assert "password_hash" not in body
    assert "password" not in body


def test_register_duplicate_email(client, registered_user):
    resp = client.post("/api/v1/auth/register", json={
        "name": "Other", "email": registered_user["email"], "password": "outrasenha1"
    })
    assert resp.status_code == 409


def test_register_weak_password(client):
    resp = client.post("/api/v1/auth/register", json={
        "name": "Bob", "email": "bob@example.com", "password": "semnumero"
    })
    assert resp.status_code == 422


def test_login_success(client, registered_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": registered_user["email"], "password": registered_user["password"]
    })
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password(client, registered_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": registered_user["email"], "password": "errada999"
    })
    assert resp.status_code == 401
    assert resp.json()["error"]["message"] == "Credenciais inválidas"


def test_login_unknown_email(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "nao@existe.com", "password": "qualquer1"
    })
    assert resp.status_code == 401
    assert resp.json()["error"]["message"] == "Credenciais inválidas"


def test_access_without_token(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 403


def test_me(client, auth_headers, registered_user):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == registered_user["email"]


def test_refresh(client, registered_user):
    login_resp = client.post("/api/v1/auth/login", json={
        "email": registered_user["email"], "password": registered_user["password"]
    })
    refresh_token = login_resp.json()["refresh_token"]
    resp = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()
