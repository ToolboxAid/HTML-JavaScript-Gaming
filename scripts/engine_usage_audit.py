#!/usr/bin/env python3
# Toolbox Aid
# David Quesenberry
# 03/25/2026
# engine_usage_audit.py

"""
Scan JS files to detect engine imports/usages and suggest index.html entries.

Usage:
  python scripts/engine_usage_audit.py <repo_root>

This is a best-effort heuristic:
- looks for import paths and class names
- maps to canonical engine labels

No file changes are made; prints a report.
"""

import sys
import re
from pathlib import Path
from collections import defaultdict

CANONICAL = [
    ("core / Engine", r"\bEngine\b"),
    ("render / CanvasRenderer", r"\bCanvasRenderer\b"),
    ("input / InputService", r"\bInputService\b"),
    ("input / ActionInputService", r"\bActionInputService\b"),
    ("scenes / Scene", r"\bScene\b"),
    ("camera / Camera2D", r"\bCamera2D\b"),
    ("assets / SpriteAtlas", r"\bSpriteAtlas\b"),
    ("assets / ImageLoader", r"\bImageLoader\b"),
    ("theme / Theme", r"\bTheme\b"),
]

JS_EXT = {".js", ".mjs", ".ts"}

def scan_file(path):
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return set()
    hits = set()
    for label, pattern in CANONICAL:
        if re.search(pattern, text):
            hits.add(label)
    return hits

def main():
    if len(sys.argv) < 2:
        print("Usage: python engine_usage_audit.py <repo_root>")
        sys.exit(1)
    root = Path(sys.argv[1])
    if not root.exists():
        print(f"Path not found: {root}")
        sys.exit(1)

    buckets = defaultdict(set)

    for p in root.rglob("*"):
        if p.suffix.lower() in JS_EXT and p.is_file():
            rel = p.relative_to(root)
            parts = rel.parts
            if len(parts) >= 2 and parts[0] in ("samples", "games"):
                key = "/".join(parts[:2])  # samples/SampleXXX or games/<name>
                buckets[key] |= scan_file(p)

    # Print report
    print("=== Engine Usage Audit Report ===")
    for key in sorted(buckets.keys()):
        used = buckets[key]
        # Order by canonical list
        ordered = [label for (label, _) in CANONICAL if label in used]
        print(f"\n[{key}]")
        if ordered:
            for item in ordered:
                print(f"  - {item}")
        else:
            print("  (no matches detected)")

    print("\nNotes:")
    print("- This is heuristic; verify manually before updating index.html")
    print("- Include only classes actually used by each entry")

if __name__ == "__main__":
    main()
