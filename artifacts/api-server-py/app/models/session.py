"""Sesiuni de autentificare — colecția `sessions`.

Cookie-ul din browser conține un token aleatoriu; în MongoDB se păstrează
doar SHA-256-ul lui, deci o citire a bazei nu dă token-uri utilizabile.
Documentele expiră automat (TTL index pe `expiresAt`).
"""

from datetime import datetime, timezone

from beanie import Document
from pydantic import ConfigDict, Field
from pymongo import IndexModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Session(Document):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(alias="userId")
    token_hash: str = Field(alias="tokenHash")
    expires_at: datetime = Field(alias="expiresAt")
    created_at: datetime = Field(default_factory=_utcnow, alias="createdAt")

    class Settings:
        name = "sessions"
        indexes = [
            IndexModel("tokenHash", unique=True),
            IndexModel("expiresAt", expireAfterSeconds=0),
        ]
