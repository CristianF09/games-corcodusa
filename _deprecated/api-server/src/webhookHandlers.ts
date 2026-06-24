import { getUncachableStripeClient, getStripeWebhookSecret } from "./stripeClient";
import { logger } from "./lib/logger";

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const webhookSecret = getStripeWebhookSecret();
    if (!webhookSecret) {
      logger.warn("STRIPE_WEBHOOK_SECRET not set — skipping webhook verification");
      return;
    }

    const stripe = await getUncachableStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    logger.info({ type: event.type }, "Stripe webhook received");

    // TODO: handle the relevant event types (e.g. checkout.session.completed,
    // customer.subscription.updated/deleted) to update users.subscriptionTier,
    // stripeCustomerId, and stripeSubscriptionId in the DB.
  }
}
