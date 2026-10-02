import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["ADMIN_EMAIL"] = "admin@test.dev"
os.environ["ADMIN_PASSWORD"] = "AdminPass123!"
os.environ["STORAGE_BACKEND"] = "local"
os.environ["LOCAL_UPLOAD_DIR"] = "./test_uploads"

import pytest
from fastapi.testclient import TestClient
from app.db.session import Base, engine
from app.main import app
from app.seed import run as seed
from app.core import ratelimit


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    ratelimit._hits.clear()
    seed()
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_client():
    c = TestClient(app)
    r = c.post("/api/auth/login", json={"email": "admin@test.dev", "password": "AdminPass123!"})
    assert r.status_code == 200
    return c


ORDER = dict(client_name="Jane Doe", client_email="jane@example.com", service_slug="full-stack-web-development",
             project_title="Booking platform", requirements="I need a booking platform with payments and an admin dashboard.")
