---
id: 2
title: Fix Spec and Plan Consistency Issues
stage: general
date: 2026-05-26
surface: agent
model: claude-sonnet-4-6
feature: physical-ai-textbook
branch: main
user: Amna Iftikhar
command: fix all issues
labels: ["consistency", "spec", "plan", "google-api", "fix"]
links:
  spec: specs/physical-ai-textbook/spec.md
  ticket: null
  adr: history/adr/001-replace-openai-with-gemini.md
  pr: null
files:
  - specs/physical-ai-textbook/spec.md
  - specs/physical-ai-textbook/plan.md
tests:
  - Manual verification: all Runner.run() calls replaced with model.generate_content()
  - Manual verification: constitution version references updated to v1.1.2
---

## Prompt

fix all issues

(Context: prior turn performed a consistency audit of constitution, spec, and plan against requirements.md excluding OpenAI agent kit. Issues found were: stale constitution version references in spec.md and plan.md (v1.1.1 instead of v1.1.2), three Runner.run() OpenAI Agents SDK remnants in spec.md data flow sections, and an architectural risk with better-auth Python adapter.)

## Response snapshot

Applied 5 fixes across spec.md and plan.md:

1. spec.md line 8 — constitution reference updated from v1.1.1 → v1.1.2
2. plan.md line 5 — constitution reference updated from v1.1.1 → v1.1.2
3. spec.md Section 4.1 (Standard Chat Query flow) — Runner.run(BookAssistant, ...) → book_model.generate_content(...)
4. spec.md Section 4.3 (Personalization Flow) — Runner.run(PersonalizationAgent, ...) → personalization_model.generate_content(...)
5. spec.md Section 4.4 (Translation Flow) — Runner.run(TranslationAgent, ...) → translation_model.generate_content(...)

Architectural risk noted but not fixed in spec/plan (better-auth Python adapter does not exist as a PyPI package) — flagged for Phase 3B implementation.

## Outcome

- ✅ Impact: spec.md and plan.md are now fully consistent with constitution v1.1.2 and Google Generative AI SDK; no OpenAI SDK patterns remain in spec data flow diagrams
- 🧪 Tests: manual grep verification — no remaining Runner.run() calls in spec.md or plan.md
- 📁 Files: specs/physical-ai-textbook/spec.md, specs/physical-ai-textbook/plan.md
- 🔁 Next prompts: implement Phase 1 (Docusaurus book initialization); address better-auth Python adapter before Phase 3B
- 🧠 Reflection: Runner.run() calls were OpenAI Agents SDK remnants that survived the ADR-001 migration in the data flow prose sections while code snippets were already correctly updated

## Evaluation notes (flywheel)

- Failure modes observed: partial migration — code samples updated but prose flow diagrams still had old SDK pattern
- Graders run and results (PASS/FAIL): visual grep — PASS after fixes
- Prompt variant (if applicable): null
- Next experiment: add a constitution-check gate to spec template to enforce no Runner.run() references when Google SDK is mandated
