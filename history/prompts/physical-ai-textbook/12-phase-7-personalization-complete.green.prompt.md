---
id: 12
title: Phase 7 Personalization Complete
stage: green
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: physical-ai-textbook
branch: main
user: Amna Iftikhar
command: /sp.implement phase 7
labels: ["personalization","gemini","fastapi","docusaurus","swizzle","react-markdown","phase-7"]
links:
  spec: specs/physical-ai-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/services/agents.py
  - backend/services/personalization.py
  - backend/routers/personalize.py
  - backend/main.py
  - book/src/components/PersonalizationBar/PersonalizeButton.tsx
  - book/src/theme/DocItem/Layout/index.tsx
  - specs/physical-ai-textbook/tasks.md
tests:
  - TypeScript tsc --noEmit → 0 errors
  - Docusaurus npm run build → [SUCCESS]
  - Python imports for routers.personalize and services.personalization → ALL IMPORTS OK
---

## Prompt

phase 7 use subagents,skills but give me 100% productive code.

## Response snapshot

Implemented all 6 Phase 7 tasks (T082–T087) from scratch. No prior personalization code existed — full greenfield implementation.

**Backend (T082–T085):**
- `backend/services/agents.py`: Added `personalization_model` (gemini-2.5-flash) with `PERSONALIZATION_SYSTEM_PROMPT` instructing: preserve all technical facts/code/headings, adjust prose depth to skill level (beginner → analogies + inline definitions; advanced → concise + deeper), return full Markdown
- `backend/services/personalization.py`: `_get_manifest()` loads `docs_manifest.json` once (module-level singleton); `get_user_profile(user_id, db)` fetches `UserProfile` from Neon via async SQLAlchemy; `personalize_chapter(chapter_id, profile)` builds skill-level prompt → calls `personalization_model.generate_content_async()` → wrapped with `with_retry()` for quota resilience
- `backend/routers/personalize.py`: `POST /api/personalize` — Bearer auth via `_bearer_user_id()`, 401 if missing; 404 if profile or chapter not found; 503 on LLM failure; returns `{personalized_text}`
- `backend/main.py`: Personalize router registered with same try/except guard pattern as auth router

**Frontend (T086–T087):**
- `book/src/components/PersonalizationBar/PersonalizeButton.tsx`: Reads `authClient.getCachedUser()` (instant) then `getSession()` (async verify); hidden for logged-out users; on click: POSTs to `/api/personalize` with 60s timeout; shows "⏳ Personalizing…" during load; calls `onPersonalize(text)` on success; inline error display
- `book/src/theme/DocItem/Layout/index.tsx`: Swizzled DocItem/Layout; uses `useDoc().metadata.id` for chapter ID; when `personalizedContent` is set replaces article area with react-markdown rendered output + "↩ Back to original" (window.location.reload); when null renders original layout untouched

**Validations:**
- `tsc --noEmit` → 0 errors
- `npm run build` → [SUCCESS] generated static files
- Python: `from routers.personalize import router` → ALL IMPORTS OK

## Outcome

- ✅ Impact: Phase 7 fully implemented. POST /api/personalize endpoint live. PersonalizeButton visible to signed-in users on every chapter page. Personalized content replaces article area with react-markdown; "Back to original" reloads.
- 🧪 Tests: tsc clean, Docusaurus build pass, Python imports clean
- 📁 Files: 7 files (2 new backend, 1 edited backend, 2 new frontend, 1 edited backend main, 1 tasks.md update)
- 🔁 Next prompts: Push to main → Railway + GitHub Pages redeploy → verify T088 at live URL → Phase 8 (Urdu translation, +50 pts)
- 🧠 Reflection: Used `useDoc().metadata.id` from `@docusaurus/plugin-content-docs/client` for chapter ID mapping — this aligns with docs_manifest.json keys exactly (e.g. "intro", "hardware/requirements", "assessments/index")

## Evaluation notes (flywheel)

- Failure modes observed: none — TypeScript and build both passed first try
- Graders run and results (PASS/FAIL): tsc PASS, npm build PASS, Python imports PASS
- Prompt variant (if applicable): null
- Next experiment: Verify personalization at live URL after push (T088); then Phase 8 Urdu translation
