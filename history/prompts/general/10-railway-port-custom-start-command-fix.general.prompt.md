---
id: 10
title: Railway $PORT Fails in Custom Start Command
stage: general
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: inline prompt
labels: ["railway", "docker", "fastapi", "deployment", "port", "$PORT", "custom-start-command"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - none
tests:
  - none
---

## Prompt

when i change start uvicorn main:app --host 0.0.0.0 --port $PORT it give me errorr and failed to deploy in railway

## Response snapshot

Root cause: Railway's custom start command field runs the command without a shell (exec form), so `$PORT` is passed as a literal string to uvicorn instead of being expanded to a number. Uvicorn rejects `"$PORT"` as an invalid port value and fails to start.

The Dockerfile's `CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}` already handles this correctly because the shell form `CMD` (without `[]` brackets) runs via `/bin/sh -c "..."`, which expands `${PORT:-8000}` properly.

**Recommended fix:** Clear the custom start command in Railway dashboard entirely. Railway will fall back to the Dockerfile `CMD`, which already uses `${PORT:-8000}` with a correct fallback.

**Alternative fix (if custom start command is required):**
```
/bin/sh -c "uvicorn main:app --host 0.0.0.0 --port $PORT"
```

This wraps the command in an explicit shell invocation so `$PORT` expands before being passed to uvicorn.

## Outcome

- ✅ Impact: Identified exec-form vs shell-form as the root cause of $PORT expansion failure in Railway custom start command
- 🧪 Tests: Not applicable — deployment configuration issue
- 📁 Files: No code changes; Dockerfile CMD is already correct
- 🔁 Next prompts: Confirm Railway redeploy succeeds with blank custom start command; verify /health returns {"status":"ok","version":"1.0.3"}
- 🧠 Reflection: Railway custom start command does not invoke a shell by default. $PORT expansion requires either the Dockerfile shell-form CMD or an explicit `/bin/sh -c "..."` wrapper. Always prefer letting Dockerfile CMD handle port configuration.

## Evaluation notes (flywheel)

- Failure modes observed: Railway custom start command exec form vs Docker shell form CMD confusion; $PORT passed as literal string to uvicorn
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): Follow-up to PHR #9
- Next experiment: Remove custom start command and verify Dockerfile CMD is used; consider adding railway.toml with startCommand using explicit sh -c wrapper
