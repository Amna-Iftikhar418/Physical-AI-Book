---
name: phase-8-urdu-translation
description: Implement Phase 8 — Urdu translation feature (T089–T094) for US5 (+50 pts)
metadata:
  type: green
  stage: green
  feature: physical-ai-textbook
  id: "001"
  date: "2026-05-27"
  surface: agent
  model: claude-sonnet-4-6
  branch: main
  user: Amna Iftikhar
  command: /sp.implement
  labels: ["translation", "urdu", "phase-8", "US5", "gemini", "fastapi", "docusaurus"]
links:
  spec: specs/physical-ai-textbook/spec.md
  tasks: specs/physical-ai-textbook/tasks.md
  adr: "null"
  pr: "null"
files_created:
  - backend/services/translation.py
  - backend/routers/translate.py
  - book/src/components/PersonalizationBar/TranslateButton.tsx
files_modified:
  - backend/services/agents.py
  - backend/main.py
  - book/src/theme/DocItem/Layout/index.tsx
  - specs/physical-ai-textbook/tasks.md
tests: []
---

## Prompt (verbatim)

```
phase 8 , use subagents,skills , but make it 100% productive. and error free.
```

## Response Summary

Implemented all 6 tasks for Phase 8 (US5 — Urdu Translation, +50 pts):

**T089** — Added `TRANSLATION_SYSTEM_PROMPT` and `translation_model` (gemini-2.5-flash) to `backend/services/agents.py`. System prompt instructs: translate prose to Urdu, preserve code blocks verbatim in English, preserve technical terms (ROS 2, URDF, NVIDIA Isaac, etc.) in English within Urdu sentences.

**T090** — Created `backend/services/translation.py` with `translate_chapter(chapter_id)` that reads from `docs_manifest.json` and calls `translation_model.generate_content_async()` wrapped with `with_retry()`.

**T091** — Created `backend/routers/translate.py` with `POST /api/translate` endpoint. Requires Bearer token (401 if missing/invalid), returns `{translated_text}`, raises 404 if chapter not in manifest, 503 if LLM retries exhausted. Does not need DB access (no user profile lookup needed for translation).

**T092** — Registered translate router in `backend/main.py` using the same safe try/except import pattern as personalize/auth routers.

**T093** — Created `book/src/components/PersonalizationBar/TranslateButton.tsx`. Auth-gated (hidden for anonymous users), calls `POST /api/translate` with 60s timeout, shows loading spinner, error display, amber/warning color scheme to distinguish from PersonalizeButton.

**T094** — Updated `book/src/theme/DocItem/Layout/index.tsx` to render both `PersonalizeButton` and `TranslateButton`. Unified override state (`overrideContent` + `overrideMode`) handles either mode. When translated: amber status bar + "Switch to English" button. When personalized: green status bar + "Back to original". Both call `window.location.reload()` to restore original.

**Verification**: `npm run build` exits 0 with no errors. Backend imports verified (`from routers.translate import router` + `from services.translation import translate_chapter` + `from services.agents import translation_model` all succeed).

**T095** (deploy + verify at live URL) requires manual push and testing — user action needed.

## Outcome

- T089–T094: COMPLETE (marked [X] in tasks.md)
- T095: Pending deployment verification
- `npm run build`: SUCCESS
- Backend imports: SUCCESS
