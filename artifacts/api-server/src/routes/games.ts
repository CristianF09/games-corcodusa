import { Router } from "express";
import { db, gamesTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/games", async (req, res) => {
  try {
    const { category, ageMin, ageMax, featured } = req.query;
    const conditions = [];
    if (category) conditions.push(eq(gamesTable.category, String(category)));
    if (ageMin) conditions.push(gte(gamesTable.ageMax, Number(ageMin)));
    if (ageMax) conditions.push(lte(gamesTable.ageMin, Number(ageMax)));
    if (featured === "true") conditions.push(eq(gamesTable.isFeatured, true));

    const games = conditions.length > 0
      ? await db.select().from(gamesTable).where(and(...conditions)).orderBy(gamesTable.createdAt)
      : await db.select().from(gamesTable).orderBy(gamesTable.createdAt);

    res.json(games.map(g => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "Failed to list games");
    res.status(500).json({ error: "Failed to list games" });
  }
});

router.get("/games/featured", async (req, res) => {
  try {
    const games = await db.select().from(gamesTable)
      .where(eq(gamesTable.isFeatured, true))
      .orderBy(gamesTable.createdAt);
    res.json(games.map(g => ({ ...g, createdAt: g.createdAt.toISOString() })));
  } catch (err) {
    logger.error({ err }, "Failed to list featured games");
    res.status(500).json({ error: "Failed to list featured games" });
  }
});

router.get("/games/categories", async (req, res) => {
  try {
    const rows = await db.execute(
      sql`SELECT category, COUNT(*) as count FROM games GROUP BY category ORDER BY count DESC`
    );
    const categoryMap: Record<string, { label: string; emoji: string }> = {
      matematica: { label: "Matematică", emoji: "🔢" },
      litere: { label: "Litere & Alfabet", emoji: "📚" },
      culori: { label: "Culori & Forme", emoji: "🎨" },
      muzica: { label: "Muzică & Ritm", emoji: "🎵" },
      natura: { label: "Natură & Animale", emoji: "🌿" },
      logica: { label: "Logică & Puzzle", emoji: "🧩" },
      memorie: { label: "Memorie & Concentrare", emoji: "🧠" },
      creativitate: { label: "Creativitate", emoji: "✏️" },
    };
    const categories = (rows.rows as any[]).map((r) => ({
      name: r.category,
      label: categoryMap[r.category]?.label ?? r.category,
      count: Number(r.count),
      emoji: categoryMap[r.category]?.emoji ?? "🎮",
    }));
    res.json(categories);
  } catch (err) {
    logger.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.get("/games/new", async (req, res) => {
  try {
    const games = await db.select().from(gamesTable)
      .where(eq(gamesTable.isNew, true))
      .orderBy(gamesTable.createdAt);
    res.json(games.map(g => ({ ...g, createdAt: g.createdAt.toISOString() })));
  } catch (err) {
    logger.error({ err }, "Failed to list new games");
    res.status(500).json({ error: "Failed to list new games" });
  }
});

router.get("/games/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, id));
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json({ ...game, createdAt: game.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Failed to get game");
    res.status(500).json({ error: "Failed to get game" });
  }
});

router.get("/stats/overview", async (req, res) => {
  try {
    const gameResult = await db.execute(sql`SELECT COUNT(*) as total FROM games`);
    const categoryResult = await db.execute(sql`SELECT COUNT(DISTINCT category) as total FROM games`);
    const userResult = await db.execute(sql`SELECT COUNT(*) as total FROM users`);
    const newResult = await db.execute(
      sql`SELECT COUNT(*) as total FROM games WHERE created_at > NOW() - INTERVAL '30 days'`
    );
    res.json({
      totalGames: Number(gameResult.rows[0]?.total ?? 0),
      totalCategories: Number(categoryResult.rows[0]?.total ?? 0),
      totalUsers: Number(userResult.rows[0]?.total ?? 0),
      newGamesThisMonth: Number(newResult.rows[0]?.total ?? 0),
    });
  } catch (err) {
    logger.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
