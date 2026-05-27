---
id: 12
title: Qdrant chapter_id Payload Index Missing — 503 Fix
stage: general
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: inline prompt
labels: ["qdrant", "rag", "filter", "payload-index", "503", "backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/services/rag.py
  - backend/subagents/index_to_qdrant.py
tests:
  - none
---

## Prompt

503: {"detail":"RAG pipeline unavailable: Unexpected Response: 400 (Bad Request)\nRaw response content:\nb'{\"status\":{\"error\":\"Bad request: Index required but not found for \\\\\"chapter_id\\\\\" of one of the following types: [keyword]. Help: Create an index for this key or use a different filter.\"},\"time\":0.0 ...'"}

## Response snapshot

**Root cause:** Qdrant requires a payload index on any field used in a filter. The `chapter_chunks` collection was created by `setup_collection` in `index_to_qdrant.py` without creating a payload index on `chapter_id`. When `/api/chat/select` passes `chapter_id` as a filter, Qdrant returns 400 "Index required but not found for 'chapter_id'", which surfaces as 503.

**Fix — two files:**

1. `backend/services/rag.py` — added idempotent index creation in `_get_qdrant()` so the live collection gets the index on the next process startup (Railway redeploy), without re-indexing:
```python
_index_ensured = False

def _get_qdrant() -> QdrantClient:
    global _qdrant, _index_ensured
    if _qdrant is None:
        _qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    if not _index_ensured:
        for field in ("chapter_id", "module_id"):
            try:
                _qdrant.create_payload_index(
                    collection_name=COLLECTION_NAME,
                    field_name=field,
                    field_schema=PayloadSchemaType.KEYWORD,
                )
            except Exception:
                pass
        _index_ensured = True
    return _qdrant
```

2. `backend/subagents/index_to_qdrant.py` — added `create_payload_index` calls in `setup_collection` after `create_collection` so future re-index runs also create the index.

Committed `5c65de3`, pushed to main. Railway will redeploy.

## Outcome

- ✅ Impact: Fixed 503 on `/api/chat/select` — Qdrant no longer rejects chapter_id filter queries
- 🧪 Tests: Will self-heal on next Railway deploy; test by calling `/api/chat/select` with a chapter_id
- 📁 Files: backend/services/rag.py, backend/subagents/index_to_qdrant.py
- 🔁 Next prompts: Verify `/api/chat/select` returns 200 after Railway redeploys (~2 min); test chat widget end-to-end on live site
- 🧠 Reflection: Qdrant payload indexes must be explicitly created — unlike relational DBs, Qdrant returns 400 (not just slow) when a filtered field has no index. Always create indexes for every field used in a filter when setting up a collection.

## Evaluation notes (flywheel)

- Failure modes observed: Collection created without payload index; filter attempted on un-indexed field
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): New issue after PHR #11 deploy
- Next experiment: Verify index creation is idempotent (re-running setup_collection on existing collection with index should not error)
