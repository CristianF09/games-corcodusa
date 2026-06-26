"""Create a test user directly in MongoDB for local API testing.

This script inserts a user with subscription_tier="pro" and a known
clerk_id so you can test protected endpoints without going through Clerk.

Usage (from artifacts/api-server-py/):
    python -m scripts.create_test_user

The user gets:
  - clerk_id:            "test_dev_user"
  - email:               "test@corcodusa.ro"
  - subscription_tier:   "pro"   (full access, no trial countdown)

For BROWSER testing, use Clerk's test-mode OTP instead:
  1. Sign up at the local dev URL with any email you control.
  2. Clerk test mode (pk_test_...) accepts OTP code "424242" for any phone,
     and delivers magic links to real email.  The first sign-up creates a
     MongoDB user via POST /api/users/me with 7 days of free trial — enough
     to test all 10 games.

Safe to re-run: skips creation if the test user already exists.
"""

import asyncio
from datetime import datetime, timezone

from app.db import close_db, connect_db
from app.models.user import User

TEST_CLERK_ID = "test_dev_user"
TEST_EMAIL = "test@corcodusa.ro"


async def main():
    await connect_db()

    existing = await User.find_one(User.clerk_id == TEST_CLERK_ID)
    if existing:
        print(f"Test user already exists — numeric_id={existing.numeric_id}, tier={existing.subscription_tier}")
        await close_db()
        return

    user = await User.create_new(
        clerk_id=TEST_CLERK_ID,
        email=TEST_EMAIL,
        first_name="Test",
        last_name="User",
        subscription_tier="pro",
        trial_started_at=datetime.now(timezone.utc),
    )
    print(f"Test user created — numeric_id={user.numeric_id}, clerk_id={TEST_CLERK_ID}")
    print(f"  email:  {TEST_EMAIL}")
    print(f"  tier:   pro (full access to all 10 games)")
    print()
    print("To call authenticated endpoints locally, pass the header:")
    print(f'  Authorization: Bearer <clerk-token>  (must be a real Clerk JWT)')
    print("The test user is useful for direct MongoDB inspection, not for bypassing Clerk JWT auth.")

    await close_db()


if __name__ == "__main__":
    asyncio.run(main())
