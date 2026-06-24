"""Beanie document for the `games` collection — field-for-field compatible
with lib/db/src/schema/games.ts (same collection name, same camelCase keys
in Mongo), so existing seeded data and the Node backend's data stay
readable/writable by this Python backend without a migration.

Pydantic aliases do the camelCase<->snake_case translation: the Python
attribute is snake_case (idiomatic), the `alias=` is the literal Mongo field
name (matches the Node side byte-for-byte).
"""

from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import ConfigDict, Field

from app.models.counter import next_sequence


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Game(Document):
    model_config = ConfigDict(populate_by_name=True)

    # Numeric public id (NOT Mongo's `_id`/ObjectId — Beanie's `Document.id`
    # already owns that slot). Stored as plain `id` in Mongo, same as the
    # Node side's `id: { type: Number, unique: true, index: true }`.
    numeric_id: Optional[int] = Field(default=None, alias="id")

    title: str
    description: str
    category: str
    age_min: int = Field(default=3, alias="ageMin")
    age_max: int = Field(default=8, alias="ageMax")
    image_url: str = Field(alias="imageUrl")
    game_url: Optional[str] = Field(default=None, alias="gameUrl")

    # Wire/API name is `isNew` (see serialize_game in routers/games.py) but
    # stored as `isNewGame` — same rationale as the Node side: avoid
    # colliding with any ODM-reserved name (Beanie doesn't reserve `isNew`
    # the way Mongoose does, but keeping the stored field name identical
    # across both backends matters more than re-litigating it here).
    is_new_game: bool = Field(default=False, alias="isNewGame")
    is_featured: bool = Field(default=False, alias="isFeatured")
    requires_subscription: bool = Field(default=True, alias="requiresSubscription")

    created_at: datetime = Field(default_factory=_utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=_utcnow, alias="updatedAt")

    class Settings:
        name = "games"

    @classmethod
    async def create_new(cls, **fields) -> "Game":
        """Insert a new game, assigning the next numeric id atomically.
        Equivalent to the Node side's `GameModel.create(...)` + its
        `pre("save")` id-assignment hook.
        """
        now = _utcnow()
        game = cls(numeric_id=await next_sequence("games"), created_at=now, updated_at=now, **fields)
        await game.insert()
        return game
