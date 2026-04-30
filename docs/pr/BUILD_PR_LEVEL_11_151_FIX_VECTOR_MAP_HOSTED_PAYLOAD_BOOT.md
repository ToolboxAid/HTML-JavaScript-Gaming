# BUILD_PR_LEVEL_11_151_FIX_VECTOR_MAP_HOSTED_PAYLOAD_BOOT

## Purpose
Fix Vector Map Editor boot logic so hosted Workspace Manager launches read the direct hosted `payloadJson.vectorMapDocument` instead of falling back to old preset/import-path messaging.

## Current Failure
Vector Map Editor still shows:

`No map objects loaded. Import a map JSON file or launch with a sample preset path.`

This means the editor is not consuming the hosted direct payload from Workspace Manager.

## STRICT SCOPE

### ALLOWED FILES
- tools/vector-map-editor/main.js
- docs/dev/reports/vector_map_hosted_payload_boot_11_151.txt

### ALLOWED CHANGES
- fix Vector Map Editor hosted-input boot path only
- read direct hosted `payloadJson.vectorMapDocument`
- remove/replace old hosted preset-path requirement for this direct payload path
- create report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify Sample 1902 JSON
- modify Workspace Manager
- modify tool host runtime
- modify other tools
- add fallback/default/demo objects
- re-add preset loading
- transform/wrap/normalize payload
- infer missing vector map data

## Required Behavior

When hosted by Workspace Manager, Vector Map Editor must:

1. Read hosted shared context payload:
   - `payloadJson`
2. Use direct document:
   - `payloadJson.vectorMapDocument`
3. Load objects from:
   - `payloadJson.vectorMapDocument.objects`
4. Render objects directly.
5. If `vectorMapDocument` or `objects` is missing:
   - show visible input/schema error
   - do NOT show old "launch with sample preset path" message for hosted direct JSON flow

## Required Investigation

Codex must inspect Vector Map Editor for old boot paths that depend on:

- `samplePresetPath`
- preset path query params
- import path only
- file picker/import only
- fallback empty map state
- old sample preset launch text

Do not remove general manual import UI if still valid.
Only fix hosted Workspace Manager direct payload boot.

## Required Validation

Targeted validation only.

Required:
- `tools/vector-map-editor/main.js` syntax passes.
- Hosted payload with:
  - `vectorMapDocument.objects[0].id = "obj-player-path"`
  - `vectorMapDocument.objects[1].id = "obj-hazard-zone"`
  loads into editor state.
- Old message is not shown for valid hosted payload:
  `No map objects loaded. Import a map JSON file or launch with a sample preset path.`
- No schema/sample/runtime/workspace files changed.
- `git diff --name-only` contains only ALLOWED FILES.

## Report

Write:

- `docs/dev/reports/vector_map_hosted_payload_boot_11_151.txt`

Report must include:
- file changed
- old boot path found
- new direct hosted payload path
- object ids verified
- validation command/result
- strict scope confirmation
- remaining blockers if any

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Vector Map Editor hosted payload boot fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- Vector Map Editor consumes hosted `payloadJson.vectorMapDocument`.
- Sample 1902 vector objects render when opened through Workspace Manager.
- No preset/fallback/demo path is required for hosted direct JSON.
