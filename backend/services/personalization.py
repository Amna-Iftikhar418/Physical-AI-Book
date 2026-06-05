"""
T083: Personalization service — fetch user profile and rewrite chapter for skill level.
"""
import json
import uuid
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import UserProfile
from services.agents import personalization_model
from utils.retry import with_retry

_MANIFEST_PATH = Path(__file__).parent.parent / "docs_manifest.json"
_manifest: dict[str, str] | None = None

# In-memory cache: (chapter_id, software_level, python, linux, hardware, ai_ml) -> result
_cache: dict[tuple, str] = {}


def _get_manifest() -> dict[str, str]:
    global _manifest
    if _manifest is None:
        with open(_MANIFEST_PATH, "r", encoding="utf-8") as f:
            _manifest = json.load(f)
    return _manifest


async def get_user_profile(user_id: str, db: AsyncSession) -> dict | None:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return None
    return {
        "software_level": profile.software_level,
        "python_familiarity": profile.python_familiarity,
        "linux_familiarity": profile.linux_familiarity,
        "hardware_background": profile.hardware_background,
        "ai_ml_familiarity": profile.ai_ml_familiarity,
    }


async def personalize_chapter(chapter_id: str, profile: dict) -> str:
    cache_key = (
        chapter_id,
        profile["software_level"],
        profile["python_familiarity"],
        profile["linux_familiarity"],
        profile["hardware_background"],
        profile["ai_ml_familiarity"],
    )
    if cache_key in _cache:
        return _cache[cache_key]

    manifest = _get_manifest()
    chapter_text = manifest.get(chapter_id)
    if chapter_text is None:
        raise KeyError(f"Chapter '{chapter_id}' not found in manifest")

    prompt = (
        f"Student Profile:\n"
        f"- Software engineering level: {profile['software_level']}\n"
        f"- Python familiarity: {profile['python_familiarity']}\n"
        f"- Linux familiarity: {profile['linux_familiarity']}\n"
        f"- Hardware background: {profile['hardware_background']}\n"
        f"- AI/ML familiarity: {profile['ai_ml_familiarity']}\n\n"
        f"Chapter Content to Rewrite:\n{chapter_text}"
    )

    async def _generate() -> str:
        response = await personalization_model.generate_content_async(prompt)
        return response.text

    result = await with_retry(_generate)
    _cache[cache_key] = result
    return result
