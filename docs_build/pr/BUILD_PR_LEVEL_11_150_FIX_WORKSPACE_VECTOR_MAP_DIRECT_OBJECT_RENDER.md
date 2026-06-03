# BUILD_PR_LEVEL_11_150_FIX_WORKSPACE_VECTOR_MAP_DIRECT_OBJECT_RENDER

## Purpose
Fix the Workspace Manager → Vector Map Editor path so Sample 1902 direct `vectorMapDocument.objects` render in Vector Map Editor.

## Current State
Workspace Manager now loads Sample 1902.
Palette and Vector Map launch.
Vector Map Editor opens, but does not show any objects.
Other tools do not have assets yet and are intentionally out of scope for this PR.

## STRICT SCOPE

### ALLOWED FILES
- toolbox/vector-map-editor/main.js
- docs_build/dev/reports/vector_map_workspace_object_render_11_150.txt

### ALLOWED CHANGES
- fix Vector Map Editor direct payload ingestion/rendering for `vectorMapDocument.objects`
- preserve direct JSON input contract
- create report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify Sample 1902 JSON
- modify Workspace Manager
- modify tool host runtime
- modify other tools
- add fallback/default/demo objects
- normalize/transform/convert payload shape
- add wrapper compatibility
- infer missing vector map data

## Problem to Fix

When launched from Workspace Manager, Vector Map Editor receives direct payload shape:

```json
{
  "vectorMapDocument": {
    "version": 3,
    "name": "...",
    "objects": [...]
  }
}
```

Vector Map Editor must render those objects directly.

If the editor currently expects a different shape or old wrapper, update only the Vector Map Editor ingestion path so it reads the direct schema payload.

## Required Behavior

Vector Map Editor must:

1. Accept the direct payload object passed by tool host.
2. Read `payloadJson.vectorMapDocument`.
3. Use `vectorMapDocument.objects` as the render source.
4. Render existing objects without mutation.
5. Show a visible schema/input error if `vectorMapDocument` or `objects` is missing.
6. Not create fallback/demo objects.

## Validation

Run targeted validation only.

Required:
- `toolbox/vector-map-editor/main.js` syntax passes.
- Workspace launch of Sample 1902 opens Vector Map Editor.
- Vector Map Editor renders Sample 1902 objects:
  - `obj-player-path`
  - `obj-hazard-zone`
- No schema files changed.
- No Sample 1902 JSON changed.
- `git diff --name-only` contains only ALLOWED FILES.

## Report

Write:

- `docs_build/dev/reports/vector_map_workspace_object_render_11_150.txt`

Report must include:
- file changed
- input shape before/after behavior
- objects verified
- validation command/result
- strict scope confirmation
- remaining blockers if any

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Vector Map Editor workspace direct-payload render fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- Vector Map Editor renders Sample 1902 vector map objects from direct payload.
- No fallback/demo/transform behavior is introduced.
- No other tools are changed.
