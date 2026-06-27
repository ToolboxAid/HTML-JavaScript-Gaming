# BUILD_PR_11_12_REBUILD_SAMPLE_1902_WORKSPACE_ALL_TOOLS

## Required Codex Work

### 1. Remove incorrect palette sidecar
Delete:
`samples/phase-19/1902/sample.1902.palette.json`

Do not replace it with another sidecar unless an existing schema strictly requires it and the report proves why.

### 2. Rebuild workspace JSON
Rewrite/normalize:
`samples/phase-19/1902/sample.1902.workspace-all-tools.json`

Rules:
- one manifest/payload source only
- no duplicated `palette` blocks in multiple places
- no duplicated `config` and `payload` copies
- no unrelated sample dump data
- one clear tool payload section per active workspace-supported tool
- all color/style/palette data lives inside the relevant tool payload or shared workspace theme section
- no hidden fallback/default data

### 3. Fix tool availability
Ensure Workspace resolves all included tools from registry/tool ids correctly.
Current bad behavior: only Palette is recognized as valid.

Workspace must expose all active workspace-supported tools, including at minimum:
- Vector Map Editor
- Vector Asset Studio
- Tilemap Studio
- Parallax Scene Studio
- Sprite Editor
- Primitive Skin Editor
- Asset Browser / Import Hub
- State Inspector
- Replay Visualizer
- Performance Profiler
- Physics Sandbox
- Asset Pipeline Tool
- Tile Model Converter
- 3D JSON Payload Normalizer
- 3D Asset Viewer
- 3D Camera Path Editor

If any listed tool is inactive/not workspace-supported, exclude it only with report justification.

### 4. Fix sample page behavior
Sample 1902 page must validate Workspace integration.
Primary action must open Workspace with the all-tools manifest.

Do not make the page a list of standalone tool links as the main proof.

Standalone links may remain only as secondary references if clearly labeled, but primary validation is Workspace.

### 5. Keep standalone sample testing separate
Do not alter standalone tool sample expectations from PR 11.10.

### 6. Validation report
Create:
docs_build/dev/reports/PR_11_12_REBUILD_SAMPLE_1902_WORKSPACE_ALL_TOOLS_report.md

Report must include:
- files changed
- files deleted
- final sample 1902 JSON structure summary
- included tools
- excluded tools with reason
- proof Workspace shows more than Palette and includes all expected active tools
- confirmation no palette sidecar remains
- confirmation no duplicated config/payload ownership
- confirmation no fallback/default/hidden data
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- Do not broadly refactor Workspace.
- Do not change standalone sample links elsewhere.
- Do not modify game samples.
