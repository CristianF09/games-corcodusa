"""Word lists and maze metadata for the Labirint and Caută Cuvinte games.

Endpoints:
  GET /api/maze/categories          → all available categories
  GET /api/maze/words?category&level → word list for a given category + level

The games themselves are fully client-side (React) — these endpoints let the
frontend fetch fresh / backend-authoritative word lists and make it easy to
extend the vocabulary from the DB in the future without a frontend redeploy.
"""

from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

# ---------------------------------------------------------------------------
# Word data
# ---------------------------------------------------------------------------

WORD_DATA: dict[str, dict] = {
    "animale": {
        "label": "Animale", "emoji": "🐾",
        "easy":   ["urs", "lup", "cal", "rață", "vacă"],
        "medium": ["urs", "lup", "cal", "oaie", "rată", "câine", "capră"],
        "hard":   ["câine", "pisică", "vulpe", "iepure", "capră", "urs", "rață", "oaie", "cal"],
    },
    "fructe": {
        "label": "Fructe", "emoji": "🍎",
        "easy":   ["măr", "par", "prună", "kiwi", "caisă"],
        "medium": ["măr", "par", "prună", "kiwi", "caisă", "mango", "banană"],
        "hard":   ["măr", "prună", "kiwi", "caisă", "mango", "banană", "lămâie", "ananas", "pepene"],
    },
    "legume": {
        "label": "Legume", "emoji": "🥕",
        "easy":   ["morcov", "roșie", "ardei", "ceapă", "varză"],
        "medium": ["morcov", "roșie", "ardei", "ceapă", "varză", "salată", "mazăre"],
        "hard":   ["morcov", "roșie", "ardei", "ceapă", "varză", "salată", "mazăre", "fasole", "spanac"],
    },
    "obiecte": {
        "label": "Obiecte", "emoji": "🧸",
        "easy":   ["masă", "scaun", "carte", "pernă", "ceas"],
        "medium": ["masă", "scaun", "carte", "pernă", "ceas", "lampă", "creion"],
        "hard":   ["masă", "scaun", "carte", "pernă", "ceas", "lampă", "creion", "oglindă", "geantă"],
    },
    "spatiu": {
        "label": "Spațiu", "emoji": "🚀",
        "easy":   ["soare", "lună", "stea", "meteor", "cosmos"],
        "medium": ["soare", "lună", "stea", "meteor", "cosmos", "rachetă", "planetă"],
        "hard":   ["soare", "lună", "stea", "meteor", "cosmos", "rachetă", "planetă", "galaxie", "orbită"],
    },
}

VALID_LEVELS = {"easy", "medium", "hard"}


@router.get("/maze/categories")
async def list_maze_categories():
    """Return all available word categories."""
    return [
        {"id": k, "label": v["label"], "emoji": v["emoji"]}
        for k, v in WORD_DATA.items()
    ]


@router.get("/maze/words")
async def get_maze_words(
    category: str = Query("animale", description="Category id"),
    level: str = Query("easy", description="Difficulty: easy | medium | hard"),
):
    """Return the word list for a given category and difficulty level."""
    cat = WORD_DATA.get(category)
    if not cat:
        raise HTTPException(
            status_code=404,
            detail=f"Category '{category}' not found. Available: {list(WORD_DATA.keys())}",
        )
    if level not in VALID_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Level '{level}' invalid. Must be one of: {sorted(VALID_LEVELS)}",
        )
    return {
        "category": category,
        "label": cat["label"],
        "emoji": cat["emoji"],
        "level": level,
        "words": cat[level],
    }
