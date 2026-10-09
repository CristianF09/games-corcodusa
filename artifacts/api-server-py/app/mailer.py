"""Trimitere email tranzacțional prin Resend (HTTP API, fără SDK).

Folosit pentru linkul de resetare a parolei. Returnează False la eșec, fără
să arunce excepție — apelantul decide ce răspunde utilizatorului.
"""

import httpx

from app.config import CONTACT_EMAIL_FROM, RESEND_API_KEY
from app.logger import log_error, log_info

RESEND_URL = "https://api.resend.com/emails"


async def send_email(to: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY:
        log_error("Email not sent: RESEND_API_KEY is not configured", subject=subject)
        return False
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                RESEND_URL,
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={"from": CONTACT_EMAIL_FROM, "to": [to], "subject": subject, "html": html},
            )
        if response.status_code >= 400:
            log_error("Resend rejected email", status=response.status_code, body=response.text[:300])
            return False
    except httpx.HTTPError as err:
        log_error("Email request failed", err=str(err))
        return False
    log_info("Email sent", subject=subject)
    return True
