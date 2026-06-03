# BUILD_PR_LEVEL_11_147_FIX_SAMPLE_1902_DIRECT_TOOL_PAYLOADS

## Purpose
Fix Sample 1902 workspace manifest so every `tools.<tool-id>` entry is the direct tool payload expected by the locked tool schema.

## Problem
Workspace Manager launches Sample 1902, but rejects the manifest because each tool entry still uses wrapper shape:

```json
{
  "tool": "vector-map-editor",
  "version": "1",
  "payload": {
    "vectorMapDocument": {}
  }
}
```

Locked tool schemas now expect direct payload shape:

```json
{
  "vectorMapDocument": {}
}
```

Runtime/schema rules are correct. Sample 1902 data shape is wrong.

## STRICT SCOPE

### ALLOWED FILES
- samples/phase-19/1902/sample.1902.workspace-all-tools.json
- docs_build/dev/reports/sample_1902_direct_payload_fix_11_147.txt

### ALLOWED CHANGES
- remove wrapper keys from Sample 1902 tool entries
- promote nested payload content to the direct tool entry object
- keep palette-browser as direct palette JSON
- create report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify runtime
- modify routing
- modify Workspace Manager code
- modify other samples
- add fallback/default/preset data
- transform data at runtime
- add compatibility wrappers

## Required Manifest Shape

For each entry in:

```json
tools
```

Convert:

```json
"tool-id": {
  "tool": "tool-id",
  "version": "1",
  "payload": {
    "<requiredSchemaRoot>": { ... }
  }
}
```

To:

```json
"tool-id": {
  "<requiredSchemaRoot>": { ... }
}
```

## Specific Required Fixes

- `vector-map-editor`
  - must contain direct `vectorMapDocument`
  - remove `tool`, `version`, `payload`

- `svg-asset-studio`
  - must contain direct `vectorAssetDocument`
  - remove `tool`, `version`, `payload`

- `tile-map-editor`
  - must contain direct `tileMapDocument`
  - remove `tool`, `version`, `payload`

- `parallax-editor`
  - must contain direct `parallaxDocument`
  - remove `tool`, `version`, `payload`

- `sprite-editor`
  - must contain direct `spriteProject`
  - remove `tool`, `version`, `payload`
  - if `assetRegistry` is not allowed by schema, remove it unless schema requires it

- `skin-editor`
  - must match direct skin-editor schema
  - remove `tool`, `version`, wrapper `payload`
  - do not invent fields

- `asset-browser`
  - must match direct asset-browser schema
  - remove `tool`, `version`, wrapper `payload`
  - preserve real `assets` only if schema allows it

- `state-inspector`
  - must contain direct `snapshot`
  - remove `tool`, `version`, `payload`

- `replay-visualizer`
  - must contain direct `events`
  - remove `tool`, `version`, `payload`

- `performance-profiler`
  - must contain direct `profileSettings`
  - remove `tool`, `version`, `payload`

- `physics-sandbox`
  - must contain direct `physicsBody`
  - remove `tool`, `version`, `payload`

- `asset-pipeline`
  - must contain direct `pipelinePayload`
  - remove `tool`, `version`, `payload`

- `tile-model-converter`
  - must contain direct `candidate` and `conversion`
  - remove `tool`, `version`, `payload`

- `3d-json-payload`
  - must contain direct `mapPayload`
  - remove `tool`, `version`, `payload`

- `3d-asset-viewer`
  - must contain direct `asset3d`
  - remove `tool`, `version`, `payload`

- `3d-camera-path-editor`
  - must contain direct `cameraPath`
  - remove `tool`, `version`, `payload`

- `palette-browser`
  - already direct palette JSON
  - keep direct `schema`, `version`, `id`, `name`, `swatches`

## Important Registry Note

The error also says:

`Tool "vector-map-editor" is not available for Workspace Manager launch.`

Do not solve this by changing registry/runtime in this PR.

First fix Sample 1902 manifest schema shape. If registry availability remains after schema-valid manifest input, report it as the next blocker.

## Validation

Run targeted validation only.

Required:
- `samples/phase-19/1902/sample.1902.workspace-all-tools.json` parses
- workspace manifest validates against `tools/schemas/workspace.manifest.schema.json`
- every `tools.<tool-id>` entry validates against its referenced tool schema
- no `tools.*.tool` wrapper keys remain
- no `tools.*.payload` wrapper keys remain
- no schema/runtime/routing files changed
- `git diff --name-only` contains only ALLOWED FILES

## Report

Write:

- `docs_build/dev/reports/sample_1902_direct_payload_fix_11_147.txt`

Report must include:
- file changed
- each tool entry converted
- validation command/result
- remaining blocker if registry still rejects `vector-map-editor`
- strict scope confirmation

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Sample 1902 manifest-shape correction only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- Sample 1902 manifest uses direct tool payloads.
- Workspace Manager no longer rejects 1902 because of `tool/version/payload` wrappers.
- No schemas/runtime/routing files changed.
