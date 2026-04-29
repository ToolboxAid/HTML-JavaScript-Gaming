# BUILD_PR_11_13_WORKSPACE_1902_SCHEMA_CONFORMANCE_FIX

## Required Codex Work

### 1. Validate against actual schemas
Use the repo schemas:
- `tools/schemas/workspace.schema.json`
- `tools/schemas/workspace.manifest.schema.json`
- tool-specific schemas under `tools/schemas/tools/`

Do not infer a custom shape from previous broken 1902 output.

### 2. Replace invalid 1902 shape
Rewrite/normalize:
`samples/phase-19/1902/sample.1902.workspace-all-tools.json`

It must match the actual Workspace schema expected by the loader.

Remove unsupported/misplaced fields unless the schema requires them:
- `tool: workspace-all-tools-integration`
- `activeWorkspaceTools`
- duplicated `config`
- duplicated `payload`
- copied unrelated sample/game data
- palette sidecar references

### 3. Use Workspace schema correctly
If Workspace expects:
- `documentKind: workspace-manifest`
- `schema`
- `version`
- `games`

then produce that shape.

If Workspace uses `workspace.manifest.schema.json` for tool data:
- provide `palettes`
- provide `tools`
- put each tool payload under the correct tool id key

### 4. Tool coverage
Ensure Workspace resolves every active workspace-supported tool from the schema-correct manifest, not from a custom `activeWorkspaceTools` array.

At minimum evaluate:
- vector-map-editor
- vector-asset-studio
- tile-map-editor / tilemap-studio naming per registry
- parallax-editor
- sprite-editor
- skin-editor
- asset-browser
- palette-browser only if valid/active
- state-inspector
- replay-visualizer
- performance-profiler
- physics-sandbox
- asset-pipeline-tool
- tile-model-converter
- 3d-json-payload-normalizer
- 3d-asset-viewer
- 3d-camera-path-editor

Document exact included IDs and any excluded IDs with reason.

### 5. Validation
Create:
docs/dev/reports/PR_11_13_WORKSPACE_1902_SCHEMA_CONFORMANCE_FIX_report.md

Report must include:
- schema files used
- old JSON shape problem
- final JSON shape summary
- schema validation command/result
- Workspace validation proving more than Palette loads
- list of resolved tools
- confirmation no palette sidecar
- confirmation no fallback/default/hidden data
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- No broad Workspace refactor unless the loader is rejecting schema-valid input.
- No standalone sample changes.
- No unrelated UI polish.
