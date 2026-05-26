---
id: 5
title: Fix process is not defined in api-client
stage: general
date: 2026-05-26
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Amna Iftikhar
command: "Understand this error this error occur in console"
labels: ["debug","frontend","docusaurus","webpack","process","api-client"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - book/src/lib/api-client.ts
tests:
  - "Open http://localhost:3000, click 💬, ask a question → no console error, answer returned"
---

## Prompt

Uncaught ReferenceError: process is not defined
    at eval (api-client.ts:1:1)
    at ./src/lib/api-client.ts (main.js:1164:1)
    ...
Understand this error this error occur in console

## Response snapshot

**Root cause:** `api-client.ts` line 1 used `process.env.DOCUSAURUS_API_URL` directly. In Docusaurus 3 (webpack 5), `process` is NOT globally polyfilled in the browser bundle. webpack's DefinePlugin only substitutes specific `process.env.*` keys it recognises — unresolved references to `process` throw `ReferenceError` at runtime.

**Fix:** Changed `api-client.ts` to import the URL from `@generated/docusaurus.config` instead:

```typescript
// BEFORE (broken in browser):
const BASE_URL = (process.env.DOCUSAURUS_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

// AFTER (works in browser):
import siteConfig from '@generated/docusaurus.config';
const BASE_URL = (((siteConfig.customFields?.apiUrl) as string | undefined) ?? 'http://localhost:8000').replace(/\/$/, '');
```

`docusaurus.config.ts` already had `customFields.apiUrl` set (line 33):
```ts
customFields: {
  apiUrl: process.env.DOCUSAURUS_API_URL ?? 'http://localhost:8000',
}
```
This evaluates `process.env.*` at **build time** in Node.js (safe), bakes the result into `@generated/docusaurus.config` as a plain string. The browser only sees the string — no `process` reference at runtime.

## Outcome

- ✅ Impact: Chat widget no longer crashes with `process is not defined` — API URL is read from Docusaurus generated config, which is a plain string in the browser
- 🧪 Tests: Browser console check — no ReferenceError after hot reload
- 📁 Files: 1 file changed (book/src/lib/api-client.ts)
- 🔁 Next prompts: Push changes to GitHub to deploy fixes (rag.py, agents.py, api-client.ts) to production
- 🧠 Reflection: Webpack 5 removed automatic `process` polyfill. Always use Docusaurus's `customFields` + `@generated/docusaurus.config` for runtime config in browser code — never `process.env` directly in client modules.

## Evaluation notes (flywheel)

- Failure modes observed: `customFields` was already configured correctly in `docusaurus.config.ts` but `api-client.ts` bypassed it by reading `process.env` directly — config and usage were out of sync
- Graders run and results (PASS/FAIL): Browser console inspection — pending user confirmation
- Prompt variant (if applicable): null
- Next experiment: Push all three changed files to GitHub and verify Railway backend + GitHub Pages frontend both work end-to-end in production
