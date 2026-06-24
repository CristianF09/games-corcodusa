"""MongoDB connection, via Motor (async driver) + Beanie (ODM).

Mirrors lib/db/src/index.ts from the Node backend: one shared connection,
opened once at startup, safe to import from anywhere.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import MONGODB_URI

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_database() -> AsyncIOMotorDatabase:
    """Returns the active database handle. Raises if `connect_db()` hasn't
    run yet — call that once at server startup before serving traffic."""
    if _db is None:
        raise RuntimeError("Database not connected. Did you forget to call connect_db()?")
    return _db


async def connect_db() -> AsyncIOMotorDatabase:
    """Opens the MongoDB connection and initializes Beanie document models.
    Safe to call more than once — later calls are no-ops if already connected.
    """
    global _client, _db

    if _db is not None:
        return _db

    from beanie import init_beanie

    from app.models.game import Game
    from app.models.user import User

    _client = AsyncIOMotorClient(MONGODB_URI)
    _db = _client.get_default_database()

    await init_beanie(database=_db, document_models=[Game, User])
    return _db


async def close_db() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None
