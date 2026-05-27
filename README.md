# Physical AI & Humanoid Robotics Textbook

An interactive, AI-powered university textbook on Physical AI and Humanoid Robotics, built with Spec-Driven Development. It pairs a full Docusaurus book with an embedded RAG chatbot that answers questions grounded exclusively in the book's content, along with user auth, per-chapter personalization, and Urdu translation.

- **Live book**: https://Amna-Iftikhar418.github.io/Physical-AI-Book/
- **Demo video**: _[placeholder — to be added after recording]_
- **Constitution** (authoritative product spec): `.specify/memory/constitution.md`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BOOK (Frontend)                         │
│  Docusaurus 3 + React 19 + TypeScript                       │
│  GitHub Pages — https://Amna-Iftikhar418.github.io/...      │
│                                                             │
│  ChatWidget │ AuthButton │ PersonalizeButton │ TranslateBtn │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTPS API calls
┌────────────────────────▼────────────────────────────────────┐
│                  RAG BACKEND (FastAPI)                       │
│  Python + uvicorn — Railway                                  │
│                                                             │
│  POST /api/chat          POST /api/chat/select              │
│  POST /api/personalize   POST /api/translate                │
│  GET  /api/auth/session  POST /api/auth/signup              │
│  POST /api/auth/signin   GET  /api/user/profile             │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
┌──────────▼──────────┐  ┌────────────▼──────────────────────┐
│   AUTH / RELATIONAL │  │   VECTOR STORE                    │
│   Neon Serverless   │  │   Qdrant Cloud                    │
│   Postgres          │  │   collection: chapter_chunks      │
│   users, profiles,  │  │   1536-dim Gemini embeddings      │
│   conversations     │  │   COSINE distance, score ≥ 0.70   │
└─────────────────────┘  └───────────────────────────────────┘
```

---

## Features

| Feature | Status | Points |
|---------|--------|--------|
| Full textbook (18 chapters, 4 modules) | Live | +100 base |
| RAG chatbot with citations | Live | (included) |
| Text-selection contextual Q&A | Live | (included) |
| Signup / signin with background survey | Live | +50 |
| Per-chapter AI personalization | Live | +50 |
| Urdu translation (code blocks preserved) | Live | +50 |
| Claude Code subagents + agent skills | Committed | +50 |

**Total: 300 / 300 pts**

---

## Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- Git

### Frontend (Docusaurus book)

```powershell
cd book
npm install
npm start            # http://localhost:3000
```

### Backend (FastAPI + RAG)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` (never committed):

```env
GOOGLE_API_KEY=<Google AI Studio key>
QDRANT_URL=<Qdrant Cloud cluster URL>
QDRANT_API_KEY=<Qdrant Cloud API key>
DATABASE_URL=<Neon Postgres connection string>
CORS_ORIGINS=http://localhost:3000,https://Amna-Iftikhar418.github.io
JWT_SECRET_KEY=<random 32+ char secret>
```

Run locally:

```powershell
.venv\Scripts\uvicorn main:app --reload   # http://localhost:8000
```

Health check:

```powershell
curl http://localhost:8000/health
# {"status":"ok","version":"1.0.0"}
```

### Index book content into Qdrant

```powershell
# From repo root
python backend/scripts/build_manifest.py        # builds backend/docs_manifest.json
python backend/subagents/index_to_qdrant.py     # embeds + upserts to Qdrant
```

---

## Reusable Intelligence

This project ships two committed, reusable Claude Code artifacts that are actively invoked during the authoring and indexing workflow (constitution Principle VI). Both live in `.claude/` and qualify for the +50 bonus.

### Agent Skill — `/generate-chapter-outline`

- **File**: `.claude/commands/generate-chapter-outline.md`
- **What it does**: Reads the constitution and `requirements.md` to confirm scope, then produces a structured Markdown outline for a requested chapter — H2 sections mapped to the 13-week breakdown, 3–5 sub-topic bullets per section, exactly one `[CODE EXAMPLE: ...]` placeholder per section, and one learning objective per section tied to the 6 course outcomes (LO1–LO6). It outlines only; it does not write the full chapter.
- **How to invoke**: `/generate-chapter-outline <chapter-id>`
  (e.g. `/generate-chapter-outline module-1-ros2/week-3-5-ros2-fundamentals`)
- **Expected output**: The outline, followed by a confirmation summary — chapter id, section count, estimated word count, and the learning outcomes covered.
- **When used**: Before writing each chapter MDX file (tasks T020–T037).

### Subagent — `qdrant-indexer`

- **File**: `.claude/agents/qdrant-indexer.md`
- **What it does**: Re-indexes the book into Qdrant after any chapter MDX changes. It verifies `backend/docs_manifest.json` exists (rebuilding it via `build_manifest.py` if missing), runs `backend/subagents/index_to_qdrant.py`, and reports chapters seen, chunks built, final point count in the `chapter_chunks` collection, and any failed `chapter_id`s.
- **How to invoke**: Reference the `qdrant-indexer` subagent in Claude Code, or run directly:

  ```powershell
  python backend/subagents/index_to_qdrant.py
  ```

- **Expected output**:

  ```
  Loaded manifest: <M> chapters
  Total chunks to index: <N>
  Indexing complete. Total points in collection: <N>
  ```

- **When used**: After writing or updating any chapter MDX, to keep the RAG index current.

---

## Deployment

| Component | Platform | Trigger |
|-----------|----------|---------|
| Book (frontend) | GitHub Pages | Push to `main` (`.github/workflows/deploy-book.yml`) |
| Backend (API) | Railway | Auto-deploy from `main` |
| Vector store | Qdrant Cloud | Manual re-index via `qdrant-indexer` subagent |
| Database | Neon Serverless Postgres | Alembic migrations |

---

## Project Structure

```
├── book/                   # Docusaurus 3 frontend
│   ├── docs/               # 18 chapter MDX files
│   ├── src/components/     # ChatWidget, Auth, PersonalizationBar
│   └── src/theme/          # Swizzled Navbar + Root + DocItem
├── backend/                # FastAPI RAG backend
│   ├── routers/            # chat, auth, personalize, translate
│   ├── services/           # rag.py, agents.py, personalization, translation
│   ├── db/                 # SQLAlchemy models + Alembic migrations
│   ├── subagents/          # index_to_qdrant.py
│   └── scripts/            # build_manifest.py
├── .claude/
│   ├── agents/             # qdrant-indexer subagent
│   └── commands/           # generate-chapter-outline skill
├── specs/                  # SDD spec, plan, tasks
└── history/                # Prompt History Records + ADRs
```

---

## Hackathon

**Panaversity Hackathon I** — Deadline: Nov 30, 2025  
Built by: Amna Iftikhar  
Scoring: 300 / 300 pts
