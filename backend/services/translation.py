"""
T090: Translation service — translate chapter content to Urdu, preserving code blocks in English.
"""
import json
from pathlib import Path

from services.agents import translation_model
from utils.retry import with_retry

_MANIFEST_PATH = Path(__file__).parent.parent / "docs_manifest.json"
_manifest: dict[str, str] | None = None


def _get_manifest() -> dict[str, str]:
    global _manifest
    if _manifest is None:
        with open(_MANIFEST_PATH, "r", encoding="utf-8") as f:
            _manifest = json.load(f)
    return _manifest


async def translate_chapter(chapter_id: str) -> str:
    manifest = _get_manifest()
    chapter_text = manifest.get(chapter_id)
    if chapter_text is None:
        raise KeyError(f"Chapter '{chapter_id}' not found in manifest")

    prompt = (
        "Translate the following chapter content to Urdu. "
        "Keep all fenced code blocks and technical terms in English:\n\n"
        f"{chapter_text}"
    )

    async def _generate() -> str:
        response = await translation_model.generate_content_async(prompt)
        return response.text

    return await with_retry(_generate)
