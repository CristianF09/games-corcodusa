"""Stripe webhook signature verification + dispatch — port of
webhookHandlers.ts.

NOTE: same TODO as the Node original — signature verification works, but
no event types are actually handled yet. `checkout.session.completed` and
`customer.subscription.updated`/`deleted` need to update
`User.subscription_tier` / `stripe_subscription_id`. Flagged in the audit
sent to the user; not silently dropped.
"""

import stripe

from app.logger import log_info, log_warn
from app.stripe_client import get_stripe_webhook_secret


async def process_webhook(payload: bytes, signature: str) -> None:
    webhook_secret = get_stripe_webhook_secret()
    if not webhook_secret:
        log_warn("STRIPE_WEBHOOK_SECRET not set — skipping webhook verification")
        return

    event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
    log_info("Stripe webhook received", type=event["type"])

    # TODO: handle the relevant event types (e.g. checkout.session.completed,
    # customer.subscription.updated/deleted) to update users.subscription_tier,
    # stripe_customer_id, and stripe_subscription_id in the DB.
