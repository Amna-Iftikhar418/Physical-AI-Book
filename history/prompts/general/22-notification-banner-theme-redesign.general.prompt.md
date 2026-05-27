---
name: notification-banner-theme-redesign
description: Redesign personalize/translate notification banner from green/yellow Docusaurus defaults to Neural Circuit dark theme (blue/violet), and fix button text visibility
metadata:
  type: general
  stage: green
  date: 2026-05-28
  surface: agent
  model: claude-sonnet-4-6
  feature: none
  branch: main
  user: Amna Iftikhar
  command: chat
  labels: ["ui", "theme", "personalization", "translate", "css"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - book/src/theme/DocItem/Layout/index.tsx
  - book/src/css/custom.css
tests: []
---

## Prompt

when personalized button , urdu button activate why it show notification with green, yellow bg make it according to theme and give excellent design and make text of buttons visible

## Response

Redesigned two areas:

1. **Notification banner** (`DocItem/Layout/index.tsx`) — replaced inline green/yellow Docusaurus default styles (`var(--ifm-color-success-lightest)` / `var(--ifm-color-warning-lightest)`) with semantic CSS class structure (`docOverrideBanner`, `docOverrideBanner--personalized`, `docOverrideBanner--urdu`). New design uses:
   - Personalized: electric blue `#5b9aff` left border + `rgba(91,154,255,0.06)` background
   - Urdu: violet `#a78bfa` left border + `rgba(167,139,250,0.06)` background
   - Two-line label (title + subtitle), icon, and themed reset button
   - Full light/dark mode support

2. **Pill buttons** (`custom.css`) — improved visibility for both modes:
   - `actionPillBtn--amber` (Personalize): blue text with subtle blue tint bg, hover glow
   - `actionPillBtn--outline` (Translate): violet `#a78bfa` text with violet bg tint, hover glow
   - Light mode overrides for both with matching deep blue/violet contrast colors

## Outcome

All notification colors now match the Neural Circuit theme palette. No green or yellow anywhere. Button text is clearly visible in both light and dark modes.
