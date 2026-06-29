"""Clerk authentication — FastAPI dependency port of @clerk/express's
`requireAuth()` + `getAuth(req)` pair used throughout the Node routes.

Verified against clerk-backend-api==6.0.1 in this session:
  - `Clerk(bearer_auth=secret_key).authenticate_request(request, options)`
    returns a `RequestState` with `.is_signed_in` (bool) and `.payload`
    (the verified JWT claims dict; `payload["sub"]` is the Clerk user id).
  - Verification is local (JWKS-based), no network round-trip per request.
"""

import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from fastapi import HTTPException, Request, status

from app.config import CLERK_SECRET_KEY

_sdk: Clerk | None = Clerk(bearer_auth=CLERK_SECRET_KEY) if CLERK_SECRET_KEY else None


def _to_httpx_request(request: Request) -> httpx.Request:
    return httpx.Request(
        method=request.method,
        url=str(request.url),
        headers=list(request.headers.items()),
    )


async def require_auth(request: Request) -> str:
    """Dependency for protected routes. Returns the authenticated user's
    Clerk id (the `sub` claim) or raises 401 — use like:

        @router.get("/users/me")
        async def me(clerk_id: str = Depends(require_auth)): ...
    """
    if _sdk is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Clerk is not configured (CLERK_SECRET_KEY missing)",
        )

    try:
        request_state = _sdk.authenticate_request(
            _to_httpx_request(request),
            AuthenticateRequestOptions(),
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    if not request_state.is_signed_in or not request_state.payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    clerk_id = request_state.payload.get("sub")
    if not clerk_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    return clerk_id
