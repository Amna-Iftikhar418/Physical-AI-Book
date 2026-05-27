---
name: obsidian-codex-full-ui-redesign
description: Complete frontend redesign — Obsidian Codex theme with Playfair Display headings, Crimson Pro body, Outfit UI, amber-gold accents; navbar, sidebar, TOC, buttons, landing page.
metadata:
  type: general
  stage: general
  date: 2026-05-27
  surface: agent
  model: claude-sonnet-4-6
  feature: none
  branch: main
  user: Amna Iftikhar
  command: frontend-design skill + manual redesign
  labels: ["ui", "design", "css", "typography", "theme", "frontend"]
---

## Prompt

use frontend design skill and make it excellent. also design button navbar, font, text, sidebar and right bar. make it professional book. and excellent

## Response

Implemented full **Obsidian Codex** theme redesign across 3 files:

### Design Direction
- **Tone**: Dark scholarly academia meets precision engineering
- **Palette**: Near-black ink `#0d0d0f` + warm amber-gold `#e8a020` (completely replaces previous cyan/violet)
- **Differentiator**: Playfair Display serif headings give it the feel of a premium MIT Press textbook rendered in digital form

### Typography Stack
| Role | Font |
|------|------|
| Headings (H1–H3) | Playfair Display (700–800wt, italic variants) |
| Body / Markdown | Crimson Pro (serif, 1.9 line-height) |
| Nav / UI / Labels | Outfit (geometric sans, tracked uppercase for labels) |
| Code / Mono | JetBrains Mono |

### Files Changed
- `book/src/css/custom.css` — complete rewrite: Google Fonts @import, all IFM variable overrides, navbar (frosted obsidian glass + amber border), sidebar (Outfit labels + amber left-border active), TOC (amber active links), blockquotes (Playfair italic), tables (Outfit uppercase headers), pagination (Playfair label), cards, admonitions, scrollbar, search
- `book/src/pages/index.module.css` — landing page redesign: amber neural canvas, editorial hero chip with flanking lines, monumental Playfair title, amber gradient accent, sharp CTA button (uppercase Outfit), stats with Playfair numbers, module cards with editorial numbering (Module 01–04), decorative `::before` CTA watermark text
- `book/src/pages/index.tsx` — neural canvas nodes/lines changed to amber `rgba(232,160,32,...)`, module icons updated from emojis to "Module 01–04" text labels, section labels added (Curriculum / Features / Technology)

### Verified
- `curl http://localhost:3000/Physical-AI-Book/styles.css` confirms Google Fonts @import and all amber CSS vars are in the live bundle
- No compilation errors; dev server running on port 3000
