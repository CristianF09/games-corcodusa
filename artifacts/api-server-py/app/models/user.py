"""Beanie document for the `users` collection — direct port of
lib/db/src/schema/users.ts. See game.py's module docstring for why fields
use `alias=` instead of renaming the Mongo-side keys.
"""

from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pymongo import IndexModel
from pydantic import ConfigDict, Field

from app.models.counter import next_sequence


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Document):
    model_config = ConfigDict(populate_by_name=True)

    numeric_id: Optional[int] = Field(default=None, alias="id")
    clerk_id: str = Field(alias="clerkId")
    email: str
    first_name: Optional[str] = Field(default=None, alias="firstName")
    last_name: Optional[str] = Field(default=None, alias="lastName")
    avatar_url: Optional[str] = Field(default=None, alias="avatarUrl")
    subscription_tier: str = Field(default="free", alias="subscriptionTier")
    trial_started_at: Optional[datetime] = Field(default=None, alias="trialStartedAt")
    stripe_customer_id: Optional[str] = Field(default=None, alias="stripeCustomerId")
    stripe_subscription_id: Optional[str] = Field(default=None, alias="stripeSubscriptionId")

    created_at: datetime = Field(default_factory=_utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=_utcnow, alias="updatedAt")

    class Settings:
        name = "users"
        indexes = [
            IndexModel("clerkId", unique=True),
            IndexModel("id", unique=True),
        ]

    @classmethod
    async def create_new(cls, **fields) -> "User":
        now = _utcnow()
        user = cls(numeric_id=await next_sequence("users"), created_at=now, updated_at=now, **fields)
        await user.insert()
        return user

    async def touch_and_save(self, **fields) -> "User":
        """Apply partial updates and persist, refreshing `updated_at`.
        Equivalent to the Node side's `user.set({...}); await user.save()`.
        """
        for key, value in fields.items():
            setattr(self, key, value)
        self.updated_at = _utcnow()
        await self.save()
        return self
