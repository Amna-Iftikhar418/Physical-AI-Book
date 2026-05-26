---
id: 6
title: Update CLAUDE.md with project context
stage: general
date: 2026-05-26
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: "update my persistent context file claude.md according to project"
labels: ["claude-md","project-context","documentation","setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - CLAUDE.md
tests:
  - "CLAUDE.md opens without unresolved placeholders"
  - "All known pitfalls are documented"
  - "Dev commands are accurate for Windows PowerShell"
---

## Prompt

update my persistent context file claude.md according to project

## Response snapshot

Added a "Project: Physical AI & Humanoid Robotics Textbook" section at the top of `CLAUDE.md` (before the SDD framework rules), covering:

- Hackathon identity (Panaversity Hackathon I, 300-pt scoring, deadline, live URL)
- Three-layer architecture table (Docusaurus/GitHub Pages, FastAPI/Railway, Qdrant+Neon)
- Local run commands (PowerShell, correct `.venv\Scripts\uvicorn`)
- Required backend `.env` keys
- Key source files table (backend + frontend)
- Actual models in use (`gemini-2.5-flash`, `models/gemini-embedding-2`) — noting drift from spec
- API endpoints table with request/response shapes
- Known pitfalls section: qdrant `.search()` removal, Docusaurus `process` undefined, Gemini quota, backend root 404

All SDD framework rules preserved unchanged.

## Outcome

- ✅ Impact: Every future Claude Code session starts with full project context — no re-explanation needed for architecture, tech stack, dev commands, or known pitfalls
- 🧪 Tests: File reviewed — no unresolved placeholders, all PowerShell commands verified accurate
- 📁 Files: 1 file changed (CLAUDE.md)
- 🔁 Next prompts: Push all pending changes (rag.py, agents.py, api-client.ts, CLAUDE.md) to GitHub; test chat widget in browser
- 🧠 Reflection: CLAUDE.md is the highest-leverage file in the repo for AI-assisted development — keeping it current with actual runtime state (model names, library versions, pitfalls) prevents repeated debugging of the same issues

## Evaluation notes (flywheel)

- Failure modes observed: None — straightforward documentation update
- Graders run and results (PASS/FAIL): Visual review PASS
- Prompt variant (if applicable): null
- Next experiment: After pushing to GitHub, verify Railway redeploys with correct model and Qdrant client usage
