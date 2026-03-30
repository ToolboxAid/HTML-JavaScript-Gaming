MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_TILEMAP_EDITOR_FOUNDATION as a docs-first, repo-structured delta. Build the Tile Map Editor foundation only. Do not include a parallax editor in this PR. The editor should support tile painting, layers, tileset selection, map load/save, collision/data layers, and object/spawn markers. Keep the data model compatible with a later separate Parallax Editor companion tool.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_TILEMAP_EDITOR_FOUNDATION_delta.zip
- Include docs/dev/reports/
- Include only relevant files
