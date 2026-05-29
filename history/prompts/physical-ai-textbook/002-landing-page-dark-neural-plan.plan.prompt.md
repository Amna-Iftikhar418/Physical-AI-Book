---
id: "002"
title: Landing Page Dark Neural Plan
stage: plan
date: 2026-05-27
surface: agent
model: claude-sonnet-4-6
feature: physical-ai-textbook
branch: physical-ai-textbook
user: Amna Iftikhar
command: /sp.plan
labels: ["landing-page", "frontend", "redesign", "dark-neural", "docusaurus"]
links:
  spec: specs/physical-ai-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/physical-ai-textbook/plan.md
  - specs/physical-ai-textbook/research.md
  - specs/physical-ai-textbook/tasks.md
tests:
  - Manual: npm start → verify landing page at localhost:3000/Physical-AI-Book/
  - Build: npm run build exits 0
---

## Prompt

Landing page redesign: dark neural aesthetic hero page for the Physical AI & Humanoid Robotics Docusaurus book. Replace the current one-line redirect in book/src/pages/index.tsx with a full landing page featuring: animated neural-net canvas background (#050A14 deep space bg, #00D4FF cyan + #7B2FFF violet accents), hero section with "Start Reading" CTA to /intro, animated stats counters (4 modules, 13 weeks, 18 chapters), 4 module cards with glow hover effects, feature highlights grid, tech stack badges with float animation. New files: index.tsx (full page), index.module.css (scoped styles). Minor update to custom.css dark-mode primary color. No backend changes, no changes to ChatWidget/Auth/Personalize/Translate components or docs.

## Response snapshot

Created three SDD artifacts:
- `specs/physical-ai-textbook/plan.md` — Full implementation plan with Technical Context, Constitution Check (all gates pass), component architecture (NeuralCanvas, HeroSection, StatsSection, ModulesSection, FeaturesSection, TechSection, CtaSection), CSS design tokens, Docusaurus API usage, and verification checklist
- `specs/physical-ai-textbook/research.md` — Phase 0 research resolving 6 questions: canvas SSR safety (useEffect-only), CSS scoping (CSS Modules), no new npm packages, Redirect removal, IntersectionObserver for counters, Layout wrapper
- `specs/physical-ai-textbook/tasks.md` — 12 dependency-ordered tasks (T-LP01 through T-LP12) with full acceptance criteria including component code snippets

## Outcome

- ✅ Impact: Complete plan + tasks ready for implementation of dark neural landing page
- 🧪 Tests: Manual browser verification checklist defined in T-LP12; build check in T-LP11
- 📁 Files: plan.md, research.md, tasks.md created/updated
- 🔁 Next prompts: /sp.implement to execute T-LP01 through T-LP12
- 🧠 Reflection: All constitution gates pass; zero new npm packages; SSR-safe canvas pattern identified; scope strictly limited to 3 files

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A — planning phase
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify canvas performance on low-end devices; consider reducing node count from 60 to 40 if needed
