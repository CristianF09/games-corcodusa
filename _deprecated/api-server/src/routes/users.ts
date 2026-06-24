import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { UserModel, type UserAttrs } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

function serializeUser(user: UserAttrs, trialDaysLeft: number) {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    subscriptionTier: user.subscriptionTier,
    trialDaysLeft,
    stripeCustomerId: user.stripeCustomerId,
    createdAt: new Date(user.createdAt).toISOString(),
  };
}

router.get("/users/me", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await UserModel.findOne({ clerkId }).lean<UserAttrs>();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(serializeUser(user, computeTrialDaysLeft(user)));
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

    // Deliberately find-then-save/create instead of findOneAndUpdate(...,
    // {upsert: true}): Mongoose's pre("save") hooks (which assign the
    // numeric `id` for brand-new documents — see schema/users.ts) only run
    // on .save()/.create(), not on query-level upserts.
    let user = await UserModel.findOne({ clerkId });
    if (user) {
      user.set({ email, firstName, lastName, avatarUrl });
      await user.save();
    } else {
      user = await UserModel.create({
        clerkId,
        email,
        firstName,
        lastName,
        avatarUrl,
        subscriptionTier: "free",
        trialStartedAt: new Date(),
      });
    }

    res.json(serializeUser(user.toObject(), computeTrialDaysLeft(user)));
  } catch (err) {
    logger.error({ err }, "Failed to upsert user");
    res.status(500).json({ error: "Failed to upsert user" });
  }
});

router.get("/users/me/subscription", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await UserModel.findOne({ clerkId }).lean<UserAttrs>();
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
  const elapsed = Date.now() - new Date(user.trialStartedAt).getTime();
  const daysElapsed = Math.floor(elapsed / msPerDay);
  return Math.max(0, 7 - daysElapsed);
}

export default router;
