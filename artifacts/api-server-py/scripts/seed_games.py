"""One-off seed script — direct port of scripts/src/seed-games.ts.

Run with:  python -m scripts.seed_games   (from artifacts/api-server-py/,
with MONGODB_URI set, e.g. via the .env file and python-dotenv which
app.config already loads).

Safe to re-run: games are matched by `title` and skipped if they already
exist.

NOTE: writes to the same `games` collection/field names as the Node seed
script, so it's interchangeable with it against the same MongoDB Atlas
cluster — running one after the other won't create duplicates.
"""

import asyncio

from app.db import close_db, connect_db
from app.models.game import Game

PLACEHOLDER_IMAGE = "https://placehold.co/600x400/FFD166/333?text="

GAMES = [
    {
        "title": "Numere Vesele",
        "description": "Învață să numeri de la 1 la 20 cu animale simpatice.",
        "category": "matematica",
        "age_min": 3,
        "age_max": 6,
        "image_url": f"{PLACEHOLDER_IMAGE}1-2-3",
        "is_new_game": True,
        "is_featured": True,
        "requires_subscription": False,
    },
    {
        "title": "Adunări Distractive",
        "description": "Exersează adunări simple printr-un joc de potrivire.",
        "category": "matematica",
        "age_min": 6,
        "age_max": 9,
        "image_url": f"{PLACEHOLDER_IMAGE}%2B",
        "is_featured": True,
    },
    {
        "title": "Alfabetul Animalelor",
        "description": "Asociază fiecare literă cu un animal și sunetul ei.",
        "category": "litere",
        "age_min": 3,
        "age_max": 7,
        "image_url": f"{PLACEHOLDER_IMAGE}ABC",
        "is_new_game": True,
        "is_featured": True,
        "requires_subscription": False,
    },
    {
        "title": "Primele Cuvinte",
        "description": "Formează cuvinte simple din litere colorate.",
        "category": "litere",
        "age_min": 5,
        "age_max": 8,
        "image_url": f"{PLACEHOLDER_IMAGE}Cuvinte",
    },
    {
        "title": "Curcubeul Culorilor",
        "description": "Învață culorile de bază printr-un puzzle interactiv.",
        "category": "culori",
        "age_min": 3,
        "age_max": 6,
        "image_url": f"{PLACEHOLDER_IMAGE}🎨",
        "is_featured": True,
        "requires_subscription": False,
    },
    {
        "title": "Forme și Contururi",
        "description": "Recunoaște și sortează forme geometrice de bază.",
        "category": "culori",
        "age_min": 4,
        "age_max": 7,
        "image_url": f"{PLACEHOLDER_IMAGE}%E2%97%8F%E2%96%B2",
    },
    {
        "title": "Ritmuri Vesele",
        "description": "Reproduce secvențe muzicale simple apăsând pe instrumente.",
        "category": "muzica",
        "age_min": 4,
        "age_max": 8,
        "image_url": f"{PLACEHOLDER_IMAGE}🎵",
        "is_new_game": True,
    },
    {
        "title": "Lumea Animalelor",
        "description": "Descoperă animale și habitatele lor naturale.",
        "category": "natura",
        "age_min": 3,
        "age_max": 7,
        "image_url": f"{PLACEHOLDER_IMAGE}🌿",
        "is_featured": True,
    },
    {
        "title": "Puzzle Logic",
        "description": "Rezolvă puzzle-uri simple de logică și asociere.",
        "category": "logica",
        "age_min": 5,
        "age_max": 9,
        "image_url": f"{PLACEHOLDER_IMAGE}🧩",
    },
    {
        "title": "Joc de Memorie",
        "description": "Găsește perechile de cărți identice — exersează memoria.",
        "category": "memorie",
        "age_min": 4,
        "age_max": 8,
        "image_url": f"{PLACEHOLDER_IMAGE}🧠",
        "is_new_game": True,
    },
    {
        "title": "Atelier de Desen",
        "description": "Desenează liber sau colorează șabloane gata făcute.",
        "category": "creativitate",
        "age_min": 3,
        "age_max": 9,
        "image_url": f"{PLACEHOLDER_IMAGE}✏️",
    },
]


async def main():
    await connect_db()

    created = 0
    skipped = 0

    for game in GAMES:
        existing = await Game.find_one(Game.title == game["title"])
        if existing:
            skipped += 1
            continue
        await Game.create_new(**game)
        created += 1

    print(f"Seed complete: {created} created, {skipped} already existed.")
    await close_db()


if __name__ == "__main__":
    asyncio.run(main())
