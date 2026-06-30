"""Stripe webhook signature verification + dispatch — port of
webhookHandlers.ts.

Checkout Sessions are created with mode="payment" (see payments.py) — a
single instant charge, not a recurring Stripe Subscription. So the only
event that matters here is `checkout.session.completed`: when it fires (and
the payment actually succeeded), we grant the user `PLAN_DURATION_DAYS[interval]`
days of paid access from `app/routers/payments.py`'s Checkout Session
metadata (`clerkId`, `interval`), stacking on top of any unexpired access
the user already has.

There is no Stripe-side renewal to react to, so `customer.subscription.*`
events aren't relevant to purchases made through this flow and are left
unhandled (logged only).
"""

from datetime import datetime, timedelta, timezone

import stripe

from app.logger import log_error, log_info, log_warn
from app.models.user import User
from app.stripe_client import get_stripe_webhook_secret

# Length of paid access granted per one-time purchase. Keys match the
# `interval` metadata set on the Checkout Session in payments.py.
PLAN_DURATION_DAYS = {"month": 30, "year": 365}


async def _grant_access(clerk_id: str | None, customer_id: str | None, interval: str | None) -> None:
    user = None
    if clerk_id:
        user = await User.find_one(User.clerk_id == clerk_id)
    if not user and customer_id:
        user = await User.find_one(User.stripe_customer_id == customer_id)
    if not user:
        log_warn("Stripe checkout completed but no matching user found", clerk_id=clerk_id, customer_id=customer_id)
        return

    duration_days = PLAN_DURATION_DAYS.get(interval or "", 30)
    now = datetime.now(timezone.utc)

    current_expiry = user.subscription_expires_at
    if current_expiry and current_expiry.tzinfo is None:
        current_expiry = current_expiry.replace(tzinfo=timezone.utc)
    base = current_expiry if current_expiry and current_expiry > now else now
    new_expiry = base + timedelta(days=duration_days)

    await user.touch_and_save(
        subscription_tier="premium",
        subscription_expires_at=new_expiry,
        stripe_customer_id=customer_id or user.stripe_customer_id,
    )
    log_info(
        "Granted premium access from Stripe checkout",
        clerk_id=user.clerk_id,
        interval=interval,
        expires_at=new_expiry.isoformat(),
    )


async def process_webhook(payload: bytes, signature: str) -> None:
    webhook_secret = get_stripe_webhook_secret()
    if not webhook_secret:
        log_warn("STRIPE_WEBHOOK_SECRET not set — skipping webhook verification")
        return

    event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
    log_info("Stripe webhook received", type=event["type"])

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") not in ("paid", "no_payment_required"):
            log_info("Checkout completed but not paid yet — ignoring", payment_status=session.get("payment_status"))
            return
        metadata = session.get("metadata") or {}
        try:
            await _grant_access(
                clerk_id=metadata.get("clerkId"),
                customer_id=session.get("customer"),
                interval=metadata.get("interval"),
            )
        except Exception as err:  # noqa: BLE001
            log_error("Failed to grant access after checkout.session.completed", err=str(err))
    else:
        log_info("Unhandled Stripe webhook event type", type=event["type"])
