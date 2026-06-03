# BUILD_PR_LEVEL_11_158_FORCE_FIX_LITERAL_ASSET_NONE_RENDERER

## Purpose
Force-fix the exact Workspace Manager renderer path that still outputs the literal visible text `Asset: none` for SVG Asset Studio.

## Current Failure
After multiple targeted PRs, the UI still shows:

```text
Vector Assets
SVG Asset Studio
Asset: none
```

This means prior changes did not patch the active renderer path.

## STRICT SCOPE

### ALLOWED FILES
- tools/workspace-manager/main.js
- docs_build/dev/reports/literal_asset_none_renderer_11_158.txt

### ALLOWED CHANGES
- find and patch the exact active path that creates the visible `Asset: none` line
- add a temporary hard assertion if needed so the PR cannot silently pass while the literal remains
- create/update report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify samples
- modify SVG Asset Studio
- modify runtime host
- modify routing outside Workspace Manager
- modify unrelated tools
- add fallback/default/demo data
- transform/wrap/normalize payload
- leave report empty

## Mandatory Search

Codex MUST search `tools/workspace-manager/main.js` for every occurrence of:

- `Asset:`
- `none`
- `data-workspace`
- `textContent`
- `innerHTML`
- `appendChild`
- `assetLabel`
- `assetStatus`
- `assetSummary`
- `tool.asset`
- `toolData`
- `svg-asset-studio`

Codex MUST identify which occurrence actually creates the visible `Asset: none`.

## Required Hard Fix

For the active visible renderer path:

When rendering the SVG Asset Studio card, if loaded manifest contains:

```js
workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument.svgText
```

then the visible asset line MUST NOT be `Asset: none`.

It MUST be:

```text
Asset: sample-0901-ship.svg
```

using:

```js
workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument.sourceName
```

If `sourceName` is missing but `svgText` exists:

```text
Asset: Inline SVG
```

## Anti-Noop Requirement

This PR must FAIL unless one of these is true:

1. The exact renderer branch generating `Asset: none` was changed; OR
2. A temporary targeted assertion/log is added that fires when SVG Asset Studio renders `Asset: none`.

If Codex cannot statically find the active branch, it MUST add this temporary diagnostic:

```js
if (toolId === "svg-asset-studio" && renderedAssetText === "Asset: none") {
  console.error("[WorkspaceManager][svg-asset-studio][asset-none-source]", {
    toolId,
    renderedAssetText,
    workspaceToolEntry: workspaceManifest?.tools?.["svg-asset-studio"]
  });
}
```

Use actual variable names.

## Required Report Evidence

The report MUST include:

- every literal occurrence of `none` related to asset display
- the exact branch changed
- the exact data source now used
- whether a diagnostic/assertion remains
- expected visible output
- why previous PRs missed the active path

## Validation

Run targeted validation only.

Required:
- `node --check tools/workspace-manager/main.js`
- static search proves the SVG active branch cannot produce `Asset: none` when `vectorAssetDocument.svgText` exists, OR diagnostic remains to identify the source
- `git diff --name-only` contains only ALLOWED FILES

## Full Samples Smoke Test

Skipped.

Reason:
- targeted literal renderer fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- SVG Asset Studio card no longer displays `Asset: none` when the data is loaded, OR
- a targeted diagnostic proves exactly where that string is still coming from on the next run.
