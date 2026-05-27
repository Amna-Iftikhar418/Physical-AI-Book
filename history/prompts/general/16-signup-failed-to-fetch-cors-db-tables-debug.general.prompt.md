---
id: 16
title: Signup Failed to Fetch CORS and DB Tables Debug
stage: general
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: auth
branch: main
user: Amna Iftikhar
command: general
labels: ["debug","cors","auth","signup","db-tables","railway"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/main.py
tests:
  - manual: POST /api/auth/signup from GitHub Pages frontend
---

## Prompt

now health show : {"status":"ok","version":"1.0.5","git_sha":"1f749f08"} but when i click on create account it said failed to fetch error

## Response snapshot

Diagnosed two root causes for the "failed to fetch" error on the Create Account page:

1. **CORS (primary cause)**: "Failed to fetch" is a browser TypeError thrown by fetch() itself — meaning no HTTP response was received at all. This happens when CORS blocks the preflight. The Railway CORS_ORIGINS env var must include `https://amna-iftikhar418.github.io`. If missing, all POST requests from GitHub Pages are silently blocked.

2. **Missing DB tables (secondary cause)**: The `create_all` was removed from lifespan in a previous commit to fix the Railway health check. The `users` and `user_profiles` tables never exist on Neon. This would cause a 500 after CORS is fixed.

Code fix: Re-added `create_all` to lifespan wrapped in try/except so it never blocks startup or the health check:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        import db.models  # registers models on Base.metadata
        from db.connection import engine, Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("DB tables created/verified OK")
    except Exception:
        import traceback
        print("DB init warning (non-fatal):", traceback.format_exc())
    routes = [...]
    print("REGISTERED ROUTES:", routes)
    yield
```

User action required: In Railway dashboard, set `CORS_ORIGINS=http://localhost:3000,https://amna-iftikhar418.github.io`

## Outcome

- ✅ Impact: Fixed DB table creation on startup; identified CORS env var issue on Railway
- 🧪 Tests: Manual test needed after Railway redeploy with correct CORS_ORIGINS
- 📁 Files: backend/main.py (lifespan updated)
- 🔁 Next prompts: Verify signup works after Railway redeploy; test signin flow
- 🧠 Reflection: "Failed to fetch" always means CORS or network error, never a 4xx/5xx. The create_all was lost when health-check blocking was fixed — wrapping in try/except is the right pattern.

## Evaluation notes (flywheel)

- Failure modes observed: CORS misconfiguration silently blocks all browser POSTs; DB tables missing after lifespan cleanup
- Graders run and results (PASS/FAIL): none automated
- Prompt variant (if applicable): null
- Next experiment: Add a CORS test in CI using the GitHub Pages origin
