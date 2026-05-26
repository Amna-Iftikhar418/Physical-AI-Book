"""
T049: POST /api/chat — RAG chatbot endpoint.
T058: POST /api/chat/select — chapter-scoped RAG endpoint (Phase 4 prep).
"""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from db.connection import get_db
from db.models import Conversation, Message
from services.rag import embed_query, search_qdrant, run_rag_query

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    chapter_id: Optional[str] = None


class ChatSelectRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    chapter_id: str  # required for select endpoint


class SourceRef(BaseModel):
    chapter_id: str
    heading: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    session_id: str
    sources: list[SourceRef]


async def _run_chat(
    query: str,
    chapter_id: Optional[str],
    session_id: Optional[str],
    db: AsyncSession,
) -> ChatResponse:
    try:
        vector = embed_query(query)
        chunks = search_qdrant(vector, chapter_id=chapter_id)
        # Landing pages are served at '/module-x/' but stored as 'module-x/index'.
        if chapter_id and not chunks and not chapter_id.endswith("/index"):
            chunks = search_qdrant(vector, chapter_id=f"{chapter_id}/index")
        answer = await run_rag_query(query, chunks)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"RAG pipeline unavailable: {exc}") from exc

    # Persist conversation + messages
    conv_uuid = uuid.UUID(session_id) if session_id else uuid.uuid4()
    try:
        conv = Conversation(id=conv_uuid, chapter_id=chapter_id)
        db.add(conv)
        db.add(Message(conversation_id=conv_uuid, role="user", content=query))
        db.add(Message(conversation_id=conv_uuid, role="assistant", content=answer))
        await db.commit()
    except Exception:
        await db.rollback()
        # Non-fatal: proceed with response even if DB write fails

    sources = [
        SourceRef(chapter_id=c["chapter_id"], heading=c["heading"], score=c["score"])
        for c in chunks
    ]
    return ChatResponse(answer=answer, session_id=str(conv_uuid), sources=sources)


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, db: AsyncSession = Depends(get_db)):
    return await _run_chat(body.query, body.chapter_id, body.session_id, db)


@router.post("/chat/select", response_model=ChatResponse)
async def chat_select(body: ChatSelectRequest, db: AsyncSession = Depends(get_db)):
    return await _run_chat(body.query, body.chapter_id, body.session_id, db)
