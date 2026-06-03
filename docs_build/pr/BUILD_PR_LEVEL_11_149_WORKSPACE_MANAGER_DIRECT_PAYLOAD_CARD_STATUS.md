# BUILD_PR_LEVEL_11_149_WORKSPACE_MANAGER_DIRECT_PAYLOAD_CARD_STATUS

## Purpose
Fix Workspace Manager card/status population so Sample 1902 shows active assets for direct tool payload entries.

## Problem
Sample 1902 now launches Workspace Manager and the manifest loads, but Workspace Manager cards still show:

- Asset: none
- Asset: N/A
- Palette: none
- disabled-looking tool cards

This means Workspace Manager parsing accepts the manifest, but the UI/presence/status layer is still not deriving asset availability from the direct tool payloads.

## STRICT SCOPE

### ALLOWED FILES

- toolbox/workspace-manager/main.js
- docs_build/dev/reports/workspace_direct_payload_card_status_11_149.txt

### ALLOWED CHANGES

- update Workspace Manager card/status/presence detection to use direct payload objects from `workspaceManifest.tools[toolId]`
- derive display labels from direct payload root keys
- mark tools available when their direct payload exists and validates
- preserve exact payload pass-through behavior
- create report

## FORBIDDEN

Codex MUST NOT:

- modify schemas
- modify Sample 1902 manifest
- modify runtime host
- modify routing outside Workspace Manager
- modify other samples
- re-add `tool/version/payload` wrappers
- add fallback/default/preset data
- transform payloads before launch
- infer missing payloads
- add fake assets

## Required Behavior

Given manifest:

```json
"tools": {
  "vector-map-editor": {
    "vectorMapDocument": { ... }
  },
  "palette-browser": {
    "schema": "html-js-gaming.palette",
    "swatches": [ ... ]
  }
}
```

Workspace Manager must:

1. Treat the tool as present if `tools[toolId]` exists and validates.
2. Use the direct payload object for card/status display.
3. Show a useful status label instead of `Asset: none` when data exists.
4. Show `Palette: <palette name>` for palette-browser when palette data exists.
5. Keep disabled/no-data state only when the direct payload is missing or invalid.
6. Launch tools with the exact direct payload object unchanged.

## Suggested Display Labels

Codex may derive labels from direct payload content using explicit root fields only.

Examples:

- vector-map-editor:
  - `vectorMapDocument.name`
- svg-asset-studio:
  - `vectorAssetDocument.sourceName`
- tile-map-editor:
  - `tileMapDocument.map.name`
- parallax-editor:
  - `parallaxDocument.map.name`
- sprite-editor:
  - `spriteProject.assetRefs.spriteId` or `Sprite Project`
- skin-editor:
  - `skin.name` or schema-specific skin name
- asset-browser:
  - count of `assets` entries if present
- state-inspector:
  - `snapshot.toolId` or snapshot schema
- replay-visualizer:
  - count of `events`
- performance-profiler:
  - `profileSettings.frameSamples`
- physics-sandbox:
  - `physicsBody`
- asset-pipeline:
  - `pipelinePayload.projectId`
- tile-model-converter:
  - `candidate.name`
- 3d-json-payload:
  - `mapPayload.mapId`
- 3d-asset-viewer:
  - `asset3d.assetId`
- 3d-camera-path-editor:
  - `cameraPath.pathId`
- palette-browser:
  - direct `name`

Do not mutate payloads while deriving labels.

## Validation

Run targeted validation only.

Required:

- Sample 1902 workspace loads.
- Direct payload tool entries are accepted.
- Cards no longer show `Asset: none` for tools with valid payloads.
- Palette card shows the direct palette name.
- Tool launch still passes direct payload unchanged.
- no schema files changed.
- no sample files changed.
- `git diff --name-only` contains only ALLOWED FILES.

## Report

Write:

- `docs_build/dev/reports/workspace_direct_payload_card_status_11_149.txt`

Report must include:

- file changed
- previous status behavior
- new status behavior
- Sample 1902 cards verified
- validation command/result
- strict scope confirmation
- remaining blockers if any

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Workspace Manager card/status population fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- Workspace Manager shows Sample 1902 tools as populated from direct payloads.
- Palette Browser shows Sample 1902 palette name.
- No direct payload is wrapped, converted, or mutated.
- No schemas or sample files changed.
