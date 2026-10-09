"""Autentificare cu email + parolă: înregistrare, login, logout, resetare parolă.

Răspunsurile de eroare sunt în română, pentru utilizatorul final.
"""

import re
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Body, HTTPException, Request, Response

from app.auth import create_session, end_session, hash_password, hash_token, new_token, verify_password
from app.config import APP_BASE_URL, RESET_TOKEN_MINUTES
from app.logger import log_error, log_info
from app.mailer import send_email
from app.models.session import Session
from app.models.user import User
from app.routers.users import serialize_user

router = APIRouter()

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MIN_PASSWORD = 8
MAX_PASSWORD = 128
INVALID_LOGIN = "Email sau parolă incorectă."


def _clean_email(raw: object) -> str:
    email = str(raw or "").strip().lower()
    if not email or len(email) > 320 or not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Adresa de email nu este validă.")
    return email


def _check_password(raw: object) -> str:
    password = str(raw or "")
    if len(password) < MIN_PASSWORD:
        raise HTTPException(status_code=400, detail=f"Parola trebuie să aibă minimum {MIN_PASSWORD} caractere.")
    if len(password) > MAX_PASSWORD:
        raise HTTPException(status_code=400, detail="Parola este prea lungă.")
    return password


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


@router.post("/auth/register")
async def register(response: Response, body: dict = Body(...)):
    email = _clean_email(body.get("email"))
    password = _check_password(body.get("password"))
    if body.get("confirmPassword") is not None and body.get("confirmPassword") != body.get("password"):
        raise HTTPException(status_code=400, detail="Parolele nu coincid.")
    name = str(body.get("name") or "").strip()[:100] or None

    existing = await User.find_one(User.email == email)
    if existing:
        # Nu dezvăluim contul altcuiva: el își poate seta parola prin resetare.
        raise HTTPException(
            status_code=409,
            detail="Există deja un cont cu acest email. Intră în cont sau folosește „Ai uitat parola?”.",
        )

    now = datetime.now(timezone.utc)
    user = await User.create_new(
        email=email,
        password_hash=hash_password(password),
        first_name=name,
        subscription_tier="free",
        trial_started_at=now,
    )
    await create_session(response, user)
    log_info("User registered", user_id=str(user.id))
    return serialize_user(user)


@router.post("/auth/login")
async def login(response: Response, body: dict = Body(...)):
    email = str(body.get("email") or "").strip().lower()
    password = str(body.get("password") or "")

    user = await User.find_one(User.email == email) if email else None
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail=INVALID_LOGIN)

    await create_session(response, user)
    return serialize_user(user)


@router.post("/auth/logout")
async def logout(request: Request, response: Response):
    await end_session(request, response)
    return {"success": True}


@router.post("/auth/forgot-password")
async def forgot_password(body: dict = Body(...)):
    email = _clean_email(body.get("email"))

    user = await User.find_one(User.email == email)
    if user:
        token = new_token()
        await user.touch_and_save(
            reset_token_hash=hash_token(token),
            reset_expires_at=datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_MINUTES),
        )
        link = f"{APP_BASE_URL}/resetare-parola-noua?token={token}"
        html = (
            "<p>Ai cerut resetarea parolei pentru contul Corcodușa.</p>"
            f'<p><a href="{link}">Alege o parolă nouă</a></p>'
            f"<p>Linkul expiră în {RESET_TOKEN_MINUTES} de minute. Dacă nu tu ai cerut asta, ignoră acest email.</p>"
        )
        if not await send_email(email, "Resetare parolă — Corcodușa", html):
            log_error("Password reset email failed", user_id=str(user.id))

    # Același răspuns indiferent dacă emailul există — nu dezvăluim conturile.
    return {"success": True}


@router.post("/auth/reset-password")
async def reset_password(response: Response, body: dict = Body(...)):
    token = str(body.get("token") or "")
    password = _check_password(body.get("password"))
    if body.get("confirmPassword") is not None and body.get("confirmPassword") != body.get("password"):
        raise HTTPException(status_code=400, detail="Parolele nu coincid.")

    invalid = HTTPException(status_code=400, detail="Linkul de resetare nu este valid sau a expirat.")
    if not token:
        raise invalid

    user = await User.find_one(User.reset_token_hash == hash_token(token))
    if not user or not user.reset_expires_at or _aware(user.reset_expires_at) <= datetime.now(timezone.utc):
        raise invalid

    await user.touch_and_save(
        password_hash=hash_password(password),
        reset_token_hash=None,
        reset_expires_at=None,
    )
    # Parola s-a schimbat: închidem toate sesiunile vechi, apoi logăm utilizatorul.
    await Session.find(Session.user_id == str(user.id)).delete()
    await create_session(response, user)
    log_info("Password reset", user_id=str(user.id))
    return serialize_user(user)
