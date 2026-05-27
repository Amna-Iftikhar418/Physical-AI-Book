---
id: 14
title: Railway Silent Rollback Auth Debug
stage: general
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: /ask
labels: ["railway","deployment","debug","auth","fastapi","neon"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/routers/health.py
  - backend/main.py
  - railway.json
tests:
  - curl /health → version + git_sha confirm correct deployment
  - curl /openapi.json → auth routes present
  - Railway logs show AUTH ROUTER LOADED OK
---

## Prompt

I need deep debugging help for a FastAPI + Railway deployment issue.

Context:
* Backend: FastAPI
* Hosting: Railway
* DB: Neon PostgreSQL
* Frontend: Docusaurus on GitHub Pages
* Auth: custom JWT auth router under `/api/auth/*`

Problem: Railway keeps serving old version `1.0.3` even after successful deploys.
`/health` returns: `{"status":"ok","version":"1.0.3"}`
But latest git commit should be `1.0.5`.

Symptoms:
* `/api/auth/session` returns 404
* `/openapi.json` only shows `/health`, `/api/chat`, `/api/chat/select`
* Auth routes are completely missing
* Railway logs show container starts successfully
* No crash loop visible

Already attempted fixes:
1. Added build dependencies to Dockerfile (gcc libffi-dev libssl-dev)
2. Removed blocking Neon DB startup code from FastAPI lifespan
3. Bumped app version to 1.0.5
4. Pushed latest commit successfully

Need: root cause analysis, exact debugging code, Railway settings to verify, how to force clean rebuild, how to confirm which git SHA Railway is running.

## Response snapshot

**Root Cause #1 — Health Check Timeout → Silent Rollback:**
FastAPI lifespan blocks on `Base.metadata.create_all` which connects to Neon. Neon serverless cold-starts in 10–60s. uvicorn cannot serve HTTP during lifespan startup. Railway polls `/health` for 30s (`healthcheckTimeout`), gets "connection refused", kills new container, keeps v1.0.3. Build logs show "success" because the Docker BUILD succeeded; the DEPLOY (health check) silently failed.

Fix already applied: removed blocking DB call from lifespan. Lifespan now just logs routes and yields immediately.

**Root Cause #2 — Auth Router Silently None:**
`routers/auth.py` imports `passlib[bcrypt]` and `python-jose[cryptography]` which require compiled C extensions (gcc, libffi, libssl). `python:3.11-slim` ships without these. If pip install layer was cached from before the Dockerfile gcc fix, auth router import fails silently → `auth_router = None` → no auth routes in OpenAPI.

**Changes applied:**
- `railway.json`: `healthcheckTimeout` 30 → 120 seconds
- `backend/routers/health.py`: Added `git_sha: os.environ.get("RAILWAY_GIT_COMMIT_SHA")[:8]` to health response
- `backend/main.py`: Added `print("AUTH ROUTER LOADED OK")` on successful auth import

**Verification after next deploy:**
```bash
curl .../health
# {"status":"ok","version":"1.0.5","git_sha":"241a077"}
curl .../openapi.json | python -m json.tool | grep '"/api/auth'
# /api/auth/signup, /api/auth/signin, /api/auth/session
```

Railway logs should show: `AUTH ROUTER LOADED OK` and `REGISTERED ROUTES: [.../api/auth/signup...]`

## Outcome

- ✅ Impact: Diagnosed Railway silent rollback mechanism; added git SHA to health endpoint for definitive version tracking; increased health check timeout to 120s
- 🧪 Tests: curl /health checks git_sha vs git log; curl /openapi.json confirms auth route registration
- 📁 Files: railway.json, backend/routers/health.py, backend/main.py
- 🔁 Next prompts: verify v1.0.5 deploys successfully; run Phase 6 auth verification (signup → profile → signin → session)
- 🧠 Reflection: Railway's silent rollback (build success ≠ deploy success) is a common trap with serverless DB cold starts; the version+git_sha sentinel pattern is essential for Railway debugging

## Evaluation notes (flywheel)

- Failure modes observed: Railway shows "deployment complete" while actually rolling back to old container; health check timeout window too tight for Neon cold starts
- Graders run and results (PASS/FAIL): manual curl verification pending new deployment
- Prompt variant (if applicable): null
- Next experiment: if auth router still fails after fix, add comment to requirements.txt to bust pip cache layer
