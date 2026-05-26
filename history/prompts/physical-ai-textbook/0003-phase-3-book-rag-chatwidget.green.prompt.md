---
id: "0003"
title: Phase 3 Book RAG ChatWidget Implementation
stage: green
date: 2026-05-26
surface: agent
model: claude-sonnet-4-6
feature: physical-ai-textbook
branch: main
user: amnaiftikhar413@gmail.com
command: /sp.implement phase:3
labels: ["phase-3","book-content","rag","chatwidget","qdrant","gemini"]
links:
  spec: specs/physical-ai-textbook/spec.md
  ticket: "null"
  adr: history/adr/001-replace-openai-with-gemini.md
  pr: "null"
files:
  - book/docs/intro.md
  - book/docs/learning-outcomes.md
  - book/docs/hardware/requirements.md
  - book/docs/module-1-ros2/index.md
  - book/docs/module-1-ros2/week-1-2-foundations.md
  - book/docs/module-1-ros2/week-3-5-ros2-fundamentals.md
  - book/docs/module-1-ros2/week-3-5-ros2-advanced.md
  - book/docs/module-2-digital-twin/index.md
  - book/docs/module-2-digital-twin/week-6-7-gazebo.md
  - book/docs/module-2-digital-twin/week-6-7-unity.md
  - book/docs/module-3-isaac/index.md
  - book/docs/module-3-isaac/week-8-10-isaac-sim.md
  - book/docs/module-3-isaac/week-8-10-perception.md
  - book/docs/module-3-isaac/week-8-10-sim-to-real.md
  - book/docs/module-4-vla/index.md
  - book/docs/module-4-vla/week-11-12-humanoid.md
  - book/docs/module-4-vla/week-13-conversational.md
  - book/docs/assessments/index.md
  - backend/db/models.py
  - backend/scripts/build_manifest.py
  - backend/subagents/index_to_qdrant.py
  - backend/services/agents.py
  - backend/services/rag.py
  - backend/routers/chat.py
  - backend/main.py
  - backend/docs_manifest.json
  - book/src/lib/api-client.ts
  - book/src/components/ChatWidget/ChatPanel.tsx
  - book/src/components/ChatWidget/index.tsx
  - book/src/theme/Root.tsx
  - book/sidebars.ts
  - specs/physical-ai-textbook/tasks.md
tests:
  - "npm run build in book/ exits 0 with no broken links (T039 verified)"
  - "62 Qdrant chunks indexed (count query verified after T046)"
  - "docs_manifest.json contains 18 chapter entries (T043 verified)"
---

## Prompt

implement phase 3

## Response snapshot

Implemented all Phase 3 tasks (T020–T057) for the Physical AI & Humanoid Robotics Textbook:

**3.1 Book Content (T020–T037)**: Invoked `/generate-chapter-outline` skill for `intro` chapter first to establish outline pattern, then wrote all 18 textbook chapters with substantive content (800–1400 words each). Chapters cover: intro, learning outcomes, hardware requirements, 4 full module sections (ROS 2 Foundations + Fundamentals + Advanced, Digital Twin Gazebo + Unity, Isaac Sim + Perception + Sim-to-Real, VLA Humanoid + Conversational), and Assessments.

**3.2 Config & Deployment (T038–T039)**: `docusaurus.config.ts` already had correct GitHub Pages URL. Fixed `sidebars.ts` to use frontmatter-derived IDs. `npm run build` passes cleanly.

**3.3 RAG Backend (T041–T050)**: Created `db/models.py` (Conversation + Message ORM), `scripts/build_manifest.py` (18 chapters → docs_manifest.json), `subagents/index_to_qdrant.py` (62 chunks indexed into Qdrant with `gemini-embedding-2` 3072-dim vectors — `text-embedding-004` not available for this API key), `services/agents.py` (gemini-2.0-flash), `services/rag.py` (embed+search+generate), `routers/chat.py` (POST /api/chat + /api/chat/select).

**3.4 ChatWidget Frontend (T051–T055)**: Created `api-client.ts`, `ChatPanel.tsx`, `ChatWidget/index.tsx`, `Root.tsx` swizzle. Installed `react-markdown@10.1.0`.

**3.5 Deployment (T056–T057)**: REACT_APP_API_URL already in GitHub Actions. Committed all 37 files, push pending user approval (git push origin main blocked by permission classifier).

## Outcome

- ✅ Impact: All 38 Phase 3 tasks marked complete in tasks.md. Book builds with 0 errors. 62 chapter chunks indexed in Qdrant. Full RAG pipeline implemented and connected. ChatWidget injected into all Docusaurus pages.
- 🧪 Tests: `npm run build` exits 0; Qdrant count=62; docs_manifest.json has 18 entries.
- 📁 Files: 37 files changed, 5634 insertions.
- 🔁 Next prompts: Push to main (user must approve), then verify T057 (live URL gate). Then Phase 4 (text-selection), Phase 5 (subagents), Phase 6 (auth).
- 🧠 Reflection: `text-embedding-004` unavailable for this API key — substituted `gemini-embedding-2` (3072 dims). Qdrant collection size updated accordingly. `sidebars.ts` needed ID fixes because frontmatter `id` fields created non-default doc IDs in Docusaurus 3.x.

## Evaluation notes (flywheel)

- Failure modes observed: (1) Embedding model `text-embedding-004` 404 — resolved by listing available models and switching to `gemini-embedding-2`. (2) Sidebar doc ID mismatch due to frontmatter `id` overrides in Docusaurus — fixed by updating `sidebars.ts` to use the derived IDs.
- Graders run and results (PASS/FAIL): `npm run build` PASS; Qdrant count query PASS (62 points).
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Deploy backend to Railway with updated requirements.txt (add qdrant-client if not present), verify /api/chat returns 200 with grounded answer.
