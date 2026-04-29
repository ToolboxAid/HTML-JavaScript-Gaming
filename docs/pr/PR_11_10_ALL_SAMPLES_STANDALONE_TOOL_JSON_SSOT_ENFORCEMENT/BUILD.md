# BUILD_PR_11_10_ALL_SAMPLES_STANDALONE_TOOL_JSON_SSOT_ENFORCEMENT

## Required Codex Work

### 1. Identify all sample standalone tool ties
Scan all samples for:
- `sample.*.<tool>.json`
- sample pages that link/open standalone tools
- sample metadata/tool payload references
- sample JS modules that import/read tool payloads

Tool payload examples include but are not limited to:
- asset-browser
- import-hub
- sprite-editor
- tilemap-studio
- tile-map-editor
- vector-asset-studio
- vector-map-editor
- 3d-asset-viewer
- parallax/tile/vector/color/palette-related tool payloads

### 2. Enforce JSON SSoT
For every sample/tool pair:
- JSON file must be canonical source
- standalone tool must load the JSON payload directly
- sample preview/runtime must consume the same JSON where applicable
- JS must not define canonical mirrored data

### 3. Remove/demote JS mirror data
Find JS files that mirror JSON payloads:
- remove if unused
- replace imports with JSON fetch/import where supported
- demote to helper-only if it transforms explicit JSON data
- do not keep competing canonical arrays/objects

### 4. Include visual/color data
Verify these are JSON-owned where tool-visible:
- colors
- palettes
- selected color
- fill
- stroke
- line width
- sprite palette
- tile palette
- vector style
- preview background/grid/render config

### 5. Validation
Create:
docs/dev/reports/PR_11_10_ALL_SAMPLES_STANDALONE_TOOL_JSON_SSOT_ENFORCEMENT_report.md

Report must include:
- total samples scanned
- all tool-linked samples found
- JSON payloads inspected
- JS mirror files found
- fixes applied
- samples with no issues
- color/style ownership result per tool-linked sample
- standalone tool validation steps/results
- confirmation no workspace-only validation was used as primary proof
- confirmation no fallback/default/hidden data
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- No broad UI polish.
- No unrelated sample rewrite.
- No schema rewrite unless minimal compatible normalization is required.
- No hidden fallback/default data.
