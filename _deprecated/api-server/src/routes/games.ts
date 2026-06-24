import { Router } from "express";
import { GameModel, UserModel, type GameAttrs } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  matematica: { label: "Matematică", emoji: "🔢" },
  litere: { label: "Litere & Alfabet", emoji: "📚" },
  culori: { label: "Culori & Forme", emoji: "🎨" },
  muzica: { label: "Muzică & Ritm", emoji: "🎵" },
  natura: { label: "Natură & Animale", emoji: "🌿" },
  logica: { label: "Logică & Puzzle", emoji: "🧩" },
  memorie: { label: "Memorie & Concentrare", emoji: "🧠" },
  creativitate: { label: "Creativitate", emoji: "✏️" },
};

// The wire format calls this field `isNew`; it's stored as `isNewGame` in
// Mongo to avoid colliding with Mongoose's built-in Document#isNew. See
// lib/db/src/schema/games.ts for the full explanation.
function serializeGame(g: GameAttrs) {
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    category: g.category,
    ageMin: g.ageMin,
    ageMax: g.ageMax,
    imageUrl: g.imageUrl,
    gameUrl: g.gameUrl ?? null,
    isNew: g.isNewGame,
    isFeatured: g.isFeatured,
    requiresSubscription: g.requiresSubscription,
    createdAt: new Date(g.createdAt).toISOString(),
  };
}

router.get("/games", async (req, res) => {
  try {
    const { category, ageMin, ageMax, featured } = req.query;
    const filter: Record<string, unknown> = {};

    if (category) filter.category = String(category);
    if (featured === "true") filter.isFeatured = true;

    // Mirrors the original Postgres query: a game matches when its own
    // [ageMin, ageMax] range overlaps the requested [ageMin, ageMax] range.
    if (ageMin) filter.ageMax = { $gte: Number(ageMin) };
    if (ageMax) filter.ageMin = { $lte: Number(ageMax) };

    const games = await GameModel.find(filter).sort({ createdAt: 1 }).lean<GameAttrs[]>();
    res.json(games.map(serializeGame));
  } catch (err) {
    logger.error({ err }, "Failed to list games");
    res.status(500).json({ error: "Failed to list games" });
  }
});

router.get("/games/featured", async (req, res) => {
  try {
    const games = await GameModel.find({ isFeatured: true })
      .sort({ createdAt: 1 })
      .lean<GameAttrs[]>();
    res.json(games.map(serializeGame));
  } catch (err) {
    logger.error({ err }, "Failed to list featured games");
    res.status(500).json({ error: "Failed to list featured games" });
  }
});

router.get("/games/categories", async (req, res) => {
  try {
    const rows = await GameModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const categories = rows.map((r) => ({
      name: r._id,
      label: CATEGORY_LABELS[r._id]?.label ?? r._id,
      count: r.count,
      emoji: CATEGORY_LABELS[r._id]?.emoji ?? "🎮",
    }));
    res.json(categories);
  } catch (err) {
    logger.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.get("/games/new", async (req, res) => {
  try {
    const games = await GameModel.find({ isNewGame: true })
      .sort({ createdAt: 1 })
      .lean<GameAttrs[]>();
    res.json(games.map(serializeGame));
  } catch (err) {
    logger.error({ err }, "Failed to list new games");
    res.status(500).json({ error: "Failed to list new games" });
  }
});

router.get("/games/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(404).json({ error: "Game not found" });

    const game = await GameModel.findOne({ id }).lean<GameAttrs>();
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json(serializeGame(game));
  } catch (err) {
    logger.error({ err }, "Failed to get game");
    res.status(500).json({ error: "Failed to get game" });
  }
});

router.get("/stats/overview", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalGames, distinctCategories, totalUsers, newGamesThisMonth] = await Promise.all([
      GameModel.countDocuments(),
      GameModel.distinct("category"),
      UserModel.countDocuments(),
      GameModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    res.json({
      totalGames,
      totalCategories: distinctCategories.length,
      totalUsers,
      newGamesThisMonth,
    });
  } catch (err) {
    logger.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
