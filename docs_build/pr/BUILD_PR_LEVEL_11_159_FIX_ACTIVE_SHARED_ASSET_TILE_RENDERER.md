# BUILD_PR_LEVEL_11_159_FIX_ACTIVE_SHARED_ASSET_TILE_RENDERER

## Purpose
Fix the actual active renderer that displays `Asset: none` for SVG Asset Studio after PR 11.158 patched the wrong handoff path.

## Evidence
PR 11.158 changed `tools/Workspace Manager/main.js` and reported that it wrote a shared asset handoff, but the visible UI still shows:

```text
Vector Assets
SVG Asset Studio
Asset: none
```

Therefore the visible asset line is not being rendered from the patched `primeSvgAssetStatusLabelFromWorkspaceDiagnostics` path.

The active renderer is likely in a shared tool card/tile component or registry/status renderer, not the Workspace Manager diagnostic handoff branch.

## STRICT SCOPE

### ALLOWED FILES

Codex may inspect these files:

- tools/Workspace Manager/main.js
- tools/workspace-manager/main.js
- tools/shared/platformShell.js
- tools/shared/toolRegistry.js
- tools/shared/toolLaunchState.js
- tools/shared/toolCard*.js
- tools/shared/*card*.js
- tools/shared/*tile*.js
- tools/index*.js
- tools/index.html

Codex may modify ONLY the one file that contains the active renderer for the visible `Asset: none` line, plus the report:

- <the active renderer file found by search>
- docs_build/dev/reports/active_asset_tile_renderer_11_159.txt

If the active renderer file is not in ALLOWED FILES, STOP and report the exact file path. Do not modify any other file.

### ALLOWED CHANGES

- patch the active visible tile/card asset renderer so SVG Asset Studio uses loaded direct payload data
- add a temporary targeted diagnostic only if the active renderer cannot be proven statically
- create/update report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify Sample 1902 JSON
- modify SVG Asset Studio
- modify unrelated tools
- add fallback/default/demo data
- transform/wrap/normalize payload
- alter launch behavior
- patch inactive handoff code again

## Required Search

Codex MUST search the allowed files for every active renderer pattern:

- `Asset:`
- `Asset`
- `asset:`
- `assetLabel`
- `assetStatus`
- `assetSummary`
- `assetDisplay`
- `assetMeta`
- `toolMeta`
- `currentLabel`
- `switchMetaText`
- `data-tools-platform`
- `data-tool`
- `none`
- `N/A`
- `workspace`
- `svg-asset-studio`

Codex must identify which file/function creates the visible tile/card row:

```text
Vector Assets
SVG Asset Studio
Asset: none
```

Do not patch another helper unless it feeds this exact renderer.

## Required Fix

When rendering the visible asset line for `svg-asset-studio` in Workspace Manager context:

Use the loaded direct entry:

```js
workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument
```

or the equivalent already-loaded Workspace Manager direct payload source.

Display:

```text
Asset: sample-0901-ship.svg
```

from:

```js
vectorAssetDocument.sourceName
```

If `sourceName` is missing but `svgText` exists, display:

```text
Asset: Inline SVG
```

## Required Runtime Diagnostic If Not Statically Proven

If Codex cannot prove the active renderer receives `workspaceManifest`, it must leave a temporary diagnostic in the active renderer that logs only when the visible asset line would be `none` for SVG:

```js
console.error("[WorkspaceManager][svg-asset-studio][active-asset-renderer-none]", {
  renderedText,
  toolId,
  cardData,
  sourceData
});
```

Use actual variable names.

The report must then instruct the user to send that console output.

## Anti-Noop Rules

This PR is invalid if it only changes `tools/Workspace Manager/main.js` in the same `primeSvgAssetStatusLabelFromWorkspaceDiagnostics` handoff branch used by PR 11.158.

Codex must either:
1. Patch the actual shared/tile renderer source; OR
2. Leave a targeted diagnostic in the actual active renderer.

## Validation

Run targeted validation only.

Required:
- syntax check for changed JS file
- `git diff --name-only` shows only the active renderer file and the report
- report includes exact search results and active renderer path
- static proof that SVG no longer renders `Asset: none`, OR diagnostic left in active renderer

## Report

Write:

- `docs_build/dev/reports/active_asset_tile_renderer_11_159.txt`

Report must include:
- files searched
- exact active renderer file/function
- why PR 11.158 did not affect the visible line
- exact old value source
- exact new value source or diagnostic left in place
- expected visible output
- validation command/result
- strict scope confirmation

## Full Samples Smoke Test

Skipped.

Reason:
- targeted shared/tile renderer fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- SVG Asset Studio visible tile/card no longer shows `Asset: none` when direct data is loaded, OR
- the active renderer logs a targeted diagnostic proving the real data source on the next run.
