---
name: qdrant-indexer
description: Use this agent to re-index the Physical AI textbook into Neon Postgres (pgvector) after chapter MDX files change. It rebuilds docs_manifest.json if needed, runs backend/subagents/index_to_qdrant.py, and reports chunk/chapter counts plus any failures.
tools: Bash, Read, Glob
---

# qdrant-indexer

Subagent for indexing Physical AI textbook chapter content into Neon Postgres (pgvector) after any MDX chapter is created or updated.

## Trigger

This subagent should be invoked automatically after any of the following files are created or modified:
- `book/docs/**/*.md`
- `book/docs/**/*.mdx`

It should also be invoked manually after running `build_manifest.py`.

## What this subagent does

1. **Verify prerequisites** — checks that `backend/docs_manifest.json` exists and is non-empty
2. **Run the indexer** — executes `python backend/subagents/index_to_qdrant.py`
3. **Confirm output** — reads stdout and reports:
   - `Loaded manifest: <M> chapters` (chapters seen)
   - `Total chunks to index: <N>` (chunks built)
   - `Indexing complete. Total points in collection: <N>` (final count in Postgres)
   - Any `WARNING: Failed chapters: {...}` line (failed `chapter_id` set)
4. **Validate** — confirms the final `Total points in collection` count is ≥ the number of chunks built (no silent drops)

## Instructions for the AI

When invoked:

1. Check if `backend/docs_manifest.json` exists:
   - If not: first run `python backend/scripts/build_manifest.py` to generate it
   - If yes: proceed directly to step 2

2. Run the indexer:
   ```bash
   cd "C:\Hackathon 1" && python backend/subagents/index_to_qdrant.py
   ```

3. Parse the output (actual strings printed by the indexer):
   - `Loaded manifest: <M> chapters` — number of chapters read from the manifest
   - `Total chunks to index: <N>` — number of chunks built
   - `Indexing complete. Total points in collection: <N>` — final Postgres count
   - `WARNING: Failed chapters: {...}` (stderr) — any failed `chapter_id` set
   - `ERROR: ... not found` — manifest missing; run `build_manifest.py` first
   - If the script exits non-zero, report the error and suggest checking `DATABASE_URL` / `GOOGLE_API_KEY` in `.env`

4. After successful indexing, confirm:
   ```
   indexer complete:
     Chapters indexed: <M>      (from "Loaded manifest")
     Total chunks: <N>          (from "Total chunks to index")
     Points in collection: <N>  (from "Indexing complete. Total points...")
     Failed chapters: <set or "none">
     Postgres table: chapter_chunks
   ```

## Invocation

Manual invocation during chapter writing workflow:
```
/qdrant-indexer
```

Or reference this subagent in implementation tasks by noting:
> After writing/updating chapter MDX, the `qdrant-indexer` subagent must be run to keep the RAG index current.

## Error handling

| Error | Action |
|-------|--------|
| `docs_manifest.json` missing | Run `build_manifest.py` first |
| `DATABASE_URL` not set | Check `.env` file |
| `GOOGLE_API_KEY` not set | Check `.env` file — obtain API key |
| Connection refused | Verify Neon Postgres is accessible |
| Embedding quota exceeded | Wait 60s (free tier: 1500 RPD / 15 RPM) |
| `pgvector` extension missing | Extension is auto-created by the indexer via `CREATE EXTENSION IF NOT EXISTS vector` |
