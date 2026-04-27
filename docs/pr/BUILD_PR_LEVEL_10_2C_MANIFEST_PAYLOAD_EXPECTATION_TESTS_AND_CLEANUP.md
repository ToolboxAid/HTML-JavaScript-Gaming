# BUILD_PR_LEVEL_10_2C_MANIFEST_PAYLOAD_EXPECTATION_TESTS_AND_CLEANUP

## Objective
Fix the gap exposed by review: tests validate load/open state, but not expected manifest payload.

## Current Bad Example
Bouncing-ball manifest contains:
- `lineage`
- `sources`
- `assets`
- `sourcePath`
- references to old JSON
- copied legacy catalog data

These should not be present in the final clean manifest model.

## Direct Answers / Final Rules

### 1. `lineage`
Delete it from game manifests.

Reason:
- It is migration history/debug metadata.
- It is not runtime/tool data.
- It creates legacy dependency noise.

### 2. `sources`
Delete it from game manifests.

Reason:
- It points to old external JSON sources.
- Final manifest should not be a reference map.

### 3. `assets`
Delete generic root `assets`.

Reason:
- It is a copied catalog/index.
- It duplicates tool-owned data.
- External media file references belong only under `tools["asset-browser"].assets`.

### 4. Asteroids vector data
Asteroids ships/asteroids/title vectors must be actual Vector Asset Studio data under:

```json
tools["vector-asset-studio"].vectors
```

Workspace Manager should show Vector Asset Studio with a selected/available asset, not `Asset: none`.

### 5. `sprite-editor`
Remove from Asteroids if Asteroids has only vector assets.

### 6. `tile-map-editor`
Remove from Asteroids if Asteroids does not use tile maps.

### 7. `parallax-editor`
Remove from Asteroids if Asteroids does not use parallax.

### 8. `libraries`
Delete if it is only an index/reference list.

Keep only if it contains actual tool-owned reusable data that the tool requires. For Asteroids vector data, prefer actual entries in `vectors`, not a separate reference library.

## Clean Manifest Model

Allowed root fields:
- `schema`
- `version`
- `game`
- `launch` only if still intentionally used
- `tools`

Disallowed root fields:
- `lineage`
- `sources`
- generic `assets`
- copied legacy catalog data
- root `palette`
- root `palettes`

Allowed tool sections only when valid:
- `palette-browser`
- `primitive-skin-editor`
- `asset-browser`
- `vector-asset-studio`
- `sprite-editor` only for sprite games/data
- `tile-map-editor` only for tile games/data
- `parallax-editor` only for parallax games/data

## Required Test
Add or update a manifest payload expectation test.

Suggested file:

```text
tests/runtime/GameManifestPayloadExpectations.test.mjs
```

The test must validate:

### For all games
- no root `lineage`
- no root `sources`
- no generic root `assets`
- no `sourcePath`
- no stale external JSON paths
- no old `workspace.asset-catalog.json`
- no old `tools.manifest.json`
- every tool section has `schema`, `version`, `name`, `source`
- exactly one palette at `tools["palette-browser"].palette`
- no root `palette`
- no root `palettes`

### For Asteroids
- has `tools["vector-asset-studio"].vectors`
- vector count > 0
- does not have `sprite-editor` unless actual sprite data exists
- does not have `tile-map-editor` unless actual tilemap data exists
- does not have `parallax-editor` unless actual parallax data exists
- does not have `libraries` unless actual non-reference library data is required
- Workspace Manager must not show Vector Asset Studio `Asset: none` if vectors exist

### For Bouncing-ball
- no lineage/sources/assets
- has `palette-browser.palette`
- has `primitive-skin-editor.skins`
- no stale references to external palette/skin JSON files

## Required Cleanup
Clean all game manifests to satisfy the above test.

## Required Reports
Create:
- `docs/dev/reports/level_10_2c_manifest_payload_expectation_report.md`
- `docs/dev/reports/level_10_2c_manifest_cleanup_report.md`

## Acceptance
- Tests fail on the old bad manifest shape.
- Tests pass after cleanup.
- Bouncing-ball has no `lineage`, `sources`, or generic `assets`.
- Asteroids has Vector Asset Studio vectors and no invalid unused tool sections.
- Workspace Manager asset presence test validates actual payload expectations.
- No validators added.
- No start_of_day changes.
