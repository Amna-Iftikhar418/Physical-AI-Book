"""
One-shot migration: create keyword payload indexes on chapter_chunks collection.
Run from backend/ directory: python create_qdrant_indexes.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from config import QDRANT_URL, QDRANT_API_KEY
from qdrant_client import QdrantClient

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
COLLECTION = "chapter_chunks"

info = client.get_collection(COLLECTION)
print(f"Collection '{COLLECTION}' — {info.points_count} points")

for field in ("chapter_id", "module_id"):
    try:
        result = client.create_payload_index(
            collection_name=COLLECTION,
            field_name=field,
            field_schema="keyword",
            wait=True,
        )
        print(f"  ✓ Index created on '{field}': {result}")
    except Exception as e:
        print(f"  ! Index on '{field}': {e}")

print("Done.")
