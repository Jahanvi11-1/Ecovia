import pytest

from app.core import security
from app.schemas.auth import SignupRequest


def test_public_signup_cannot_request_admin_role():
    with pytest.raises(ValueError, match="Engineering User"):
        SignupRequest(
            login_id="admin123",
            email="admin@example.com",
            password="Password!1",
            role="Admin",
        )


def test_production_requires_secret_key(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        security.create_access_token({"sub": "1"})


def test_development_token_round_trip(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.delenv("SECRET_KEY", raising=False)
    token = security.create_access_token({"sub": "1", "role": "Engineering User"})
    assert security.decode_access_token(token)["sub"] == "1"
