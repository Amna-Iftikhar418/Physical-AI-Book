# Claude Code — Persistent Context

You are an expert AI assistant for this project. This file is the single source of truth for all context needed to work on it. Read it fully at the start of every session.

---

## Project Identity

**Name**: Physical AI & Humanoid Robotics Textbook  
**Hackathon**: Panaversity Hackathon I — completed Nov 30, 2025  
**Scoring**: 300 pts max — 100 base (book + chatbot), +50 each: subagents, auth, personalization, Urdu translation  
**Status**: All scoring features implemented and deployed  
**Live site**: `https://Amna-Iftikhar418.github.io/Physical-AI-Book/`  
**Constitution**: `.specify/memory/constitution.md` — authoritative for all product decisions  
**Git user**: Amna Iftikhar (`amnaiftikhar413@gmail.com`)

---

## Architecture

| Layer | Stack | Deployed on |
|-------|-------|-------------|
| Frontend (book) | Docusaurus 3.10.1, React 19, TypeScript | GitHub Pages |
| Backend (API/RAG) | FastAPI + uvicorn, Python, `google-generativeai` SDK | Railway (Docker) |
| Vector store | pgvector on Neon Postgres — table `chapter_chunks` | Neon free tier (same DB) |
| Relational DB | Neon Serverless Postgres — async via `asyncpg` | Neon free tier |
| Auth | JWT (HS256, 24h expiry) via `python-jose` + `bcrypt` | In-process |

---

## Running Locally

```powershell
# Backend — from C:\Hackathon 1\backend\
.venv\Scripts\uvicorn main:app --reload          # port 8000

# Frontend — from C:\Hackathon 1\book\
npm start                                         # port 3000
```

- Always use `.venv\Scripts\uvicorn` (not system uvicorn).
- Use **PowerShell tool** for all Windows paths — the Bash tool cannot resolve backslash paths.
- Backend health check: `GET http://localhost:8000/health` → `{"status":"ok","version":"1.0.8"}`
- Frontend test URL: `http://localhost:3000` (not 8000 — no root route on backend)

---

## Required Backend `.env`

File lives at `C:\Hackathon 1\backend\.env` (not tracked in git).

```
GOOGLE_API_KEY=...
DATABASE_URL=...             # Neon Postgres connection string (postgresql://)
CORS_ORIGINS=http://localhost:3000,https://Amna-Iftikhar418.github.io
JWT_SECRET_KEY=...           # or BETTER_AUTH_SECRET — used to sign/verify JWTs
```

`backend/config.py` collects (does not raise) missing vars into `MISSING_VARS`; `main.py` surfaces them via `/health` so Railway doesn't crash-loop on the old build.

---

## Models in Use

| Purpose | Model ID | Notes |
|---------|---------|-------|
| Chat / generation | `gemini-2.5-flash` | Switched from `gemini-2.0-flash` — free-tier quota exhausted |
| Personalization rewrite | `gemini-2.5-flash` | `personalization_model` in `agents.py` |
| Translation (Urdu) | `gemini-2.5-flash` | `translation_model` in `agents.py` |
| Embeddings | `models/gemini-embedding-2` | 3072 dims; `task_type` `retrieval_query`/`retrieval_document` |
| pgvector table | `chapter_chunks` | `score_threshold=0.70`, `top_k=5`, cosine similarity (`<=>`) |

> **Note**: The indexer (`index_to_qdrant.py`) uses `EMBEDDING_DIMS=3072`; the RAG query side (`rag.py`) uses the same model. These must stay in sync if the table is ever rebuilt.

---

## Complete File Map

### Backend (`backend/`)

| File | Role |
|------|------|
| `main.py` | FastAPI app entry, CORS middleware, lifespan (DB init), all routers loaded via try/except |
| `config.py` | Env var loading; `MISSING_VARS` list; `CORS_ORIGINS` normalized (lowercase, no trailing slash) |
| `auth.py` | JWT helpers: `create_access_token`, `hash_password`, `verify_password`, `verify_token`; uses `bcrypt` directly (no passlib) |
| `routers/health.py` | `GET /health` → `{"status":"ok","version":"1.0.8"}` |
| `routers/chat.py` | `POST /api/chat`, `POST /api/chat/select`; calls `_run_chat()` shared logic |
| `routers/auth.py` | `POST /api/auth/signup`, `POST /api/auth/signin`, `GET /api/auth/session`, `GET /api/user/profile` |
| `routers/personalize.py` | `POST /api/personalize` — fetches user profile + rewrites chapter |
| `routers/translate.py` | `POST /api/translate` — Urdu translation via Gemini |
| `services/rag.py` | Full RAG pipeline: `embed_query` → `search_qdrant` → `run_rag_query` |
| `services/agents.py` | Three Gemini models: `book_model`, `personalization_model`, `translation_model`; system prompts |
| `services/personalization.py` | `personalize_chapter()`: reads `docs_manifest.json`, calls `personalization_model` |
| `services/translation.py` | Translation service |
| `db/models.py` | SQLAlchemy models: `User`, `UserProfile`, `Conversation`, `Message`, `ChapterChunk` |
| `db/connection.py` | Async engine (asyncpg), strips `sslmode`/`channel_binding` from URL, injects SSL context |
| `db/migrations/` | Alembic migration versions |
| `subagents/index_to_qdrant.py` | One-shot indexer: reads `docs_manifest.json`, chunks, embeds, inserts to Neon Postgres (pgvector) |
| `scripts/build_manifest.py` | Builds `docs_manifest.json` from book MDX files |
| `utils/retry.py` | `with_retry()` — exponential backoff (2, 4, 8s) for `ResourceExhausted`/`ServiceUnavailable` |
| `Dockerfile` | Container for Railway deploy |

### Frontend (`book/`)

| File | Role |
|------|------|
| `docusaurus.config.ts` | Site config; `customFields.apiUrl` set via `DOCUSAURUS_API_URL` env var (falls back to `http://localhost:8000`) |
| `sidebars.ts` | Book sidebar structure |
| `src/lib/api-client.ts` | Chat API calls (`postChat`, `postChatSelect`); reads `apiUrl` from `siteConfig.customFields` |
| `src/lib/auth-client.ts` | `authClient` object: `signUp`, `signIn`, `signOut`, `getSession`, `getCachedUser`; stores JWT in `localStorage` |
| `src/theme/Root.tsx` | Global wrapper: FAB button, `SelectionButton` (text-selection → ask chat), `ChatPanel` |
| `src/theme/DocBreadcrumbs/index.tsx` | Swizzled breadcrumbs with Personalize/Translate buttons injected |
| `src/theme/DocItem/Layout/index.tsx` | Swizzled doc layout |
| `src/theme/Footer/index.tsx` | Custom footer (Neural Circuit theme) |
| `src/theme/Navbar/Content/index.tsx` | Custom navbar with auth button |
| `src/components/ChatWidget/ChatPanel.tsx` | Full chat panel UI |
| `src/components/ChatWidget/SelectionButton.tsx` | Floating "Ask about this" button on text selection |
| `src/components/ChatWidget/index.tsx` | ChatWidget barrel export |
| `src/components/Auth/AuthButton.tsx` | Sign-up / sign-in modal |
| `src/components/PersonalizationBar/PersonalizeButton.tsx` | Calls `POST /api/personalize`; injects skill-level context |
| `src/components/PersonalizationBar/TranslateButton.tsx` | Calls `POST /api/translate`; toggles Urdu translation |
| `src/pages/index.tsx` | Landing page |
| `src/pages/signup.tsx` | Dedicated sign-up page |
| `src/pages/signin.tsx` | Dedicated sign-in page |
| `src/css/custom.css` | Neural Circuit dark theme — all CSS custom properties |
| `src/lib/doc-override-context.tsx` | Context for doc content overrides (personalization display) |

### Root / CI

| File | Role |
|------|------|
| `railway.json` | Railway build config: `DOCKERFILE` builder at `backend/Dockerfile`, healthcheck `/health` timeout 120s |
| `.github/workflows/deploy-book.yml` | GitHub Actions: build Docusaurus → deploy to GitHub Pages (auto on push to `main`, plus `workflow_dispatch`) |
| `package.json` | Root-level (for any tooling); book has its own `book/package.json` |

---

## API Endpoints

| Method | Path | Auth | Request body | Response |
|--------|------|------|-------------|----------|
| GET | `/health` | — | — | `{"status":"ok","version":"1.0.8"}` |
| POST | `/api/chat` | — | `{query, session_id?, chapter_id?}` | `{answer, session_id, sources[]}` |
| POST | `/api/chat/select` | — | `{query, session_id?, chapter_id}` | `{answer, session_id, sources[]}` |
| POST | `/api/auth/signup` | — | `{email, password, software_level, python_familiarity, linux_familiarity, hardware_background, ai_ml_familiarity}` | `{user_id, token}` |
| POST | `/api/auth/signin` | — | `{email, password}` | `{user_id, token}` |
| GET | `/api/auth/session` | Bearer JWT | — | `{user_id, email}` |
| GET | `/api/user/profile` | Bearer JWT | — | `{user_id, email, profile:{...}}` |
| POST | `/api/personalize` | Bearer JWT (via body `user_id`) | `{user_id, chapter_id}` | `{personalized_content}` |
| POST | `/api/translate` | — | `{text, target_language}` | `{translated_text}` |

**Validation constraints for signup:**
- `software_level`: `beginner | intermediate | advanced`
- `python_familiarity`, `linux_familiarity`, `hardware_background`, `ai_ml_familiarity`: `none | basic | intermediate | advanced`

**Error conventions:**
- RAG failure → HTTP 503 `"RAG pipeline unavailable: {exc}"`
- DB write failure → non-fatal (rollback + proceed with response)
- Auth failure → 401; duplicate email → 409; bad enum → 422

---

## Data Models

### Postgres tables (auto-created via SQLAlchemy on startup)

```
users             id (UUID PK), email (unique), hashed_password, created_at
user_profiles     user_id (FK→users, PK), software_level, python_familiarity,
                  linux_familiarity, hardware_background, ai_ml_familiarity, created_at
conversations     id (UUID PK), user_id (nullable), chapter_id (nullable), created_at
messages          id (UUID PK), conversation_id (FK→conversations), role ('user'|'assistant'),
                  content, created_at
```

### pgvector table `chapter_chunks` (Neon Postgres)

```
Columns: id (BIGINT PK), chapter_id (TEXT, indexed), module_id (TEXT),
         heading (TEXT), text (TEXT), char_start (INT),
         embedding vector(3072)
Row ID: int from first 8 bytes of sha256(chapter_id:char_start)
Distance: cosine (<=> operator), score = 1 - distance
```

---

## Auth Implementation Details

- `backend/auth.py` uses `bcrypt` directly — **no passlib** (passlib 1.7.4 + bcrypt 4.x crashes on init)
- Password prehash: SHA-256 + base64 → 44 ASCII bytes (avoids bcrypt 72-byte limit)
- JWT algorithm: HS256, 24h expiry, signed with `JWT_SECRET_KEY`
- Frontend stores token in `localStorage` under key `physical_ai_auth_token`
- Frontend stores user under key `physical_ai_auth_user`

---

## Indexing Pipeline

To rebuild the pgvector index:
1. `python backend/scripts/build_manifest.py` — regenerates `backend/docs_manifest.json` from MDX files
2. `python backend/subagents/index_to_qdrant.py` — drops + recreates `chapter_chunks` table in Neon Postgres
   - Chunks: 2000 chars (~500 tokens), 200 char overlap
   - Batches of 10, 5s sleep between batches
   - **Drops and recreates table on every run**

Alternatively, use the `qdrant-indexer` Claude subagent: `.claude/agents/qdrant-indexer.md`

---

## Deployment Pipeline

- **Frontend**: `.github/workflows/deploy-book.yml` → GitHub Pages, auto-deploys on push to `main`
  - Sets `DOCUSAURUS_API_URL` to Railway backend URL during build
- **Backend**: Railway reads `railway.json`, builds `backend/Dockerfile`, auto-deploys on push to `main`
  - Env vars set in Railway dashboard
  - Healthcheck at `/health` (120s timeout)

---

## Known Pitfalls — Do NOT Reintroduce

1. **qdrant-client v1.18+**: `.search()` removed. Use `.query_points()`. Parameter is `query=` (not `query_vector=`). Results are `result.points`, not a list.

2. **Docusaurus + webpack 5**: `process` is not polyfilled in the browser. Never use `process.env.*` in client-side modules. Always use `import siteConfig from '@generated/docusaurus.config'` and read from `siteConfig.customFields.apiUrl`.

3. **Gemini quota**: `gemini-2.0-flash` and `gemini-2.0-flash-lite` have exhausted free-tier quota. Always use `gemini-2.5-flash`.

4. **Backend root route**: `GET /` → `{"detail":"Not Found"}` — expected, no root route exists. Never test the backend by hitting `http://localhost:8000/`.

5. **bcrypt — no passlib**: `passlib` was removed because `passlib 1.7.4 + bcrypt 4.x` crashes at import. Do not re-add passlib.

6. **CORS on error responses**: The `_catch_exceptions` HTTP middleware in `main.py` must remain registered **before** `CORSMiddleware.add_middleware()`. This ensures error responses pass through the CORS layer. If removed, 500s arrive CORS-less and fail silently in the browser.

7. **Optional routers at startup**: All four routers (chat, auth, personalize, translate) are imported inside try/except in `main.py`. A broken import never kills the server. If endpoints return 404, check Railway/local logs for `ROUTER LOAD ERROR`.

8. **Database SSL**: `db/connection.py` strips `sslmode` and `channel_binding` from the Neon connection URL and passes an `ssl` context via `connect_args`. Do not re-add these as URL params — asyncpg rejects them.

9. **Embedding dimensions mismatch**: The `chapter_chunks` table was created with `vector(3072)` (gemini-embedding-2). If you rebuild with a different model or dimension, you must drop and recreate the table.

10. **Chapter ID mapping**: The chat widget derives `chapter_id` from `window.location.pathname` by stripping `baseUrl`. The backend has a fallback: if `chapter_id` yields no chunks, it retries with `chapter_id + "/index"` (for module landing pages).

---

## Theme

The frontend uses the **Neural Circuit** dark theme defined in `book/src/css/custom.css`. Key CSS custom properties: deep navy/dark backgrounds, gold (`#d4a843`) headings, electric blue primary, monospace code blocks. The footer grid is hidden on doc pages (only copyright bar shown) via swizzled `Footer/index.tsx`.

---

## Agent Skills Available

| Skill | How to invoke |
|-------|--------------|
| Generate chapter outline | `/generate-chapter-outline` |
| Index book to pgvector | Use `qdrant-indexer` subagent (`.claude/agents/qdrant-indexer.md`) |
| Spec-driven workflows | `/sp.specify`, `/sp.plan`, `/sp.tasks`, `/sp.implement`, `/sp.phr`, `/sp.adr` |

---

## Development Guidelines

### Core policies
- Clarify intent before implementing. Keep business understanding separate from technical plan.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Do not invent APIs, data, or contracts — ask if missing.
- Never hardcode secrets or tokens; use `.env`.
- Cite existing code with `file_path:line_number` references.
- Default to writing no comments; only add one when the WHY is non-obvious.

### PHR (Prompt History Record) — create after every substantive request
- Route: `history/prompts/general/` (general tasks), `history/prompts/<feature-name>/` (feature work), `history/prompts/constitution/` (constitution changes)
- Template: `.specify/templates/phr-template.prompt.md`
- Skip PHR only for `/sp.phr` itself.

### ADR suggestions
When an architecturally significant decision is detected (long-term impact, alternatives considered, cross-cutting scope), suggest:
> "📋 Architectural decision detected: `<brief>` — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"

Never auto-create ADRs; wait for user consent.

### Execution contract for every request
1. Confirm surface and success criteria (one sentence).
2. List constraints, invariants, non-goals.
3. Produce the artifact with acceptance checks.
4. Add follow-ups and risks (max 3 bullets).
5. Create PHR.
6. Surface ADR suggestion if applicable.

---

## Project Structure

```
C:\Hackathon 1\
├── backend/              FastAPI app, RAG, auth, DB, indexer
│   ├── routers/          chat.py, auth.py, health.py, personalize.py, translate.py
│   ├── services/         rag.py, agents.py, personalization.py, translation.py
│   ├── db/               models.py, connection.py, migrations/
│   ├── subagents/        index_to_qdrant.py
│   ├── scripts/          build_manifest.py
│   ├── utils/            retry.py
│   ├── auth.py           JWT + bcrypt helpers
│   ├── config.py         env var loading
│   ├── main.py           app entry point
│   └── docs_manifest.json  chapter text for personalization + indexing
├── book/                 Docusaurus frontend
│   ├── docs/             MDX chapter files
│   ├── src/
│   │   ├── components/   ChatWidget/, Auth/, PersonalizationBar/
│   │   ├── theme/        Root.tsx, Footer/, Navbar/, DocBreadcrumbs/, DocItem/
│   │   ├── lib/          api-client.ts, auth-client.ts, doc-override-context.tsx
│   │   ├── pages/        index.tsx, signup.tsx, signin.tsx
│   │   └── css/          custom.css (Neural Circuit theme)
│   └── docusaurus.config.ts
├── specs/                Feature specs, plans, tasks
├── history/              PHRs and ADRs
├── .specify/             Constitution and templates
├── .claude/              Agent definitions and skills
├── railway.json          Railway deploy config
└── CLAUDE.md             ← this file
```

---

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.
