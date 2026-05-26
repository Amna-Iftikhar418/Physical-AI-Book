---
description: Generate a structured Markdown chapter outline (H2 sections, sub-topic bullets, code-example placeholders, learning objectives) for a Physical AI & Humanoid Robotics textbook chapter, grounded in the constitution.
argument-hint: <chapter-id>
---

# generate-chapter-outline

Generate a structured Markdown chapter outline for the Physical AI & Humanoid Robotics textbook.

The requested chapter id is: **$ARGUMENTS**

## Usage

```
/generate-chapter-outline <chapter-id>
```

Where `<chapter-id>` is one of:
- `intro`
- `learning-outcomes`
- `hardware/requirements`
- `module-1-ros2/index`
- `module-1-ros2/week-1-2-foundations`
- `module-1-ros2/week-3-5-ros2-fundamentals`
- `module-1-ros2/week-3-5-ros2-advanced`
- `module-2-digital-twin/index`
- `module-2-digital-twin/week-6-7-gazebo`
- `module-2-digital-twin/week-6-7-unity`
- `module-3-isaac/index`
- `module-3-isaac/week-8-10-isaac-sim`
- `module-3-isaac/week-8-10-perception`
- `module-3-isaac/week-8-10-sim-to-real`
- `module-4-vla/index`
- `module-4-vla/week-11-12-humanoid`
- `module-4-vla/week-13-conversational`
- `assessments/index`

## What this skill does

1. **Read constitution** — loads `.specify/memory/constitution.md` to confirm topic scope, module structure, weekly breakdown, and the 6 learning outcomes.

2. **Read requirements** — loads `requirements.md` for course details, hardware specs, and assessment descriptions.

3. **Generate outline** following this structure:

```markdown
# <Chapter Title>

> **Learning Objectives** (tied to course outcomes LO1–LO6)
> - LO#: ...

## <H2 Section 1 — matches weekly breakdown>
- bullet sub-topic 1
- bullet sub-topic 2
- bullet sub-topic 3
[CODE EXAMPLE: <brief description of what example will demonstrate>]

## <H2 Section 2>
- bullet sub-topic 1
- bullet sub-topic 2
- bullet sub-topic 3
- bullet sub-topic 4
[CODE EXAMPLE: <brief description>]

...
```

4. **Rules enforced**:
   - Every H2 section must map to the weekly breakdown in the constitution
   - Minimum 3, maximum 5 bullet sub-topics per H2 section
   - Exactly one `[CODE EXAMPLE: ...]` placeholder per H2 section
   - Each Learning Objective must reference at least one of the 6 course outcomes (LO1–LO6)
   - No fabricated specs — all facts from constitution/requirements only
   - Target word count for full chapter: ≥800 words

5. **Output**: Print the completed outline, then confirm:
   ```
   Outline generated for: <chapter-id>
   Sections: <N>
   Estimated word count when written: ~<N*200> words
   Learning outcomes covered: LO<X>, LO<Y>...
   ```

## Instructions for the AI

When invoked:

1. Read `.specify/memory/constitution.md` — extract: 4 modules, 13-week breakdown, 6 learning outcomes, 4 assessments
2. Read `requirements.md` — extract: course details, hardware specs, weekly topics
3. Identify which module and weeks the requested `<chapter-id>` covers
4. Map those weeks to the weekly breakdown in the constitution
5. Generate the outline following the structure above
6. Do NOT write the full chapter yet — only the outline
7. Print the outline and the confirmation summary

This skill is intended to be called BEFORE writing each chapter MDX file (T020–T037).
