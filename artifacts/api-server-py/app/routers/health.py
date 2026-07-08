from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
@router.get("/health")  # alias — the pricing page pre-warms via /api/health
async def healthz():
    return {"status": "ok"}
