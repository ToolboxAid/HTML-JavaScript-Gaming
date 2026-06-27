# BUILD_PR_LEVEL_11_152_FIX_SVG_ASSET_STUDIO_HOSTED_PAYLOAD_BOOT

## Purpose
Fix SVG Asset Studio so Workspace Manager launches read the direct hosted `payloadJson.vectorAssetDocument` from Sample 1902.

## Current State
- Workspace Manager loads Sample 1902.
- Palette Browser works.
- Vector Map Editor now works.
- SVG Asset Studio is the next direct-payload tool to validate/fix.

## STRICT SCOPE

### ALLOWED FILES
- toolbox/svg-asset-studio/main.js
- docs_build/dev/reports/svg_asset_studio_hosted_payload_boot_11_152.txt

### ALLOWED CHANGES
- fix SVG Asset Studio hosted-input boot path only
- read direct hosted `payloadJson.vectorAssetDocument`
- render/load SVG from direct payload
- create report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify Sample 1902 JSON
- modify Workspace Manager
- modify tool host runtime
- modify other tools
- add fallback/default/demo SVG
- re-add preset loading
- transform/wrap/normalize payload
- infer missing vector asset data

## Required Behavior

When hosted by Workspace Manager, SVG Asset Studio must:

1. Read hosted shared context payload:
   - `payloadJson`
2. Use direct document:
   - `payloadJson.vectorAssetDocument`
3. Load/render from:
   - `vectorAssetDocument.svgText`
   - `vectorAssetDocument.sourceName`
   - `vectorAssetDocument.editorOptions`
4. If `vectorAssetDocument` or `svgText` is missing:
   - show visible input/schema error
   - do NOT fallback to demo SVG
   - do NOT require old preset/import path for hosted direct JSON flow

## Required Investigation

Codex must inspect SVG Asset Studio for old boot paths that depend on:
- `samplePresetPath`
- preset path query params
- import path only
- fallback/demo SVG
- old sample preset launch text
- wrapper payload shape

Do not remove general manual import UI if still valid.
Only fix hosted Workspace Manager direct payload boot.

## Required Validation

Targeted validation only.

Required:
- `toolbox/svg-asset-studio/main.js` syntax passes.
- Hosted payload with `vectorAssetDocument.svgText` loads into the editor.
- Hosted payload with `sourceName = sample-0901-ship.svg` is recognized.
- No old fallback/demo SVG is used for valid hosted payload.
- No schema/sample/runtime/workspace files changed.
- `git diff --name-only` contains only ALLOWED FILES.

## Report

Write:

- `docs_build/dev/reports/svg_asset_studio_hosted_payload_boot_11_152.txt`

Report must include:
- file changed
- old boot path found
- new direct hosted payload path
- sourceName/svgText verified
- validation command/result
- strict scope confirmation
- remaining blockers if any

## Full Samples Smoke Test

Skipped.

Reason:
- targeted SVG Asset Studio hosted payload boot fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- SVG Asset Studio consumes hosted `payloadJson.vectorAssetDocument`.
- Sample 1902 SVG asset renders/loads when opened through Workspace Manager.
- No preset/fallback/demo path is required for hosted direct JSON.
