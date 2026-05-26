# qdrant-indexer

Subagent for indexing Physical AI textbook chapter content into Qdrant Cloud after any MDX chapter is created or updated.

## Trigger

This subagent should be invoked automatically after any of the following files are created or modified:
- `book/docs/**/*.md`
- `book/docs/**/*.mdx`

It should also be invoked manually after running `build_manifest.py`.

## What this subagent does

1. **Verify prerequisites** — checks that `backend/docs_manifest.json` exists and is non-empty
2. **Run the indexer** — executes `python backend/subagents/index_to_qdrant.py`
3. **Confirm output** — reads stdout and reports:
   - `Indexed N chunks across M chapters`
   - Any failed `chapter_id` entries (with error message)
4. **Validate** — runs a quick count query against the Qdrant `chapter_chunks` collection to verify chunk count is ≥ expected

## Instructions for the AI

When invoked:

1. Check if `backend/docs_manifest.json` exists:
   - If not: first run `python backend/scripts/build_manifest.py` to generate it
   - If yes: proceed directly to step 2

2. Run the indexer:
   ```bash
   cd "C:\Hackathon 1" && python backend/subagents/index_to_qdrant.py
   ```

3. Parse the output:
   - Look for lines matching `Indexed \d+ chunks` — report total
   - Look for lines matching `ERROR` or `FAILED` — report any failures
   - If the script exits non-zero, report the error and suggest checking `QDRANT_URL` / `QDRANT_API_KEY` in `.env`

4. After successful indexing, confirm:
   ```
   qdrant-indexer complete:
     Chapters indexed: <M>
     Total chunks: <N>
     Failed chapters: <list or "none">
     Qdrant collection: chapter_chunks
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
| `QDRANT_URL` not set | Check `.env` file — provision Qdrant Cloud (T010) |
| `GOOGLE_API_KEY` not set | Check `.env` file — obtain API key (T011) |
| Connection refused | Verify Qdrant Cloud cluster is running |
| Embedding quota exceeded | Wait 60s (free tier: 1500 RPD / 15 RPM) |
