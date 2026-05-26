# ADR-001: Replace OpenAI API Stack with Google Gemini Free Tier

- **Status**: Accepted
- **Date**: 2026-05-26
- **Feature**: physical-ai-textbook
- **Constitution Version at Decision**: 1.1.1 → amended to 1.1.2

## Context

The constitution (v1.1.1) mandated the OpenAI Agents SDK and OpenAI models (`gpt-4o-mini`,
`text-embedding-3-small`). OpenAI has no free tier — estimated cost is $2–5 for embedding
the textbook plus hackathon evaluation API calls. The project must be 100% free with no
credit card required and no trial credits that expire. A replacement must support:

1. LLM capable of RAG Q&A, content rewriting, and Urdu translation
2. Embedding generation for Qdrant vector search
3. Python SDK usable in a deployed cloud environment (Railway/Render)
4. Permanent free tier (not trial-based)
5. Rate limit handling via retry logic (15 RPM free tier limit)

## Decision

Replace the OpenAI stack with **Google Generative AI** using a single Google AI Studio API key:

| Component | Old (Paid) | New (Free) |
|-----------|-----------|-----------|
| LLM | `gpt-4o-mini` | `gemini-2.0-flash` |
| Embeddings | `text-embedding-3-small` (1536-dim) | `text-embedding-004` (768-dim) |
| SDK | `openai-agents` + `openai` | `google-generativeai` |
| API key env var | `OPENAI_API_KEY` | `GOOGLE_API_KEY` |
| Qdrant vector size | `size=1536` | `size=768` |
| Orchestration | Agent/Runner pattern | Direct `GenerativeModel.generate_content()` |

Rate limit mitigation:
- Exponential backoff retry wrapper (`backend/utils/retry.py`) on all LLM and embed calls
- Batch pacing in indexing script (10 chunks/call, 5s between batches)
- Frontend timeout increased to 45 seconds; user-friendly 429 message shown

## Consequences

### Positive

- **Zero cost**: Google AI Studio free tier — 1500 RPD, 15 RPM, no expiry, no credit card
  required in most regions.
- **Single provider**: one API key, one SDK, one dashboard.
- **Urdu quality**: Gemini 2.0 Flash has first-class Urdu language support — directly
  benefits the Urdu translation feature (P5).
- **Embedding quality**: `text-embedding-004` with `task_type` parameter (`retrieval_document`
  / `retrieval_query`) improves RAG retrieval accuracy vs. generic embeddings.
- **Simpler orchestration**: direct `generate_content()` calls replace the openai-agents
  Agent/Runner abstraction — fewer dependencies, faster cold starts.
- **Smaller requirements.txt**: removes `openai-agents` and `openai`; adds only
  `google-generativeai`.

### Negative

- **15 RPM limit**: rapid sequential API calls can hit the rate cap. Mitigated by the
  exponential backoff retry wrapper on all calls.
- **Qdrant dimension change**: `chapter_chunks` collection must be recreated with `size=768`
  (not backward compatible with any existing 1536-dim data). `recreate_collection()` handles
  this idempotently.
- **Sync SDK**: `google-generativeai` `generate_content()` is synchronous — wrapped with
  `asyncio.to_thread()` for use in FastAPI async routes (Python 3.11+).
- **Regional availability**: Google AI Studio may require a Google account login. No credit
  card required for the free tier in supported regions.

## Alternatives Considered

**Alternative A — Groq (LLaMA 3.3-70B) + Jina AI (jina-embeddings-v3, 1024-dim)**
- Groq free tier is more generous (30 RPM) and extremely fast.
- Rejected because: two providers, two API keys, two rate limit surfaces. Jina's
  1024-dim embeddings require a Qdrant collection rebuild just like this decision.
  Urdu quality of LLaMA models is lower than Gemini's multilingual training.

**Alternative B — Groq (LLaMA 3.3-70B) + sentence-transformers (local, 384/768-dim)**
- No embedding API cost; model runs in FastAPI container.
- Rejected because: `all-MiniLM-L6-v2` is English-optimized and produces weak
  cross-lingual embeddings (degrades RAG quality). BAAI/bge-base-en needs ~400MB RAM
  — exceeds Railway free tier (512MB) when combined with FastAPI overhead.

**Alternative C — Keep OpenAI, fund with $5 credit**
- Rejected: the constraint is 100% free with no credit card and no expiring credits.

## References

- Feature Spec: `specs/physical-ai-textbook/spec.md`
- Implementation Plan: `specs/physical-ai-textbook/plan.md`
- Constitution: `.specify/memory/constitution.md` (v1.1.2)
- Google AI Studio free tier: https://ai.google.dev/pricing
- google-generativeai SDK: https://pypi.org/project/google-generativeai/
- text-embedding-004 docs: https://ai.google.dev/gemini-api/docs/embeddings
