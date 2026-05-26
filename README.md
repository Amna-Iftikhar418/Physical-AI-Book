# Physical AI & Humanoid Robotics Textbook

An interactive, AI-powered textbook for the Physical AI & Humanoid Robotics course, built
with Spec-Driven Development. It pairs a full Docusaurus book with an embedded RAG chatbot
that answers questions grounded exclusively in the book's content, plus optional auth,
per-chapter personalization, and Urdu translation.

- **Live book**: https://Amna-Iftikhar418.github.io/Physical-AI-Book/
- **Constitution** (authoritative product spec): `.specify/memory/constitution.md`

## Architecture

| Layer | Stack | Deployed on |
|-------|-------|-------------|
| Book (frontend) | Docusaurus 3 + React + TypeScript | GitHub Pages |
| AI/RAG (backend) | FastAPI + `google-generativeai` | Railway |
| Vector store | Qdrant Cloud — collection `chapter_chunks` | Qdrant Cloud free tier |
| Relational DB | Neon Serverless Postgres | Neon free tier |

## Reusable Intelligence

This project ships two committed, reusable Claude Code artifacts that are actively invoked
during the authoring and indexing workflow (constitution Principle VI). Both live in
`.claude/` and are evaluated as reusable intelligence for the +50 bonus.

### Agent Skill — `/generate-chapter-outline`

- **File**: `.claude/commands/generate-chapter-outline.md`
- **What it does**: Reads the constitution and `requirements.md` to confirm scope, then
  produces a structured Markdown outline for a requested chapter — H2 sections mapped to the
  13-week breakdown, 3–5 sub-topic bullets per section, exactly one `[CODE EXAMPLE: ...]`
  placeholder per section, and one learning objective per section tied to the 6 course
  outcomes (LO1–LO6). It outlines only; it does not write the full chapter.
- **How to invoke**: `/generate-chapter-outline <chapter-id>`
  (e.g. `/generate-chapter-outline module-1-ros2/week-3-5-ros2-fundamentals`)
- **Expected output**: The outline, followed by a confirmation summary — chapter id, section
  count, estimated word count, and the learning outcomes covered.
- **When used**: Before writing each chapter MDX file (tasks T020–T037).

### Subagent — `qdrant-indexer`

- **File**: `.claude/agents/qdrant-indexer.md`
- **What it does**: Re-indexes the book into Qdrant after any chapter MDX changes. It verifies
  `backend/docs_manifest.json` exists (rebuilding it via `build_manifest.py` if missing), runs
  `backend/subagents/index_to_qdrant.py`, and reports chapters seen, chunks built, final point
  count in the `chapter_chunks` collection, and any failed `chapter_id`s.
- **How to invoke**: reference the `qdrant-indexer` subagent, or run the underlying step
  directly: `python backend/subagents/index_to_qdrant.py`
- **Expected output**:

  ```
  Loaded manifest: <M> chapters
  Total chunks to index: <N>
  Indexing complete. Total points in collection: <N>
  ```

- **When used**: After writing or updating any chapter MDX, to keep the RAG index current.

## Running locally

```powershell
# Backend — from C:\Hackathon 1\backend\
.venv\Scripts\uvicorn main:app --reload          # port 8000

# Frontend — from C:\Hackathon 1\book\
npm start                                         # port 3000
```

Required backend env vars (`backend/.env`): `GOOGLE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`,
`DATABASE_URL`, `CORS_ORIGINS`. Secrets are never committed — `.env` is gitignored.
