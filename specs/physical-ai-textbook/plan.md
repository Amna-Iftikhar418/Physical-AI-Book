# Implementation Plan: Landing Page Redesign — Dark Neural Aesthetic

**Branch**: `physical-ai-textbook` | **Date**: 2026-05-27 | **Spec**: `specs/physical-ai-textbook/spec.md`  
**Input**: Feature specification from `/specs/physical-ai-textbook/spec.md`

## Summary

Replace the current one-line redirect in `book/src/pages/index.tsx` (which instantly forwards to `/intro`) with a full, visually stunning landing page. The redesign uses a **Dark Neural aesthetic** — deep-space background (#050A14), animated neural-network canvas, electric cyan (#00D4FF) and deep violet (#7B2FFF) accents — giving the textbook an NVIDIA / OpenAI-caliber first impression.

The scope is **frontend only, landing page only**. No backend, no docs, no ChatWidget, Auth, Personalize, or Translate components are touched.

## Technical Context

**Language/Version**: TypeScript 6.0 / React 19 (Docusaurus 3.10.1)  
**Primary Dependencies**: Docusaurus `@theme/Layout`, `@docusaurus/Link`, `@docusaurus/useBaseUrl` — no new packages  
**Storage**: N/A (frontend only, no state persisted)  
**Testing**: Manual browser verify — `npm start` dev server at localhost:3000  
**Target Platform**: Browser (static Docusaurus site, GitHub Pages)  
**Project Type**: Web frontend  
**Performance Goals**: Landing page LCP ≤ 2 seconds; canvas animation ≥ 30 fps  
**Constraints**:
- NO `process.env.*` in client code (Docusaurus webpack 5 pitfall — use `useDocusaurusContext`)
- Canvas animation must be SSR-safe (`typeof window !== 'undefined'` guard or `useEffect`-only)
- No new npm dependencies
- Do NOT touch ChatWidget, Auth, Personalize, Translate components, any docs, `sidebars.ts`, `docusaurus.config.ts`, or backend

**Scale/Scope**: 3 files changed/created (index.tsx, index.module.css, custom.css minor update)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Content-First Spec-Driven | ✅ PASS | Landing page is UI chrome, not textbook content. Docs unchanged. |
| II. Unified Modular System | ✅ PASS | Still one Docusaurus site; landing page is new entry point within same deployment |
| III. RAG Pipeline Integrity | ✅ PASS | No RAG code touched; ChatWidget unchanged |
| IV. Security / Secrets | ✅ PASS | No secrets in frontend; no API calls from landing page |
| V. Personalization by Consent | ✅ PASS | PersonalizeButton and TranslateButton untouched |
| VI. Reusable Intelligence | ✅ PASS | Not applicable to this UI task |
| VII. Smallest Viable Diff | ✅ PASS | 3 files only; no unrelated refactors |
| VIII. Deployment Readiness | ✅ PASS | Existing GitHub Actions CI deploys on push to main |

**No violations. All gates pass.**

## Project Structure

### Documentation (this feature)

```text
specs/physical-ai-textbook/
├── plan.md              ← This file
├── research.md          ← Phase 0 output (below)
├── data-model.md        ← N/A (pure UI, no entities)
├── quickstart.md        ← Phase 1 output
├── contracts/           ← N/A (no new API endpoints)
└── tasks.md             ← Phase 2 output (/sp.tasks)
```

### Source Code (files to create/modify)

```text
book/
├── src/
│   ├── pages/
│   │   ├── index.tsx            ← REPLACE (was 1-line redirect, becomes full landing page)
│   │   └── index.module.css     ← CREATE NEW (all landing page styles)
│   └── css/
│       └── custom.css           ← MINOR UPDATE (dark-mode primary color only)
```

**Structure Decision**: Web frontend — modifying the Docusaurus `book/` frontend layer only. Backend untouched.

## Complexity Tracking

No constitution violations — table not applicable.

---

## Phase 0: Research

*(See `research.md` for full findings. Summary below.)*

### Decisions Made

| Decision | Rationale |
|----------|-----------|
| `<canvas>` for neural animation | Pure browser API, zero bundle cost, SSR-safe with `useEffect` guard |
| CSS Modules (`index.module.css`) | Scopes all landing styles, prevents Docusaurus Infima theme leakage |
| `IntersectionObserver` for stat counters | Native browser API, no library, fires once when section enters viewport |
| Emoji icons for module cards | Zero bundle cost, universally supported, no SVG import complexity |
| No new npm packages | Avoids any webpack/Docusaurus build breakage risk |
| `Layout` from `@theme/Layout` | Keeps navbar (AuthButton) and footer; consistent with other pages |

---

## Phase 1: Design & Contracts

### Page Architecture

The landing page is a single `export default function Home()` rendered inside Docusaurus `Layout`. All sub-sections are React components defined in the same file.

```
Home (Layout wrapper)
└── <div className={styles.page}>
    ├── NeuralCanvas          ← canvas, position:fixed behind all
    ├── HeroSection           ← min-height:100vh, headline, CTA
    ├── StatsSection          ← 4 animated counters
    ├── ModulesSection        ← 2×2 grid of module cards
    ├── FeaturesSection       ← 2×2 grid of feature highlights
    ├── TechSection           ← horizontal tech badge strip
    └── CtaSection            ← bottom "Open the Book" strip
```

---

### Component Specs

#### NeuralCanvas
- `<canvas ref={canvasRef}>` positioned `fixed; inset:0; z-index:0; pointer-events:none`
- `useEffect` only (no SSR execution)
- 60 nodes; random initial positions and velocities
- Each frame: move nodes, bounce off edges, draw cyan lines between nodes within 150px
- Line opacity proportional to distance: `1 - (dist/150)`
- Node radius: 2px; fill `rgba(0, 212, 255, 0.6)`
- Line color: `rgba(0, 212, 255, LINE_OPACITY)`
- Canvas resizes on `window.resize` with `ResizeObserver`
- Cleanup: `cancelAnimationFrame` on unmount

#### HeroSection
```
[chip] AI-NATIVE UNIVERSITY TEXTBOOK
[h1]   Physical AI &
       Humanoid Robotics      ← second line in cyan-violet gradient
[p]    Master ROS 2 · Digital Twins · NVIDIA Isaac · Vision-Language-Action Models
[btn]  Start Reading →        ← Link to useBaseUrl('/intro'), glowing cyan
[link] View on GitHub         ← muted secondary link
```
- Section: `min-height: 100vh; display: flex; align-items: center; justify-content: center`
- Text centered; `position: relative; z-index: 1` (above canvas)
- CTA button: `background: #00D4FF; color: #050A14; border-radius: 8px; font-weight: 700`
  - Hover: `box-shadow: 0 0 30px rgba(0,212,255,0.5); transform: translateY(-2px)`

#### StatsSection
- 4 stats: `{ label: '4', desc: 'Modules' }`, `{ label: '13', desc: 'Weeks' }`, `{ label: '18+', desc: 'Chapters' }`, `{ label: 'AI', desc: 'Powered' }`
- Counter animation using `IntersectionObserver` → triggers `useState` driven count-up with `requestAnimationFrame`
- Layout: `display: flex; justify-content: space-around; padding: 4rem 2rem`
- Stat number: 3rem font, cyan-violet gradient text
- Separator lines between stats

#### ModulesSection
```
Module 1 — ROS 2          Module 2 — Digital Twins
🤖 Nodes, Topics, URDF    🌐 Gazebo, Unity, Physics

Module 3 — NVIDIA Isaac   Module 4 — VLA Models
⚡ Isaac Sim, Nav2, RL    🧠 Humanoid, GPT, Voice
```
- CSS Grid: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`
- Each card: `background: rgba(10,22,40,0.8); border: 1px solid rgba(0,212,255,0.15); border-radius: 16px; backdrop-filter: blur(10px)`
- Hover: `border-color: #00D4FF; box-shadow: 0 0 30px rgba(0,212,255,0.15)` (odd cards)
         `border-color: #7B2FFF; box-shadow: 0 0 30px rgba(123,47,255,0.15)` (even cards)
- Each card has: icon (large emoji), module title (h3), 1-line description, `Link` to module index page

Module card links (using `useBaseUrl`):
- Module 1 → `/module-1-ros2/module-1-ros2`
- Module 2 → `/module-2-digital-twin/module-2-digital-twin`
- Module 3 → `/module-3-isaac/module-3-isaac`
- Module 4 → `/module-4-vla/module-4-vla`

#### FeaturesSection
4-feature 2×2 grid:
| Icon | Title | Description |
|------|-------|-------------|
| 💬 | AI Chat Assistant | RAG-powered Q&A grounded in book content |
| ✨ | Personalized Learning | Chapter content rewritten for your skill level |
| 🌐 | Urdu Translation | Full chapter translation with one click |
| 🔍 | Text Selection Q&A | Highlight any passage to ask about it |

#### TechSection
Horizontal row of pill-shaped badges with float animation:
`ROS 2` · `NVIDIA Isaac` · `Python` · `Gemini AI` · `Qdrant` · `FastAPI` · `React`

CSS keyframe `@keyframes float`:
```css
0%, 100% { transform: translateY(0); }
50%       { transform: translateY(-6px); }
```
Staggered: each badge gets `animation-delay: 0s, 0.4s, 0.8s, ...` per nth-child

#### CtaSection
- Centered strip: "Ready to begin your journey?"
- `Link` button: "Open the Book →" → `useBaseUrl('/intro')`
- Background: subtle violet gradient strip

---

### CSS Design Tokens (index.module.css)

```css
/* Colors — defined as local vars for self-containment */
--bg:           #050A14
--bg2:          #0A1628
--cyan:         #00D4FF
--violet:       #7B2FFF
--text:         #E2E8F0
--text-muted:   #64748B
--border-cyan:  rgba(0, 212, 255, 0.2)
--border-violet: rgba(123, 47, 255, 0.2)
--glow-cyan:    0 0 30px rgba(0, 212, 255, 0.2)
--glow-violet:  0 0 30px rgba(123, 47, 255, 0.2)
```

All values inlined (not custom properties) to avoid Docusaurus Infima variable conflicts.

---

### custom.css Update

Dark mode primary color change only — aligns Docusaurus docs sidebar links with neural brand:

```css
/* Before: teal (#25c2a0 family) */
/* After: neural cyan (#00bcd4 family — desaturated for text readability) */
[data-theme='dark'] {
  --ifm-color-primary:         #00bcd4;
  --ifm-color-primary-dark:    #00acc1;
  --ifm-color-primary-darker:  #00a0b4;
  --ifm-color-primary-darkest: #007d8f;
  --ifm-color-primary-light:   #26c6da;
  --ifm-color-primary-lighter: #4dd0e1;
  --ifm-color-primary-lightest: #80deea;
}
```

Light mode green stays unchanged.

---

## Reused Docusaurus APIs

| Import | Source | Usage |
|--------|--------|-------|
| `Layout` | `@theme/Layout` | Wraps page with navbar + footer |
| `Link` | `@docusaurus/Link` | CTA buttons and card links |
| `useBaseUrl` | `@docusaurus/useBaseUrl` | Path resolution for doc links |
| `useDocusaurusContext` | `@docusaurus/useDocusaurusContext` | Site title/tagline |
| `useRef`, `useEffect`, `useState` | `react` | Canvas, counters, animations |

---

## Quickstart

```powershell
# Dev server (from book/)
cd "C:\Hackathon 1\book"
npm start
# → Open http://localhost:3000/Physical-AI-Book/
# → Should show dark neural landing page (NOT redirect to /intro)
```

```powershell
# Build check
npm run build
# → Should complete with 0 TypeScript errors
```

---

## Verification Checklist

- [ ] `http://localhost:3000/Physical-AI-Book/` shows dark hero landing (not a redirect)
- [ ] Neural canvas animation is visible and animating
- [ ] "Start Reading →" button navigates to `/intro`
- [ ] Stats section counters animate on scroll
- [ ] All 4 module cards display and link to correct chapter pages
- [ ] Features section renders all 4 items
- [ ] Tech badges float-animate
- [ ] Navbar (Auth button) and footer still render correctly
- [ ] No TypeScript errors in terminal
- [ ] Dark/light mode toggle — landing page stays dark; docs sidebar uses updated cyan in dark mode
- [ ] Mobile responsive — sections stack on narrow viewports
