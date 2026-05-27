"""
T084: POST /api/personalize — rewrite chapter content for the authenticated user's skill level.
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from auth import verify_token
from db.connection import get_db
from services.personalization import get_user_profile, personalize_chapter

router = APIRouter(prefix="/api", tags=["personalize"])


class PersonalizeRequest(BaseModel):
    chapter_id: str


async def _bearer_user_id(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization[7:]
    try:
        return verify_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/personalize")
async def personalize(
    body: PersonalizeRequest,
    user_id: str = Depends(_bearer_user_id),
    db: AsyncSession = Depends(get_db),
):
    profile = await get_user_profile(user_id, db)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    try:
        personalized_text = await personalize_chapter(body.chapter_id, profile)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Personalization unavailable: {exc}") from exc

    return {"personalized_text": personalized_text}
