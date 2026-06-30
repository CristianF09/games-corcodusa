"""Port of artifacts/api-server/src/routes/users.ts."""

from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException

from app.auth import require_auth
from app.logger import log_error
from app.models.user import User

router = APIRouter()


def compute_trial_days_left(user: User) -> int:
    if user.subscription_tier != "free":
        return 0
    if not user.trial_started_at:
        return 7
    started = user.trial_started_at
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    days_elapsed = (datetime.now(timezone.utc) - started).days
    return max(0, 7 - days_elapsed)


def serialize_user(user: User) -> dict:
    return {
        "id": user.numeric_id,
        "clerkId": user.clerk_id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "avatarUrl": user.avatar_url,
        "subscriptionTier": user.subscription_tier,
        "trialDaysLeft": compute_trial_days_left(user),
        "stripeCustomerId": user.stripe_customer_id,
        "createdAt": user.created_at.isoformat(),
    }


@router.get("/users/me")
async def get_me(clerk_id: str = Depends(require_auth)):
    try:
        user = await User.find_one(User.clerk_id == clerk_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return serialize_user(user)
    except HTTPException:
        raise
    except Exception as err:  # noqa: BLE001
        log_error("Failed to get user", err=str(err))
        raise HTTPException(status_code=500, detail="Failed to get user")


@router.post("/users/me")
async def upsert_me(body: dict = Body(...), clerk_id: str = Depends(require_auth)):
    try:
        email = body.get("email")
        first_name = body.get("firstName")
        last_name = body.get("lastName")
        avatar_url = body.get("avatarUrl")

        user = await User.find_one(User.clerk_id == clerk_id)
        if user:
            await user.touch_and_save(
                email=email,
                first_name=first_name,
                last_name=last_name,
                avatar_url=avatar_url,
            )
        else:
            user = await User.create_new(
                clerk_id=clerk_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                avatar_url=avatar_url,
                subscription_tier="free",
                trial_started_at=datetime.now(timezone.utc),
            )
        return serialize_user(user)
    except Exception as err:  # noqa: BLE001
        log_error("Failed to upsert user", err=str(err))
        raise HTTPException(status_code=500, detail="Failed to upsert user")


@router.get("/users/me/subscription")
async def get_subscription(clerk_id: str = Depends(require_auth)):
    try:
        user = await User.find_one(User.clerk_id == clerk_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        trial_days_left = compute_trial_days_left(user)

        # Paid access is a one-time purchase (see app/webhooks.py), not a
        # recurring Stripe Subscription — it's "active" only while
        # subscription_expires_at hasn't passed yet, there's no ongoing
        # billing status to ask Stripe for.
        expires_at = user.subscription_expires_at
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        has_paid_access = (
            user.subscription_tier != "free" and expires_at is not None and expires_at > datetime.now(timezone.utc)
        )
        is_active = has_paid_access or trial_days_left > 0

        return {
            "tier": user.subscription_tier if has_paid_access else "free",
            "isActive": is_active,
            "trialDaysLeft": trial_days_left,
            "expiresAt": expires_at.isoformat() if has_paid_access and expires_at else None,
            "stripePriceId": None,
        }
    except HTTPException:
        raise
    except Exception as err:  # noqa: BLE001
        log_error("Failed to get subscription", err=str(err))
        raise HTTPException(status_code=500, detail="Failed to get subscription")
