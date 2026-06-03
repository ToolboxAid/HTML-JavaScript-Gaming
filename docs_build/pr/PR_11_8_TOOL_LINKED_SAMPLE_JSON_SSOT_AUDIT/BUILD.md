# BUILD_PR_11_8_TOOL_LINKED_SAMPLE_JSON_SSOT_AUDIT

## Required Codex Work

### 1. Identify tool-linked samples
Scan samples for links to tool payloads / tool JSON files / workspace launches. Include every sample with any of:
- sample.*.asset-browser.json
- sample.*.sprite-editor.json
- sample.*.tilemap-studio.json
- sample.*.vector-asset-studio.json
- sample.*.vector-map-editor.json
- sample.*.3d-asset-viewer.json
- tool/workspace launch metadata

### 2. Verify JSON ownership
For each tool-linked sample, verify the following are in JSON, not canonical JS constants/classes:
- assets
- tilemaps/tilesets
- sprites/frames/palettes
- vector shapes
- vector maps
- colors
- fill/stroke/line width
- selected item/tool state
- preview config
- import/export destinations

### 3. Fix violations
If a sample contains canonical tool-visible data in JS:
- move/normalize the data into the sample tool JSON
- update runtime/tool code to consume JSON
- do not add fallback/default/hidden sample data
- do not scrape JS source

### 4. Color requirement
Specifically check that all color-related tool-visible data is JSON-owned:
- palette arrays
- selected color
- fill color
- stroke color
- background/grid colors if tool-visible
- sprite palette colors
- vector style colors

### 5. Validation report
Create:
docs_build/dev/reports/PR_11_8_TOOL_LINKED_SAMPLE_JSON_SSOT_AUDIT_report.md

Report must include:
- all tool-linked samples found
- JSON files inspected
- violations found/fixed
- color/palette ownership result per sample
- samples intentionally unchanged with reason
- confirmation no fallback data
- confirmation no start_of_day changes

## Constraints
- One PR purpose only: tool-linked sample JSON SSoT.
- No broad UI polish.
- No schema rewrite unless minimal compatible field addition is required.
- No unrelated sample changes.
