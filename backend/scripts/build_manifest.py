"""
T042: Build docs_manifest.json from all MDX/MD files in book/docs/.
Strips frontmatter and JSX, extracts plain text.
Outputs: backend/docs_manifest.json mapping chapter_id → plain text.
"""
import json
import os
import re
import sys
from pathlib import Path

BOOK_DOCS_DIR = Path(__file__).parent.parent.parent / "book" / "docs"
OUTPUT_PATH = Path(__file__).parent.parent / "docs_manifest.json"


def strip_frontmatter(text: str) -> str:
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            return text[end + 3:].lstrip()
    return text


def strip_jsx(text: str) -> str:
    # Remove import statements
    text = re.sub(r'^import\s+.*$', '', text, flags=re.MULTILINE)
    # Remove JSX tags (e.g. <TabItem>, <Tabs>, etc.)
    text = re.sub(r'<[A-Z][^>]*/>', '', text)
    text = re.sub(r'<[A-Z][^>]*>.*?</[A-Z][^>]*>', '', text, flags=re.DOTALL)
    # Remove mermaid code blocks (keep them as text indicators)
    text = re.sub(r'```mermaid.*?```', '[DIAGRAM]', text, flags=re.DOTALL)
    return text


def md_to_plain(text: str) -> str:
    text = strip_frontmatter(text)
    text = strip_jsx(text)
    # Remove markdown formatting but keep text
    text = re.sub(r'#{1,6}\s+', '', text)          # headings
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)   # bold
    text = re.sub(r'\*(.+?)\*', r'\1', text)        # italic
    text = re.sub(r'`{3}[a-z]*\n.*?`{3}', '', text, flags=re.DOTALL)  # code blocks
    text = re.sub(r'`([^`]+)`', r'\1', text)        # inline code
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)  # links
    text = re.sub(r'^[-*]\s+', '', text, flags=re.MULTILINE)  # list items
    text = re.sub(r'^\|.*\|$', '', text, flags=re.MULTILINE)  # tables
    text = re.sub(r'^[-|:]+$', '', text, flags=re.MULTILINE)  # table separators
    text = re.sub(r'\n{3,}', '\n\n', text)          # collapse whitespace
    return text.strip()


def path_to_chapter_id(md_path: Path, base: Path) -> str:
    rel = md_path.relative_to(base)
    # Remove .md extension; use forward slashes
    parts = list(rel.parts)
    parts[-1] = parts[-1].replace(".md", "").replace(".mdx", "")
    return "/".join(parts)


def build_manifest() -> dict:
    manifest = {}
    md_files = list(BOOK_DOCS_DIR.rglob("*.md")) + list(BOOK_DOCS_DIR.rglob("*.mdx"))
    for md_file in sorted(md_files):
        chapter_id = path_to_chapter_id(md_file, BOOK_DOCS_DIR)
        raw = md_file.read_text(encoding="utf-8")
        plain = md_to_plain(raw)
        if plain:
            manifest[chapter_id] = plain

    return manifest


def main():
    print(f"Scanning: {BOOK_DOCS_DIR}")
    if not BOOK_DOCS_DIR.exists():
        print(f"ERROR: {BOOK_DOCS_DIR} does not exist", file=sys.stderr)
        sys.exit(1)

    manifest = build_manifest()
    OUTPUT_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Written {len(manifest)} chapters to {OUTPUT_PATH}")
    for chapter_id, text in manifest.items():
        print(f"  {chapter_id}: {len(text.split())} words")


if __name__ == "__main__":
    main()
