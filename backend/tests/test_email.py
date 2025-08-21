import os
import sys
from pathlib import Path
from typing import Any

import httpx

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["FRONTEND_URL"] = "http://testserver"

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.core.email import send_confirmation_email


def test_send_confirmation_email_no_token() -> None:
    """Ensure sending is a no-op without Postmark credentials."""
    assert send_confirmation_email("test@example.com", "Tester") is None


def test_send_confirmation_email_with_token(monkeypatch) -> None:
    """Send email via Postmark API when credentials are provided."""
    monkeypatch.setattr(settings, "postmark_api_token", "token")
    monkeypatch.setattr(settings, "postmark_from_email", "from@example.com")

    called: dict[str, Any] = {}

    def fake_post(url, json, headers, timeout):  # type: ignore[no-untyped-def]
        called["url"] = url
        called["json"] = json
        called["headers"] = headers
        return None

    monkeypatch.setattr(httpx, "post", fake_post)
    send_confirmation_email("user@example.com", "User")

    assert called["url"] == "https://api.postmarkapp.com/email"
    assert called["json"]["To"] == "user@example.com"
    assert called["headers"]["X-Postmark-Server-Token"] == "token"
