# BUILD_PR_11_9_STANDALONE_SAMPLE_TOOL_JSON_DIRECT_LOAD_AUDIT

## Required Codex Work

### 1. Correct validation target
Treat samples as standalone tool launch users.
Do not validate this PR using samples-to-workspace as the primary path.

Validate by opening/running standalone tools launched from samples.

### 2. Review sample 1208 first
Inspect sample 1208:
- `data/toolFormattedParallax.js`
- `data/toolFormattedParallax.json`
- `data/toolFormattedTileMap.js`
- `data/toolFormattedTileMap.json`
- `sample.1208.*.json`
- `ToolFormattedTilesParallaxScene.js`
- `main.js`

Expected issue:
- JS files mirror JSON data and create duplicate source-of-truth risk.
- Scene references JSON files and extracts nested payloads instead of treating JSON payload as the direct canonical input.

Fix so:
- JSON is the only canonical data.
- Standalone tools load the JSON directly.
- Runtime/sample preview consumes the same JSON.
- JS mirror data modules are removed or made non-canonical only if needed.

### 3. Scan all sample tool payloads
Find all sample-owned tool JSON files:
- `samples/**/sample.*.asset-browser.json`
- `samples/**/sample.*.sprite-editor.json`
- `samples/**/sample.*.tile-map-editor.json`
- `samples/**/sample.*.tilemap-studio.json`
- `samples/**/sample.*.vector-asset-studio.json`
- `samples/**/sample.*.vector-map-editor.json`
- `samples/**/sample.*.parallax-editor.json`
- `samples/**/sample.*.palette.json`
- `samples/**/sample.*.3d-asset-viewer.json`
- any other `sample.*.<tool>.json`

For each:
- verify the standalone tool can directly load the JSON file
- verify tool-visible data is not supplied by JS mirror files
- verify color/palette/style data is JSON-owned

### 4. Fix JSON payload shape where needed
If a standalone tool currently receives only references to JSON:
- normalize the sample payload so it contains the direct document/config the tool needs
- keep source paths only as asset references, not as substitute data ownership
- do not create fallback data

### 5. Validation report
Create:
docs/dev/reports/PR_11_9_STANDALONE_SAMPLE_TOOL_JSON_DIRECT_LOAD_AUDIT_report.md

Report must include:
- standalone tool validation path used
- all tool-linked samples found
- sample 1208 findings and fixes
- JS mirror files removed/demoted
- color/palette/style ownership result
- direct JSON load result per standalone tool
- confirmation no workspace-only validation was used as primary proof
- confirmation no fallback/hidden data and no start_of_day changes

## Constraints
- One PR purpose only: standalone sample tools load direct JSON SSoT.
- No broad UI polish.
- No unrelated runtime refactor.
- No schema rewrite unless minimal compatible payload normalization is required.
