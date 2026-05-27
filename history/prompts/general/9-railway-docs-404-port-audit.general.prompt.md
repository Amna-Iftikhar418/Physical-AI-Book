---
id: 9
title: Railway /docs 404 — Port + Stale Build Follow-up Audit
stage: general
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: inline prompt
labels: ["railway", "docker", "fastapi", "deployment", "port", "debugging"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/Dockerfile
  - backend/main.py
tests:
  - none
---

## Prompt

Follow-up to session 8. Same symptoms: /health works, /docs returns 404. New context provided:
- Custom start command: `uvicorn main:app --host 0.0.0.0 --port 8000` (hardcoded port)
- Dockerfile CMD uses port 8080
- Uvicorn reported running on 0.0.0.0:8080 in Railway logs
- Port 8000 vs 8080 vs Railway $PORT conflict identified

## Response snapshot

Three confirmed root causes:

1. **Stale Railway deployment** (certainty 100%): `/health` returns `{"paused": false, "status": "ok"}` — the `paused` field does not exist in any version of `backend/routers/health.py`. Railway silently keeps the last successful build when new builds fail. The deployed code is not the current codebase. FastAPI `/docs` is unconditionally registered in `main.py:34` (`FastAPI(title=..., version="1.0.3")`, no `docs_url=None`), so the 404 cannot come from the current code.

2. **Hardcoded port in custom start command** (certainty high): `uvicorn main:app --host 0.0.0.0 --port 8000` hardcodes port 8000. Railway assigns `$PORT` dynamically. Conflict with Dockerfile CMD which hardcodes 8080. Fix: `uvicorn main:app --host 0.0.0.0 --port $PORT`.

3. **Missing env vars → chat router import crash** (certainty 100%): `DATABASE_URL` empty → `create_async_engine("")` raises `ArgumentError` at import time → chat_router becomes None. App still starts, `/health` still works, but chat routes and /docs both absent in stale build.

Exact fix sequence:
1. Railway dashboard → Root Directory → set to `backend`
2. Custom Start Command → `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. `railway variables set DATABASE_URL=... GOOGLE_API_KEY=... QDRANT_URL=... QDRANT_API_KEY=...`
4. `railway up` to force redeploy
5. Verify: `/health` should return `{"status":"ok","version":"1.0.3"}` (no `paused` field)

## Outcome

- ✅ Impact: Identified port hardcoding as additional issue; reinforced stale deployment as confirmed root cause
- 🧪 Tests: Not applicable — deployment configuration issue
- 📁 Files: No new file changes (audit only)
- 🔁 Next prompts: confirm Railway redeploy succeeds; set env vars; verify /docs accessible
- 🧠 Reflection: Port mismatch between Dockerfile CMD (8080), custom start command (8000), and Railway $PORT is a fragile configuration that will break across redeploys. Always use $PORT.

## Evaluation notes (flywheel)

- Failure modes observed: Hardcoded ports in both CMD and custom start command creating ambiguity; stale deployment masking all code fixes
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): Follow-up to PHR #8
- Next experiment: Add railway.toml to codify port and root directory configuration
