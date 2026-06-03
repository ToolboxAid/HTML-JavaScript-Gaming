# BUILD_PR_LEVEL_11_153_FIX_WORKSPACE_SVG_ASSET_STATUS_LABEL

## Purpose
Fix Workspace Manager card/status display for SVG Asset Studio so Sample 1902 shows the loaded vector asset instead of `Asset: none`.

## Current State
SVG Asset Studio is present under Vector Assets, but Workspace Manager still shows:

`Asset: none`

This means the card/status layer does not recognize the direct `vectorAssetDocument` payload for SVG Asset Studio.

## STRICT SCOPE

### ALLOWED FILES
- tools/workspace-manager/main.js
- docs_build/dev/reports/workspace_svg_asset_status_label_11_153.txt

### ALLOWED CHANGES
- update only SVG Asset Studio card/status label detection
- recognize direct `workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument`
- display a useful asset label from `vectorAssetDocument.sourceName`
- create report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify Sample 1902 JSON
- modify SVG Asset Studio
- modify tool host runtime
- modify other tools
- add fallback/default/demo data
- wrap/transform/normalize the payload
- broaden status logic for unrelated tools

## Required Behavior

Given:

```json
"svg-asset-studio": {
  "vectorAssetDocument": {
    "sourceName": "sample-0901-ship.svg",
    "svgText": "<svg ...>"
  }
}
```

Workspace Manager must display:

`Asset: sample-0901-ship.svg`

or an equivalent useful label derived directly from `vectorAssetDocument.sourceName`.

## Required Validation

Targeted validation only.

Required:
- Workspace Manager Sample 1902 card for SVG Asset Studio no longer shows `Asset: none`.
- SVG Asset Studio status label uses direct payload data.
- No sample/schema/tool runtime files changed.
- `git diff --name-only` contains only ALLOWED FILES.

## Report

Write:

- `docs_build/dev/reports/workspace_svg_asset_status_label_11_153.txt`

Report must include:
- file changed
- previous label behavior
- new label behavior
- validation command/result
- strict scope confirmation

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Workspace Manager SVG card label fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- SVG Asset Studio card shows the direct vector asset name.
- Payload remains direct and unchanged.
- No unrelated tools changed.
