---
id: 8
title: Replace OpenAI Paid Stack with Gemini Free Tier
stage: plan
date: 2026-05-26
surface: agent
model: claude-sonnet-4-6
feature: physical-ai-textbook
branch: main
user: amnaiftikhar413@gmail.com
command: apply plan — replace OpenAI with Google Gemini free tier; update requirements.md, constitution, spec, plan
labels: ["plan", "gemini", "free-tier", "openai-replacement", "rate-limit", "retry", "adr", "constitution-amendment"]
links:
  spec: specs/physical-ai-textbook/spec.md
  ticket: null
  adr: history/adr/001-replace-openai-with-gemini.md
  pr: null
files:
  - requirements.md
  - .specify/memory/constitution.md
  - specs/physical-ai-textbook/spec.md
  - specs/physical-ai-textbook/plan.md
  - history/adr/001-replace-openai-with-gemini.md
tests:
  - none
---

## Prompt

Replace the paid OpenAI API stack (gpt-4o-mini, text-embedding-3-small, openai-agents SDK) with a
completely free alternative. User constraint: 100% free, no credit card, no expiring trial credits.
Also add rate limit handling and retry logic to the plan.

## Response snapshot

**Decision**: Replace with Google Generative AI (single provider, single API key).

| Component | Old (Paid) | New (Free) |
|-----------|-----------|-----------|
| LLM | gpt-4o-mini | gemini-2.0-flash |
| Embeddings | text-embedding-3-small (1536-dim) | text-embedding-004 (768-dim) |
| SDK | openai-agents + openai | google-generativeai |
| Env var | OPENAI_API_KEY | GOOGLE_API_KEY |
| Qdrant size | 1536 | 768 |

**Rate limit handling added**: backend/utils/retry.py — exponential backoff (2s/4s/8s) on
429 ResourceExhausted / 503 ServiceUnavailable; batch pacing in indexer (10 chunks/call, 5s delay).

**Files updated:**
- requirements.md: "OpenAI Agents/ChatKit SDKs" → "Google Generative AI SDK (google-generativeai)"
- constitution.md: bumped to v1.1.2 (PATCH); updated Principle III, Principle V, tech stack table
- specs/physical-ai-textbook/spec.md: all model refs, embedding dims, code blocks, cost table, FR-005/006
- specs/physical-ai-textbook/plan.md: requirements.txt, env vars, all 3 agent code blocks, risk table
- history/adr/001-replace-openai-with-gemini.md: new file documenting the decision

**Remaining intentional OpenAI references:**
- "OpenAI Whisper" in Module 4 course content — course curriculum (speech model), not LLM SDK
- ADR file — historical comparison document (correct)
- PHR history files — read-only historical records (correct)

## Outcome

- ✅ Impact: Project is now 100% free. All 5 project files updated. ADR-001 created. Constitution amended to v1.1.2.
- 🧪 Tests: none (documentation update)
- 📁 Files: requirements.md, .specify/memory/constitution.md, specs/physical-ai-textbook/spec.md, specs/physical-ai-textbook/plan.md, history/adr/001-replace-openai-with-gemini.md (new)
- 🔁 Next prompts: /sp.tasks to generate executable Phase 1 task list (Docusaurus + book content)
- 🧠 Reflection: The key insight is that google-generativeai supports both LLM and embeddings under a single API key — the only provider with this property at zero cost. The retry wrapper using google.api_core.exceptions.ResourceExhausted is the idiomatic way to handle Gemini rate limits.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): none (documentation update)
- Prompt variant (if applicable): user requested free alternative + retry logic
- Next experiment (smallest change to try): Run /sp.tasks for Phase 1 (Docusaurus initialization + chapter writing)
