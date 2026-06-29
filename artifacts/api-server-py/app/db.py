"""MongoDB connection, via Motor (async driver) + Beanie (ODM).

Mirrors lib/db/src/index.ts from the Node backend: one shared connection,
opened once at startup, safe to import from anywhere.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConfigurationError, OperationFailure

from app.config import DB_NAME, MONGODB_URI

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

    # motor 3.7.x doesn't expose PyMongo's append_metadata on AsyncIOMotorClient.
    # Beanie 2.1.0 checks callable(db.client.append_metadata) which raises TypeError
    # instead of AttributeError, crashing startup. Patch the class once before
    # creating the client so the attribute exists and the check is a safe no-op.
    if not hasattr(AsyncIOMotorClient, "append_metadata"):
        AsyncIOMotorClient.append_metadata = lambda self, driver_info: None  # type: ignore[attr-defined]

    _client = AsyncIOMotorClient(MONGODB_URI)
    # Use the database name embedded in the URI when present (e.g.
    # ".../corcodusa?..."); fall back to DB_NAME env var (default "corcodusa")
    # when the Render MONGODB_URI is a bare connection string without a /dbname
    # segment — that's what caused the ConfigurationError on Render.
    try:
        _db = _client.get_default_database()
    except ConfigurationError:
        _db = _client[DB_NAME]

    try:
        await init_beanie(database=_db, document_models=[Game, User])
    except OperationFailure as exc:
        # Atlas M0 / restricted users deny createIndex (code 8000).
        # Indexes already exist from first deploy — safe to skip re-creation.
        if exc.code == 8000 or "createIndex" in str(exc):
            from app.logger import log_warn
            log_warn(
                "Atlas denied createIndex — starting without index sync "
                "(indexes must already exist in the cluster). "
                "Fix: grant 'readWrite' role on the corcodusa database in "
                "Atlas → Database Access.",
                code=exc.code,
            )
            # beanie 2.1.0 has no skip_index_creation param, so patch the
            # Initializer class to skip index creation for this one call.
            from beanie.odm.utils.init import Initializer

            async def _noop_init_indexes(self, cls, allow_index_dropping=False):
                pass

            old_init_indexes = Initializer.init_indexes
            Initializer.init_indexes = _noop_init_indexes  # type: ignore[method-assign]
            try:
                await init_beanie(database=_db, document_models=[Game, User])
            finally:
                Initializer.init_indexes = old_init_indexes  # type: ignore[method-assign]
        else:
            raise
    return _db


async def close_db() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None
