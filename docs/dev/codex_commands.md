# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_118_SAMPLE_TILE_LINK_SSOT_ENFORCEMENT

## Execute

This replaces PR 11.117. Do not run 11.117.

1. Trace where visible sample tile "Open <tool>" links actually come from.

2. Search candidate sources:
   - samples/index.html
   - samples index JSON/JS files
   - generated sample registry files
   - sample tile renderer data/config
   - samples2tools data
   - sample manifests
   - per-sample metadata JSON
   - generated static metadata used by samples page

3. Identify the one active SSoT file for sample tile tool links.

4. Enforce only one active source:
   - update loader/index code to use only the SSoT if needed
   - delete stale duplicate link files if safe
   - otherwise disable them from runtime loading and report why

5. Remove known-bad links from the SSoT and any active duplicates:
   - 0201: remove unrelated Open Tool links
   - 0202: remove unrelated Open Tool links
   - 0204: remove unrelated Open Tool links
   - 0210: remove unrelated Open Tool links
   - 0220: remove unrelated Open Tool links
   - 0221: remove 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
   - 0226: remove unrelated Open Tool links
   - 0227: remove unrelated Open Tool links
   - 0303: remove unrelated Open Tool links
   - 0305: remove 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
   - 0901: remove Vector Map Editor
   - 1204: remove SVG Asset Studio
   - 1205: remove Vector Map Editor
   - 1208: remove 3D Asset Viewer and SVG Asset Studio
   - 1319: remove unrelated Open Tool links

6. Delete bad/stale launcher data that is not the SSoT and can reintroduce bad links.

7. Do not:
   - delete samples
   - add fake data
   - add fallback/default/preset inputs
   - reintroduce normalization or inference

8. Validate:
   - changed JSON parses
   - changed JS/HTML/index files are syntactically valid where practical
   - listed bad links no longer exist in active SSoT
   - no second active source remains
   - stale duplicate sources are deleted or disabled

9. Write populated reports:
   - docs/dev/reports/sample_tile_link_ssot_11_118.txt
   - docs/dev/reports/sample_tile_bad_links_removed_11_118.txt
   - docs/dev/reports/stale_launcher_sources_deleted_11_118.txt
   - docs/dev/reports/validation_after_11_118.txt

10. Reports must include:
   - exact files searched
   - chosen SSoT
   - exact entries removed
   - stale files deleted/disabled
   - validation command/result
   - blockers

11. Roadmap:
   - status-only update if execution-backed
   - do not rewrite roadmap text
   - do not delete roadmap text

12. Package Codex output ZIP at:
   tmp/PR_11_118_SAMPLE_TILE_LINK_SSOT_ENFORCEMENT.zip
