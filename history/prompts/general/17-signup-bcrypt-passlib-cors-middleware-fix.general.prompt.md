---
name: signup-bcrypt-passlib-cors-middleware-fix
description: Root-cause analysis and fix for signup 500 error — passlib+bcrypt4 crash + CORS on 500 responses
metadata:
  type: general
  stage: general
  date: 2026-05-27
  surface: agent
  model: claude-sonnet-4-6
  feature: auth
  branch: main
  user: Amna Iftikhar
  labels: ["auth", "bcrypt", "cors", "railway", "bug-fix"]
---

## Prompt

it show failed to load response data
(user confirmed health endpoint returned version 1.0.7, cors_origins correct)
"use subagents,skills any thing but finally resolve this error .strictly resolve"

## Response

Diagnosed two compounding root causes via direct curl to Railway:

### Root Cause 1: passlib 1.7.4 + bcrypt 4.x crashes on startup
passlib's `detect_wrap_bug()` (called during `CryptContext(schemes=["bcrypt"])` initialization) internally calls `bcrypt.hashpw` with a 72-byte test password. bcrypt 4.x now raises `ValueError: password cannot be longer than 72 bytes` for this internal test. This means `from auth import ...` fails at module load time — auth router is `None`, all `/api/auth/*` return 404 or the error propagates as 500.

**Fix:** Dropped passlib entirely. Rewrote `auth.py` to use `bcrypt` library directly with SHA-256+base64 prehash (passwords always 44 bytes, safe for bcrypt). Updated `requirements.txt`: `passlib[bcrypt]` → `bcrypt`.

### Root Cause 2: `@app.exception_handler(Exception)` goes to ServerErrorMiddleware (outside CORS)
Starlette puts `Exception` handlers in `ServerErrorMiddleware` (outermost layer, before `CORSMiddleware`). So 500 responses never pass through CORS, and the browser gets no `Access-Control-Allow-Origin` header → "Failed to fetch" / "Failed to load response data".

**Fix:** Replaced with `@app.middleware("http")` registered **before** `app.add_middleware(CORSMiddleware)`. Since each new `add_middleware` call inserts at list[0], CORS ends up wrapping our exception middleware. Stack: `ServerError → CORS → ExcCatcher → ExceptionMiddleware → router`.

### Files changed
- `backend/auth.py` — drop passlib, direct bcrypt, SHA-256 prehash
- `backend/main.py` — HTTP middleware before CORS, version 1.0.8
- `backend/routers/health.py` — version bump to 1.0.8
- `backend/requirements.txt` — passlib[bcrypt] → bcrypt

### Commits
- `fe43ec0` — CORS middleware fix + version 1.0.8
- `90ed0cc` — bcrypt/passlib drop, direct bcrypt usage

## Outcome
Both fixes verified locally (auth module imports cleanly, hash/verify round-trip works). Pushed to Railway for deployment.
