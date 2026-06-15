import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/users/me", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
    if (!user) return res.status(404).json({ error: "User not found" });

    const trialDaysLeft = computeTrialDaysLeft(user);

    res.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      subscriptionTier: user.subscriptionTier,
      trialDaysLeft,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.post("/users/me", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const { email, firstName, lastName, avatarUrl } = req.body;

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));

    let user;
    if (existing) {
      [user] = await db.update(usersTable)
        .set({ email, firstName, lastName, avatarUrl })
        .where(eq(usersTable.clerkId, clerkId))
        .returning();
    } else {
      [user] = await db.insert(usersTable)
        .values({
          clerkId,
          email,
          firstName,
          lastName,
          avatarUrl,
          subscriptionTier: "free",
          trialStartedAt: new Date(),
        })
        .returning();
    }

    const trialDaysLeft = computeTrialDaysLeft(user);

    res.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      subscriptionTier: user.subscriptionTier,
      trialDaysLeft,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to upsert user");
    res.status(500).json({ error: "Failed to upsert user" });
  }
});

router.get("/users/me/subscription", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
    if (!user) return res.status(404).json({ error: "User not found" });

    const trialDaysLeft = computeTrialDaysLeft(user);
    const isActive = user.subscriptionTier !== "free" || trialDaysLeft > 0;

    res.json({
      tier: user.subscriptionTier,
      isActive,
      trialDaysLeft,
      expiresAt: null,
      stripePriceId: null,
    });
  } catch (err) {
    logger.error({ err }, "Failed to get subscription");
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

function computeTrialDaysLeft(user: { trialStartedAt: Date | null; subscriptionTier: string }): number {
  if (user.subscriptionTier !== "free") return 0;
  if (!user.trialStartedAt) return 7;
  const msPerDay = 1000 * 60 * 60 * 24;
  const elapsed = Date.now() - user.trialStartedAt.getTime();
  const daysElapsed = Math.floor(elapsed / msPerDay);
  return Math.max(0, 7 - daysElapsed);
}

export default router;
