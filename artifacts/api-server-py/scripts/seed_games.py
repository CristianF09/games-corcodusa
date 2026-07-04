"""One-off seed script — keeps the `games` collection in sync with the 10
playable games in artifacts/corcodusa/src/games/index.ts.

IMPORTANT: `numeric_id` is assigned sequentially (1, 2, 3, ...) in insertion
order by Game.create_new() (see app/models/counter.py's next_sequence). The
frontend's GAME_COMPONENTS map (src/games/index.ts) keys components by that
same numeric id:

    1: GameNumarare   2: GameAdunare   3: GameAlfabet   4: GameDinozauri
    5: GameForme      6: GameAnimale   7: GameMuzica    8: GameMemorie
    9: GameDesen     10: GamePuzzle

So the order of GAMES below is load-bearing — it must match that map 1:1,
or a DB game's id will point at the wrong (or no) component on the games
hub. (An earlier version of this script seeded 11 games in a different
order/category split that did NOT line up with the component map — e.g.
id 4 resolved to "Primele Cuvinte" while the frontend rendered GameDinozauri
for id 4, and id 11 had no component at all. This rewrite fixes that.)

Run with:  python -m scripts.seed_games   (from artifacts/api-server-py/,
with MONGODB_URI set, e.g. via the .env file and python-dotenv which
app.config already loads).

Safe to re-run: games are matched by `title` and skipped if they already
exist. Existing games with placehold.co placeholder images are updated to
the real /api/assets/ paths.
"""

import asyncio

from app.db import close_db, connect_db
from app.models.game import Game

GAMES = [
    {
        # id 1 -> GameNumarare: counting 1-20, odd/even, tens, number tracing.
        "title": "Numărătoare Veselă",
        "description": "Numără de la 1 la 20, exersează par/impar și trasează cifrele cu degetul.",
        "category": "matematica",
        "age_min": 3,
        "age_max": 7,
        "image_url": "/api/assets/game-matematica-1.png",
        "is_new_game": True,
        "is_featured": True,
        "requires_subscription": False,
    },
    {
        # id 2 -> GameAdunare: addition, subtraction, mixed, early multiplication.
        "title": "Adunări Distractive",
        "description": "Adunări, scăderi și primele tabele de înmulțire prin jocuri rapide.",
        "category": "matematica",
        "age_min": 6,
        "age_max": 9,
        "image_url": "/api/assets/game-matematica-2.png",
        "is_featured": True,
    },
    {
        # id 3 -> GameAlfabet: letters of the alphabet.
        "title": "Alfabetul Vesel",
        "description": "Învață literele alfabetului și sunetele lor prin asociere cu imagini.",
        "category": "litere",
        "age_min": 3,
        "age_max": 7,
        "image_url": "/api/assets/game-litere-1.png",
        "is_new_game": True,
        "is_featured": True,
        "requires_subscription": False,
    },
    {
        # id 4 -> GameDinozauri: dinosaur exploration/discovery.
        "title": "Lumea Dinozaurilor",
        "description": "Descoperă dinozauri, numele și caracteristicile lor printr-o aventură interactivă.",
        "category": "natura",
        "age_min": 4,
        "age_max": 8,
        "image_url": "/api/assets/game-natura-1.png",
        "is_new_game": True,
    },
    {
        # id 5 -> GameForme: shapes + color mixing + shape tracing.
        "title": "Forme și Culori",
        "description": "Recunoaște forme geometrice, combină culori și trasează contururi.",
        "category": "culori",
        "age_min": 3,
        "age_max": 7,
        "image_url": "/api/assets/game-culori-1.png",
        "is_featured": True,
        "requires_subscription": False,
    },
    {
        # id 6 -> GameAnimale: animal sounds, habitats, legs, babies.
        "title": "Lumea Animalelor",
        "description": "Asociază animale cu sunetele, habitatele și puii lor.",
        "category": "natura",
        "age_min": 3,
        "age_max": 7,
        "image_url": "/api/assets/game-natura-1.png",
        "is_featured": True,
    },
    {
        # id 7 -> GameMuzica: rhythm/instrument sequences.
        "title": "Ritmuri Vesele",
        "description": "Reproduce secvențe muzicale simple apăsând pe instrumente colorate.",
        "category": "muzica",
        "age_min": 4,
        "age_max": 8,
        "image_url": "/api/assets/game-muzica-1.png",
        "is_new_game": True,
    },
    {
        # id 8 -> GameMemorie: classic memory/matching pairs.
        "title": "Joc de Memorie",
        "description": "Găsește perechile de cărți identice din 4 teme diferite — exersează memoria.",
        "category": "memorie",
        "age_min": 4,
        "age_max": 9,
        "image_url": "/api/assets/game-memorie-1.png",
        "is_new_game": True,
    },
    {
        # id 9 -> GameDesen: free drawing / coloring canvas.
        "title": "Atelier de Desen",
        "description": "Desenează liber sau colorează șabloane gata făcute, cu pensule și culori variate.",
        "category": "creativitate",
        "age_min": 3,
        "age_max": 9,
        "image_url": "/api/assets/game-creativitate-1.png",
    },
    {
        # id 10 -> GamePuzzle: logic/matching puzzles.
        "title": "Puzzle de Logică",
        "description": "Rezolvă puzzle-uri de logică, sortare și asociere la mai multe niveluri.",
        "category": "logica",
        "age_min": 5,
        "age_max": 9,
        "image_url": "/api/assets/game-logica-1.png",
    },
    {
        # id 11 -> GameLabirint: maze navigation, 3 difficulty levels, 5 themes.
        "title": "Labirint",
        "description": "Navighează prin labirint cu 3 niveluri de dificultate și 5 teme: animale, fructe, legume, obiecte, spațiu.",
        "category": "labirint",
        "age_min": 4,
        "age_max": 9,
        "image_url": "/api/assets/game-labirint-1.png",
        "is_new_game": True,
        "is_featured": True,
        "requires_subscription": True,
    },
    {
        # id 12 -> GameCuvinte: word search, 5 categories, 3 difficulty levels.
        "title": "Caută Cuvinte",
        "description": "Găsește cuvinte ascunse în grilă! 5 categorii: animale, fructe, legume, obiecte, spațiu.",
        "category": "cuvinte",
        "age_min": 5,
        "age_max": 9,
        "image_url": "/api/assets/game-cuvinte-1.png",
        "is_new_game": True,
        "is_featured": True,
        "requires_subscription": True,
    },
]


async def main():
    await connect_db()

    created = 0
    skipped = 0
    updated = 0

    for game in GAMES:
        existing = await Game.find_one(Game.title == game["title"])
        if existing:
            # Update placeholder image URLs to real assets
            if existing.image_url and "placehold.co" in existing.image_url:
                existing.image_url = game["image_url"]
                await existing.save()
                updated += 1
            else:
                skipped += 1
            continue
        await Game.create_new(**game)
        created += 1

    print(f"Seed complete: {created} created, {updated} updated, {skipped} already up-to-date.")
    await close_db()


if __name__ == "__main__":
    asyncio.run(main())
