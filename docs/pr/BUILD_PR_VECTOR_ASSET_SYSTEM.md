# BUILD_PR_VECTOR_ASSET_SYSTEM

## Purpose
Implement the first-class vector asset system defined in `PLAN_PR_VECTOR_ASSET_SYSTEM.md` while preserving the accepted platform boundaries and avoiding engine core API changes.

## Build Scope
- add `vector` as a first-class registry-owned asset type
- integrate vector assets into the dependency graph, validation, packaging, and runtime flows
- use the SVG-focused tool as the authoring bridge for normalized vector asset output
- normalize forward-facing tool naming to:
  - `tools/Sprite Editor V3/`
  - `tools/Tilemap Studio/`
  - `tools/Parallax Scene Studio/`
  - `tools/Vector Asset Studio/`
- document transitional compatibility for legacy tool paths

## Implemented Files
- `tools/shared/projectAssetRegistry.js`
- `tools/shared/projectAssetValidation.js`
- `tools/shared/projectPackaging.js`
- `tools/shared/gameplaySystemLayer.js`
- `tools/shared/vector/vectorAssetBridge.js`
- `tools/shared/vectorAssetSystem.js`
- `tests/tools/VectorAssetSystem.test.mjs`
- `tests/run-tests.mjs`
- `games/Asteroids/platform/assets/vectors/asteroids-ship.vector.json`
- `games/Asteroids/platform/assets/vectors/asteroids-asteroid-large.vector.json`
- `games/Asteroids/platform/assets/vectors/asteroids-title.vector.json`
- `tools/index.html`
- `tools/Sprite Editor V3/*`
- `tools/Tilemap Studio/*`
- `tools/Parallax Scene Studio/*`
- `tools/Vector Asset Studio/*`

## Vector Asset Contracts
- Registry adds a `vectors` section with normalized `source.kind`, `source.path`, geometry, style, and optional `paletteId`.
- Dependency graph adds `vector` nodes and deterministic `usesPalette` edges for palette-backed vector assets.
- Validation adds deterministic vector checks for malformed source definitions, missing geometry paths, invalid style, and missing registry references.
- Packaging accepts `vectorDocument.assetRefs.vectorId` as a strict packaging root and keeps stable ordering.
- Runtime consumes packaged vector assets through the existing strict data-asset path, preserving deterministic load order and fail-fast behavior.

## SVG Authoring Bridge
- Added `tools/shared/vector/vectorAssetBridge.js` to normalize SVG-authored path data into first-class vector asset definitions.
- `tools/Vector Asset Studio/` is now the normalized forward-facing authoring path.
- The current implementation bridge redirects to `tools/Vector Asset Studio/` during the transition window.

## Tool Naming Normalization
Forward-facing normalized paths now exist in the repo and should be treated as the target standard:

- `tools/Sprite Editor V3/`
- `tools/Tilemap Studio/`
- `tools/Parallax Scene Studio/`
- `tools/Vector Asset Studio/`

## Transitional Compatibility
Legacy implementation paths remain intact during transition and are compatibility-only:

- `tools/Sprite Editor V3/` backs `tools/Sprite Editor V3/`
- `tools/Tilemap Studio/` backs `tools/Tilemap Studio/`
- `tools/Parallax Scene Studio/` backs `tools/Parallax Scene Studio/`
- `tools/Vector Asset Studio/` backs `tools/Vector Asset Studio/`

Legacy naming such as `SpriteEditor` is not treated as the target standard.

## Verification
- `node --check tools/shared/projectAssetRegistry.js`
- `node --check tools/shared/projectAssetValidation.js`
- `node --check tools/shared/projectPackaging.js`
- `node --check tools/shared/vector/vectorAssetBridge.js`
- `node --check tools/shared/vectorAssetSystem.js`
- `node --check tests/tools/VectorAssetSystem.test.mjs`
- `node ./scripts/run-node-tests.mjs`
- Result: `107/107` explicit `run()` tests passed.

## Manual Validation Checklist
1. Vector asset can be normalized from SVG input into a registry-owned vector definition.
2. Dependency graph includes vector nodes and relationships.
3. Validation rejects malformed vector definitions deterministically.
4. Packaging includes vector assets deterministically from vector roots.
5. Runtime consumes packaged vector assets successfully.
6. Forward-facing tool names use the normalized studio names.
7. Transitional compatibility for legacy paths is documented.
8. No engine core APIs are changed.
