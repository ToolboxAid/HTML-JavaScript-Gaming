# BUILD_PR_11_11_WORKSPACE_ALL_TOOLS_INTEGRATION_SAMPLE

## Required Codex Work

### 1. Choose sample placement
Add the sample in the next appropriate samples phase/location based on current repo conventions.

Preferred naming:
- Title: `Workspace All Tools Integration`
- Purpose: workspace orchestration sample for every active tool

### 2. Add JSON SSoT payload
Create sample-owned JSON payloads for each tool, or one workspace manifest that references explicit per-tool JSON payloads.

Required:
- Asset Browser data
- Sprite Editor data
- Tilemap Studio data
- Vector Asset Studio data
- Vector Map Editor data
- all color/palette/fill/stroke/style config in JSON
- import/export destination hints must be sample-local, not `games/<project>/...`

### 3. Launch workspace
The sample page must launch Workspace as the test target.
This is intentionally different from standalone tool samples.

### 4. Tool coverage
Use the tool registry to identify every active workspace-supported tool.
If a tool is inactive/deprecated, document why it is excluded.

### 5. Validation report
Create:
docs_build/dev/reports/PR_11_11_WORKSPACE_ALL_TOOLS_INTEGRATION_SAMPLE_report.md

Report must include:
- sample path
- tools included
- tools excluded with reason
- JSON payload files created
- validation that all tool-visible data is JSON-owned
- validation that workspace switching works across every included tool
- validation that fullscreen enter/exit still works
- confirmation no fallback/default/hidden data
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- No broad tool refactor.
- No unrelated sample changes.
- No schema rewrite unless minimal compatible payload addition is required.
