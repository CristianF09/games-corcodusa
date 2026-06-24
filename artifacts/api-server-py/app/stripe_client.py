"""Stripe client factory — port of stripeClient.ts.

Verified against stripe==15.2.1 in this session: `StripeClient` exists, but
its top-level resource shortcuts (`.products`, `.checkout`, ...) are
deprecated in favor of the explicit `.v1` namespace (`.v1.products`,
`.v1.checkout`, ...). All resources also expose `*_async` methods, which is
what makes `StripeClient` worth using over the classic
`stripe.api_key = "..."` global-mutation style in an async FastAPI app.
"""

import stripe

from app.config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET


def get_stripe_client() -> stripe.StripeClient:
    if not STRIPE_SECRET_KEY:
        raise RuntimeError(
            "Stripe integration not connected. Set the STRIPE_SECRET_KEY "
            "environment variable to enable payments."
        )
    return stripe.StripeClient(STRIPE_SECRET_KEY)


def get_stripe_webhook_secret() -> str | None:
    return STRIPE_WEBHOOK_SECRET
