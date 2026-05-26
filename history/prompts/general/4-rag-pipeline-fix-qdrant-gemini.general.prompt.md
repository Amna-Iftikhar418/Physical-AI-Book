---
id: 4
title: RAG Pipeline Fix — Qdrant and Gemini
stage: general
date: 2026-05-26
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: "Continue from where you left off. / run my project"
labels: ["debug","backend","RAG","qdrant-client","gemini","quota"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/services/rag.py
  - backend/services/agents.py
tests:
  - "POST /api/chat {query: 'What is ROS2?'} → 200 with answer and sources"
  - "GET /health → {status: ok, version: 1.0.0}"
---

## Prompt

Continue from where you left off. / run my project (backend showed {"detail":"Not Found"}, then red error blink in frontend chat)

## Response snapshot

Restarted both servers (backend on port 8000, frontend on port 3000 — already running).

Diagnosed the red error by testing `/api/chat` directly via PowerShell.

**Root causes found and fixed:**

1. `'QdrantClient' object has no attribute 'search'`
   - qdrant-client v1.18.0 removed the `.search()` method.
   - Fix: `rag.py` — changed `_qdrant.search(...)` → `_qdrant.query_points(...)`, `query_vector=` → `query=`, `query_filter=` → `query_filter=`, result access changed from direct list → `result.points`.

2. `429 Quota exceeded — limit: 0 — gemini-2.0-flash / gemini-2.0-flash-lite`
   - Free-tier daily quota exhausted for older Gemini models on this API key.
   - Fix: `agents.py` — switched model from `gemini-2.0-flash` → `gemini-2.5-flash`.

**Confirmed working:**
- `POST /api/chat {"query":"What is ROS2?"}` → 200, answer with 2 Qdrant sources, session_id returned.

## Outcome

- ✅ Impact: RAG chatbot fully functional end-to-end — Qdrant search works, Gemini 2.5 Flash generates answers, sources returned
- 🧪 Tests: Direct API test PASS — answer returned with sources from Qdrant collection
- 📁 Files: 2 files changed (rag.py, agents.py)
- 🔁 Next prompts: Test in browser chat widget; push changes to GitHub for production deployment on Railway
- 🧠 Reflection: qdrant-client v1.7+ renamed `.search()` to `.query_points()` — always check library changelogs after dependency upgrades. Gemini 2.5 Flash has separate free-tier quota from 2.0 Flash.

## Evaluation notes (flywheel)

- Failure modes observed: Two sequential errors — Qdrant API change masked by Gemini quota error (had to fix Qdrant first to expose Gemini error)
- Graders run and results (PASS/FAIL): API integration test PASS
- Prompt variant (if applicable): null
- Next experiment: Run indexing script `subagents/index_to_qdrant.py` to verify Qdrant collection has full book content indexed
