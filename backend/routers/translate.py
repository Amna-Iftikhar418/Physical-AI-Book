"""
T091: POST /api/translate — translate chapter to Urdu for authenticated users.
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

from auth import verify_token
from services.translation import translate_chapter

router = APIRouter(prefix="/api", tags=["translate"])


class TranslateRequest(BaseModel):
    chapter_id: str


async def _bearer_user_id(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization[7:]
    try:
        return verify_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/translate")
async def translate(
    body: TranslateRequest,
    user_id: str = Depends(_bearer_user_id),
):
    try:
        translated_text = await translate_chapter(body.chapter_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Translation unavailable: {exc}") from exc

    return {"translated_text": translated_text}
