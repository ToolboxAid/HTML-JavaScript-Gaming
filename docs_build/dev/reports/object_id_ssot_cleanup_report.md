# Object ID SSoT Cleanup Report

Task: PR_26133_027-object-id-ssot-manifest-schema-cleanup
Date: 2026-05-13

## Runtime Identity Contract

Object IDs are the single source of truth for Object Vector runtime/gameplay identity. Object Vector Studio V2 assetLibrary entries now use the runtime object ID directly in `id`, and duplicate runtime alias fields are rejected.

Preferred Object Vector assetLibrary entry shape is now:

```json
{
  "id": "object.asteroids.ship",
  "name": "Asteroids Ship",
  "tags": ["player", "ship"]
}
```

## Removed Or Replaced

- Removed `objectId` from `workspace.tools.object-vector-studio-v2.assetLibrary.assets[*]` in `games/Asteroids/game.manifest.json`.
- Replaced redundant `asset.asteroids.*` Object Vector assetLibrary IDs with matching `object.asteroids.*` IDs.
- Updated Object Vector Studio V2 editor logic so rename/delete/runtime preview/dependency graph behavior follows `asset.id` as the object ID.
- Updated runtime asset validation and normalization so Object Vector assetLibrary entries cannot carry duplicate `objectId` aliases.

## What Remains And Why

- `object.asteroids.*` remains under `game.gameData.objectVectorRuntime.objectIds` and Object Vector Studio V2 object records because those are runtime object identities.
- `vector.asteroids.*` remains only in vector-document/editor scoped data and is not used as runtime object identity.
- `assets.*` asset-manager IDs remain for true media/file assets such as audio, image, and font records.
- No `asset.asteroids.*` runtime Object Vector identity remains in active Asteroids runtime/editor payloads.

## Schema And Validation

- `tools/schemas/tools/object-vector-studio-v2.schema.json` no longer requires or permits `libraryAsset.objectId`.
- Object Vector Studio V2 validation now requires each library entry `id` to reference an existing object.
- Object Vector runtime validation now follows the same library ID/object ID contract.
- Playwright coverage includes explicit rejection for:
  - `assetLibrary.assets[*].objectId`
  - `assetLibrary.assets[*].id` values that do not resolve to an existing object ID

## Editor Controls

- Triangle-labeled Object Vector polygon shapes hide Add Point and Delete Point controls.
- Editable non-triangle polygons retain Add Point and Delete Point behavior.
- Duplicate Frame renders between Frame Earlier and Frame Later.

## Validation

- PASS - Asteroids game manifest validates against the updated schema.
- PASS - Asteroids small asteroid resolves by `objectId: object.asteroids.asteroid.small`.
- PASS - Object Vector Studio V2 loads Asteroids objects through `object.*` IDs.
- PASS - Object Vector Studio V2 rejects duplicate runtime alias fields in assetLibrary entries.
- PASS - Active Asteroids runtime/editor payloads have no `asset.asteroids.*` Object Vector runtime identity.
- PASS - Triangle/non-triangle polygon controls verified in Playwright.
- PASS - Duplicate Frame ordering verified in Playwright.
- PASS - `npm run test:workspace-v2` completed with 49 passed.
