"""Port of artifacts/api-server/src/routes/payments.ts.

The webhook route reads the RAW request body (required for Stripe signature
verification) — see the `await request.body()` call below, and make sure
this router is mounted before anything that would otherwise consume/parse
the body for this path (FastAPI/Starlette don't auto-parse JSON ahead of
time the way Express does, so this is less fragile here than on the Node
side, but the comment is kept for parity/context).
"""

from fastapi import APIRouter, Body, Depends, HTTPException, Request

from app.auth import require_auth
from app.config import APP_BASE_URL
from app.logger import log_error, log_info, log_warn
from app.models.user import User
from app.stripe_client import get_stripe_client
from app.webhooks import process_webhook

router = APIRouter()


def get_base_url() -> str:
    return APP_BASE_URL


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    signature = request.headers.get("stripe-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")

    payload = await request.body()
    try:
        await process_webhook(payload, signature)
        return {"received": True}
    except Exception as err:  # noqa: BLE001
        log_error("Webhook processing failed", err=str(err))
        raise HTTPException(status_code=400, detail="Webhook failed")


@router.get("/payments/products")
async def list_products():
    try:
        client = get_stripe_client()
        products = await client.v1.products.list_async(params={"active": True, "expand": ["data.default_price"]})

        result = []
        for product in products.data:
            prices = await client.v1.prices.list_async(params={"product": product.id, "active": True})
            price = prices.data[0] if prices.data else None
            metadata = product.metadata or {}
            # Checkout now runs in mode="payment" (one-time charge — see
            # create_checkout below), so these Prices should be one-time,
            # not recurring, and won't carry a `.recurring.interval`.
            # "month"/"year" comes from the Product's own metadata instead
            # (set this in the Stripe Dashboard on each Product). Recurring
            # prices are still read as a fallback for older Stripe setups.
            interval = metadata.get("interval") or (price.recurring.interval if price and price.recurring else None)
            result.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "description": product.description or "",
                    "priceId": price.id if price else "",
                    "amount": price.unit_amount if price else 0,
                    "currency": price.currency if price else "ron",
                    "interval": interval,
                    "isPopular": metadata.get("isPopular") == "true",
                }
            )
        return result
    except Exception as err:  # noqa: BLE001
        log_warn("Stripe products not available", err=str(err))
        return [
            {
                "id": "prod_monthly",
                "name": "Abonament Lunar",
                "description": "Acces nelimitat la toate jocurile timp de 30 de zile",
                "priceId": "",
                "amount": 6700,
                "currency": "ron",
                "interval": "month",
                "isPopular": False,
            },
            {
                "id": "prod_annual",
                "name": "Abonament Anual",
                "description": "Acces nelimitat la toate jocurile, -25% față de plata lunară",
                "priceId": "",
                "amount": 60300,
                "currency": "ron",
                "interval": "year",
                "isPopular": True,
            },
        ]


@router.post("/payments/checkout")
async def create_checkout(body: dict = Body(...), clerk_id: str = Depends(require_auth)):
    try:
        price_id = body.get("priceId")
        # "month" or "year" — which plan was bought, so the webhook knows how
        # many days of access to grant once payment completes (see
        # app/webhooks.py). Sent by the frontend from the product it fetched
        # via /payments/products.
        interval = body.get("interval")

        user = await User.find_one(User.clerk_id == clerk_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        client = get_stripe_client()
        base_url = get_base_url()

        customer_id = user.stripe_customer_id
        if not customer_id:
            name = " ".join(filter(None, [user.first_name, user.last_name])) or None
            customer = await client.v1.customers.create_async(params={"email": user.email, "name": name})
            customer_id = customer.id
            await user.touch_and_save(stripe_customer_id=customer_id)

        # mode="payment" — a single instant charge, not a recurring Stripe
        # Subscription. There's nothing to auto-renew and nothing to
        # "cancel" later; access just runs out after PLAN_DURATION_DAYS
        # (app/webhooks.py) unless the customer buys again. The Price
        # behind `price_id` must therefore be a one-time Price in Stripe —
        # mode="payment" rejects a recurring Price.
        session_params = {
            "customer": customer_id,
            "payment_method_types": ["card"],
            "line_items": [{"price": price_id, "quantity": 1}],
            "mode": "payment",
            "success_url": f"{base_url}/?checkout=success",
            "cancel_url": f"{base_url}/pricing",
            "metadata": {"clerkId": clerk_id, "interval": interval or ""},
        }

        session = await client.v1.checkout.sessions.create_async(params=session_params)
        return {"url": session.url}
    except HTTPException:
        raise
    except Exception as err:  # noqa: BLE001
        log_error("Checkout session failed", err=str(err))
        raise HTTPException(status_code=500, detail=str(err) or "Failed to create checkout session")


@router.post("/payments/portal")
async def create_portal(clerk_id: str = Depends(require_auth)):
    try:
        user = await User.find_one(User.clerk_id == clerk_id)
        if not user or not user.stripe_customer_id:
            raise HTTPException(status_code=400, detail="No Stripe customer found")

        client = get_stripe_client()
        base_url = get_base_url()
        session = await client.v1.billing_portal.sessions.create_async(
            params={"customer": user.stripe_customer_id, "return_url": f"{base_url}/dashboard"}
        )
        return {"url": session.url}
    except HTTPException:
        raise
    except Exception as err:  # noqa: BLE001
        log_error("Portal session failed", err=str(err))
        raise HTTPException(status_code=500, detail=str(err) or "Failed to create portal session")
