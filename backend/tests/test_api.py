from tests.conftest import ORDER
from fastapi.testclient import TestClient
from app.main import app


def login(email, pw):
    c = TestClient(app)
    assert c.post("/api/auth/login", json={"email": email, "password": pw}).status_code == 200
    return c


def test_services_and_projects_seeded(client):
    assert len(client.get("/api/services").json()) == 8
    assert client.get("/api/projects/devtrack").json()["title"] == "DevTrack"
    assert client.get("/api/projects/nope").status_code == 404


def test_register_login_logout(client):
    r = client.post("/api/auth/register", json={"email": "a@b.co", "full_name": "Al B", "password": "password123"})
    assert r.status_code == 201 and r.json()["role"] == "client"
    assert client.get("/api/auth/me").json()["email"] == "a@b.co"
    client.post("/api/auth/logout")
    assert client.get("/api/auth/me").status_code == 401
    assert client.post("/api/auth/login", json={"email": "a@b.co", "password": "wrong-pass"}).status_code == 401
    assert client.post("/api/auth/register", json={"email": "a@b.co", "full_name": "Al B", "password": "password123"}).status_code == 409


def test_order_creation_and_number(client):
    r = client.post("/api/orders", json=ORDER)
    assert r.status_code == 201
    body = r.json()
    assert body["order_number"].startswith("ORD-") and body["order_number"].endswith("-0001")
    assert body["status"] == "New"
    assert client.post("/api/orders", json=ORDER).json()["order_number"].endswith("-0002")


def test_order_validation(client):
    bad = {**ORDER, "requirements": "short"}
    assert client.post("/api/orders", json=bad).status_code == 422
    assert client.post("/api/orders", json={**ORDER, "service_slug": "nope"}).status_code == 422


def test_authorization_clients_cannot_see_others(client):
    a = TestClient(app)
    a.post("/api/auth/register", json={"email": "a@x.co", "full_name": "Alice A", "password": "password123"})
    oid = a.post("/api/orders", json={**ORDER, "client_email": "a@x.co"}).json()["id"]
    b = TestClient(app)
    b.post("/api/auth/register", json={"email": "b@x.co", "full_name": "Bob B", "password": "password123"})
    assert b.get(f"/api/orders/{oid}").status_code == 404
    assert b.get("/api/orders").json() == []
    assert a.get(f"/api/orders/{oid}").status_code == 200
    assert b.patch(f"/api/orders/{oid}", json={"status": "Completed"}).status_code == 403
    assert client.get("/api/admin/analytics").status_code == 401
    assert b.get("/api/admin/analytics").status_code == 403


def test_admin_status_update_and_analytics(admin_client, client):
    oid = client.post("/api/orders", json=ORDER).json()["id"]
    r = admin_client.patch(f"/api/orders/{oid}", json={"status": "In Progress", "priority": "High", "quoted_amount": 2000})
    assert r.status_code == 200 and r.json()["status"] == "In Progress"
    assert admin_client.patch(f"/api/orders/{oid}", json={"status": "Bogus"}).status_code == 422
    a = admin_client.get("/api/admin/analytics").json()
    assert a["total_orders"] == 1 and a["active_projects"] == 1 and a["revenue_estimate"] == 2000


def test_messages_and_updates(client, admin_client):
    c = TestClient(app)
    c.post("/api/auth/register", json={"email": "m@x.co", "full_name": "Mia M", "password": "password123"})
    oid = c.post("/api/orders", json={**ORDER, "client_email": "m@x.co"}).json()["id"]
    assert c.post(f"/api/orders/{oid}/messages", json={"body": "I uploaded the design."}).status_code == 201
    msgs = admin_client.get(f"/api/orders/{oid}/messages").json()
    assert msgs[0]["sender_role"] == "client"
    admin_client.post(f"/api/orders/{oid}/messages", json={"body": "Received."})
    assert c.get(f"/api/orders/{oid}/messages").json()[1]["sender_role"] == "admin"
    assert admin_client.get(f"/api/orders/{oid}/messages").json()[0]["is_read"] is True
    assert admin_client.post(f"/api/orders/{oid}/updates", json={"title": "Kickoff", "body": "Work started.", "progress": 10}).status_code == 201
    assert c.get(f"/api/orders/{oid}").json()["updates"][0]["title"] == "Kickoff"
    assert c.post(f"/api/orders/{oid}/updates", json={"title": "Hack", "body": "nope nope"}).status_code == 403


def test_file_upload_rules(client):
    created = client.post("/api/orders", json=ORDER).json()
    h = {"X-Upload-Token": created["upload_token"]}
    url = f"/api/orders/{created['id']}/files"
    ok = client.post(url, files={"file": ("brief.pdf", b"%PDF-1.4 data", "application/pdf")}, headers=h)
    assert ok.status_code == 201
    assert client.post(url, files={"file": ("evil.exe", b"MZ", "application/octet-stream")}, headers=h).status_code == 422
    assert client.post(url, files={"file": ("fake.pdf", b"not a pdf", "application/pdf")}, headers=h).status_code == 422
    assert client.post(url, files={"file": ("brief.pdf", b"%PDF-1.4", "application/pdf")}).status_code == 401


def test_contact_form(client):
    ok = {"name": "Sam S", "email": "s@x.co", "subject": "Hello there", "message": "I would like to talk about a project."}
    assert client.post("/api/contact", json=ok).status_code == 201
    assert client.post("/api/contact", json={**ok, "website": "spam.com"}).status_code == 422
