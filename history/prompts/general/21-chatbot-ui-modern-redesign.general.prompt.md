---
name: 21-chatbot-ui-modern-redesign
description: Full redesign of ChatWidget — FAB button, ChatPanel, SelectionButton — with dark glassmorphism, animated typing indicator, suggested questions, and source chips
metadata:
  type: general
  stage: green
  date: 2026-05-28
  feature: chatbot-ui
  branch: main
  user: Amna Iftikhar
  surface: agent
  model: claude-sonnet-4-6
---

## Prompt

make chatbot UI excellent and modern

## Response

Redesigned all three ChatWidget files:

**ChatPanel.tsx** — complete overhaul:
- Dark glassmorphism panel (`rgba(10,12,22,0.97)` + `backdrop-filter: blur(24px)`)
- Header with bot avatar, "Physical AI Assistant" title, animated green status pulse, close button
- Welcome screen with 4 suggested question chips (pre-fills input on click)
- Per-message avatar icons: robot for assistant, person for user
- User messages: right-aligned blue gradient bubbles
- Assistant messages: left-aligned dark surface with blue border, full ReactMarkdown rendering
- `strong` → gold (#fbbf24), `code` → blue-tinted pill, `pre` → dark code block
- Animated typing indicator: 3 staggered bouncing dots
- Source chips: gold pill badges with book icon
- Auto-resize textarea (max 120px), Enter to send / Shift+Enter newline
- Error state: red-tinted alert box with warning icon

**index.tsx** — FAB button:
- Robot head icon (matching the panel avatar)
- Pulse animation when closed; icon rotates 90° on open/close
- Hover scale-up effect via CSS class

**SelectionButton.tsx** — text-selection popup:
- Blue gradient pill matching panel aesthetic
- Hover scale-up via onMouseEnter/Leave
- Robot icon prefix

## Files Modified

- book/src/components/ChatWidget/ChatPanel.tsx
- book/src/components/ChatWidget/index.tsx
- book/src/components/ChatWidget/SelectionButton.tsx

## Outcome

TypeScript: 0 errors in ChatWidget files (pre-existing unrelated errors in pages/index.tsx only).
