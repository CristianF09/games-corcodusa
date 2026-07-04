"""Stripe webhook dispatch. Grants access on checkout.session.completed
and sends a Romanian confirmation email via Resend (non-fatal)."""

from datetime import datetime, timedelta, timezone

import httpx
import stripe

from app.config import CONTACT_EMAIL_FROM, RESEND_API_KEY
from app.logger import log_error, log_info, log_warn
from app.models.user import User
from app.stripe_client import get_stripe_webhook_secret

PLAN_DURATION_DAYS = {"month": 30, "year": 365}
_RESEND_URL = "https://api.resend.com/emails"

_EMAIL_TEMPLATE = """\
<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background:#f5f3ff;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0"
 style="background:#fff;border-radius:16px;max-width:560px;width:100%;
        box-shadow:0 4px 24px rgba(124,58,237,.13);">
<tr><td align="center"
  style="background:linear-gradient(135deg,#7c3aed,#a855f7);
         border-radius:16px 16px 0 0;padding:28px 32px 24px;">
  <p style="margin:0;font-size:36px;">&#127918;</p>
  <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:800;">
    Corcodusa &middot; Games</h1>
</td></tr>
<tr><td style="padding:32px 32px 24px;">
  <h2 style="margin:0 0 12px;color:#7c3aed;font-size:20px;text-align:center;">
    &#127881; Felicitari!</h2>
  <p style="margin:0 0 20px;font-size:15px;color:#374151;text-align:center;line-height:1.6;">
    Ati achizitionat un abonament <strong>{plan_label}</strong>
    la <strong>games.corcodusa.ro</strong></p>
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
  <td style="background:#f3e8ff;border-radius:10px;padding:14px 20px;">
    <p style="margin:0;color:#6d28d9;font-size:14px;text-align:center;">
      &#9989; Abonamentul este activ pana pe <strong>{expiry_str}</strong></p>
  </td></tr></table>
  <p style="margin:20px 0 24px;font-size:14px;color:#6b7280;text-align:center;line-height:1.6;">
    Bucurati-va de acces nelimitat la toate jocurile educationale Corcodusa!</p>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <a href="https://games.corcodusa.ro/games"
       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);
              color:#fff;text-decoration:none;padding:13px 32px;border-radius:8px;
              font-weight:700;font-size:15px;">Joaca acum &#8594;</a>
  </td></tr></table>
</td></tr>
<tr><td align="center" style="border-top:1px solid #e5e7eb;padding:16px 32px;">
  <p style="margin:0;font-size:12px;color:#9ca3af;">
    &#169; 2025 Corcodusa &middot; games.corcodusa.ro</p>
  <p style="margin:4px 0 0;font-size:11px;color:#d1d5db;">
    Daca nu ati initiat aceasta achizitie, contactati-ne la
    <a href="mailto:contact@corcodusa.ro"
       style="color:#a78bfa;text-decoration:none;">contact@corcodusa.ro</a></p>
</td></tr>
</table></td></tr></table>
</body></html>"""


async def _send_purchase_email(to_email: str, interval: str | None, expires_at: datetime) -> None:
    """Send Romanian purchase confirmation email via Resend. Non-fatal."""
    if not RESEND_API_KEY:
        log_warn("RESEND_API_KEY not set - purchase confirmation email skipped", to=to_email)
        return

    plan_label = "pe un an" if interval == "year" else "pe o luna"
    expiry_str = expires_at.strftime("%d.%m.%Y")
    html = _EMAIL_TEMPLATE.format(plan_label=plan_label, expiry_str=expiry_str)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                _RESEND_URL,
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": CONTACT_EMAIL_FROM,
                    "to": [to_email],
                    "subject": "Felicitari! Abonamentul tau Games Corcodusa este activ",
                    "html": html,
                },
            )
        if resp.status_code >= 400:
            log_error(
                "Resend rejected purchase confirmation email",
                status=resp.status_code,
                body=resp.text[:300],
                to=to_email,
            )
        else:
            log_info("Purchase confirmation email sent", to=to_email, interval=interval)
    except httpx.HTTPError as err:
        log_error("Failed to send purchase confirmation email", err=str(err), to=to_email)


async def _grant_access(clerk_id: str | None, customer_id: str | None, interval: str | None) -> None:
    user = None
    if clerk_id:
        user = await User.find_one(User.clerk_id == clerk_id)
    if not user and customer_id:
        user = await User.find_one(User.stripe_customer_id == customer_id)
    if not user:
        log_warn(
            "Stripe checkout completed but no matching user found",
            clerk_id=clerk_id,
            customer_id=customer_id,
        )
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

    # Send confirmation email - failure must NOT block the access grant
    try:
        await _send_purchase_email(user.email, interval, new_expiry)
    except Exception as err:  # noqa: BLE001
        log_error("Purchase confirmation email raised unexpectedly", err=str(err))


async def process_webhook(payload: bytes, signature: str) -> None:
    webhook_secret = get_stripe_webhook_secret()
    if not webhook_secret:
        log_warn("STRIPE_WEBHOOK_SECRET not set - skipping webhook verification")
        return

    event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
    log_info("Stripe webhook received", type=event["type"])

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") not in ("paid", "no_payment_required"):
            log_info(
                "Checkout completed but not paid yet - ignoring",
                payment_status=session.get("payment_status"),
            )
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
