
# Feature Specification: Physical AI & Humanoid Robotics Textbook — Full System

**Feature Branch**: `main`
**Created**: 2026-05-26
**Status**: Draft
**Version**: 1.0.0
**Constitution Reference**: `.specify/memory/constitution.md` v1.1.2

---

## 1. System Overview

### 1.1 Purpose

Build and deploy a publicly accessible, AI-native textbook for the university course *Physical AI & Humanoid Robotics*. The system allows any reader to read the full book through a Docusaurus website, ask questions about the content through an embedded RAG chatbot, and — when authenticated — personalize chapter content or translate it to Urdu.

The system is the sole submission for Hackathon I (Panaversity). It must be live at a single public URL that serves the book, the embedded chatbot widget, and all bonus features by **Nov 30, 2025, 6:00 PM**. The project is authored using **Spec-Kit Plus** (https://github.com/panaversity/spec-kit-plus/) and **Claude Code** throughout all phases.

### 1.2 Core Components

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| Book Frontend | Docusaurus (React/TypeScript) | Renders all 4 modules, weekly breakdown, assessments, hardware docs |
| Chatbot Widget | Google Generative AI SDK (client calls via FastAPI) | In-page Q&A UI, text-selection trigger |
| RAG Backend | FastAPI (Python) | Query processing, embedding, retrieval, response generation |
| Vector Store | Qdrant Cloud (Free Tier) | Stores and retrieves chapter chunk embeddings |
| Relational DB | Neon Serverless Postgres | User profiles, sessions, conversation metadata |
| Auth System | better-auth | Signup/signin, session tokens, background survey storage |
| AI Orchestration | Google Generative AI SDK (`google-generativeai`) | RAG pipeline, personalization LLM calls, translation LLM calls |
| Subagents/Skills | Claude Code Subagents + Agent Skills | Reusable content generation and indexing workflows |
| Deployment | GitHub Pages (book) + Railway/Render (API) | Single submitted public URL |

### 1.3 Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  BOOK LAYER — Docusaurus (GitHub Pages / Vercel)            │
│  • Chapter pages (MDX)                                       │
│  • Chatbot widget embed                                       │
│  • Auth UI (signup, signin, session display)                  │
│  • Personalization button (per chapter, logged-in only)       │
│  • Translation button (per chapter, logged-in only)           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS API calls
┌────────────────────────▼────────────────────────────────────┐
│  AI/RAG LAYER — FastAPI (public HTTPS endpoint)             │
│  • POST /api/chat          — RAG query                       │
│  • POST /api/chat/select   — text-selection RAG query        │
│  • POST /api/personalize   — LLM-personalized chapter        │
│  • POST /api/translate     — Urdu translation                 │
│  • GET  /health            — liveness probe                   │
│  Google Generative AI SDK orchestrates all LLM calls         │
└────┬───────────────────────────────────────┬────────────────┘
     │                                       │
┌────▼──────────────┐             ┌──────────▼──────────────┐
│  Qdrant Cloud     │             │  Neon Serverless Postgres│
│  • chapter_chunks │             │  • users                 │
│    collection     │             │  • user_profiles         │
│  • 768-dim vecs   │             │  • sessions              │
│  • payload:       │             │  • conversations         │
│    chapter_id,    │             │  • messages              │
│    module_id,     │             └─────────────────────────┘
│    text, heading  │
└───────────────────┘
```

The three layers are independently deployable. A failure in the AI/RAG layer MUST NOT crash the book frontend.

---

## 2. Feature Specifications

### 2.1 AI-Driven Book Creation — P1 (Base, 100 pts combined with RAG)

#### 2.1.1 Scope

Write the complete textbook content as Docusaurus MDX pages, strictly following the course structure codified in Constitution Principle I. All content must be grounded in real Physical AI / ROS 2 / Gazebo / Isaac / VLA facts — no hallucinated specifications.

#### 2.1.2 Content Structure (Non-Negotiable)

**Site navigation tree:**

```
docs/
├── intro.md                         ← Welcome + course overview
├── hardware/
│   └── requirements.md              ← Digital Twin Workstation, Edge Kit, Robot Lab tiers, Cloud
├── module-1-ros2/
│   ├── index.md                     ← Module 1 overview
│   ├── week-1-2-foundations.md      ← Physical AI, embodied intelligence, humanoid landscape, sensors
│   ├── week-3-5-ros2-fundamentals.md ← ROS 2 arch, nodes, topics, services, actions, Python packages
│   └── week-3-5-ros2-advanced.md    ← Launch files, parameter management, URDF
├── module-2-digital-twin/
│   ├── index.md                     ← Module 2 overview
│   ├── week-6-7-gazebo.md           ← Gazebo setup, URDF/SDF, physics/sensor simulation
│   └── week-6-7-unity.md            ← Unity intro, high-fidelity rendering, HRI
├── module-3-isaac/
│   ├── index.md                     ← Module 3 overview
│   ├── week-8-10-isaac-sim.md       ← Isaac SDK, Isaac Sim, synthetic data
│   ├── week-8-10-perception.md      ← AI perception, VSLAM, Nav2, manipulation
│   └── week-8-10-sim-to-real.md     ← Reinforcement learning, Sim-to-Real transfer
├── module-4-vla/
│   ├── index.md                     ← Module 4 overview
│   ├── week-11-12-humanoid.md       ← Kinematics, dynamics, bipedal locomotion, grasping, HRI design
│   └── week-13-conversational.md    ← GPT integration, Whisper, speech recognition, multi-modal
├── assessments/
│   └── index.md                     ← All 4 assessments with rubrics
└── learning-outcomes.md             ← 6 learning outcomes
```

**Content requirements per page:**
- Minimum 800 words of technical content (no padding)
- Code examples in fenced blocks (Python/ROS 2 where applicable)
- At least one conceptual diagram (ASCII or Mermaid) per module index
- No invented API signatures, hardware specs, or command outputs

#### 2.1.3 Docusaurus Configuration

```js
// docusaurus.config.js (key settings)
{
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'AI Systems in the Physical World. Embodied Intelligence.',
  url: '<GITHUB_PAGES_URL>',
  baseUrl: '/<REPO_NAME>/',
  organizationName: '<GITHUB_ORG>',
  projectName: '<REPO_NAME>',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  presets: [['classic', { docs: { routeBasePath: '/' }, blog: false }]],
}
```

#### 2.1.4 Deployment

- **Primary**: GitHub Pages via `gh-pages` branch — triggered by GitHub Actions on push to `main`
- **Alternative**: Vercel with `docusaurus build` output directory `build/`
- The chatbot widget JavaScript bundle MUST be injected as a custom script in `docusaurus.config.js` `scripts` array so it loads on every page
- Environment variable `REACT_APP_API_URL` MUST point to the live FastAPI backend URL

---

### 2.2 Embedded RAG Chatbot — P1 (Base, 100 pts combined with book)

#### 2.2.1 Chatbot Widget (Frontend)

The chatbot widget MUST be embedded directly in every Docusaurus page — not as a separate page or external link.

**Widget behavior:**
- Renders as a floating chat button (bottom-right corner) on all pages
- Expands into an inline chat panel (300px × 500px) on click
- Text field + send button for typed queries
- Displays assistant responses with Markdown rendering
- **Text-selection trigger**: When user selects text anywhere in a chapter, a floating action button ("Ask about this") appears near the selection. Clicking it pre-fills the chat input with the selected text and opens the panel.

**Text-selection implementation:**
```typescript
// src/theme/Root.tsx (Docusaurus swizzle)
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 10) {
    showSelectionButton(selection.toString(), selection.getRangeAt(0).getBoundingClientRect());
  } else {
    hideSelectionButton();
  }
});
```

#### 2.2.2 RAG Backend (FastAPI)

**Indexing pipeline** (run once, then on content update):
1. Read all MDX files from `docs/` directory
2. Strip MDX frontmatter and JSX; extract plain text
3. Chunk text into ~500-token segments with 50-token overlap
4. Generate embeddings via Google `text-embedding-004` (768 dimensions, task_type="retrieval_document")
5. Upsert vectors into Qdrant `chapter_chunks` collection with payload:
   ```json
   {
     "chapter_id": "module-1/week-3-5-ros2-fundamentals",
     "module_id": "module-1",
     "heading": "ROS 2 Nodes and Topics",
     "text": "<chunk text>",
     "char_start": 1240
   }
   ```

**Query pipeline (per user message):**
1. Receive `{ query: string, chapter_id?: string, selected_text?: string, session_id?: string }` from frontend
2. Embed the query using Google `text-embedding-004` (task_type="retrieval_query")
3. Search Qdrant `chapter_chunks` (top-5, cosine similarity); filter by `chapter_id` if `selected_text` is present
4. Assemble context string from retrieved chunks
5. Call Gemini via Google Generative AI SDK with system prompt: *"You are a textbook assistant. Answer ONLY from the provided context. If the answer is not in the context, say so explicitly."*
6. Stream the response back to the frontend
7. Persist message pair to Neon Postgres `messages` table

**Google Generative AI SDK usage:**
```python
import asyncio
import google.generativeai as genai

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

book_model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction=SYSTEM_PROMPT,
)

async def run_rag_query(query: str, context_chunks: list[str]) -> str:
    context = "\n\n---\n\n".join(context_chunks)
    response = await with_retry(
        asyncio.to_thread,
        book_model.generate_content,
        f"Context:\n{context}\n\nQuestion: {query}"
    )
    return response.text
```

Rate limit handling via `backend/utils/retry.py` — exponential backoff (2s/4s/8s) on 429
ResourceExhausted and 503 ServiceUnavailable errors. All three agent calls and embed calls
use `with_retry`.

---

### 2.3 Authentication System — P3 (+50 pts)

#### 2.3.1 better-auth Setup

better-auth is installed in the FastAPI backend as the authoritative auth server. The Docusaurus frontend uses the better-auth client SDK for session management.

**Backend** (`backend/auth.py`):
```python
from better_auth import BetterAuth, PostgresAdapter

auth = BetterAuth(
    adapter=PostgresAdapter(database_url=os.environ["DATABASE_URL"]),
    secret=os.environ["BETTER_AUTH_SECRET"],
    base_url=os.environ["BETTER_AUTH_BASE_URL"],
)
```

**Frontend** (`src/lib/auth-client.ts`):
```typescript
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: process.env.REACT_APP_API_URL,
});
```

#### 2.3.2 Signup Background Survey

At signup the system MUST collect and persist the following 5 fields (all required):

| Field | Type | Options |
|-------|------|---------|
| `software_level` | enum | `beginner` / `intermediate` / `advanced` |
| `python_familiarity` | enum | `none` / `basic` / `proficient` |
| `linux_familiarity` | enum | `none` / `basic` / `proficient` |
| `hardware_background` | enum | `none` / `hobbyist` / `professional` |
| `ai_ml_familiarity` | enum | `none` / `basic` / `proficient` |

These are collected on the signup form immediately after email/password. They are stored in `user_profiles` table (FK → `users.id`) and used ONLY for personalization.

#### 2.3.3 Auth UI in Docusaurus

Custom React components swizzled into Docusaurus Navbar:
- `<AuthButton />` — shows "Sign In" / "Sign Up" when logged out; shows user email + "Sign Out" when logged in
- `/signup` page — email, password, + 5 survey dropdowns
- `/signin` page — email + password
- Session state stored in `localStorage` via better-auth client; checked on every page load

---

### 2.4 Content Personalization — P4 (+50 pts)

#### 2.4.1 Behavior

A "Personalize for Me" button appears at the **top of every chapter page**, visible only to authenticated users. Non-authenticated users do not see this button.

On click:
1. Frontend calls `POST /api/personalize` with `{ chapter_id, user_id }`
2. Backend fetches user profile from Neon Postgres
3. Backend fetches full chapter MDX text from a pre-built JSON manifest (`docs-manifest.json`)
4. Backend calls Google Generative AI SDK with:
   - System prompt: *"You are a technical writing assistant. Rewrite the following chapter for a reader with this profile: {profile}. Keep all technical facts, code examples, and section headings intact. Adjust vocabulary, depth of explanation, and assumed prerequisites to match the reader's level."*
   - User message: full chapter text
5. Returns rewritten chapter text (Markdown)
6. Frontend renders the rewritten text in a modal or replaces the page content (with a "Back to original" link always visible)

#### 2.4.2 Constraints

- The original chapter content MUST remain accessible (never overwritten)
- Personalization is session-scoped; it does not persist between sessions
- This feature MUST NOT be built until P1 and P3 are both deployed and verified

---

### 2.5 Urdu Translation — P5 (+50 pts)

#### 2.5.1 Behavior

A "Translate to Urdu" button appears at the **top of every chapter page**, visible only to authenticated users, alongside the personalization button.

On click:
1. Frontend calls `POST /api/translate` with `{ chapter_id }`
2. Backend fetches full chapter MDX text from `docs-manifest.json`
3. Backend calls Google Generative AI SDK with:
   - System prompt: *"Translate the following technical textbook chapter to Urdu. Preserve all code blocks, technical terms (ROS 2, NVIDIA Isaac, URDF, etc.), and section headings in their original English. Translate all prose to Urdu."*
   - User message: full chapter text
4. Returns translated text (Markdown with English code blocks preserved)
5. Frontend replaces the displayed chapter text with the translated version
6. A "Switch to English" toggle button appears at the top; clicking it restores the original content

#### 2.5.2 Constraints

- This feature MUST NOT be built until P1 and P3 are both deployed and verified
- Code blocks and technical term names MUST NOT be translated

---

### 2.6 Subagents and Reusable Intelligence — P2 (+50 pts)

#### 2.6.1 Required Artifacts

Two concrete, committed, and documented artifacts:

**Artifact 1 — Agent Skill: Chapter Outline Generator**

File: `.claude/commands/generate-chapter-outline.md`

```markdown
# generate-chapter-outline

Generate a structured chapter outline for a given Physical AI textbook topic.

## Input
- $TOPIC: The chapter topic (e.g., "ROS 2 Nodes and Topics")
- $MODULE: Module number (1–4)
- $WEEKS: Week range (e.g., "3-5")

## Behavior
1. Read the constitution at `.specify/memory/constitution.md` to confirm the topic
   is within the approved course scope.
2. Generate a Markdown chapter outline with:
   - H2 sections matching the weekly breakdown
   - Bullet sub-topics per section (3-5 bullets)
   - One code example placeholder per section
   - Learning objective per section tied to the 6 course outcomes
3. Output the outline to `docs/<module-dir>/<filename>.md.outline`
```

**Artifact 2 — Subagent: Qdrant Indexer**

File: `backend/subagents/index_to_qdrant.py`

```python
"""
Subagent: index_to_qdrant
Invoked by: /sp.tasks or manually during content updates
Purpose: Chunk all MDX docs, embed them, and upsert into Qdrant chapter_chunks collection.
Idempotent: Uses content hash as Qdrant point ID — safe to re-run.
"""
```

This script is invoked as a Claude Code Subagent via `.claude/agents/qdrant-indexer.md` which instructs Claude to run `python backend/subagents/index_to_qdrant.py` after any chapter is written or updated.

#### 2.6.2 Documentation Requirements

Both artifacts MUST be described in `README.md` under a "Reusable Intelligence" section with:
- What each artifact does
- How to invoke it
- What output it produces

Both MUST be demonstrated in the 90-second demo video.

---

## 3. Technical Architecture

### 3.1 Frontend — Docusaurus

| Aspect | Decision |
|--------|----------|
| Version | Docusaurus 3.x (latest stable) |
| Language | TypeScript + React |
| Docs format | MDX (Markdown + JSX) |
| Routing | Docusaurus built-in (`/` → docs root) |
| Custom components | `src/components/ChatWidget/`, `src/components/Auth/`, `src/components/PersonalizationBar/` |
| Swizzled themes | `Root.tsx` (text-selection listener), `Navbar/` (auth button) |
| Build output | `build/` directory (static HTML/CSS/JS) |
| Environment vars | `REACT_APP_API_URL` — base URL of FastAPI backend |

**Directory layout:**
```
book/
├── docusaurus.config.js
├── sidebars.js
├── package.json
├── docs/                    ← all chapter MDX files
├── src/
│   ├── components/
│   │   ├── ChatWidget/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── SelectionButton.tsx
│   │   │   └── index.tsx
│   │   ├── Auth/
│   │   │   ├── AuthButton.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── SigninForm.tsx
│   │   └── PersonalizationBar/
│   │       ├── PersonalizeButton.tsx
│   │       └── TranslateButton.tsx
│   ├── lib/
│   │   ├── auth-client.ts
│   │   └── api-client.ts
│   └── theme/
│       └── Root.tsx          ← text-selection listener
└── static/
```

### 3.2 Backend — FastAPI

| Aspect | Decision |
|--------|----------|
| Version | FastAPI 0.111+ (latest stable) |
| Language | Python 3.11+ |
| ASGI server | Uvicorn |
| AI orchestration | `google-generativeai` SDK (latest stable) |
| Embedding model | `text-embedding-004` (768 dims, free with Google AI key) |
| LLM model | `gemini-2.0-flash` (free tier: 1500 RPD, 15 RPM) |
| Auth integration | better-auth Python adapter |
| DB client | `asyncpg` + SQLAlchemy 2.0 (async) |
| Vector client | `qdrant-client` (Python) |
| Env management | `python-dotenv` |

**Directory layout:**
```
backend/
├── main.py                  ← FastAPI app, router registration
├── routers/
│   ├── chat.py              ← /api/chat, /api/chat/select
│   ├── personalize.py       ← /api/personalize
│   ├── translate.py         ← /api/translate
│   └── health.py            ← /health
├── services/
│   ├── rag.py               ← embedding, Qdrant search, agent call
│   ├── personalization.py   ← profile fetch, LLM rewrite
│   └── translation.py       ← LLM translation
├── subagents/
│   └── index_to_qdrant.py   ← standalone indexing script
├── db/
│   ├── connection.py        ← Neon Postgres async engine
│   ├── models.py            ← SQLAlchemy ORM models
│   └── migrations/          ← Alembic migrations
├── auth.py                  ← better-auth initialization
├── config.py                ← env var loading + validation
├── docs_manifest.json       ← pre-built map: chapter_id → full text
└── requirements.txt
```

### 3.3 Database — Neon Serverless Postgres

**Schema:**

```sql
-- Users (managed by better-auth, extended here)
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- better-auth sessions table (managed internally by better-auth)
-- Session tokens are JWTs stored client-side.

CREATE TABLE user_profiles (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  software_level      TEXT NOT NULL CHECK (software_level IN ('beginner','intermediate','advanced')),
  python_familiarity  TEXT NOT NULL CHECK (python_familiarity IN ('none','basic','proficient')),
  linux_familiarity   TEXT NOT NULL CHECK (linux_familiarity IN ('none','basic','proficient')),
  hardware_background TEXT NOT NULL CHECK (hardware_background IN ('none','hobbyist','professional')),
  ai_ml_familiarity   TEXT NOT NULL CHECK (ai_ml_familiarity IN ('none','basic','proficient')),
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
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
```

**Indexes:**
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
```

### 3.4 Vector DB — Qdrant Cloud

**Collection configuration:**
```python
from qdrant_client.models import Distance, VectorParams

client.recreate_collection(
    collection_name="chapter_chunks",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)
```

**Point structure:**
```json
{
  "id": "<sha256 of chapter_id + char_start>",
  "vector": [0.023, -0.117, ...],
  "payload": {
    "chapter_id": "module-1/week-3-5-ros2-fundamentals",
    "module_id": "module-1",
    "heading": "ROS 2 Nodes and Topics",
    "text": "A ROS 2 node is the fundamental unit of computation...",
    "char_start": 1240
  }
}
```

**Search parameters:**
- Top-K: 5 results
- Score threshold: 0.70 (discard irrelevant matches)
- Filter: `chapter_id` match when `selected_text` query is received

### 3.5 AI/Agents Integration

All LLM calls route through the Google Generative AI SDK (`google-generativeai`). No raw HTTP LLM calls outside the SDK boundary are permitted. All SDK calls are wrapped with `with_retry()` for exponential backoff on 429/503 responses.

**Three distinct agents:**

| Agent | Model | Purpose |
|-------|-------|---------|
| `BookAssistant` | gemini-2.0-flash | RAG Q&A — answers from book context only |
| `PersonalizationAgent` | gemini-2.0-flash | Rewrites chapter text for user profile |
| `TranslationAgent` | gemini-2.0-flash | Translates chapter to Urdu |

Each agent is defined once in `backend/services/agents.py` and reused across requests.

### 3.6 Deployment Strategy

| Component | Platform | Method |
|-----------|---------|--------|
| Docusaurus book | GitHub Pages | GitHub Actions workflow: `npm run build` → deploy `build/` to `gh-pages` branch |
| FastAPI backend | Railway (or Render free tier) | Dockerfile, auto-deploy on push to `main`, env vars set in Railway dashboard |
| Qdrant | Qdrant Cloud Free Tier | Managed; API key stored in `QDRANT_API_KEY` env var |
| Neon Postgres | Neon Free Tier | Connection string in `DATABASE_URL` env var |
| Indexing | Manual (subagent script) | Run `python backend/subagents/index_to_qdrant.py` after content changes |

**GitHub Actions workflow** (`.github/workflows/deploy-book.yml`):
```yaml
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

---

## 4. Data Flow

### 4.1 Standard Chat Query

```
User types question in ChatWidget
        │
        ▼
ChatWidget → POST /api/chat
  { query, session_id?, chapter_id? }
        │
        ▼
FastAPI: rag.py
  1. Embed query → text-embedding-004 (task_type="retrieval_query") → vector[768]
  2. Qdrant search(chapter_chunks, vector, top=5, score_threshold=0.70)
  3. Assemble context = join(chunk.text for chunk in results)
  4. book_model.generate_content(f"Context:\n{context}\n\nQuestion: {query}")
  5. Save to Neon: conversations + messages (user + assistant)
        │
        ▼
Response: { answer, source_chunks: [{chapter_id, heading}] }
        │
        ▼
ChatWidget renders answer + source citations
```

### 4.2 Text-Selection Query

```
User selects text in chapter page
        │
        ▼
Root.tsx mouseup listener fires
SelectionButton appears at selection coordinates
        │
User clicks "Ask about this"
        │
        ▼
ChatWidget opens + pre-fills input with selected_text
User optionally adds a question, clicks Send
        │
        ▼
POST /api/chat/select
  { query: selected_text + user_question, chapter_id, selected_text }
        │
        ▼
FastAPI: same RAG pipeline but Qdrant search
  filtered by chapter_id (narrows retrieval to the same chapter)
```

### 4.3 Personalization Flow

```
Authenticated user clicks "Personalize for Me" on chapter page
        │
        ▼
POST /api/personalize
  { chapter_id }
  Authorization: Bearer <session_token>
        │
        ▼
FastAPI: personalization.py
  1. Verify session token → get user_id
  2. SELECT * FROM user_profiles WHERE user_id = ?
  3. Read chapter text from docs_manifest.json[chapter_id]
  4. personalization_model.generate_content(f"Profile: {profile}\n\nChapter:\n{chapter_text}")
        │
        ▼
Response: { personalized_text: "..." }
        │
        ▼
Frontend replaces chapter content with personalized version
"Back to original" link reloads page
```

### 4.4 Urdu Translation Flow

```
Authenticated user clicks "Translate to Urdu" on chapter page
        │
        ▼
POST /api/translate
  { chapter_id }
  Authorization: Bearer <session_token>
        │
        ▼
FastAPI: translation.py
  1. Verify session token → get user_id (must be authenticated)
  2. Read chapter text from docs_manifest.json[chapter_id]
  3. translation_model.generate_content(chapter_text)
        │
        ▼
Response: { translated_text: "..." }
        │
        ▼
Frontend replaces chapter content with Urdu version
"Switch to English" toggle restores original
```

### 4.5 Signup + Survey Flow

```
User fills signup form: email, password, 5 survey dropdowns
        │
        ▼
POST /api/auth/signup (better-auth)
  { email, password, profile: { software_level, python_familiarity,
    linux_familiarity, hardware_background, ai_ml_familiarity } }
        │
        ▼
better-auth: creates user record, hashes password
FastAPI hook: INSERT INTO user_profiles (user_id, ...) VALUES (...)
        │
        ▼
Response: session token → stored in localStorage by better-auth client
User redirected to book homepage (authenticated state)
```

---

## 5. API Design

All endpoints are served by the FastAPI backend. Base URL: `REACT_APP_API_URL`.

### 5.1 Health

```
GET /health
Response 200: { "status": "ok", "version": "1.0.0" }
```

### 5.2 Chat — Standard Query

```
POST /api/chat
Content-Type: application/json

Request:
{
  "query": string,           // required, 1–2000 chars
  "session_id": string?,     // optional, UUID; creates new conversation if absent
  "chapter_id": string?      // optional; e.g. "module-1/week-3-5-ros2-fundamentals"
}

Response 200:
{
  "answer": string,
  "session_id": string,       // new or existing conversation UUID
  "sources": [
    {
      "chapter_id": string,
      "heading": string,
      "score": float
    }
  ]
}

Response 422: { "detail": "query must be between 1 and 2000 characters" }
Response 503: { "detail": "RAG service temporarily unavailable" }
```

### 5.3 Chat — Text-Selection Query

```
POST /api/chat/select
Content-Type: application/json

Request:
{
  "selected_text": string,    // required, the DOM-selected text (max 1000 chars)
  "question": string?,        // optional follow-up question
  "chapter_id": string,       // required for filtered retrieval
  "session_id": string?
}

Response 200: same schema as /api/chat
Response 400: { "detail": "chapter_id is required for text-selection queries" }
```

### 5.4 Auth — Signup

```
POST /api/auth/signup
Content-Type: application/json

Request:
{
  "email": string,
  "password": string,          // min 8 chars
  "profile": {
    "software_level": "beginner" | "intermediate" | "advanced",
    "python_familiarity": "none" | "basic" | "proficient",
    "linux_familiarity": "none" | "basic" | "proficient",
    "hardware_background": "none" | "hobbyist" | "professional",
    "ai_ml_familiarity": "none" | "basic" | "proficient"
  }
}

Response 201: { "user_id": string, "token": string }
Response 409: { "detail": "email already registered" }
Response 422: { "detail": "all profile fields are required" }
```

### 5.5 Auth — Signin

```
POST /api/auth/signin
Content-Type: application/json

Request: { "email": string, "password": string }

Response 200: { "user_id": string, "token": string }
Response 401: { "detail": "invalid credentials" }
```

### 5.6 Auth — Session

```
GET /api/auth/session
Authorization: Bearer <token>

Response 200: { "user_id": string, "email": string }
Response 401: { "detail": "invalid or expired token" }
```

### 5.7 Personalization

```
POST /api/personalize
Authorization: Bearer <token>
Content-Type: application/json

Request: { "chapter_id": string }

Response 200: { "personalized_text": string }
Response 401: { "detail": "authentication required" }
Response 404: { "detail": "chapter not found" }
Response 503: { "detail": "LLM service temporarily unavailable" }
```

### 5.8 Translation

```
POST /api/translate
Authorization: Bearer <token>
Content-Type: application/json

Request: { "chapter_id": string }

Response 200: { "translated_text": string }
Response 401: { "detail": "authentication required" }
Response 404: { "detail": "chapter not found" }
Response 503: { "detail": "LLM service temporarily unavailable" }
```

### 5.9 User Profile

```
GET /api/user/profile
Authorization: Bearer <token>

Response 200:
{
  "user_id": string,
  "email": string,
  "profile": {
    "software_level": string,
    "python_familiarity": string,
    "linux_familiarity": string,
    "hardware_background": string,
    "ai_ml_familiarity": string
  }
}
Response 401: { "detail": "authentication required" }
```

---

## 6. User Flows

### 6.1 Reading the Book and Asking Questions (Unauthenticated)

1. User opens the deployed book URL
2. Docusaurus renders the intro page; sidebar shows all 4 modules
3. User clicks into any chapter; full MDX content renders
4. User clicks the chat button (bottom-right) — chat panel opens
5. User types: *"What is a ROS 2 node?"*
6. System returns answer sourced from `module-1/week-3-5-ros2-fundamentals` with citation
7. User can continue the conversation in the same session

**Acceptance criteria:**
- [ ] Book loads at public URL within 3 seconds
- [ ] All sidebar links resolve to existing pages
- [ ] Chat panel opens and closes correctly
- [ ] Response cites at least one source chapter

### 6.2 Text-Selection Contextual Q&A

1. User is reading a chapter (any page)
2. User clicks and drags to highlight a paragraph about URDF
3. A floating "Ask about this" button appears near the selection
4. User clicks it — chat panel opens with selected text pre-filled
5. User adds: *"Can you give me an example?"*
6. System queries Qdrant filtered to that chapter, returns answer from the same chapter's content

**Acceptance criteria:**
- [ ] Selection button appears after highlighting ≥10 characters
- [ ] Selection button disappears when selection is cleared
- [ ] Chat panel pre-fills with selected text
- [ ] Response is scoped to the current chapter's content

### 6.3 Signup and Login

1. User clicks "Sign Up" in navbar
2. Signup form: email, password, 5 survey dropdowns (all required)
3. On submit: account created, profile saved, session token stored
4. Navbar changes to show user email + "Sign Out"
5. Returning user clicks "Sign In" — email + password form — session restored

**Acceptance criteria:**
- [ ] All 5 survey fields are required; form does not submit with missing fields
- [ ] Duplicate email returns a clear error
- [ ] After signup, user is logged in immediately (no separate signin step)
- [ ] Session persists on page refresh

### 6.4 Personalizing Chapter Content

1. Authenticated user opens any chapter
2. "Personalize for Me" button visible at top of chapter (non-authenticated users do not see it)
3. User clicks — loading indicator appears
4. Within ≤30 seconds: chapter content is replaced with a personalized version
5. "Back to original" link is always visible above the personalized content
6. Clicking "Back to original" reloads the page (restores default content)

**Acceptance criteria:**
- [ ] Button is hidden for unauthenticated users
- [ ] API call includes valid session token
- [ ] Personalized text maintains all technical terms and code blocks
- [ ] "Back to original" always restores the default content

### 6.5 Translating a Chapter to Urdu

1. Authenticated user opens any chapter
2. "Translate to Urdu" button visible at top alongside personalization button
3. User clicks — loading indicator appears
4. Within ≤30 seconds: chapter prose is replaced with Urdu; code blocks remain in English
5. "Switch to English" button appears at top
6. Clicking "Switch to English" restores the English content

**Acceptance criteria:**
- [ ] Button is hidden for unauthenticated users
- [ ] Code blocks (```` ``` ````) are NOT translated
- [ ] Technical terms within prose (e.g., "ROS 2", "URDF", "Isaac Sim") are NOT translated
- [ ] "Switch to English" toggle always works

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target |
|--------|--------|
| Docusaurus initial page load | ≤3 seconds (Lighthouse Performance ≥80) |
| Chat RAG response (p95) | ≤8 seconds (network + embedding + Qdrant + LLM) |
| Retry budget | Up to 3 retries with exponential backoff (2s → 4s → 8s) on 429 / 503 |
| Frontend timeout | 45 seconds (covers one full retry cycle) |
| Personalization response | ≤30 seconds (full chapter LLM rewrite) |
| Translation response | ≤30 seconds (full chapter LLM translation) |
| Auth signup/signin | ≤2 seconds |

### 7.2 Scalability

- Docusaurus is a static site — scales to unlimited readers through CDN (GitHub Pages / Vercel Edge)
- FastAPI backend runs as a single Uvicorn instance on free tier; handles burst via Railway auto-sleep/wake
- Qdrant Free Tier: 1GB storage, sufficient for ~200k text chunks from this textbook
- Neon Free Tier: 0.5GB storage; sufficient for user profiles + conversation history for evaluation period

### 7.3 Security

| Control | Implementation |
|---------|---------------|
| No hardcoded secrets | All secrets via `.env` (local) and platform env vars (deployed); `.env` in `.gitignore` |
| Password storage | better-auth handles hashing (bcrypt); raw passwords never stored |
| Session tokens | JWT managed by better-auth; short expiry (24 hours) |
| API key exposure | Google AI / Qdrant / Neon keys only in backend env vars; never sent to frontend |
| CORS | FastAPI `CORSMiddleware` with allowed origins: Docusaurus site URL only |
| Input validation | Pydantic models on all FastAPI request bodies; max length enforced |
| SQL injection | SQLAlchemy ORM parameterized queries only; no raw SQL string interpolation |
| XSS | React auto-escapes; any HTML from LLM is rendered via `react-markdown` (sanitized) |

### 7.4 Cost Constraints (Free Tiers Only)

| Service | Free Tier Limit | Usage Estimate |
|---------|----------------|----------------|
| Qdrant Cloud | 1GB storage, 1 cluster | ~5MB for full textbook embeddings — well within limit |
| Neon Postgres | 0.5GB, 1 database | <10MB for evaluation period users |
| Google AI (Gemini + Embeddings) | Free tier: 1500 RPD, 15 RPM, no expiry | $0 — well within free tier for hackathon evaluation |
| Railway | 500 compute hours/month free | Sufficient for demo period |
| GitHub Pages | Unlimited for public repos | No cost |

No additional paid services may be introduced.

---

## 8. Evaluation Mapping

| Hackathon Criterion | Points | Spec Section | Constitution Principle | Done-When |
|--------------------|--------|-------------|----------------------|-----------|
| Docusaurus book deployed + all 4 modules written | 100 pts (shared with RAG) | §2.1, §3.1 | I, II, VIII | Live URL serves all chapter pages; 0 broken links |
| RAG chatbot embedded + answers from book | 100 pts (shared with book) | §2.2, §4.1 | III, VIII | Chat widget answers correctly, cites chapter sources |
| Text-selection-based querying | (part of RAG) | §2.2.1, §4.2, §6.2 | III | Selection button appears, query is chapter-scoped |
| Claude Code Subagents + Agent Skills | +50 pts | §2.6 | VI | Both artifacts in repo; demonstrated in video + README |
| better-auth signup/signin + survey | +50 pts | §2.3, §6.3 | IV | All 5 survey fields persisted; session works |
| Per-chapter content personalization | +50 pts | §2.4, §6.4 | V | Button works for logged-in users; original preserved |
| Per-chapter Urdu translation | +50 pts | §2.5, §6.5 | V | Translation works; code blocks untouched; toggle works |
| **Maximum** | **300 pts** | | | |

**P1 Gate**: Both the book AND the chatbot must be live at the public URL together before any P2–P5 work is claimed complete.

---

## 9. Implementation Plan

### Phase 1 — P1 Gate: Book + RAG (Must complete before all else)

| Step | Task | Output |
|------|------|--------|
| 1.1 | Initialize Docusaurus 3 project in `book/` with TypeScript | `book/` directory, `npm run start` works locally |
| 1.2 | Write `docs/intro.md` and `docs/hardware/requirements.md` | 2 content pages |
| 1.3 | Write Module 1 chapter pages (Weeks 1-2, 3-5) | 3 MDX files |
| 1.4 | Write Module 2 chapter pages (Weeks 6-7) | 2 MDX files |
| 1.5 | Write Module 3 chapter pages (Weeks 8-10) | 3 MDX files |
| 1.6 | Write Module 4 chapter pages (Weeks 11-12, 13) | 3 MDX files |
| 1.7 | Write `docs/assessments/index.md` and `docs/learning-outcomes.md` | 2 files |
| 1.8 | Configure Docusaurus: sidebar, nav, theme, `REACT_APP_API_URL` env | `docusaurus.config.js` + `sidebars.js` complete |
| 1.9 | Deploy Docusaurus to GitHub Pages via GitHub Actions | Live book URL — verify all pages load |
| 1.10 | Initialize FastAPI project in `backend/` with `/health` endpoint | `GET /health` returns `{"status":"ok"}` at live URL |
| 1.11 | Set up Neon Postgres — run migrations (users, user_profiles, conversations, messages) | Schema in place, `alembic upgrade head` passes |
| 1.12 | Set up Qdrant Cloud — create `chapter_chunks` collection | Collection exists, Python client can upsert |
| 1.13 | Build `docs_manifest.json` builder script (MDX → plain text map) | `docs_manifest.json` generated |
| 1.14 | Build and run `backend/subagents/index_to_qdrant.py` | All chapters indexed in Qdrant (verify with count query) |
| 1.15 | Implement `POST /api/chat` RAG endpoint | Returns grounded answers from book content |
| 1.16 | Implement `POST /api/chat/select` endpoint | Returns chapter-filtered answers |
| 1.17 | Build ChatWidget React component (chat panel + send) | Renders in Docusaurus, calls `/api/chat` |
| 1.18 | Build text-selection listener + SelectionButton component | Appears on text selection, triggers `/api/chat/select` |
| 1.19 | Swizzle Docusaurus Root.tsx to inject text-selection listener | Works on all chapter pages |
| 1.20 | Deploy updated Docusaurus (with chat widget) to GitHub Pages | **P1 GATE: verify live URL — book + chatbot functional** |

### Phase 2 — P2: Subagents and Agent Skills

| Step | Task | Output |
|------|------|--------|
| 2.1 | Write `.claude/commands/generate-chapter-outline.md` Agent Skill | Skill file committed |
| 2.2 | Write `.claude/agents/qdrant-indexer.md` Subagent definition | Subagent file committed |
| 2.3 | Document both in `README.md` under "Reusable Intelligence" section | README updated |

### Phase 3 — P3: Authentication

| Step | Task | Output |
|------|------|--------|
| 3.1 | Install better-auth in backend; configure Postgres adapter | `POST /api/auth/signup` and `POST /api/auth/signin` work |
| 3.2 | Implement signup endpoint with profile persistence | Survey data saved to `user_profiles` |
| 3.3 | Implement `GET /api/auth/session` and `GET /api/user/profile` | Session verification works |
| 3.4 | Install better-auth client in `book/`; build `AuthButton` Navbar component | Navbar shows auth state |
| 3.5 | Build `/signup` and `/signin` pages in Docusaurus | Forms submit, tokens stored in localStorage |
| 3.6 | Deploy and verify session persistence at live URL | **P3 GATE: signup → signin → session verified** |

### Phase 4 — P4: Personalization

| Step | Task | Output |
|------|------|--------|
| 4.1 | Implement `POST /api/personalize` endpoint | Returns personalized Markdown |
| 4.2 | Build `PersonalizeButton` React component | Button visible only to logged-in users |
| 4.3 | Wire button to API call; render response in page | Personalized content replaces chapter with "Back to original" link |
| 4.4 | Deploy and verify at live URL | **P4 GATE: personalization works for authenticated user** |

### Phase 5 — P5: Urdu Translation

| Step | Task | Output |
|------|------|--------|
| 5.1 | Implement `POST /api/translate` endpoint | Returns Urdu Markdown (code blocks preserved) |
| 5.2 | Build `TranslateButton` React component + English toggle | Button + toggle work correctly |
| 5.3 | Deploy and verify at live URL | **P5 GATE: translation works; toggle restores English** |

### Phase 6 — Submission Preparation

| Step | Task | Output |
|------|------|--------|
| 6.1 | Make GitHub repository public | Repo visible at public URL |
| 6.2 | Final `README.md`: setup instructions, architecture diagram, Reusable Intelligence section | README complete |
| 6.3 | Record 90-second demo video: book → chatbot → text-selection → (bonus features) | Video link ready |
| 6.4 | Prepare WhatsApp number for live presentation invitation (top submissions only) | WhatsApp number ready |
| 6.5 | Submit via https://forms.gle/CQsSEGM3GeCrL43c8: public repo link, deployed URL, demo video link (≤90s), WhatsApp number | Submission confirmed before Nov 30, 2025, 6:00 PM |

---

## User Stories

### User Story 1 — Read Book and Ask Questions (Priority: P1)

An unauthenticated user can open the textbook, navigate to any chapter, and ask the embedded chatbot a question about the book content. The chatbot answers only from book content and cites its source.

**Why this priority**: This is the P1 base deliverable — required for 100 base points.

**Independent Test**: Open the live URL. Navigate to Module 1. Ask "What is a ROS 2 topic?" in the chat widget. Verify the answer cites a chapter.

**Acceptance Scenarios**:
1. **Given** the live Docusaurus URL, **When** a user navigates to any chapter page, **Then** all content renders with no broken links and the chat button is visible.
2. **Given** the chat panel is open, **When** a user submits a question about book content, **Then** the response answers from book context and lists at least one source chapter within 8 seconds.
3. **Given** the chat panel is open, **When** a user asks something not in the book, **Then** the chatbot explicitly states the answer is not in the book (does not fabricate).

---

### User Story 2 — Text-Selection Query (Priority: P1)

A user highlights a passage in a chapter and uses the floating button to ask a question scoped to that passage.

**Why this priority**: Explicitly required in requirements.md as part of the RAG chatbot deliverable.

**Independent Test**: Select 20+ words in any chapter. Verify "Ask about this" button appears. Click it. Verify the chat opens pre-filled with the selection and the response references that chapter.

**Acceptance Scenarios**:
1. **Given** any chapter is open, **When** the user highlights text ≥10 characters, **Then** the "Ask about this" button appears within 200ms near the selection.
2. **Given** the floating button is visible, **When** the user clicks it, **Then** the chat panel opens with the selected text pre-loaded in the input field.
3. **Given** the selection query is submitted, **When** the RAG pipeline runs, **Then** Qdrant search is filtered to the current `chapter_id` only.

---

### User Story 3 — Signup with Background Survey (Priority: P3)

A new user creates an account. All 5 background survey fields are required. After signup the user is immediately logged in.

**Why this priority**: +50 bonus points; also unlocks P4 and P5 features.

**Independent Test**: Open `/signup`. Fill all fields. Submit. Verify `user_profiles` row exists in Neon Postgres via `GET /api/user/profile`.

**Acceptance Scenarios**:
1. **Given** the signup form, **When** the user omits any of the 5 survey dropdowns, **Then** the form does not submit and shows a field-level error.
2. **Given** valid signup data, **When** the form is submitted, **Then** the user is signed in, the navbar shows their email, and `GET /api/user/profile` returns all 5 profile fields.
3. **Given** an already-registered email, **When** signup is attempted again, **Then** a 409 error is shown.

---

### User Story 4 — Personalize Chapter Content (Priority: P4)

A logged-in user clicks "Personalize for Me" at the top of a chapter. The chapter is rewritten for their skill level. The original is always restorable.

**Why this priority**: +50 bonus points, independent of translation.

**Independent Test**: Sign in. Open any chapter. Click personalize. Verify rewritten text appears with "Back to original" visible. Click "Back to original" — verify original page reloads.

**Acceptance Scenarios**:
1. **Given** an unauthenticated user, **When** they view any chapter, **Then** the "Personalize for Me" button is not rendered.
2. **Given** a logged-in user clicks personalize, **When** the API returns, **Then** the chapter text is replaced and "Back to original" link is visible above it.
3. **Given** personalized content is displayed, **When** the user clicks "Back to original", **Then** the page reloads with the default chapter content.

---

### User Story 5 — Translate Chapter to Urdu (Priority: P5)

A logged-in user clicks "Translate to Urdu". Chapter prose appears in Urdu; code blocks stay in English.

**Why this priority**: +50 bonus points, independent of personalization.

**Independent Test**: Sign in. Open Module 1 ROS 2 chapter (has code blocks). Click translate. Verify Urdu prose appears; code block content is unchanged. Click "Switch to English" — verify original restores.

**Acceptance Scenarios**:
1. **Given** an unauthenticated user, **When** they view any chapter, **Then** the "Translate to Urdu" button is not rendered.
2. **Given** a logged-in user clicks translate, **When** the API returns, **Then** all prose is in Urdu and all fenced code blocks are verbatim English.
3. **Given** translated content is displayed, **When** the user clicks "Switch to English", **Then** the original English content is restored.

---

### Edge Cases

- What happens if Qdrant returns 0 results above the score threshold? → The chatbot responds: "I couldn't find relevant content in the book for this question. Please try rephrasing."
- What happens if Gemini returns 429 (rate limit)? → Backend retries up to 3 times with exponential backoff (2s/4s/8s). If all retries fail, returns HTTP 429 with `{ "detail": "AI service busy — please try again in a moment." }`. Frontend shows user-friendly message.
- What happens if Gemini API is down (503)? → Same retry logic applies. If all retries exhausted, FastAPI returns HTTP 503 with `{ "detail": "LLM service temporarily unavailable" }`. The book remains readable.
- What happens if a chapter has no text in `docs_manifest.json`? → `/api/personalize` and `/api/translate` return HTTP 404.
- What happens if a user's session token expires mid-session? → better-auth client detects 401 response; frontend redirects to `/signin`.
- What happens if the user selects text shorter than 10 characters? → No selection button appears (ignored by the listener).
- What happens if the Neon database is unavailable? → FastAPI returns 503; chat still works (conversation not persisted) but auth and personalization fail gracefully.

---

## Requirements Summary

### Functional Requirements

- **FR-001**: The system MUST serve the complete Docusaurus book at a single public URL.
- **FR-002**: The book MUST contain all 4 modules, 13-week breakdown, 6 learning outcomes, 4 assessments, and hardware documentation.
- **FR-003**: The embedded chatbot MUST answer questions exclusively from indexed book content.
- **FR-004**: The chatbot MUST expose a text-selection trigger on every chapter page.
- **FR-005**: Vector embeddings MUST be stored in Qdrant Cloud using Google `text-embedding-004` (768 dimensions).
- **FR-006**: All LLM calls MUST route through the Google Generative AI SDK — no raw HTTP calls outside the SDK.
- **FR-006a**: All Gemini SDK calls MUST be wrapped with exponential backoff retry logic to handle 429 rate limit responses.
- **FR-007**: The FastAPI backend MUST expose a `/health` endpoint returning `{"status":"ok"}`.
- **FR-008**: Users MUST be able to sign up with email, password, and 5 background survey fields.
- **FR-009**: All 5 survey fields MUST be required at signup and stored in Neon Postgres.
- **FR-010**: Authenticated users MUST see a "Personalize for Me" button at the top of each chapter.
- **FR-011**: The personalization feature MUST retrieve the user profile and rewrite chapter content via LLM.
- **FR-012**: The original chapter content MUST remain accessible (never permanently overwritten).
- **FR-013**: Authenticated users MUST see a "Translate to Urdu" button at the top of each chapter.
- **FR-014**: The translation feature MUST preserve all code blocks and technical terms in English.
- **FR-015**: Both personalization and translation features MUST NOT be visible to unauthenticated users.
- **FR-016**: At least one Claude Code Agent Skill MUST be authored and committed to the repository.
- **FR-017**: At least one Claude Code Subagent MUST be defined and committed to the repository.
- **FR-018**: No secrets, API keys, or tokens MUST be hardcoded in source code or committed to the repo.
- **FR-019**: The Docusaurus book layer MUST remain functional if the AI/RAG layer is unavailable.

### Key Entities

- **User**: email, hashed password (managed by better-auth), created_at
- **UserProfile**: software_level, python_familiarity, linux_familiarity, hardware_background, ai_ml_familiarity
- **Conversation**: user_id (nullable), chapter_id, created_at
- **Message**: conversation_id, role (user/assistant), content, created_at
- **ChunkEmbedding (Qdrant)**: chapter_id, module_id, heading, text, char_start, vector[768]

---

## Success Criteria

- **SC-001**: All chapter pages load at the public URL with Lighthouse Performance score ≥80.
- **SC-002**: The chatbot correctly answers 4 out of 5 test questions sourced directly from book content.
- **SC-003**: The chatbot responds "not in the book" for at least 3 out of 3 out-of-scope test questions.
- **SC-004**: Text-selection trigger appears within 500ms after highlighting text on any chapter page.
- **SC-005**: Signup completes in ≤2 seconds and the user profile is persisted in Neon Postgres.
- **SC-006**: Personalized chapter text differs meaningfully from the original for a user with `software_level=beginner`.
- **SC-007**: Translated chapter has zero English prose sentences (code blocks excepted).
- **SC-008**: The Subagent indexing script runs to completion without errors on the full `docs/` tree.
- **SC-009**: The Agent Skill generates a valid chapter outline when invoked with a topic from the course scope.
- **SC-010**: The `/health` endpoint returns HTTP 200 at the live backend URL at all times.
