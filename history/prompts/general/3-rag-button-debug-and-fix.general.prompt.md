---
id: 3
title: RAG Button Debug and Fix
stage: general
date: 2026-05-26
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: "when i click on rag nothing happen"
labels: ["debug","frontend","RAG","ChatWidget","env-vars","docusaurus"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - book/src/lib/api-client.ts
  - book/src/pages/index.tsx
  - book/docusaurus.config.ts
  - .github/workflows/deploy-book.yml
tests:
  - npm run typecheck (passed)
  - npm run build (succeeded)
  - curl served HTML confirmed button rendered
---

## Prompt

when i click on rag nothing happen

## Response snapshot

Ran full codebase exploration via Explore subagent, then debugged the RAG ChatWidget button issue.

**Root cause analysis:**
1. `api-client.ts` used `process.env.REACT_APP_API_URL` — Docusaurus only injects `DOCUSAURUS_*` prefix vars via Webpack DefinePlugin into the browser bundle. `REACT_APP_API_URL` was never replaced, so on the deployed site it fell back to `http://localhost:8000` (Railway backend unreachable).
2. `src/pages/index.tsx` had a TypeScript error: `JSX.Element` global namespace was removed in React 19 (project uses React 19). Caused `npm run typecheck` to fail.

**Confirmed working:**
- ChatWidget button IS pre-rendered in all page SSR HTML
- `react-markdown` is properly bundled across code-split chunks
- Dev server starts cleanly (no compilation errors)
- Production build succeeds

**Fixes applied:**
- `api-client.ts`: `REACT_APP_API_URL` → `DOCUSAURUS_API_URL`
- `deploy-book.yml`: env var key renamed to match
- `docusaurus.config.ts`: customFields reference updated
- `index.tsx`: removed `JSX.Element` return type annotation (React 19 compat)
- Rebuilt `book/build` with new main chunk hash

## Outcome

- ✅ Impact: Deployed site will now correctly point to Railway backend URL (not localhost:8000) after next GitHub Actions run
- 🧪 Tests: TypeScript typecheck passes, production build succeeds
- 📁 Files: 4 files changed
- 🔁 Next prompts: Push to GitHub to trigger redeployment; start backend locally for local testing
- 🧠 Reflection: The REACT_APP_ prefix is a Create React App convention, not Docusaurus. Easy to mix up. Always use DOCUSAURUS_ prefix for Docusaurus browser env vars.

## Evaluation notes (flywheel)

- Failure modes observed: Could not reproduce exact "button click does nothing" in CLI — button renders correctly in pre-built HTML. Likely the user is testing an outdated deployed version (before GitHub Actions redeployment) or the chat panel opens but chat fails silently due to wrong API URL.
- Graders run and results (PASS/FAIL): typecheck PASS, build PASS, served HTML check PASS
- Prompt variant (if applicable): null
- Next experiment: User should push changes, wait for GitHub Actions to redeploy, then test on the live site with the Railway backend running
