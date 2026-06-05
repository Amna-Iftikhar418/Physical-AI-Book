"""
Index book chapters into Neon Postgres using pgvector.
- Reads docs_manifest.json
- Chunks each chapter (~500 tokens, 50-token overlap)
- Embeds with gemini-embedding-2 (3072 dims)
- Drops and recreates chapter_chunks table, then inserts all vectors
"""
import hashlib
import json
import re
import sys
import time
from pathlib import Path

import google.generativeai as genai
import psycopg2
from pgvector.psycopg2 import register_vector

BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from config import GOOGLE_API_KEY, DATABASE_URL

MANIFEST_PATH = BACKEND_DIR / "docs_manifest.json"
EMBEDDING_MODEL = "models/gemini-embedding-2"
EMBEDDING_DIMS = 3072
CHUNK_CHARS = 2000
OVERLAP_CHARS = 200
BATCH_SIZE = 10
BATCH_SLEEP_SECONDS = 5


def make_point_id(chapter_id: str, char_start: int) -> int:
    raw = f"{chapter_id}:{char_start}"
    digest = hashlib.sha256(raw.encode()).digest()
    return int.from_bytes(digest[:8], "big", signed=True)


def chunk_text(text: str, chapter_id: str) -> list[dict]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + CHUNK_CHARS, len(text))
        chunk = text[start:end]
        lines = chunk.strip().split("\n")
        heading = lines[0][:80] if lines else ""
        parts = chapter_id.split("/")
        module_id = parts[0] if parts else chapter_id
        chunks.append({
            "chapter_id": chapter_id,
            "module_id": module_id,
            "heading": heading,
            "text": chunk,
            "char_start": start,
        })
        start += CHUNK_CHARS - OVERLAP_CHARS
    return chunks


def _clean_url(url: str) -> str:
    # psycopg2 handles sslmode=require natively; strip channel_binding which it doesn't support
    return re.sub(r"[?&]channel_binding=[^&]*", "", url).rstrip("?&")


def setup_table(conn) -> None:
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS chapter_chunks")
    cur.execute(f"""
        CREATE TABLE chapter_chunks (
            id BIGINT PRIMARY KEY,
            chapter_id TEXT NOT NULL,
            module_id TEXT NOT NULL,
            heading TEXT,
            text TEXT NOT NULL,
            char_start INTEGER NOT NULL,
            embedding vector({EMBEDDING_DIMS})
        )
    """)
    cur.execute("CREATE INDEX ON chapter_chunks (chapter_id)")
    conn.commit()
    cur.close()
    print(f"Table 'chapter_chunks' created (dims={EMBEDDING_DIMS})")


def embed_texts(texts: list[str]) -> list[list[float]]:
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=texts,
        task_type="retrieval_document",
    )
    emb = result["embedding"]
    return emb if isinstance(emb[0], list) else [emb]


def index_manifest(manifest: dict) -> None:
    genai.configure(api_key=GOOGLE_API_KEY)
    conn = psycopg2.connect(_clean_url(DATABASE_URL))

    # Extension must exist before register_vector queries the pg_type catalog
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
    conn.commit()
    cur.close()

    register_vector(conn)
    setup_table(conn)

    all_chunks: list[dict] = []
    for chapter_id, text in manifest.items():
        all_chunks.extend(chunk_text(text, chapter_id))

    print(f"Total chunks to index: {len(all_chunks)}")
    failed: list[str] = []
    cur = conn.cursor()

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

        rows = [
            (
                make_point_id(c["chapter_id"], c["char_start"]),
                c["chapter_id"],
                c["module_id"],
                c["heading"],
                c["text"],
                c["char_start"],
                v,
            )
            for c, v in zip(batch, vectors)
        ]
        cur.executemany(
            "INSERT INTO chapter_chunks (id, chapter_id, module_id, heading, text, char_start, embedding) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            rows,
        )
        conn.commit()
        print(f"  Indexed batch {i}–{i+len(batch)-1} ({len(rows)} rows)")

        if i + BATCH_SIZE < len(all_chunks):
            time.sleep(BATCH_SLEEP_SECONDS)

    cur.execute("SELECT COUNT(*) FROM chapter_chunks")
    count = cur.fetchone()[0]
    cur.close()
    conn.close()

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
