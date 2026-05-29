# Research: Landing Page Redesign — Dark Neural Aesthetic

**Date**: 2026-05-27 | **Feature**: Landing Page Redesign

## Question 1: Canvas Animation SSR Safety in Docusaurus

**Decision**: Use `useEffect` exclusively for all canvas code; never execute canvas API at module load time.  
**Rationale**: Docusaurus uses server-side rendering (SSR) during `npm run build`. The `window` and `document` globals do not exist in Node.js SSR context. Calling `canvas.getContext('2d')` outside of `useEffect` causes a build crash.  
**How to apply**: `canvasRef.current?.getContext('2d')` inside `useEffect(() => { ... }, [])` is the safe pattern. No `typeof window` guard needed when inside `useEffect`.  
**Alternatives rejected**: `typeof window !== 'undefined'` guard at top level — works but adds unnecessary complexity; `useEffect` is cleaner.

## Question 2: CSS Scoping — Module vs. Global

**Decision**: `index.module.css` for all landing page styles; only update CSS custom properties in `custom.css`.  
**Rationale**: Docusaurus Infima CSS framework defines hundreds of `--ifm-*` custom properties globally. If we add landing page styles to `custom.css`, they can conflict with Infima defaults on doc pages (selectors like `.hero`, `.container`, `.card` are already defined by Infima). CSS Modules scope by hash suffix ensures zero leakage.  
**Alternatives rejected**: Inline styles — verbose, cannot express `@keyframes`, pseudo-selectors, or media queries. Separate global CSS file — same conflict risk as `custom.css`.

## Question 3: No New npm Packages

**Decision**: Zero new packages. Use only browser-native APIs and existing Docusaurus utilities.  
**Rationale**: Adding packages like `framer-motion`, `three.js`, `tsparticles`, or `react-spring` creates risk of Docusaurus webpack 5 compatibility issues (these libraries often use Node.js globals or CJS modules incompatible with Docusaurus SSR). The project is close to submission; introducing new dependencies could break the build at the worst time.  
**Alternatives rejected**: `tsparticles` (particle library) — overkill, 150KB bundle; `framer-motion` — excellent library but SSR setup requires `LazyMotion` wrapper complexity; `three.js` — 600KB, massive overkill for a 2D node graph.

## Question 4: `Redirect` Component Removal

**Decision**: The `Redirect` import and usage in the existing `index.tsx` is completely removed. The file becomes a proper page component rendering `Layout`.  
**Rationale**: Docusaurus `<Redirect>` sets `window.location.href` on the client, causing a flash of blank content before navigation. A proper landing page cannot coexist with an immediate redirect.  
**Impact**: Users who previously bookmarked `/Physical-AI-Book/` get the landing page instead of jumping to intro. The `/intro` URL still works directly and "Start Reading" CTA links there.

## Question 5: `IntersectionObserver` for Counter Animation

**Decision**: Use `IntersectionObserver` to trigger stat counters only when the stats section scrolls into view.  
**Rationale**: Animating from 0 → 4, 0 → 13, etc. before the user has scrolled down wastes the animation effect. `IntersectionObserver` is a native browser API (no polyfill needed for modern browsers), triggers once via `{ once: true }` option, and is SSR-safe when called inside `useEffect`.  
**Alternatives rejected**: `setTimeout` on mount — runs before user sees the element; `scroll` event listener — performance-heavy, requires manual throttle.

## Question 6: Docusaurus `Layout` Component Usage

**Decision**: Wrap entire landing page in `<Layout title="..." description="...">` from `@theme/Layout`.  
**Rationale**: This ensures the Docusaurus navbar (which includes `AuthButton`) and footer are rendered on the landing page. Without this wrapper, the landing page would have no navigation.  
**Impact**: The Docusaurus navbar background may conflict with the dark landing page background. Mitigation: apply `background: transparent` on the navbar via a scoped CSS rule in `index.module.css` targeting `:global(.navbar)` on the landing page only — OR accept the navbar has its own background (consistent with docs pages). Simpler approach chosen: accept existing navbar styling; focus custom CSS on page content below navbar.

## Summary of Non-Issues (No Research Needed)

- **TypeScript types**: All used APIs (`useRef`, `useEffect`, `useState`, `HTMLCanvasElement`, `CanvasRenderingContext2D`) are fully typed in React 19 + TypeScript 6.
- **Responsive CSS**: CSS Grid `auto-fit minmax()` is the established responsive pattern; no research needed.
- **Docusaurus `useBaseUrl`**: Already used in other components in this project; pattern confirmed.
- **Emoji icons**: Unicode emojis render consistently across all modern browsers; no font loading needed.
