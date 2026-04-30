# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_120_SAMPLE_TOOL_LINK_COUNT_RECONCILIATION

## Execute

1. Compare relationship sources:
   - tools/index.html expected sample/tool relationships
   - samples/index.html rendered Open Tool links
   - samples/metadata/samples.index.metadata.json
   - any generated/derived sample/tool metadata files

2. Confirm current counts:
   - tools/index.html relationships: expected 34
   - samples/index.html Open Tool links: observed 22

3. Make `samples/metadata/samples.index.metadata.json` the only SSoT for all sample/tool relationships.

4. Update sample hub renderer and tools hub renderer/loading so both read from:
   - samples/metadata/samples.index.metadata.json
   or from a generated artifact derived only from it.

5. Remove or disable duplicate active sources:
   - samples2tools
   - stale generated link files
   - fallback arrays
   - inferred renderer links
   - embedded sample/tool maps

6. Reconcile relationships:
   - add valid missing relationships to SSoT
   - remove stale/invalid relationships from SSoT
   - do not reintroduce known-bad links
   - do not create fake data to justify links

7. Known-bad links must remain absent:
   - 0201 3D Camera Path Editor/unrelated links
   - 0202 unrelated links
   - 0204 unrelated links
   - 0210 unrelated links
   - 0220 unrelated links
   - 0221 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
   - 0226 unrelated links
   - 0227 unrelated links
   - 0303 unrelated links
   - 0305 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
   - 0901 Vector Map Editor
   - 1204 SVG Asset Studio
   - 1205 Vector Map Editor
   - 1208 3D Asset Viewer and SVG Asset Studio
   - 1319 unrelated links

8. If the final count is not 34:
   - report exactly which relationships were removed/blocked and why.

9. Validate:
   - JSON parses
   - JS/HTML syntax valid where practical
   - sample hub rendered links match SSoT
   - tools hub relationships match SSoT
   - no second active source remains

10. Write populated reports:
   - docs/dev/reports/sample_tool_relationship_reconciliation_11_120.txt
   - docs/dev/reports/tools_index_expected_relationships_11_120.txt
   - docs/dev/reports/samples_index_rendered_links_11_120.txt
   - docs/dev/reports/sample_tool_ssot_after_11_120.txt
   - docs/dev/reports/validation_after_11_120.txt

11. Reports must include:
   - files searched
   - counts before/after
   - entries added
   - entries removed
   - blocked entries
   - chosen SSoT
   - validation commands/results

12. Roadmap:
   - status-only update if execution-backed
   - do not rewrite roadmap text
   - do not delete roadmap text

13. Package Codex output ZIP at:
   tmp/PR_11_120_SAMPLE_TOOL_LINK_COUNT_RECONCILIATION.zip
