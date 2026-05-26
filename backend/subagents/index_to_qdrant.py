"""
T044/T045: Index book chapters into Qdrant.
- Reads docs_manifest.json
- Chunks each chapter (~500 tokens, 50-token overlap)
- Embeds with text-embedding-004 (768 dims)
- Upserts into Qdrant 'chapter_chunks' collection
Point ID = sha256(chapter_id + str(char_start))
"""
import asyncio
import hashlib
import json
import sys
import time
from pathlib import Path

import google.generativeai as genai
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
)

# Path resolution: backend/ parent is repo root
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from config import GOOGLE_API_KEY, QDRANT_URL, QDRANT_API_KEY

MANIFEST_PATH = BACKEND_DIR / "docs_manifest.json"
COLLECTION_NAME = "chapter_chunks"
EMBEDDING_MODEL = "models/gemini-embedding-2"
EMBEDDING_DIMS = 3072
CHUNK_CHARS = 2000        # ~500 tokens at 4 chars/token
OVERLAP_CHARS = 200       # ~50 tokens overlap
BATCH_SIZE = 10
BATCH_SLEEP_SECONDS = 5


def make_point_id(chapter_id: str, char_start: int) -> str:
    raw = f"{chapter_id}:{char_start}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]  # 64-bit hex string → int


def make_point_id_int(chapter_id: str, char_start: int) -> int:
    raw = f"{chapter_id}:{char_start}"
    digest = hashlib.sha256(raw.encode()).digest()
    # Take first 8 bytes as unsigned int
    return int.from_bytes(digest[:8], "big")


def chunk_text(text: str, chapter_id: str) -> list[dict]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + CHUNK_CHARS, len(text))
        chunk_text = text[start:end]

        # Extract heading from first line if available
        lines = chunk_text.strip().split("\n")
        heading = lines[0][:80] if lines else ""

        # Infer module_id from chapter_id prefix
        parts = chapter_id.split("/")
        module_id = parts[0] if parts else chapter_id

        chunks.append({
            "chapter_id": chapter_id,
            "module_id": module_id,
            "heading": heading,
            "text": chunk_text,
            "char_start": start,
        })
        start += CHUNK_CHARS - OVERLAP_CHARS
    return chunks


def setup_collection(client: QdrantClient) -> None:
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME in existing:
        client.delete_collection(COLLECTION_NAME)

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=EMBEDDING_DIMS, distance=Distance.COSINE),
    )
    print(f"Collection '{COLLECTION_NAME}' created (size={EMBEDDING_DIMS}, COSINE)")


def embed_texts(texts: list[str]) -> list[list[float]]:
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=texts,
        task_type="retrieval_document",
    )
    return result["embedding"] if isinstance(result["embedding"][0], list) else [result["embedding"]]


def index_manifest(manifest: dict) -> None:
    genai.configure(api_key=GOOGLE_API_KEY)
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

    setup_collection(client)

    all_chunks: list[dict] = []
    for chapter_id, text in manifest.items():
        chunks = chunk_text(text, chapter_id)
        all_chunks.extend(chunks)

    print(f"Total chunks to index: {len(all_chunks)}")
    failed: list[str] = []

    for i in range(0, len(all_chunks), BATCH_SIZE):
        batch = all_chunks[i: i + BATCH_SIZE]
        texts = [c["text"] for c in batch]

        try:
            vectors = embed_texts(texts)
        except Exception as exc:
            print(f"  Embedding batch {i}–{i+len(batch)} FAILED: {exc}", file=sys.stderr)
            for c in batch:
                failed.append(c["chapter_id"])
            continue

        points = [
            PointStruct(
                id=make_point_id_int(c["chapter_id"], c["char_start"]),
                vector=v,
                payload={
                    "chapter_id": c["chapter_id"],
                    "module_id": c["module_id"],
                    "heading": c["heading"],
                    "text": c["text"],
                    "char_start": c["char_start"],
                },
            )
            for c, v in zip(batch, vectors)
        ]
        client.upsert(collection_name=COLLECTION_NAME, points=points)
        print(f"  Indexed batch {i}–{i+len(batch)-1} ({len(points)} points)")

        if i + BATCH_SIZE < len(all_chunks):
            time.sleep(BATCH_SLEEP_SECONDS)

    count = client.count(COLLECTION_NAME).count
    print(f"\nIndexing complete. Total points in collection: {count}")
    if failed:
        print(f"WARNING: Failed chapters: {set(failed)}", file=sys.stderr)


def main():
    if not MANIFEST_PATH.exists():
        print(f"ERROR: {MANIFEST_PATH} not found. Run build_manifest.py first.", file=sys.stderr)
        sys.exit(1)

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    print(f"Loaded manifest: {len(manifest)} chapters")
    index_manifest(manifest)


if __name__ == "__main__":
    main()
