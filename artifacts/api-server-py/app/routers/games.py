"""Port of artifacts/api-server/src/routes/games.ts — same endpoints, same
query params (camelCase, to match the existing OpenAPI contract / generated
frontend client unchanged), same response shape.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query

from app.logger import log_error
from app.models.game import Game
from app.models.user import User

router = APIRouter()

CATEGORY_LABELS = {
    "matematica": {"label": "Matematică", "emoji": "🔢"},
    "litere": {"label": "Litere & Alfabet", "emoji": "📚"},
    "culori": {"label": "Culori & Forme", "emoji": "🎨"},
    "muzica": {"label": "Muzică & Ritm", "emoji": "🎵"},
    "natura": {"label": "Natură & Animale", "emoji": "🌿"},
    "logica": {"label": "Logică & Puzzle", "emoji": "🧩"},
    "memorie": {"label": "Memorie & Concentrare", "emoji": "🧠"},
    "creativitate": {"label": "Creativitate", "emoji": "✏️"},
    "labirint":     {"label": "Labirint",    "emoji": "🌀"},
    "cuvinte":      {"label": "Caută Cuvinte", "emoji": "🔍"},
}


def serialize_game(g: Game) -> dict:
    # Wire format calls this field `isNew`; stored as `is_new_game` /
    # Mongo `isNewGame` — see app/models/game.py for why.
    return {
        "id": g.numeric_id,
        "title": g.title,
        "description": g.description,
        "category": g.category,
        "ageMin": g.age_min,
        "ageMax": g.age_max,
        "imageUrl": g.image_url,
        "gameUrl": g.game_url,
        "isNew": g.is_new_game,
        "isFeatured": g.is_featured,
        "requiresSubscription": g.requires_subscription,
        "createdAt": g.created_at.isoformat(),
    }


@router.get("/games")
async def list_games(
    category: str | None = None,
    age_min: int | None = Query(None, alias="ageMin"),
    age_max: int | None = Query(None, alias="ageMax"),
    featured: str | None = None,
):
    try:
        conditions = []
        if category:
            conditions.append(Game.category == category)
        if featured == "true":
            conditions.append(Game.is_featured == True)  # noqa: E712
        # Mirrors the original query: a game matches when its own
        # [ageMin, ageMax] range overlaps the requested [ageMin, ageMax].
        if age_min is not None:
            conditions.append(Game.age_max >= age_min)
        if age_max is not None:
            conditions.append(Game.age_min <= age_max)

        query = Game.find(*conditions) if conditions else Game.find_all()
        games = await query.sort(Game.created_at).to_list()
        return [serialize_game(g) for g in games]
    except Exception as err:  # noqa: BLE001
        log_error("Failed to list games", err=str(err))
        raise HTTPException(status_code=500, detail="Failed to list games")


@router.get("/games/featured")
async def list_featured_games():
    try:
        games = await Game.find(Game.is_featured == True).sort(Game.created_at).to_list()  # noqa: E712
        return [serialize_game(g) for g in games]
    except Exception as err:  # noqa: BLE001
        log_error("Failed to list featured games", err=str(err))
        raise HTTPException(status_code=500, detail="Failed to list featured games")


@router.get("/games/categories")
async def list_categories():
    try:
        raw = Game.get_pymongo_collection()
        rows = await raw.aggregate(
            [
                {"$group": {"_id": "$category", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
            ]
        ).to_list(length=None)

        return [
            {
                "name": row["_id"],
                "label": CATEGORY_LABELS.get(row["_id"], {}).get("label", row["_id"]),
                "count": row["count"],
                "emoji": CATEGORY_LABELS.get(row["_id"], {}).get("emoji", "🎮"),
            }
            for row in rows
        ]
    except Exception as err:  # noqa: BLE001
        log_error("Failed to list categories", err=str(err))
        raise HTTPException(status_code=500, detail="Failed to list categories")


@router.get("/games/new")
async def list_new_games():
    try:
        games = await Game.find(Game.is_new_game == True).sort(Game.created_at).to_list()  # noqa: E712
        return [serialize_game(g) for g in games]
    except Exception as err:  # noqa: BLE001
        log_error("Failed to list new games", err=str(err))
        raise HTTPException(status_code=500, detail="Failed to list new games")


@router.get("/games/{game_id}")
async def get_game(game_id: str):
    try:
        try:
            numeric_id = int(game_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Game not found")

        game = await Game.find_one(Game.numeric_id == numeric_id)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        return serialize_game(game)
    except HTTPException:
        raise
    except Exception as err:  # noqa: BLE001
        log_error("Failed to get game", err=str(err))
        raise HTTPException(status_code=500, detail="Failed to get game")


@router.get("/stats/overview")
async def stats_overview():
    try:
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

        total_games = await Game.find_all().count()
        total_users = await User.find_all().count()
        new_games_this_month = await Game.find(Game.created_at >= thirty_days_ago).count()
        raw = Game.get_pymongo_collection()
        distinct_categories = await raw.distinct("category")

        return {
            "totalGames": total_games,
            "totalCategories": len(distinct_categories),
            "totalUsers": total_users,
            "newGamesThisMonth": new_games_this_month,
        }
    except Exception as err:  # noqa: BLE001
        log_error("Failed to get stats", err=str(err))
        raise HTTPException(status_code=500, detail="Failed to get stats")
