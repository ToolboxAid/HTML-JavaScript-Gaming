# BUILD_PR_LEVEL_11_161_WIRE_SVG_PAYLOAD_TO_SHARED_ASSET_BADGE

## Purpose
Fix the remaining SVG Asset Studio badge issue by wiring loaded `vectorAssetDocument` metadata into the shared shell asset badge path.

## Current Failure
SVG Asset Studio payload is loaded, but the visible shell/header still shows:

```text
Vector Assets
SVG Asset Studio
Asset: none
```

PR 11.160 updated shared shell compatibility, but the badge still shows `none`. That means the shared shell likely still does not receive usable asset metadata for SVG Asset Studio.

## Root Cause Direction
This is not a schema problem and not an SVG data-load problem.

The likely missing bridge is:

Workspace Manager hosted launch context:
- has `payloadJson.vectorAssetDocument`
- does NOT provide a compatible shared asset badge metadata object

Shared shell badge:
- looks for shared asset metadata
- sees none
- renders `Asset: none`

## STRICT SCOPE

### ALLOWED FILES
- toolbox/Workspace Manager/main.js
- src/shared/toolbox/platformShell.js
- docs_build/dev/reports/svg_payload_to_shared_asset_badge_11_161.txt

### ALLOWED CHANGES
- Workspace Manager may add SVG asset badge metadata to the shared host context when launching `svg-asset-studio`
- Shared shell may read SVG asset badge metadata from the hosted shared context
- create/update report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify Sample 1902 JSON
- modify SVG Asset Studio tool code
- modify tool host runtime
- modify other tools
- add fallback/default/demo data
- transform/wrap/normalize payload
- broaden unrelated badge behavior
- do repo-wide fallback cleanup

## Required Behavior

When Workspace Manager launches SVG Asset Studio with direct payload:

```js
payloadJson.vectorAssetDocument.sourceName === "sample-0901-ship.svg"
payloadJson.vectorAssetDocument.svgText
```

the shared shell badge must show:

```text
Asset: sample-0901-ship.svg
```

or if sourceName is missing but svgText exists:

```text
Asset: Inline SVG
```

## Required Implementation Contract

### Workspace Manager
When building the shared context for `svg-asset-studio`, include badge metadata derived from the already-loaded direct payload:

```js
asset: {
  kind: "svg",
  sourceName: payloadJson.vectorAssetDocument.sourceName,
  displayName: payloadJson.vectorAssetDocument.sourceName || "Inline SVG"
}
```

Use actual existing shared-context field names if the repo already has one.

Do not modify the payload itself.

### Shared Shell
When rendering the asset badge, read the explicit shared asset metadata first.

If unavailable, for hosted SVG Asset Studio only, it may read from:

```js
sharedContext.payloadJson.vectorAssetDocument
```

for display label only.

Do not mutate payload.

## Required Investigation

Codex must inspect both files:

- `toolbox/Workspace Manager/main.js`
  - shared context creation
  - SVG launch path
  - payload handoff object

- `src/shared/toolbox/platformShell.js`
  - shared context read
  - asset badge render
  - displayed `Asset: none` fallback

Codex must determine whether the badge is missing:
1. metadata creation, or
2. metadata read, or
3. both.

## Validation

Run targeted validation only.

Required:
- `node --check "toolbox/Workspace Manager/main.js"`
- `node --check src/shared/toolbox/platformShell.js`
- Sample 1902 SVG launch context includes asset badge metadata
- shared shell renders non-none asset badge for SVG Asset Studio
- no schema/sample/SVG tool/runtime files changed
- `git diff --name-only` contains only ALLOWED FILES

## Report

Write:

- `docs_build/dev/reports/svg_payload_to_shared_asset_badge_11_161.txt`

Report must include:
- files changed
- whether issue was metadata creation or metadata read
- exact metadata field used
- expected visible output
- validation command/result
- strict scope confirmation

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Workspace Manager → shared shell SVG asset badge handoff fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- SVG Asset Studio shell/header no longer shows `Asset: none` when launched from Workspace Manager with Sample 1902.
- Badge label is derived from loaded direct `vectorAssetDocument`.
- Payload remains unchanged and direct.
