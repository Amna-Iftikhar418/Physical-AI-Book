---
id: 8
title: Railway /docs 404 — Full Backend Audit
stage: general
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: inline prompt
labels: ["railway", "docker", "fastapi", "deployment", "debugging"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/Dockerfile
  - backend/requirements.txt
tests:
  - none
---

## Prompt

You are a senior DevOps + FastAPI engineer. I deployed my FastAPI backend on Railway using Docker, but I am facing issues.

CURRENT SYMPTOMS:
- /health endpoint works correctly and returns JSON: {"paused": false, "status": "ok"}
- /docs returns 404 Not Found
- The app is running in Railway logs without crashes
- Uvicorn is running on 0.0.0.0:8080
- No visible deployment errors

GOAL: Full audit for missing /docs, wrong routing, Docker misconfiguration, Railway deployment mistakes, missing env vars, router import failures, incorrect FastAPI init, root directory/backend structure mismatch.

## Response snapshot

Root cause identified: Railway is serving a stale Docker build, not the current code. Evidence: /health response field "paused" does not exist in any version of health.py in the codebase — current code returns {"status":"ok","version":"1.0.3"}. When a Railway Docker build fails, Railway silently keeps the last successful build.

Why the build is failing: Dockerfile uses `COPY requirements.txt .` (no prefix), which requires Railway Root Directory = `backend`. Commit history shows oscillation between prefixed and unprefixed COPY paths. If Railway dashboard Root Directory is empty or set to repo root, the build fails silently.

Additional confirmed issues:
1. db/connection.py calls create_async_engine("") at module level when DATABASE_URL is missing — raises ArgumentError at import time, caught in main.py, chat router becomes None.
2. qdrant-client was unpinned — pinned to >=1.18.0 (query_points API requires this).
3. Dockerfile had dead commented-out code and missing trailing newline — cleaned up.

FastAPI /docs is NOT disabled anywhere in the code — the 404 cannot come from FastAPI itself.

Fixes applied:
- backend/Dockerfile: removed dead commented-out lines, added trailing newline
- backend/requirements.txt: pinned qdrant-client>=1.18.0

Action required from user:
1. Railway dashboard → Service → Settings → Root Directory must be exactly: `backend`
2. Force redeploy
3. Check /health response — should be {"status":"ok","version":"1.0.3","startup_error":"..."} with the startup_error showing the exact chat router failure reason

## Outcome

- ✅ Impact: Identified stale Railway deployment as root cause; pinned qdrant-client; cleaned Dockerfile
- 🧪 Tests: Not applicable — deployment configuration issue
- 📁 Files: backend/Dockerfile, backend/requirements.txt
- 🔁 Next prompts: verify Railway redeploy succeeds; fix env vars to enable chat router
- 🧠 Reflection: The {"paused":false} field in the health response was the key diagnostic clue — it proved the deployed code was not the current codebase version

## Evaluation notes (flywheel)

- Failure modes observed: Silent Railway build failure keeping stale deployment; Dockerfile COPY path oscillation across commits
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment: Add railway.toml with explicit build configuration to prevent future Root Directory confusion
