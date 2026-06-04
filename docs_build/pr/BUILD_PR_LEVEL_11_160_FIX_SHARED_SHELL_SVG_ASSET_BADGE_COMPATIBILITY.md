# BUILD_PR_LEVEL_11_160_FIX_SHARED_SHELL_SVG_ASSET_BADGE_COMPATIBILITY

## Purpose
Fix the shared shell asset badge so SVG Asset Studio shows the loaded SVG/vector asset instead of `Asset: none`.

## Current Failure
The SVG data is loaded, but the visible shared shell badge still shows:

```text
Vector Assets
SVG Asset Studio
Asset: none
```

The latest delta changed `src/shared/toolbox/platformShell.js`, which means the active visible badge path is in the shared shell, not Workspace Manager.

## Likely Cause
`platformShell.js` reads a shared asset handoff, then checks compatibility through asset-kind logic before displaying the label.

If the handoff uses fields like:

- `kind`
- `type`
- `sourceName`
- `path`
- `displayName`

but the compatibility function only checks:

- `asset.assetType`

then `compatibleAsset` becomes null and the badge falls back to `none`.

## STRICT SCOPE

### ALLOWED FILES
- src/shared/toolbox/platformShell.js
- docs_build/dev/reports/shared_shell_svg_asset_badge_11_160.txt

### ALLOWED CHANGES
- fix shared shell asset compatibility/labeling for SVG Asset Studio loaded asset handoff
- support direct asset handoff fields already produced by Workspace Manager
- create/update report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify samples
- modify Workspace Manager
- modify SVG Asset Studio
- modify runtime host
- modify unrelated tools
- add fallback/default/demo data
- transform/wrap/normalize payloads
- add broad repo-wide fallback cleanup

## Required Investigation

In `src/shared/toolbox/platformShell.js`, inspect:

- `renderToolAssetBadge`
- `readSharedAssetHandoff`
- `isAssetCompatibleWithTool`
- `normalizeAssetKind`
- `resolveAcceptedAssetKindsForTool`
- SVG Asset Studio badge path
- any code that chooses `compatibleAsset?.displayName || ... || "none"`

Codex must determine why the loaded SVG asset is not considered compatible or labelable.

## Required Fix

For `svg-asset-studio`, if a shared asset handoff exists and represents a vector/SVG asset, display a useful label.

Compatibility must support direct handoff fields without requiring only `asset.assetType`.

Allowed asset kind sources:

```js
asset.assetType
asset.kind
asset.type
```

Allowed label sources:

```js
asset.displayName
asset.sourceName
asset.name
asset.label
asset.path
```

For SVG Asset Studio specifically, valid compatible kinds include:

```text
vector
svg
asset
```

The badge must not show `Asset: none` when a loaded handoff exists with any compatible kind or usable label.

## Required Behavior

If SVG Asset Studio has a shared handoff like:

```js
{
  kind: "vector",
  sourceName: "sample-0901-ship.svg"
}
```

or:

```js
{
  type: "svg",
  path: "...sample-0901-ship.svg"
}
```

then badge must display:

```text
Asset: sample-0901-ship.svg
```

or a similarly useful non-none label.

## Do Not Reintroduce Broad Normalization

This is not repo-wide normalization.

It is a local compatibility read of already-loaded asset handoff metadata for display.

Do not create aliases or remap payloads.

## Validation

Run targeted validation only.

Required:
- `node --check src/shared/toolbox/platformShell.js`
- static check that SVG badge label can be derived from `asset.kind` / `asset.type` / `asset.assetType`
- static check that label can be derived from `displayName` / `sourceName` / `name` / `label` / `path`
- no sample/schema/workspace/svg-tool files changed
- `git diff --name-only` contains only ALLOWED FILES

## Report

Write:

- `docs_build/dev/reports/shared_shell_svg_asset_badge_11_160.txt`

Report must include:
- exact function changed
- old compatibility source
- new compatibility source
- old label source
- new label source
- expected visible output
- validation command/result
- strict scope confirmation

## Full Samples Smoke Test

Skipped.

Reason:
- targeted shared shell asset badge display fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- SVG Asset Studio shared shell badge no longer shows `Asset: none` when loaded asset handoff exists.
- Fix is in the active `platformShell.js` badge path.
- No schemas, samples, Workspace Manager, SVG Asset Studio, or runtime host files changed.
