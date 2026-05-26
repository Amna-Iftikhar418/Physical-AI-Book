---
id: 10
title: Fix Tasks User Story Numbering
stage: tasks
date: 2026-05-26
surface: agent
model: claude-sonnet-4-6
feature: physical-ai-textbook
branch: main
user: Amna Iftikhar
command: is it according to requirements?
labels: ["tasks", "fix", "user-story", "consistency"]
links:
  spec: specs/physical-ai-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/physical-ai-textbook/tasks.md
tests:
  - "null"
---

## Prompt

is it according to requirements?

## Response snapshot

Performed systematic requirements check against requirements.md (19 items), constitution v1.1.2 (8 principles), spec.md (5 user stories), and plan.md (6 phases).

**All 19 requirements covered. One structural bug found and fixed:**

Bug: tasks.md assigned US3 to "Subagents + Agent Skills" (spec §2.6 — a feature section, not a numbered user story). This offset all remaining labels: auth was US4 instead of US3, personalization was US5 instead of US4, translation was US6 instead of US5.

**Fixes applied to specs/physical-ai-textbook/tasks.md:**
1. User Story Map table updated — Subagents listed as bonus milestone (no US#)
2. Phase 5 header changed from "User Story 3" to "Bonus Milestone"
3. T063–T065 US3 labels removed (Subagents tasks correctly have no US label)
4. Phase 6 header: US4 → US3; all T066–T081 labels: US4 → US3
5. Phase 7 header: US5 → US4; all T082–T088 labels: US5 → US4
6. Phase 8 header: US6 → US5; all T089–T095 labels: US6 → US5
7. Dependencies section, parallel strategy section, task count table all updated to match

US labels now map exactly to spec.md user stories: US1=Read+Chat, US2=Text-Selection, US3=Auth, US4=Personalization, US5=Translation.

## Outcome

- ✅ Impact: tasks.md is now fully consistent with spec.md user story numbering and requirements.md coverage
- 🧪 Tests: grep confirms [US3-6] labels all map to correct stories; T063-T065 have no US label
- 📁 Files: specs/physical-ai-textbook/tasks.md (updated)
- 🔁 Next prompts: /sp.implement to begin executing Phase 1 tasks
- 🧠 Reflection: Subagents/Skills (spec §2.6) is a scoring feature but not written as a user story — should have been labeled as a standalone bonus milestone from the start

## Evaluation notes (flywheel)

- Failure modes observed: task generator introduced US3 for a feature section (not a user story), shifting all subsequent labels
- Graders run and results (PASS/FAIL): label grep verification — PASS after fixes
- Prompt variant (if applicable): null
- Next experiment: add an explicit note in tasks-template.md that US# labels must map 1:1 to spec.md user story numbers only
