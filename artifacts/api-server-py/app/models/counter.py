"""Atomic numeric-id sequence generator — direct Motor port of
lib/db/src/schema/counter.ts.

Deliberately bypasses Beanie here and talks to the `counters` collection
through the raw Motor client. Beanie's `Document.id` is hard-wired to
Mongo's `_id`, and the existing `counters` collection (created by the Node
backend) uses a plain *string* `_id` ("games", "users", ...) rather than an
ObjectId — fighting Beanie's id-typing assumptions for this one tiny
collection isn't worth it when three lines of Motor do the job.
"""

from pymongo import ReturnDocument

from app.db import get_database


async def next_sequence(name: str) -> int:
    """Atomically allocates the next integer in a named sequence (e.g.
    "games", "users"). Mirrors the Node backend's `nextSequence()` — same
    collection name, same document shape — so a Mongo Atlas cluster shared
    between both backends (during a transition) stays consistent.
    """
    counters = get_database()["counters"]
    doc = await counters.find_one_and_update(
        {"_id": name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return doc["seq"]
