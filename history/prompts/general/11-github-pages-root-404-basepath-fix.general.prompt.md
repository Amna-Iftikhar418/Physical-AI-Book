---
id: 11
title: GitHub Pages Root 404 — BaseUrl Redirect Fix
stage: general
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: inline prompt
labels: ["docusaurus", "github-pages", "routing", "baseUrl", "redirect", "404", "frontend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - book/src/pages/index.tsx
tests:
  - none
---

## Prompt

give me full all url which i check manually [provided status of all backend and frontend URLs]:
- Railway root `/` → {"detail":"Not Found"} (expected)
- `/health` → {"status":"ok","version":"1.0.3"} ✅
- `/docs` → Swagger UI loads ✅
- `/openapi.json` → all routes present ✅
- GitHub Pages `https://Amna-Iftikhar418.github.io/Physical-AI-Book/` → "Page Not Found"
- Clicking "Textbook" nav item → loads at `/Physical-AI-Book/intro` ✅
- Screenshot at `C:\Users\LAPTOP VILLA\OneDrive\Pictures\Screenshots` showing `amna-iftikhar418.github.io/intro` with "Page Not Found"

## Response snapshot

**Root cause identified from screenshot:** `book/src/pages/index.tsx` had `<Redirect to="/intro" />` — absolute path with no base URL prefix. Since the site is deployed at `baseUrl: '/Physical-AI-Book/'`, visiting `https://amna-iftikhar418.github.io/Physical-AI-Book/` triggers the redirect to `/intro` (absolute), which resolves to `amna-iftikhar418.github.io/intro` — outside the base path. This 404s.

**Fix applied:**
```tsx
// Before
import { Redirect } from '@docusaurus/router';
export default function Home() {
  return <Redirect to="/intro" />;
}

// After
import { Redirect } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
export default function Home() {
  return <Redirect to={useBaseUrl('/intro')} />;
}
```

`useBaseUrl('/intro')` returns `/Physical-AI-Book/intro`, so the redirect goes to the correct URL.

**Railway backend status: fully operational**
- All 3 routes registered: `/health`, `/api/chat`, `/api/chat/select`
- No `startup_error` in health response — env vars are set, chat router loaded
- Stale deployment confirmed resolved (version 1.0.3 live, `paused` field gone)

Committed and pushed: `7f0ab9a`

## Outcome

- ✅ Impact: Fixed root URL "Page Not Found" on GitHub Pages; backend fully confirmed working
- 🧪 Tests: Manual URL verification; screenshot confirmed redirect destination was wrong
- 📁 Files: book/src/pages/index.tsx (2-line change)
- 🔁 Next prompts: verify GitHub Pages root loads intro after ~3 min deploy; test chat widget end-to-end
- 🧠 Reflection: Absolute paths in Docusaurus Redirect components do not include baseUrl automatically. Always use useBaseUrl() when constructing redirect targets so the path is correct regardless of deployment base path.

## Evaluation notes (flywheel)

- Failure modes observed: Absolute path `/intro` in Redirect bypasses Docusaurus baseUrl; redirect lands outside deployment root
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): Follow-up to PHR #10
- Next experiment: Consider adding slug: / to docs/intro.md + removing index.tsx entirely to avoid redirect overhead
