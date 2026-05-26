"""
T048: RAG pipeline — embed query, search Qdrant, generate answer.
"""
from __future__ import annotations

import google.generativeai as genai
from qdrant_client import QdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue

from config import QDRANT_URL, QDRANT_API_KEY
from services.agents import book_model
from utils.retry import with_retry

EMBEDDING_MODEL = "models/gemini-embedding-2"
COLLECTION_NAME = "chapter_chunks"
TOP_K = 5
SCORE_THRESHOLD = 0.70

_qdrant: QdrantClient | None = None


def _get_qdrant() -> QdrantClient:
    global _qdrant
    if _qdrant is None:
        _qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    return _qdrant


def embed_query(text: str) -> list[float]:
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query",
    )
    emb = result["embedding"]
    # embed_content returns a list of floats for single string input
    return emb if isinstance(emb[0], float) else emb[0]


def search_qdrant(
    vector: list[float],
    chapter_id: str | None = None,
    top_k: int = TOP_K,
) -> list[dict]:
    query_filter = None
    if chapter_id:
        query_filter = Filter(
            must=[FieldCondition(key="chapter_id", match=MatchValue(value=chapter_id))]
        )

    result = _get_qdrant().query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=top_k,
        score_threshold=SCORE_THRESHOLD,
        query_filter=query_filter,
        with_payload=True,
    )
    return [
        {
            "chapter_id": h.payload.get("chapter_id", ""),
            "heading": h.payload.get("heading", ""),
            "text": h.payload.get("text", ""),
            "score": h.score,
        }
        for h in result.points
    ]


async def run_rag_query(query: str, context_chunks: list[dict]) -> str:
    if not context_chunks:
        return "I don't have information about that in the textbook."

    context_block = "\n\n---\n\n".join(
        f"[{c['chapter_id']}] {c['heading']}\n{c['text']}"
        for c in context_chunks
    )
    prompt = (
        f"Context from the textbook:\n\n{context_block}\n\n"
        f"Question: {query}\n\n"
        "Answer based only on the context above:"
    )

    response = await with_retry(
        lambda: book_model.generate_content_async(prompt)
    )
    return response.text
