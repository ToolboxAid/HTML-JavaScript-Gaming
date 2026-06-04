# BUILD_PR_11_22_WORKSPACE_MANAGER_EMBEDDED_PAYLOAD_ASSET_STATUS_FIX

## Required Codex Work

### 1. Locate asset/status display logic
Find where Workspace Manager displays:
- `Asset: none`
- `Asset: N/A`
- `Palette: ...`
- `select skin in Asset Browser`

This is likely separate from tool presence detection.

### 2. Use embedded payloads as data presence
For each manifest tool entry:
`manifest.tools[toolId]`

If it has:
`payload`

and the payload contains a known document key, mark it as data-present.

Known document mappings for sample 1902:
- `vector-map-editor.payload.vectorMapDocument`
- `vector-asset-studio.payload.vectorAssetDocument`
- `tile-map-editor.payload.tileMapDocument`
- `parallax-editor.payload.parallaxDocument`
- `sprite-editor.payload.spriteProject`
- `skin-editor.skin` or `skin-editor.payload.skin`
- `asset-browser.payload.assetCatalog`
- `palette.payload`
- `state-inspector.payload.snapshot`
- `replay-visualizer.payload.events`
- `performance-profiler.payload.profileSettings`
- `physics-sandbox.payload.physicsBody`
- `asset-pipeline-tool.payload.pipelinePayload`
- `tile-model-converter.payload.candidate`
- `3d-json-payload-normalizer.payload.mapPayload`
- `3d-asset-viewer.payload.asset3d`
- `3d-camera-path-editor.payload.cameraPath`

### 3. Display useful labels
Derive labels from payload data where possible:
- vector map: document name
- vector asset: sourceName
- tile map: map.name
- parallax: map.name
- sprite: project format or dimensions
- skin: skin.name
- asset browser: selected asset label or catalog count
- 3D asset: assetId
- camera path: pathId
- normalizer: mapId
- state inspector/replay/profiler/physics may display N/A if they are utility-like, but they must not be treated as missing data if payload exists.

### 4. Avoid old pointer-only logic
Do not require:
- assetRegistry reference
- external asset file pointer
- legacy selectedAssetId
- separate palette sidecar
- top-level `config`
- top-level `payload`

Embedded payload is valid data.

### 5. Validation report
Create:
docs_build/dev/reports/PR_11_22_WORKSPACE_MANAGER_EMBEDDED_PAYLOAD_ASSET_STATUS_FIX_report.md

Report must include:
- files changed
- old asset/status logic
- new payload presence rules
- sample 1902 tool-by-tool status before/after
- list of tools still intentionally showing N/A with reason
- confirmation no schema loosening
- confirmation no other samples changed
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- No schema loosening.
- No broad Workspace rewrite.
- No unrelated UI polish.
- No fallback/default/hidden data.
