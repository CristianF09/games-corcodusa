"""Contact form backend — POST /api/contact, called from the footer's
contact popup (artifacts/corcodusa/src/components/contact-dialog.tsx).

Sends mail via Resend's HTTP API directly (no SDK dependency needed —
httpx is already in requirements.txt). Not wired into the generated
api-client-react client; the frontend calls this with a plain fetch().
"""

import re

import httpx
from fastapi import APIRouter, Body, HTTPException

from app.config import CONTACT_EMAIL_FROM, CONTACT_EMAIL_TO, RESEND_API_KEY
from app.logger import log_error, log_info

router = APIRouter()

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
RESEND_URL = "https://api.resend.com/emails"


@router.post("/contact")
async def submit_contact(body: dict = Body(...)):
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip()
    message = (body.get("message") or "").strip()

    if not name or len(name) > 200:
        raise HTTPException(status_code=400, detail="Numele este obligatoriu.")
    if not email or not EMAIL_RE.match(email) or len(email) > 320:
        raise HTTPException(status_code=400, detail="Adresa de email nu este validă.")
    if not message or len(message) < 5 or len(message) > 5000:
        raise HTTPException(status_code=400, detail="Mesajul trebuie să aibă între 5 și 5000 de caractere.")

    if not RESEND_API_KEY:
        log_error("Contact form submitted but RESEND_API_KEY is not configured", name=name, email=email)
        raise HTTPException(status_code=500, detail="Serviciul de email nu este configurat momentan.")

    safe_message = message.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")

    payload = {
        "from": CONTACT_EMAIL_FROM,
        "to": [CONTACT_EMAIL_TO],
        "reply_to": email,
        "subject": f"Mesaj nou de contact de la {name}",
        "html": (
            f"<p><strong>Nume:</strong> {name}</p>"
            f"<p><strong>Email:</strong> {email}</p>"
            f"<p><strong>Mesaj:</strong></p><p>{safe_message}</p>"
        ),
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                RESEND_URL,
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json=payload,
            )
        if response.status_code >= 400:
            log_error("Resend rejected contact email", status=response.status_code, body=response.text)
            raise HTTPException(status_code=502, detail="Nu am putut trimite mesajul. Încearcă din nou mai târziu.")
    except httpx.HTTPError as err:
        log_error("Contact email request failed", err=str(err))
        raise HTTPException(status_code=502, detail="Nu am putut trimite mesajul. Încearcă din nou mai târziu.")

    log_info("Contact form email sent", name=name, email=email)
    return {"success": True}
