import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { UserModel } from "@workspace/db";
import { logger } from "../lib/logger";
import { getUncachableStripeClient } from "../stripeClient";
import { WebhookHandlers } from "../webhookHandlers";

const router = Router();

function getBaseUrl(): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  const port = process.env.PORT ?? "8080";
  return `http://localhost:${port}`;
}

let stripeInitialized = false;

export async function initStripe() {
  if (stripeInitialized) return;
  if (!process.env.STRIPE_SECRET_KEY) return;
  stripeInitialized = true;
  logger.info("Stripe configured (STRIPE_SECRET_KEY present)");
}

router.post("/stripe/webhook",
  (req, res, next) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) return res.status(400).json({ error: "Missing signature" });
    const sig = Array.isArray(signature) ? signature[0] : signature;
    WebhookHandlers.processWebhook(req.body as Buffer, sig)
      .then(() => res.status(200).json({ received: true }))
      .catch((err) => {
        logger.error({ err }, "Webhook processing failed");
        res.status(400).json({ error: "Webhook failed" });
      });
  }
);

router.get("/payments/products", async (req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const products = await stripe.products.list({ active: true, expand: ["data.default_price"] });

    const result = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({ product: product.id, active: true });
        const price = prices.data[0];
        return {
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          priceId: price?.id ?? "",
          amount: price?.unit_amount ?? 0,
          currency: price?.currency ?? "ron",
          interval: (price?.recurring?.interval as string | null) ?? null,
          isPopular: product.metadata?.isPopular === "true",
        };
      })
    );

    res.json(result);
  } catch (err: any) {
    logger.warn({ err: err.message }, "Stripe products not available");
    res.json([
      {
        id: "prod_trial",
        name: "Acces Gratuit 7 Zile",
        description: "Acces complet timp de 7 zile, fără card bancar",
        priceId: "",
        amount: 0,
        currency: "ron",
        interval: null,
        isPopular: false,
      },
      {
        id: "prod_full",
        name: "Acces Complet",
        description: "Acces nelimitat la toate jocurile, jocuri noi în fiecare lună",
        priceId: "",
        amount: 4900,
        currency: "ron",
        interval: "month",
        isPopular: true,
      },
    ]);
  }
});

router.post("/payments/checkout", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const { priceId, trialDays } = req.body;
    const user = await UserModel.findOne({ clerkId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const stripe = await getUncachableStripeClient();
    const baseUrl = getBaseUrl();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
        metadata: { userId: String(user.id) },
      });
      customerId = customer.id;
      await UserModel.updateOne({ clerkId }, { stripeCustomerId: customerId });
    }

    const sessionParams: any = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/pricing`,
    };

    if (trialDays && trialDays > 0) {
      sessionParams.subscription_data = { trial_period_days: trialDays };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (err: any) {
    logger.error({ err }, "Checkout session failed");
    res.status(500).json({ error: err.message ?? "Failed to create checkout session" });
  }
});

router.post("/payments/portal", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await UserModel.findOne({ clerkId });
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = getBaseUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    logger.error({ err }, "Portal session failed");
    res.status(500).json({ error: err.message ?? "Failed to create portal session" });
  }
});

export default router;
