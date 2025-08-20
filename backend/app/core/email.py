from __future__ import annotations

from contextlib import suppress
from pathlib import Path

import httpx
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings

TEMPLATES_DIR = Path(__file__).resolve().parents[1] / "templates"

env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)


def send_confirmation_email(email: str, name: str) -> None:
    """Send a confirmation email using Postmark.

    If Postmark credentials are not configured, the function exits silently.
    """

    if not settings.postmark_api_token or not settings.postmark_from_email:
        return

    template = env.get_template("confirmation_email.html")
    html_body = template.render(name=name)

    headers = {"X-Postmark-Server-Token": settings.postmark_api_token}
    payload = {
        "From": settings.postmark_from_email,
        "To": email,
        "Subject": "Thanks for joining the Vocatio waitlist!",
        "HtmlBody": html_body,
    }

    with suppress(httpx.HTTPError):
        httpx.post(
            "https://api.postmarkapp.com/email",
            json=payload,
            headers=headers,
            timeout=10.0,
        )
