# BUILD_PR_LEVEL_11_155_TRACE_SVG_ASSET_NONE_SOURCE

## Purpose
Fix SVG Asset Studio `Asset: none` by tracing the exact Workspace Manager code path that renders `none`, then patching only that branch.

## Problem
PR 11.153 and PR 11.154 did not fix the visible result:

Vector Assets
SVG Asset Studio
Asset: none

Therefore the prior PRs likely changed the wrong branch or the UI is not using that detection function.

## STRICT SCOPE

### ALLOWED FILES
- tools/workspace-manager/main.js
- docs_build/dev/reports/svg_asset_none_trace_11_155.txt

### ALLOWED CHANGES
- trace the exact code path producing `Asset: none`
- patch only that exact path for `svg-asset-studio`
- create/update report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify samples
- modify SVG Asset Studio
- modify tool host runtime
- modify other tools
- add fallback/default/demo data
- transform/wrap/normalize payload
- broaden unrelated detection logic

## Required Investigation

Codex must search in `tools/workspace-manager/main.js` for:

- `Asset: none`
- `none`
- `assetLabel`
- `assetSummary`
- `asset`
- `svg-asset-studio`
- `vectorAssetDocument`
- card render function
- tool row render function
- status summary function

Then identify the exact function/value that produces the displayed text.

## Required Fix

Given the loaded manifest direct payload:

```js
workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument
```

The visible SVG Asset Studio card must use:

```js
vectorAssetDocument.sourceName
```

or, if sourceName is unavailable but svgText exists:

```text
Inline SVG
```

The visible result must not be:

```text
Asset: none
```

when `vectorAssetDocument.svgText` exists.

## Required Debug Evidence

The report must include:

- exact function that produced `Asset: none`
- old expression/value source
- new expression/value source
- why PR 11.153/11.154 missed the active branch
- before/after rendered label expectation

## Validation

Run targeted validation only.

Required:
- `tools/workspace-manager/main.js` syntax passes.
- Static trace confirms active rendered SVG row/card reads direct:
  `tools["svg-asset-studio"].vectorAssetDocument`
- Sample 1902 SVG card label expected:
  `Asset: sample-0901-ship.svg`
  or equivalent non-none value.
- No schema/sample/runtime/tool files changed.
- `git diff --name-only` contains only ALLOWED FILES.

## Report

Write:

- `docs_build/dev/reports/svg_asset_none_trace_11_155.txt`

Report must include:
- file changed
- exact line/function producing old `Asset: none`
- exact line/function changed
- validation command/result
- strict scope confirmation

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Workspace Manager SVG card rendering fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- The active UI path for SVG Asset Studio no longer renders `Asset: none` when Sample 1902 has `vectorAssetDocument.svgText`.
- Fix is applied to the actual rendering path, not an unused helper.
