# PR_26133_031 Shape Schema Field Reduction Report

Task: PR_26133_031-shape-schema-field-reduction
Date: 2026-05-14

## Contract Changes

- Removed persisted shape-level `shapeKey` from Object Vector Studio V2 shape contracts.
- Removed persisted shape-level `label` from Object Vector Studio V2 shape contracts.
- Removed persisted shape-level `type` because it duplicated `tool` for Object Vector Studio V2 shapes.
- Kept `tool` as the required editor/runtime semantic field for each shape.
- Kept object IDs as the runtime object identity source of truth.
- Replaced frame `shapeOverrides[*].shapeKey` with `shapeOverrides[*].shapeIndex`, which references the local sorted shape row for the object including inherited rows.

## Schema Updates

- Updated `tools/schemas/tools/object-vector-studio-v2.schema.json` so shape variants discriminate by `tool`.
- Updated `tools/schemas/game.manifest.schema.json` to embed the same reduced Object Vector Studio V2 shape contract.
- Updated schema guards in `ObjectVectorStudioV2SchemaService` and `ObjectVectorRuntimeAssetService` so deprecated shape fields fail validation if reintroduced.
- Added duplicate local shape-order validation because sorted local order now carries editor row identity.

## Manifest/Data Updates

- Updated `games/Asteroids/game.manifest.json` to remove shape-level `shapeKey`, `label`, and `type` from Asteroids Object Vector Studio V2 objects.
- Updated ship animation frame overrides to use `shapeIndex` for the two thrust-line visibility toggles.
- Preserved media/file asset `type` fields for audio, font, and image assets because those are not Object Vector Studio V2 shape semantics.

## Editor/Runtime Updates

- Updated Object Vector Studio V2 selection, tile actions, palette sync, geometry editing, transforms, z-ordering, grouping, shape delete, and frame override logic to use local shape indexes.
- Derived UI display names from `tool` instead of removed local shape labels.
- Derived rendering and geometry behavior from `tool`; `triangle` continues to use polygon geometry where required.
- Updated runtime canvas/SVG rendering, bounds calculation, inheritance merging, and frame override application to use `tool` plus sorted local shape rows.

## Validation

- PASS - `npm run test:workspace-v2` completed with 49 passed, 0 failed.
- PASS - `games/Asteroids/game.manifest.json` validates against `tools/schemas/game.manifest.schema.json`.
- PASS - Embedded Object Vector Studio V2 payload validates against `tools/schemas/tools/object-vector-studio-v2.schema.json`.
- PASS - `ObjectVectorRuntimeAssetService` loads the reduced Asteroids payload.
- PASS - `node tests/games/AsteroidsAssetReferenceAdoption.test.mjs`.
- PASS - `node tests/games/AsteroidsPlatformDemo.test.mjs`.
