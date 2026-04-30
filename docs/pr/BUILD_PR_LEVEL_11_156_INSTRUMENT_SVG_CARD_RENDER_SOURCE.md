# BUILD_PR_LEVEL_11_156_INSTRUMENT_SVG_CARD_RENDER_SOURCE

## Purpose
Stop guessing why SVG Asset Studio still shows `Asset: none` by instrumenting the actual Workspace Manager SVG card render source, then fixing the branch that renders the visible value.

## Current Failure
After PR 11.153, 11.154, and 11.155, the visible Workspace Manager card still shows:

Vector Assets
SVG Asset Studio
Asset: none

Therefore previous changes did not touch the active render source or the active UI is reading a different object than expected.

## STRICT SCOPE

### ALLOWED FILES
- tools/workspace-manager/main.js
- docs/dev/reports/svg_card_render_source_11_156.txt

### ALLOWED CHANGES
- add temporary console diagnostic only for `svg-asset-studio`
- trace the actual value used to render the visible asset label
- fix the exact active render branch
- remove the temporary diagnostic before final output if the fix is confirmed
- create/update report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify Sample 1902 JSON
- modify SVG Asset Studio
- modify tool host runtime
- modify other tools
- add fallback/default/demo data
- transform/wrap/normalize payload
- broaden unrelated tool logic

## Required Diagnostic

In `tools/workspace-manager/main.js`, locate the final render path that creates the card text for:

- category: Vector Assets
- title: SVG Asset Studio
- visible text: Asset: none

Add a temporary diagnostic that logs only when `toolId === "svg-asset-studio"`:

```js
console.info("[WorkspaceManager][svg-asset-studio-card]", {
  toolId,
  toolData,
  directEntry: workspaceManifest?.tools?.["svg-asset-studio"],
  vectorAssetDocument: workspaceManifest?.tools?.["svg-asset-studio"]?.vectorAssetDocument,
  renderedAssetLabel
});
```

Use actual variable names from the file.

## Required Fix

Once the active render value is identified, set the displayed asset label from the actual direct entry path.

Expected source:

```js
workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument.sourceName
```

If `sourceName` is missing but `svgText` exists, display:

```text
Inline SVG
```

Do not display:

```text
Asset: none
```

when `vectorAssetDocument.svgText` exists.

## Required Anti-Noop Rule

This PR must not finish with a report-only/no-op result.

Codex must either:
1. Change the active render branch so SVG no longer shows `Asset: none`, or
2. Leave the temporary diagnostic in place and report the exact console output required from the user.

If the active branch cannot be proven statically, leave the diagnostic in the file for one run.

## Validation

Run targeted validation only.

Required:
- JS syntax for `tools/workspace-manager/main.js` passes.
- Static code inspection shows the visible SVG asset label branch reads direct manifest data.
- If not statically provable, diagnostic remains for one run and report says exactly what console output to send back.
- `git diff --name-only` contains only ALLOWED FILES.

## Report

Write:

- `docs/dev/reports/svg_card_render_source_11_156.txt`

Report must include:
- file changed
- exact render function/branch touched
- whether diagnostic was removed or intentionally left
- expected visible label
- validation command/result
- strict scope confirmation
- if not fixed, exact console output requested

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Workspace Manager SVG card render-source diagnostic/fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- SVG Asset Studio card displays a non-none asset label from direct manifest data, OR
- a targeted console diagnostic is left in place that identifies the real active render source on next run.
