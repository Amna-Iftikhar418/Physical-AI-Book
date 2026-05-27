---
id: 15
title: Railway Build Context Root Cause Diagnosis
stage: general
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: general debugging session
labels: ["railway", "deployment", "docker", "debugging", "root-directory", "build-context"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/railway.json
tests:
  - manual: verify /health returns version 1.0.5 with git_sha field after fix
---

## Prompt

I need strict root-cause debugging for a Railway deployment issue. Do NOT give generic advice. I need concrete diagnosis steps and exact fixes.

Railway STILL serves `{"status":"ok","version":"1.0.3"}` even after successful git push and Railway deploy. Runtime logs DO NOT contain `AUTH ROUTER LOADED OK`. `/api/auth/session` returns 404. `/openapi.json` only contains old routes.

Project has backend/ subdirectory with Dockerfile. Two railway.json files exist.

## Response snapshot

Root cause identified: Two conflicting `railway.json` files with incompatible build context assumptions.

- Root `railway.json`: `dockerfilePath: "backend/Dockerfile"`, healthcheckTimeout: 120
- `backend/railway.json`: `dockerfilePath: "Dockerfile"`, healthcheckTimeout: 30

The `backend/Dockerfile` line `COPY requirements.txt .` expects build context = `backend/`. But root `railway.json` sets build context = repo root where no `requirements.txt` exists.

If Railway Root Directory = blank → Docker build fails at `COPY requirements.txt .` → old image (1.0.3) stays active.
If Railway Root Directory = `backend/` → `backend/railway.json` used → 30s health check timeout (the 120s fix was applied to wrong file).

**Fix applied**: Updated `backend/railway.json` healthcheckTimeout from 30 to 120.
**Action required**: Set Railway dashboard Root Directory = `backend`, clear build cache, redeploy.

## Outcome

- ✅ Impact: Identified exact reason why all deploys since auth feature are failing silently
- 🧪 Tests: Hit /health and check for git_sha field + version 1.0.5 to verify fix works
- 📁 Files: backend/railway.json (healthcheckTimeout 30→120)
- 🔁 Next prompts: Verify Railway dashboard Root Directory = backend; confirm /health returns 1.0.5 after redeploy
- 🧠 Reflection: The mismatch between two railway.json files and the Docker build context is a silent failure — Railway keeps serving the old deployment without a clear error surfaced to the user

## Evaluation notes (flywheel)

- Failure modes observed: User interpreted "Railway deploy queued/started" as "deployment succeeded" — Railway still serves old container on health check failure or build failure
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment: After setting Root Directory=backend and redeploying, check /health for git_sha=6e5e29e[:8]
