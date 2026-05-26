---
id: 0005
title: Phase 4 Text-Selection Chapter-Scope Fix
stage: green
date: 2026-05-27
surface: agent
model: claude-opus-4-7
feature: physical-ai-textbook
branch: main
user: Amna Iftikhar
command: /sp.implement
labels: ["phase-4", "us2", "text-selection", "rag", "bugfix"]
links:
  spec: specs/physical-ai-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - book/src/theme/Root.tsx
 - backend/routers/chat.py
tests:
 - npm run build (book/) — SUCCESS, 0 errors
 - python ast.parse(routers/chat.py) — parses OK
---

## Prompt

phase 4 because it is in complete

## Response snapshot

Ran `/sp.implement` scoped to Phase 4 (US2 — Text-Selection Contextual Q&A).
Tasks T058–T061 were already marked `[X]`; only T062 (deploy + verify at live
URL) was unchecked. While verifying the "done" tasks I found a latent bug that
made the whole feature non-functional:

- `Root.tsx` derived `chapter_id` via `window.location.pathname.match(/\/docs\/(.+)/)`,
  but `docusaurus.config.ts` uses `routeBasePath: '/'` with `baseUrl: '/Physical-AI-Book/'`.
  Live chapter URLs contain no `/docs/` segment, so `chapter_id` was always
  `undefined`, `useSelectEndpoint` was always `false`, and `/api/chat/select`
  was never used — selection Q&A silently fell back to general chat.

Fixes:
1. `Root.tsx`: import `@generated/docusaurus.config`; rewrote `getChapterIdFromPath`
   to strip `siteConfig.baseUrl` and trim slashes, returning the path (or `intro`
   for the root). This matches manifest/Qdrant keys for the 13 leaf chapters
   exactly (e.g. `module-1-ros2/week-1-2-foundations`).
2. `backend/routers/chat.py`: in `_run_chat`, when a `chapter_id` filter returns
   no chunks and doesn't already end in `/index`, retry with `chapter_id + "/index"`.
   This maps the 5 landing-page URLs (`/module-x/`, `/assessments/`) to their
   stored `module-x/index` chapter_ids.

Verified: `npm run build` succeeds (0 errors); `chat.py` parses. Grep confirmed
`Root.tsx` was the only place assuming the `/docs/` structure.

T062 left unchecked — it requires deploy to live URL + browser verification,
which is a shared/visible action pending user confirmation.

## Outcome

- ✅ Impact: Text-selection Q&A now actually scopes responses to the current
  chapter (the core promise of US2). Without this fix, T062 would have failed.
- 🧪 Tests: Frontend production build passes; backend syntax validated. No live
  verification yet (requires deploy).
- 📁 Files: book/src/theme/Root.tsx, backend/routers/chat.py
- 🔁 Next prompts: Commit + push to deploy (GH Pages + Railway), then verify
  T062 at live URL and mark it [X].
- 🧠 Reflection: "Marked done" ≠ "works"; verifying checked tasks against the
  real routing config surfaced a silent fallback bug.

## Evaluation notes (flywheel)

- Failure modes observed: chapter_id extraction coupled to a URL structure
  (`/docs/`) that the config never produces.
- Graders run and results (PASS/FAIL): build PASS, syntax PASS, live verify PENDING.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): deploy and confirm selection on a
  Module 1 leaf page returns sources only from that chapter.
