"""Autentificare proprie (email + parolă) — înlocuiește Clerk.

- Parole: scrypt din biblioteca standard (hashlib), cu salt aleatoriu.
  Nu se stochează niciodată parola în clar.
- Sesiune: un token aleatoriu trimis în cookie `httpOnly`. În MongoDB
  (colecția `sessions`) se păstrează doar SHA-256 al tokenului.
- Cookie-ul e `SameSite=Lax`: frontend-ul (games.corcodusa.ro) și API-ul
  (games-api.corcodusa.ro) sunt pe același site, deci browserul îl trimite.
"""

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from beanie import PydanticObjectId
from fastapi import HTTPException, Request, Response, status

from app.config import SESSION_DAYS
from app.models.session import Session
from app.models.user import User

SESSION_COOKIE = "cs"

# Parametri scrypt (~16 MB RAM, sub limita implicită de 32 MB a hashlib).
_SCRYPT_N, _SCRYPT_R, _SCRYPT_P = 2**14, 8, 1
_KEY_LEN = 64


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"), salt=salt, n=_SCRYPT_N, r=_SCRYPT_R, p=_SCRYPT_P, dklen=_KEY_LEN
    )
    return f"scrypt${_SCRYPT_N}${_SCRYPT_R}${_SCRYPT_P}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str | None) -> bool:
    if not stored:
        return False
    try:
        scheme, n, r, p, salt_hex, digest_hex = stored.split("$")
        if scheme != "scrypt":
            return False
        digest = hashlib.scrypt(
            password.encode("utf-8"),
            salt=bytes.fromhex(salt_hex),
            n=int(n),
            r=int(r),
            p=int(p),
            dklen=len(bytes.fromhex(digest_hex)),
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(digest, bytes.fromhex(digest_hex))


def hash_token(token: str) -> str:
    """Hash pentru tokenuri (sesiune și resetare parolă). Tokenurile au deja
    256 de biți de entropie, deci SHA-256 simplu e suficient."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def new_token() -> str:
    return secrets.token_urlsafe(32)


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_DAYS * 24 * 3600,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )


async def create_session(response: Response, user: User) -> None:
    token = new_token()
    await Session(
        user_id=str(user.id),
        token_hash=hash_token(token),
        expires_at=_utcnow() + timedelta(days=SESSION_DAYS),
    ).insert()
    set_session_cookie(response, token)


async def end_session(request: Request, response: Response) -> None:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        await Session.find(Session.token_hash == hash_token(token)).delete()
    response.delete_cookie(SESSION_COOKIE, path="/", secure=True, samesite="lax")


async def require_user(request: Request) -> User:
    """Dependență FastAPI: returnează utilizatorul logat sau 401."""
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nu ești autentificat.")

    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise unauthorized

    session = await Session.find_one(Session.token_hash == hash_token(token))
    if not session or _aware(session.expires_at) <= _utcnow():
        raise unauthorized

    try:
        user = await User.get(PydanticObjectId(session.user_id))
    except Exception:  # noqa: BLE001 — id invalid sau utilizator șters
        user = None
    if not user:
        raise unauthorized
    return user
