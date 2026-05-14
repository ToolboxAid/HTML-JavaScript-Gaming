# Object ID SSoT Migration Report

Task: PR_26133_026-object-id-ssot-schema-and-editor-controls
Date: 2026-05-13

## Runtime Identity Contract

Object IDs are now the single source of truth for Asteroids Object Vector runtime identity. Runtime game selection uses `object.asteroids.*` IDs directly instead of resolving through `asset.asteroids.*` IDs or `vector.asteroids.*` editor IDs.

## Removed Or Replaced Runtime Identity

- Replaced Asteroids scene constants that selected `asset.asteroids.*` with `object.asteroids.*` constants.
- Replaced Asteroids scene render calls from `assetId` to `objectId` for ship, asteroid sizes, and UFO sizes.
- Replaced Asteroids platform demo runtime visual preference `vectorIds` with runtime `objectIds`.

## What Remains And Why

- `asset.asteroids.*` remains in `workspace.tools.object-vector-studio-v2.assetLibrary` because those entries are editor/library assets that map to Object Vector objects. Runtime scene selection no longer depends on them.
- `vector.asteroids.*` remains in `workspace.tools.vector-map-editor.vectorMapDocument.vectors` and vector document asset refs because those are editor/vector-document geometry IDs, not game runtime object identities.
- Object Vector object records remain under `workspace.tools.object-vector-studio-v2.objects`; the runtime loader resolves these objects by object ID.

## Schema Changes

- Added `game.gameData.objectVectorRuntime.objectIds` to `tools/schemas/game.manifest.schema.json`.
- The schema constrains runtime object references with the `^object\.` identity pattern so asset IDs and vector IDs are rejected when this contract is used.
- Updated `games/Asteroids/game.manifest.json` to declare ship, asteroid, and UFO runtime object IDs in `game.gameData.objectVectorRuntime.objectIds`.

## Editor Controls

- Triangle-labeled Object Vector polygon shapes hide Add Point, Delete Point, and point selection controls.
- Editable non-triangle polygons retain Add Point and Delete Point behavior.
- Duplicate Frame now renders between Frame Earlier and Frame Later.

## Validation

- PASS - Asteroids game manifest validates against the updated schema.
- PASS - Asteroids small asteroid resolves by `objectId: object.asteroids.asteroid.small`.
- PASS - Object Vector Studio V2 loads Asteroids objects.
- PASS - Triangle/non-triangle polygon controls verified in Playwright.
- PASS - Duplicate Frame ordering verified in Playwright.
- PASS - `npm run test:workspace-v2` completed with 49 passed.
