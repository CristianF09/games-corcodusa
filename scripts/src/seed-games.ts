/**
 * One-off seed script: inserts a starter set of games so the site isn't
 * empty on first load. Run with `pnpm --filter @workspace/scripts run
 * seed:games` after MONGODB_URI is set (e.g. export it in your shell, or
 * run via `pnpm dotenv -e ../artifacts/api-server-py/.env -- pnpm run seed:games`).
 *
 * Safe to re-run: games are matched by `title` and skipped if they already
 * exist, so re-running won't create duplicates.
 */
import { connectDB, GameModel } from "@workspace/db";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/FFD166/333?text=";

const games = [
  {
    title: "Numere Vesele",
    description: "Învață să numeri de la 1 la 20 cu animale simpatice.",
    category: "matematica",
    ageMin: 3,
    ageMax: 6,
    imageUrl: `${PLACEHOLDER_IMAGE}1-2-3`,
    isNewGame: true,
    isFeatured: true,
    requiresSubscription: false,
  },
  {
    title: "Adunări Distractive",
    description: "Exersează adunări simple printr-un joc de potrivire.",
    category: "matematica",
    ageMin: 6,
    ageMax: 9,
    imageUrl: `${PLACEHOLDER_IMAGE}%2B`,
    isFeatured: true,
  },
  {
    title: "Alfabetul Animalelor",
    description: "Asociază fiecare literă cu un animal și sunetul ei.",
    category: "litere",
    ageMin: 3,
    ageMax: 7,
    imageUrl: `${PLACEHOLDER_IMAGE}ABC`,
    isNewGame: true,
    isFeatured: true,
    requiresSubscription: false,
  },
  {
    title: "Primele Cuvinte",
    description: "Formează cuvinte simple din litere colorate.",
    category: "litere",
    ageMin: 5,
    ageMax: 8,
    imageUrl: `${PLACEHOLDER_IMAGE}Cuvinte`,
  },
  {
    title: "Curcubeul Culorilor",
    description: "Învață culorile de bază printr-un puzzle interactiv.",
    category: "culori",
    ageMin: 3,
    ageMax: 6,
    imageUrl: `${PLACEHOLDER_IMAGE}🎨`,
    isFeatured: true,
    requiresSubscription: false,
  },
  {
    title: "Forme și Contururi",
    description: "Recunoaște și sortează forme geometrice de bază.",
    category: "culori",
    ageMin: 4,
    ageMax: 7,
    imageUrl: `${PLACEHOLDER_IMAGE}%E2%97%8F%E2%96%B2`,
  },
  {
    title: "Ritmuri Vesele",
    description: "Reproduce secvențe muzicale simple apăsând pe instrumente.",
    category: "muzica",
    ageMin: 4,
    ageMax: 8,
    imageUrl: `${PLACEHOLDER_IMAGE}🎵`,
    isNewGame: true,
  },
  {
    title: "Lumea Animalelor",
    description: "Descoperă animale și habitatele lor naturale.",
    category: "natura",
    ageMin: 3,
    ageMax: 7,
    imageUrl: `${PLACEHOLDER_IMAGE}🌿`,
    isFeatured: true,
  },
  {
    title: "Puzzle Logic",
    description: "Rezolvă puzzle-uri simple de logică și asociere.",
    category: "logica",
    ageMin: 5,
    ageMax: 9,
    imageUrl: `${PLACEHOLDER_IMAGE}🧩`,
  },
  {
    title: "Joc de Memorie",
    description: "Găsește perechile de cărți identice — exersează memoria.",
    category: "memorie",
    ageMin: 4,
    ageMax: 8,
    imageUrl: `${PLACEHOLDER_IMAGE}🧠`,
    isNewGame: true,
  },
  {
    title: "Atelier de Desen",
    description: "Desenează liber sau colorează șabloane gata făcute.",
    category: "creativitate",
    ageMin: 3,
    ageMax: 9,
    imageUrl: `${PLACEHOLDER_IMAGE}✏️`,
  },
];

async function main() {
  await connectDB();

  let created = 0;
  let skipped = 0;

  for (const game of games) {
    const existing = await GameModel.findOne({ title: game.title });
    if (existing) {
      skipped++;
      continue;
    }
    await GameModel.create(game);
    created++;
  }

  console.log(`Seed complete: ${created} created, ${skipped} already existed.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
}