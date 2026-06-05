"""
RAG pipeline — embed query, search pgvector (Neon Postgres), generate answer.
"""
from __future__ import annotations

import google.generativeai as genai
from sqlalchemy import text

from db.connection import AsyncSessionLocal
from services.agents import book_model
from utils.retry import with_retry

EMBEDDING_MODEL = "models/gemini-embedding-2"
TOP_K = 5
SCORE_THRESHOLD = 0.70


def embed_query(query_text: str) -> list[float]:
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=query_text,
        task_type="retrieval_query",
    )
    emb = result["embedding"]
    return emb if isinstance(emb[0], float) else emb[0]


async def search_chunks(
    vector: list[float],
    chapter_id: str | None = None,
    top_k: int = TOP_K,
) -> list[dict]:
    vec_str = "[" + ",".join(str(float(x)) for x in vector) + "]"

    if chapter_id:
        stmt = text("""
            SELECT chapter_id, heading, text,
                   (1 - (embedding <=> CAST(:vec AS vector)))::float AS score
            FROM chapter_chunks
            WHERE chapter_id = :chapter_id
            ORDER BY embedding <=> CAST(:vec AS vector)
            LIMIT :top_k
        """)
        params = {"vec": vec_str, "chapter_id": chapter_id, "top_k": top_k}
    else:
        stmt = text("""
            SELECT chapter_id, heading, text,
                   (1 - (embedding <=> CAST(:vec AS vector)))::float AS score
            FROM chapter_chunks
            ORDER BY embedding <=> CAST(:vec AS vector)
            LIMIT :top_k
        """)
        params = {"vec": vec_str, "top_k": top_k}

    async with AsyncSessionLocal() as session:
        result = await session.execute(stmt, params)
        rows = result.fetchall()

    return [
        {
            "chapter_id": row.chapter_id,
            "heading": row.heading,
            "text": row.text,
            "score": row.score,
        }
        for row in rows
        if row.score >= SCORE_THRESHOLD
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
