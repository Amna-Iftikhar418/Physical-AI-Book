# Implementation Plan: Physical AI & Humanoid Robotics Textbook

**Branch**: `main` | **Date**: 2026-05-26 | **Spec**: `specs/physical-ai-textbook/spec.md`
**Constitution**: `.specify/memory/constitution.md` v1.1.2
**Submission Deadline**: Nov 30, 2025 at 06:00 PM

---

## Summary

Build and deploy a publicly accessible AI-native textbook for the *Physical AI & Humanoid Robotics* university course. The system consists of:

1. A Docusaurus static site containing the full 4-module course textbook, deployed to GitHub Pages or Vercel.
2. An embedded RAG chatbot (FastAPI + Neon Postgres + Qdrant Cloud + Google Generative AI SDK) answering questions from book content, including text-selection-based queries.

Together these two components form the **P1 base gate (100 pts)**. Both must be live and functional at the submitted public URL before any bonus work begins.

**Maximum achievable score: 300 pts** (100 base + 4 × 50 bonus).

---

## 1. Requirements Mapping (MANDATORY)

Every line item from `requirements.md` is mapped below. Nothing is skipped.

| # | requirements.md Item | Implementation Phase | Priority |
|---|---------------------|---------------------|----------|
| R1 | Write a book using Docusaurus, deployed to GitHub Pages | Phase 1 | CORE |
| R2 | Use Spec-Kit Plus and Claude Code to write the book | All phases (process) | CORE |
| R3 | Build and embed a RAG chatbot within the published book | Phase 2 | CORE |
| R4 | Chatbot uses Google Generative AI SDK (`google-generativeai`) | Phase 2 | CORE |
| R5 | Chatbot uses FastAPI | Phase 2 | CORE |
| R6 | Chatbot uses Neon Serverless Postgres | Phase 2 | CORE |
| R7 | Chatbot uses Qdrant Cloud Free Tier | Phase 2 | CORE |
| R8 | Chatbot answers questions about book content | Phase 2 | CORE |
| R9 | Chatbot answers questions based on text selected by the user | Phase 2 | CORE |
| R10 | +50 pts: Reusable intelligence via Claude Code Subagents and Agent Skills | Phase 3A | BONUS |
| R11 | +50 pts: Signup and Signin using better-auth | Phase 3B | BONUS |
| R12 | +50 pts: Logged-in user asks background questions at signup (for personalization) | Phase 3B | BONUS |
| R13 | +50 pts: Logged-in user can personalize chapter content via button at chapter start | Phase 3C | BONUS |
| R14 | +50 pts: Logged-in user can translate chapter content to Urdu via button at chapter start | Phase 3D | BONUS |
| R15 | Submission: Public GitHub repository link | Phase 4 | CORE |
| R16 | Submission: Published book link (GitHub Pages or Vercel) — includes Book, ChatKit, all components | Phase 4 | CORE |
| R17 | Submission: Demo video ≤ 90 seconds | Phase 4 | CORE |
| R18 | Submission: WhatsApp number (for live presentation invitation) | Phase 4 | CORE |
| R19 | Submit via https://forms.gle/CQsSEGM3GeCrL43c8 before Nov 30, 2025 6:00 PM | Phase 4 | CORE |

**Coverage**: All 19 requirement items from requirements.md are mapped. ✅

---

## 2. Strategy Overview

**Score maximization order (strictly from requirements.md):**

```
100 pts (base)  → R1–R9: Docusaurus book + embedded RAG chatbot
+50 pts (bonus) → R10:   Claude Code Subagents + Agent Skills
+50 pts (bonus) → R11–R12: better-auth signup/signin + background survey
+50 pts (bonus) → R13:   Per-chapter content personalization
+50 pts (bonus) → R14:   Per-chapter Urdu translation
─────────────────────────────────────────────────────
300 pts maximum
```

**Critical constraint from requirements.md (item 3):**
> "Participants will receive points out of 100, for base functionality defined above."

Both R1 (Docusaurus book) and R3–R9 (RAG chatbot) must be deployed and functional together to receive the 100 base points. Neither alone qualifies. This is the **P1 gate** — it must be verified at the live public URL before any bonus phase begins.

**Bonus ordering rationale (strictly by dependencies):**
- R10 (Subagents/Skills) is independent of auth — implement first among bonus features
- R11–R12 (Auth) must precede R13 and R14, since personalization and translation require a logged-in user
- R13 (Personalization) and R14 (Urdu translation) are independent of each other; implement in parallel or sequentially

---

## 3. Feature Prioritization

### CORE (required for base 100 pts — both must ship together)

| Feature | Source | Must Ship Together |
|---------|--------|-------------------|
| Docusaurus book — all 4 modules, 13-week breakdown, 6 outcomes, 4 assessments, hardware | R1, R2 | Yes (P1 gate) |
| RAG chatbot embedded in book — Google Generative AI SDK, FastAPI, Neon, Qdrant | R3–R9 | Yes (P1 gate) |
| Text-selection-based querying | R9 | Yes (part of chatbot) |

### BONUS (explicitly defined extra points only — from requirements.md items 4–7)

| Feature | Source | Points | Dependency |
|---------|--------|--------|-----------|
| Claude Code Subagents + Agent Skills | R10 | +50 | None (independent) |
| better-auth signup/signin + background survey | R11–R12 | +50 | None |
| Per-chapter content personalization button | R13 | +50 | Requires R11–R12 (auth) |
| Per-chapter Urdu translation button | R14 | +50 | Requires R11–R12 (auth) |

**Nothing else is included.** No features, tools, or components beyond what requirements.md explicitly defines.

---

## 4. Development Phases

### Phase 1 — Book Creation System

**Requirements fulfilled**: R1, R2
**Gate**: Docusaurus site live at public URL with all chapters loading correctly.

#### 1.1 — Docusaurus Initialization

- Initialize Docusaurus 3.x project in `book/` directory using TypeScript template
- Configure `docusaurus.config.js`:
  - `title`: "Physical AI & Humanoid Robotics"
  - `url` + `baseUrl`: set to GitHub Pages URL or Vercel URL
  - `onBrokenLinks: 'throw'` — enforces no dead links
  - Disable blog plugin (not needed)
  - Set docs as root (`routeBasePath: '/'`)
- Configure `sidebars.js` with all 4 modules + hardware + assessments sections
- Install dependencies: `npm install`
- Verify: `npm run start` renders locally

**Files created**:
```
book/
├── docusaurus.config.js
├── sidebars.js
├── package.json
└── docs/
    └── intro.md     ← placeholder until content phases
```

#### 1.2 — Book Content: All 4 Modules

Write all chapter MDX files. Each file must contain factual Physical AI content — no fabricated technical specifications.

**Required file tree (mandated by spec and course structure from requirements.md):**

```
book/docs/
├── intro.md                                  ← Course overview
├── learning-outcomes.md                      ← 6 outcomes from requirements.md
├── hardware/
│   └── requirements.md                       ← Digital Twin Workstation, Edge Kit, Robot Lab tiers, Cloud
├── module-1-ros2/
│   ├── index.md                              ← Module 1 overview
│   ├── week-1-2-foundations.md               ← Physical AI, embodied intelligence, sensors (Weeks 1-2)
│   ├── week-3-5-ros2-fundamentals.md         ← ROS 2 arch, nodes, topics, services, actions (Weeks 3-5)
│   └── week-3-5-ros2-advanced.md             ← Python packages, launch files, URDF (Weeks 3-5 cont.)
├── module-2-digital-twin/
│   ├── index.md                              ← Module 2 overview
│   ├── week-6-7-gazebo.md                    ← Gazebo, URDF/SDF, physics/sensor simulation (Weeks 6-7)
│   └── week-6-7-unity.md                     ← Unity, HRI visualization (Weeks 6-7)
├── module-3-isaac/
│   ├── index.md                              ← Module 3 overview
│   ├── week-8-10-isaac-sim.md                ← Isaac SDK, Sim, synthetic data (Weeks 8-10)
│   ├── week-8-10-perception.md               ← VSLAM, Nav2, AI perception (Weeks 8-10)
│   └── week-8-10-sim-to-real.md              ← RL, Sim-to-Real transfer (Weeks 8-10)
├── module-4-vla/
│   ├── index.md                              ← Module 4 overview
│   ├── week-11-12-humanoid.md                ← Kinematics, dynamics, bipedal, grasping, HRI (Weeks 11-12)
│   └── week-13-conversational.md             ← GPT integration, Whisper, speech, multi-modal (Week 13)
└── assessments/
    └── index.md                              ← All 4 assessments with descriptions
```

**Content rules per chapter (strictly from R1, R2):**
- Minimum 800 words of factual technical content
- Code examples in fenced blocks (Python/ROS 2 where applicable)
- No hallucinated API signatures, hardware specs, or fabricated commands

#### 1.3 — GitHub Pages Deployment

- Create GitHub Actions workflow `.github/workflows/deploy-book.yml`:

```yaml
name: Deploy Book to GitHub Pages
on:
  push:
    branches: [main]
    paths: ['book/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd book && npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./book/build
```

- Push to `main` → verify live URL loads all chapter pages
- **PHASE 1 GATE**: All chapter pages load at live URL. Zero broken links (`npm run build` completes with no errors).

---

### Phase 2 — RAG Chatbot (MANDATORY CORE)

**Requirements fulfilled**: R3, R4, R5, R6, R7, R8, R9
**Gate**: Chatbot embedded in live Docusaurus site, answers questions from book content, text-selection trigger works.

#### 2.1 — FastAPI Backend Setup

**Requirement source**: R5 (FastAPI), R6 (Neon Postgres), R7 (Qdrant Cloud)

- Initialize `backend/` Python project:

```
backend/
├── main.py
├── routers/
│   ├── chat.py           ← POST /api/chat, POST /api/chat/select
│   └── health.py         ← GET /health
├── services/
│   └── rag.py            ← embedding + Qdrant search + Agents SDK call
├── subagents/
│   └── index_to_qdrant.py ← standalone indexer script
├── db/
│   ├── connection.py     ← asyncpg + SQLAlchemy async engine
│   ├── models.py         ← SQLAlchemy ORM: users, conversations, messages
│   └── migrations/       ← Alembic
├── config.py             ← env var loading (python-dotenv)
├── docs_manifest.json    ← generated: chapter_id → plain text map
└── requirements.txt
```

- `requirements.txt` dependencies:
  ```
  fastapi==0.111.*
  uvicorn[standard]
  google-generativeai
  qdrant-client
  asyncpg
  sqlalchemy[asyncio]
  alembic
  python-dotenv
  pydantic
  ```

- `GET /health` returns `{"status": "ok"}` — first endpoint implemented

**Environment variables required (never hardcoded)**:
```
GOOGLE_API_KEY=...                       ← Google AI Studio key (free, no credit card)
QDRANT_URL=...
QDRANT_API_KEY=...
DATABASE_URL=postgresql+asyncpg://...   ← Neon connection string
```

#### 2.2 — Neon Serverless Postgres: Schema

**Requirement source**: R6 (Neon Serverless Postgres)

Run Alembic migration to create schema:

```sql
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,              -- nullable; populated after Phase 3B (auth)
  chapter_id  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

*Note: `users` and `user_profiles` tables are added in Phase 3B (auth). This schema is sufficient for anonymous chat in Phase 2.*

#### 2.3 — Qdrant Cloud: Collection + Book Indexing

**Requirement source**: R7 (Qdrant Cloud Free Tier)

**Step 1 — Create collection** (one-time, via Python client; use `recreate_collection` for idempotency):
```python
client.recreate_collection(
    collection_name="chapter_chunks",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)
```

**Step 2 — Build `docs_manifest.json`** (script: `backend/scripts/build_manifest.py`):
- Read all MDX files from `book/docs/`
- Strip frontmatter, JSX, and Markdown syntax; extract plain text
- Output: `{ "module-1/week-3-5-ros2-fundamentals": "<full plain text>", ... }`

**Step 3 — Run `backend/subagents/index_to_qdrant.py`** (Subagent — also counted for R10):
- Read `docs_manifest.json`
- Chunk each chapter: ~500 tokens per chunk, 50-token overlap
- Embed each chunk: Google `text-embedding-004` (768 dims, task_type="retrieval_document")
  Batch 10 chunks per API call; sleep 5s between batches (keeps well under 15 RPM)
- Upsert to Qdrant `chapter_chunks` with payload:
  ```json
  {
    "chapter_id": "module-1/week-3-5-ros2-fundamentals",
    "module_id": "module-1",
    "heading": "<section heading>",
    "text": "<chunk text>",
    "char_start": 1240
  }
  ```
- Point ID = `sha256(chapter_id + char_start)` — idempotent re-runs

#### 2.4 — RAG Query Endpoint

**Requirement source**: R3, R4, R8 (RAG chatbot using Google Generative AI SDK)

`POST /api/chat` implementation in `backend/routers/chat.py`:

```python
@router.post("/api/chat")
async def chat(body: ChatRequest):
    # 1. Embed query (with retry)
    embedding = await embed_query(body.query)  # text-embedding-004, 768-dim
    # 2. Search Qdrant
    results = qdrant.search("chapter_chunks", embedding, limit=5, score_threshold=0.70)
    # 3. Assemble context
    context = "\n\n---\n\n".join(r.payload["text"] for r in results)
    # 4. Call Gemini (Google Generative AI SDK — with retry, no raw HTTP calls)
    answer = await run_rag_query(body.query, context)
    # 5. Persist to Neon
    await save_message(body.session_id, body.query, answer)
    return {"answer": answer, "sources": [...], "session_id": ...}
```

**Google Generative AI SDK agent** (`backend/services/agents.py`):
```python
import asyncio
import google.generativeai as genai
from backend.utils.retry import with_retry

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

book_model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction=(
        "You are a textbook assistant for a Physical AI & Humanoid Robotics course. "
        "Answer ONLY from the provided context. If the answer is not in the context, "
        "say explicitly: 'This topic is not covered in the book content provided.'"
    ),
)

async def run_rag_query(query: str, context: str) -> str:
    response = await with_retry(
        asyncio.to_thread,
        book_model.generate_content,
        f"Context:\n{context}\n\nQuestion: {query}"
    )
    return response.text
```

**Rate limit retry utility** (`backend/utils/retry.py`):
```python
import asyncio, random, logging
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable

async def with_retry(fn, *args, max_attempts=4, base_delay=2.0, **kwargs):
    for attempt in range(max_attempts):
        try:
            return await fn(*args, **kwargs)
        except (ResourceExhausted, ServiceUnavailable) as e:
            if attempt == max_attempts - 1:
                raise
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            logging.warning(f"Gemini rate limit (attempt {attempt+1}). Retry in {delay:.1f}s.")
            await asyncio.sleep(delay)
```

#### 2.5 — Text-Selection Query Endpoint

**Requirement source**: R9 (answering questions based on text selected by the user)

`POST /api/chat/select` — identical to `/api/chat` but Qdrant search is filtered by `chapter_id`:

```python
results = qdrant.search(
    "chapter_chunks",
    embedding,
    limit=5,
    score_threshold=0.70,
    query_filter=Filter(must=[FieldCondition(key="chapter_id", match=MatchValue(value=body.chapter_id))])
)
```

#### 2.6 — Chatbot Widget (Frontend)

**Requirement source**: R3 (embedded within the published book)

Components in `book/src/components/ChatWidget/`:

- **`ChatPanel.tsx`** — floating button (bottom-right), expands to 300×500px chat panel, input field, send button, response display with Markdown rendering, source citations
- **`SelectionButton.tsx`** — appears on text highlight ≥10 characters; positioned near selection via `getBoundingClientRect()`; on click: opens `ChatPanel` pre-filled with selected text + passes `chapter_id` from current page URL

**Text-selection listener** swizzled into `book/src/theme/Root.tsx`:
```typescript
document.addEventListener('mouseup', () => {
  const sel = window.getSelection();
  if (sel && sel.toString().trim().length >= 10) {
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    showSelectionButton(sel.toString(), rect);
  } else {
    hideSelectionButton();
  }
});
```

**Environment variable** `REACT_APP_API_URL` in `.env.production` (not committed) points to live FastAPI URL.

#### 2.7 — End-to-End Integration + Deployment

- Deploy FastAPI backend to Railway (or Render) with environment variables set in dashboard
- Set `REACT_APP_API_URL` in Docusaurus build config to backend live URL
- Re-deploy Docusaurus with chatbot widget bundle included
- **P1 GATE VERIFICATION** at live URL:
  - [ ] All chapter pages load
  - [ ] Chat panel opens and sends a question
  - [ ] Response is grounded in book content with citations
  - [ ] Text selection triggers floating button
  - [ ] Text-selection query returns chapter-scoped response
  - [ ] `GET /health` returns HTTP 200

**P1 gate must pass before Phase 3 begins. This is non-negotiable per constitution Principle VIII.**

---

### Phase 3A — Bonus: Subagents and Reusable Intelligence (+50 pts)

**Requirements fulfilled**: R10
**Source**: requirements.md item 4: "creating and using reusable intelligence via Claude Code Subagents and Agent Skills"

**Note**: This is independent of auth (R11–R12). It can be implemented immediately after P1 gate passes.

#### 3A.1 — Agent Skill: Chapter Outline Generator

File: `.claude/commands/generate-chapter-outline.md`

```markdown
# generate-chapter-outline

Generate a structured chapter outline for a Physical AI textbook topic.

## Usage
Invoked during book authoring to plan chapter structure before writing MDX content.

## Input variables
- $TOPIC — chapter topic (e.g., "ROS 2 Nodes and Topics")
- $MODULE — module number (1–4)
- $WEEKS — week range (e.g., "3-5")

## Steps
1. Read `.specify/memory/constitution.md` to confirm topic is within the 4-module scope.
2. Generate Markdown chapter outline:
   - H2 sections aligned to the weekly breakdown in the constitution
   - 3–5 bullet sub-topics per section
   - One code example placeholder per section
   - One learning objective per section tied to the 6 course outcomes
3. Output outline to stdout (author pastes into docs/ file).
```

#### 3A.2 — Subagent: Qdrant Indexer

File: `.claude/agents/qdrant-indexer.md`

```markdown
# qdrant-indexer

Subagent that indexes updated book content into Qdrant Cloud.

## When to invoke
After any chapter MDX file is created or significantly updated.

## Steps
1. Run: python backend/subagents/index_to_qdrant.py
2. Confirm output: "Indexed N chunks across M chapters. Collection: chapter_chunks."
3. If errors occur, report the chapter_id that failed.
```

Implementation file: `backend/subagents/index_to_qdrant.py` (already built in Phase 2.3).

#### 3A.3 — Documentation

- Add "Reusable Intelligence" section to `README.md`:
  - Describe what each artifact does
  - Show invocation command
  - Show expected output
- **Both artifacts must be committed to the repository**

**Phase 3A Gate**: Both `.claude/commands/generate-chapter-outline.md` and `.claude/agents/qdrant-indexer.md` exist in repo. README section is complete.

---

### Phase 3B — Bonus: Authentication with better-auth (+50 pts)

**Requirements fulfilled**: R11, R12
**Source**: requirements.md item 5: "Signup and Signin using better-auth. At signup you will ask questions from the user about their software and hardware background."

**Note**: R13 (personalization) and R14 (Urdu translation) both require auth. Phase 3B must complete before 3C or 3D.

#### 3B.1 — Backend: better-auth Setup

Install in `backend/`:
```
better-auth
```

Configure in `backend/auth.py`:
```python
from better_auth import BetterAuth, PostgresAdapter
auth = BetterAuth(
    adapter=PostgresAdapter(database_url=os.environ["DATABASE_URL"]),
    secret=os.environ["BETTER_AUTH_SECRET"],
    base_url=os.environ["BETTER_AUTH_BASE_URL"],
)
```

New environment variables:
```
BETTER_AUTH_SECRET=...
BETTER_AUTH_BASE_URL=https://<backend-live-url>
```

#### 3B.2 — Database: Auth Tables + User Profiles

Alembic migration:
```sql
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- better-auth manages password_hash and sessions internally

CREATE TABLE user_profiles (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  software_level      TEXT NOT NULL CHECK (software_level IN ('beginner','intermediate','advanced')),
  python_familiarity  TEXT NOT NULL CHECK (python_familiarity IN ('none','basic','proficient')),
  linux_familiarity   TEXT NOT NULL CHECK (linux_familiarity IN ('none','basic','proficient')),
  hardware_background TEXT NOT NULL CHECK (hardware_background IN ('none','hobbyist','professional')),
  ai_ml_familiarity   TEXT NOT NULL CHECK (ai_ml_familiarity IN ('none','basic','proficient')),
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

#### 3B.3 — Auth Endpoints

`backend/routers/auth.py`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signup` | POST | Create user, save profile, return session token |
| `/api/auth/signin` | POST | Verify credentials, return session token |
| `/api/auth/session` | GET | Verify token, return user_id + email |
| `/api/user/profile` | GET | Return user_id + email + all 5 profile fields |

Signup request body (all fields required):
```json
{
  "email": "string",
  "password": "string",
  "profile": {
    "software_level": "beginner|intermediate|advanced",
    "python_familiarity": "none|basic|proficient",
    "linux_familiarity": "none|basic|proficient",
    "hardware_background": "none|hobbyist|professional",
    "ai_ml_familiarity": "none|basic|proficient"
  }
}
```

#### 3B.4 — Frontend: Auth UI in Docusaurus

Install in `book/`:
```
better-auth
```

Configure `book/src/lib/auth-client.ts`:
```typescript
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({ baseURL: process.env.REACT_APP_API_URL });
```

Components:
- `book/src/components/Auth/AuthButton.tsx` — swizzled into Navbar; shows "Sign In / Sign Up" (logged out) or email + "Sign Out" (logged in)
- `book/src/pages/signup.tsx` — form: email, password, 5 survey dropdowns (all required)
- `book/src/pages/signin.tsx` — form: email, password

**Phase 3B Gate** at live URL:
- [ ] Signup with all 5 fields creates user and returns session token
- [ ] `GET /api/user/profile` returns all 5 profile fields
- [ ] Signin restores session; navbar shows email
- [ ] Session persists on page refresh (localStorage)
- [ ] Duplicate email returns error

---

### Phase 3C — Bonus: Content Personalization (+50 pts)

**Requirements fulfilled**: R13
**Source**: requirements.md item 6: "logged user can personalise the content in the chapters by pressing a button at the start of each chapter"
**Dependency**: Phase 3B (auth) must be complete.

#### 3C.1 — Backend: Personalization Endpoint

`POST /api/personalize` in `backend/routers/personalize.py`:

```python
@router.post("/api/personalize")
async def personalize(body: PersonalizeRequest, token: str = Depends(get_session)):
    user_id = verify_token(token)
    profile = await get_user_profile(user_id)       # FROM Neon Postgres
    chapter_text = docs_manifest[body.chapter_id]   # FROM docs_manifest.json
    response = await with_retry(
        asyncio.to_thread,
        personalization_model.generate_content,
        f"Reader profile: {profile}\n\nChapter:\n{chapter_text}"
    )
    return {"personalized_text": response.text}
```

Google Generative AI SDK model:
```python
personalization_model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction=(
        "Rewrite the following textbook chapter for a reader with the given profile. "
        "Keep all technical facts, code examples, and section headings intact. "
        "Adjust vocabulary, depth, and assumed prerequisites to match the reader's level."
    ),
)
```

#### 3C.2 — Frontend: Personalization Button

`book/src/components/PersonalizationBar/PersonalizeButton.tsx`:
- Rendered at the **top of every chapter MDX page** via a custom MDX component
- **Visible only to authenticated users** (checked via `authClient.useSession()`)
- On click: calls `POST /api/personalize`, shows loading indicator, replaces page content with personalized text
- "Back to original" link always visible above personalized content; click reloads the page

**Phase 3C Gate**:
- [ ] Button hidden for unauthenticated users
- [ ] Personalized text returned and displayed within 30 seconds
- [ ] All code blocks and technical terms preserved in personalized text
- [ ] "Back to original" reloads original chapter

---

### Phase 3D — Bonus: Urdu Translation (+50 pts)

**Requirements fulfilled**: R14
**Source**: requirements.md item 7: "logged user can translate the content in Urdu in the chapters by pressing a button at the start of each chapter"
**Dependency**: Phase 3B (auth) must be complete. Independent of Phase 3C.

#### 3D.1 — Backend: Translation Endpoint

`POST /api/translate` in `backend/routers/translate.py`:

```python
@router.post("/api/translate")
async def translate(body: TranslateRequest, token: str = Depends(get_session)):
    verify_token(token)
    chapter_text = docs_manifest[body.chapter_id]
    response = await with_retry(asyncio.to_thread, translation_model.generate_content, chapter_text)
    return {"translated_text": response.text}
```

Google Generative AI SDK model:
```python
translation_model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction=(
        "Translate the following technical textbook chapter to Urdu. "
        "Preserve ALL code blocks verbatim in English. "
        "Preserve technical terms (ROS 2, URDF, NVIDIA Isaac, etc.) in English within Urdu prose. "
        "Translate all prose sentences to Urdu."
    ),
)
```

#### 3D.2 — Frontend: Translation Button

`book/src/components/PersonalizationBar/TranslateButton.tsx`:
- Rendered at the **top of every chapter** alongside PersonalizeButton
- **Visible only to authenticated users**
- On click: calls `POST /api/translate`, shows loading indicator, replaces chapter prose with Urdu
- "Switch to English" toggle appears; click restores original content

**Phase 3D Gate**:
- [ ] Button hidden for unauthenticated users
- [ ] Urdu translation displayed within 30 seconds
- [ ] All fenced code blocks (```` ``` ``` ``) unchanged (English)
- [ ] "Switch to English" restores original content

---

### Phase 4 — Final Submission Assets

**Requirements fulfilled**: R15, R16, R17, R18, R19

#### 4.1 — Make Repository Public

- Go to GitHub repo Settings → change visibility to Public
- Verify the repo URL is publicly accessible without login

#### 4.2 — README.md

`README.md` at repo root must contain:
- Project title and description
- Architecture diagram (ASCII)
- Setup instructions: book (npm), backend (Python), env vars
- **"Reusable Intelligence" section** (required for R10 evaluation):
  - `.claude/commands/generate-chapter-outline.md` — what it does, how to invoke
  - `.claude/agents/qdrant-indexer.md` — what it does, how to invoke
- Live URL of the deployed book
- Link to demo video

#### 4.3 — Demo Video (≤ 90 seconds)

The demo video MUST show (in under 90 seconds, per requirements.md R17):
1. The deployed book URL loading in browser
2. Navigating to a chapter page
3. Typing a question in the chatbot and getting an answer
4. Selecting text in a chapter → floating "Ask about this" button appearing → chat pre-filled
5. (If time permits) Signup with survey, personalization button, Urdu translation button

**Recording tool**: Loom or NotebookLM (explicitly mentioned in requirements.md submission section).

#### 4.4 — Final Deployment Verification

Before submitting, verify at the live public URL:
- [ ] All chapter pages accessible (0 broken links)
- [ ] `GET /health` → HTTP 200
- [ ] Chat widget loads and responds
- [ ] Text-selection trigger works
- [ ] (If Phase 3B done) Signup and signin work
- [ ] (If Phase 3C done) Personalization button works for logged-in users
- [ ] (If Phase 3D done) Translation button works for logged-in users

#### 4.5 — Submit via Form

Submit the following at https://forms.gle/CQsSEGM3GeCrL43c8 **before Nov 30, 2025 at 06:00 PM**:
1. Public GitHub repository link
2. Deployed book URL (GitHub Pages or Vercel) — must include Book + ChatKit + all bonus components
3. Demo video link (≤ 90 seconds, Loom or NotebookLM)
4. WhatsApp number (for live presentation invitation)

---

## 5. Timeline Plan

All blocks are relative to project start day. Core (P1) must complete before bonus phases.

| Block | Days | Phase | Deliverable |
|-------|------|-------|-------------|
| Block 1 | Day 1–2 | Phase 1 | Docusaurus initialized, sidebar configured, `intro.md` written |
| Block 2 | Day 3–6 | Phase 1 | All 14 chapter MDX files written (4 modules + hardware + assessments) |
| Block 3 | Day 7 | Phase 1 | GitHub Actions workflow, Docusaurus live on GitHub Pages |
| Block 4 | Day 8–9 | Phase 2 | FastAPI project initialized, `/health` live, Neon schema migrated, Qdrant collection created |
| Block 5 | Day 10 | Phase 2 | `index_to_qdrant.py` runs, all chapters indexed in Qdrant |
| Block 6 | Day 11–12 | Phase 2 | `/api/chat` and `/api/chat/select` endpoints implemented and tested locally |
| Block 7 | Day 13 | Phase 2 | ChatWidget + SelectionButton built in Docusaurus, integrated with FastAPI URL |
| Block 8 | Day 14 | Phase 2 | **P1 GATE**: Full deployment verified at live URL — book + chatbot functional |
| Block 9 | Day 15 | Phase 3A | Agent Skill + Subagent files committed, README Reusable Intelligence section written |
| Block 10 | Day 16–17 | Phase 3B | better-auth backend + auth endpoints + Neon auth schema |
| Block 11 | Day 18–19 | Phase 3B | Auth UI in Docusaurus (signup form, signin form, navbar button) |
| Block 12 | Day 20 | Phase 3B | **Phase 3B Gate**: Signup + signin + profile verified at live URL |
| Block 13 | Day 21–22 | Phase 3C | Personalization endpoint + PersonalizeButton component |
| Block 14 | Day 23–24 | Phase 3D | Translation endpoint + TranslateButton component |
| Block 15 | Day 25 | Phase 4 | README complete, repo public, demo video recorded |
| Block 16 | Day 26 | Phase 4 | Final verification + form submission before deadline |

**Buffer**: Days 27–30 reserved for fixes, deployment issues, or re-recording the demo video.

---

## 6. Dependencies & Order

```
Phase 1: Book Creation
    │
    └─► Phase 1 Gate (book live at URL) ──────────────────────┐
                                                               │
Phase 2: RAG Chatbot (depends on Phase 1 book content)        │
    │    (needs docs indexed into Qdrant)                      │
    │                                                          │
    └─► P1 Gate (book + RAG both live) ◄───────────────────── ┘
            │
            ├─► Phase 3A: Subagents/Skills (independent — no auth needed)
            │
            ├─► Phase 3B: Auth (better-auth)
            │       │
            │       ├─► Phase 3C: Personalization (requires auth)
            │       │
            │       └─► Phase 3D: Urdu Translation (requires auth)
            │
            └─► Phase 4: Submission Assets (requires all phases complete)
```

**Strict rules**:
- Phase 2 cannot begin until Phase 1 content is complete (Qdrant indexing requires MDX files)
- Phase 3C and 3D cannot begin until Phase 3B (auth) is deployed and verified
- Phase 4 (submission) cannot begin until all intended features are verified at live URL
- Phase 3A is the only bonus phase with no dependency — it can begin immediately after P1 gate

---

## 7. Risk Analysis

Risks are identified strictly from required components (requirements.md). No speculative risks added.

| Risk | Component | Likelihood | Impact | Mitigation |
|------|-----------|-----------|--------|-----------|
| Google AI 15 RPM rate limit hit during rapid evaluation | R4: Gemini SDK | Low | Low | Exponential backoff retry (2s/4s/8s) in `backend/utils/retry.py` handles transient 429s; indexing uses 5s batch pacing |
| Qdrant Free Tier storage exceeded | R7: Qdrant Cloud Free Tier | Low | Low | 14 chapters × avg 20 chunks × 768 dims ≈ 2MB — well within 1GB limit |
| Neon Postgres connection pool exhausted (serverless cold start) | R6: Neon Serverless | Medium | Medium | Use `asyncpg` connection pooling; configure min=1 max=5 |
| FastAPI backend cold start causes chat timeout | R5: FastAPI deployment | Medium | Medium | Deploy to Railway with always-on (or Render with spin-up); set frontend timeout to 15s with retry UI |
| GitHub Pages deployment delay (CDN cache) | R1: GitHub Pages | Low | Low | Wait 5 minutes post-deploy; hard-refresh during verification |
| better-auth client/server version mismatch | R11: better-auth | Medium | Medium | Pin versions in both `requirements.txt` and `package.json`; test signup end-to-end before moving to Phase 3C |
| LLM response time exceeds 30s for personalization/translation | R13, R14: Gemini SDK | Medium | Low | Frontend loading indicator + "may take up to 30 seconds" message; frontend timeout 45s; retry wrapper handles transient errors |
| Demo video exceeds 90 seconds | R17: Submission | Low | High | Script and rehearse demo before recording; aim for 80 seconds to allow buffer |

---

## 8. Deliverables Checklist (STRICT)

These match the submission requirements from requirements.md exactly.

### CORE Deliverables (R1–R9)

- [ ] **Docusaurus book** deployed at public URL
  - [ ] Module 1 — The Robotic Nervous System (ROS 2): all chapters
  - [ ] Module 2 — The Digital Twin (Gazebo & Unity): all chapters
  - [ ] Module 3 — The AI-Robot Brain (NVIDIA Isaac™): all chapters
  - [ ] Module 4 — Vision-Language-Action (VLA): all chapters
  - [ ] Hardware requirements page
  - [ ] Learning outcomes page
  - [ ] Assessments page
  - [ ] Zero broken links at live URL
- [ ] **RAG chatbot** embedded in every Docusaurus page
  - [ ] Chat panel opens on button click
  - [ ] Answers grounded in book content (not fabricated)
  - [ ] Returns source citations (chapter_id + heading)
  - [ ] Text-selection trigger appears on highlight ≥ 10 chars
  - [ ] Text-selection query is filtered to current chapter

### BONUS Deliverables (R10–R14)

- [ ] **Claude Code Subagents + Agent Skills** (R10, +50 pts)
  - [ ] `.claude/commands/generate-chapter-outline.md` committed
  - [ ] `.claude/agents/qdrant-indexer.md` committed
  - [ ] README "Reusable Intelligence" section complete
- [ ] **better-auth signup/signin + background survey** (R11–R12, +50 pts)
  - [ ] All 5 survey fields required and saved to Neon Postgres
  - [ ] Session persists on page refresh
  - [ ] Navbar reflects auth state
- [ ] **Content personalization button** (R13, +50 pts)
  - [ ] Button at top of every chapter (logged-in only)
  - [ ] Original content always restorable
- [ ] **Urdu translation button** (R14, +50 pts)
  - [ ] Button at top of every chapter (logged-in only)
  - [ ] Code blocks preserved in English
  - [ ] "Switch to English" toggle works

### Submission Assets (R15–R19)

- [ ] **Public GitHub repository link** (R15)
- [ ] **Deployed book URL** (GitHub Pages or Vercel) — includes book + chatbot + all bonus features (R16)
- [ ] **Demo video ≤ 90 seconds** — shows deployed book, chatbot answering, text-selection (R17)
- [ ] **WhatsApp number** (R18)
- [ ] **Form submitted** at https://forms.gle/CQsSEGM3GeCrL43c8 before Nov 30, 2025 6:00 PM (R19)

---

## 9. Validation Step

**Does this plan fully cover ALL requirements.md? YES.**

| requirements.md Item | Covered in Plan | Phase |
|---------------------|----------------|-------|
| R1: Docusaurus book on GitHub Pages | ✅ | Phase 1 |
| R2: Use Spec-Kit Plus + Claude Code | ✅ | All phases (process constraint) |
| R3: Embed RAG chatbot in book | ✅ | Phase 2 |
| R4: Google Generative AI SDK (`google-generativeai`) | ✅ | Phase 2.4, 2.5 |
| R5: FastAPI | ✅ | Phase 2.1 |
| R6: Neon Serverless Postgres | ✅ | Phase 2.2 |
| R7: Qdrant Cloud Free Tier | ✅ | Phase 2.3 |
| R8: Chatbot answers questions about book content | ✅ | Phase 2.4 |
| R9: Chatbot answers based on user-selected text | ✅ | Phase 2.5, 2.6 |
| R10: Claude Code Subagents + Agent Skills (+50) | ✅ | Phase 3A |
| R11: better-auth signup/signin (+50) | ✅ | Phase 3B |
| R12: Background survey at signup (+50, shared with R11) | ✅ | Phase 3B |
| R13: Personalization button per chapter (+50) | ✅ | Phase 3C |
| R14: Urdu translation button per chapter (+50) | ✅ | Phase 3D |
| R15: Public GitHub repo | ✅ | Phase 4.1 |
| R16: Deployed book URL (book + chatkit + all components) | ✅ | Phase 4.4 |
| R17: Demo video ≤ 90 seconds | ✅ | Phase 4.3 |
| R18: WhatsApp number | ✅ | Phase 4.5 |
| R19: Submit form by Nov 30, 2025 6:00 PM | ✅ | Phase 4.5 |

**Missing requirements**: None.
**Invented requirements not in requirements.md**: None.

---

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Node.js 20 (frontend)
**Primary Dependencies**: FastAPI 0.111+, Docusaurus 3.x, google-generativeai (latest), qdrant-client, better-auth, asyncpg, SQLAlchemy 2.0
**Storage**: Neon Serverless Postgres (relational), Qdrant Cloud (vectors)
**Testing**: Manual browser testing (UI), `pytest` (backend endpoints), end-to-end gate checks at live URL
**Target Platform**: Static CDN (GitHub Pages / Vercel) + Railway/Render cloud (FastAPI)
**Performance Goals**: Page load ≤ 3s; chat response ≤ 8s; personalization/translation ≤ 30s
**Constraints**: Free tiers only (Qdrant, Neon, Railway/Render); no additional databases or vector stores

## Constitution Check

All 8 constitution principles satisfied:

| Principle | Check |
|-----------|-------|
| I — Content-First: all 4 modules, 13 weeks, 6 outcomes, 4 assessments, hardware | ✅ Phase 1.2 |
| II — Unified 3-layer deployable system | ✅ Phases 1, 2, 3B |
| III — RAG from book only, text-selection UI, Qdrant, Neon, Google Generative AI SDK | ✅ Phase 2 |
| IV — No hardcoded secrets, better-auth, 5 survey questions | ✅ Phase 2.1 (env vars), Phase 3B |
| V — Buttons at chapter start, logged-in only, original preserved | ✅ Phase 3C, 3D |
| VI — Subagents + Skills committed and documented | ✅ Phase 3A |
| VII — Smallest viable diff: P1 before P2–P5, no speculative features | ✅ Phase ordering |
| VIII — GitHub Pages/Vercel, /health, single public URL | ✅ Phase 1.3, 2.1, 4.4 |

## Project Structure

```
C:\Hackathon 1\
├── book/                            ← Docusaurus static site (Phase 1)
│   ├── docusaurus.config.js
│   ├── sidebars.js
│   ├── package.json
│   ├── docs/                        ← All 14 chapter MDX files
│   └── src/
│       ├── components/
│       │   ├── ChatWidget/          ← ChatPanel.tsx, SelectionButton.tsx (Phase 2)
│       │   ├── Auth/                ← AuthButton.tsx, SignupForm.tsx (Phase 3B)
│       │   └── PersonalizationBar/  ← PersonalizeButton.tsx, TranslateButton.tsx (Phase 3C/3D)
│       ├── lib/
│       │   ├── auth-client.ts       ← better-auth client (Phase 3B)
│       │   └── api-client.ts        ← fetch wrapper for FastAPI
│       └── theme/
│           └── Root.tsx             ← text-selection listener (Phase 2)
├── backend/                         ← FastAPI (Phase 2)
│   ├── main.py
│   ├── routers/
│   │   ├── chat.py
│   │   ├── health.py
│   │   ├── auth.py                  ← Phase 3B
│   │   ├── personalize.py           ← Phase 3C
│   │   └── translate.py             ← Phase 3D
│   ├── services/
│   │   ├── agents.py                ← 3 GenerativeModel instances (book, personalize, translate)
│   │   └── rag.py
│   ├── utils/
│   │   └── retry.py                 ← with_retry() exponential backoff (handles 429)
│   ├── subagents/
│   │   └── index_to_qdrant.py       ← Phase 2.3 + Phase 3A
│   ├── db/
│   │   ├── models.py
│   │   └── migrations/
│   ├── docs_manifest.json           ← generated from book/docs/
│   └── requirements.txt
├── .claude/
│   ├── commands/
│   │   └── generate-chapter-outline.md  ← Agent Skill (Phase 3A)
│   └── agents/
│       └── qdrant-indexer.md             ← Subagent definition (Phase 3A)
├── .github/
│   └── workflows/
│       └── deploy-book.yml          ← Phase 1.3
├── specs/
│   └── physical-ai-textbook/
│       ├── spec.md
│       └── plan.md                  ← This file
├── .specify/
│   └── memory/
│       └── constitution.md
├── .env                             ← local only, in .gitignore
├── .gitignore                       ← must include .env
└── README.md                        ← Phase 4.2
```

## Complexity Tracking

No constitution violations. All technology choices are within the fixed stack. No additional databases, vector stores, or deployment targets introduced beyond what requirements.md specifies.
