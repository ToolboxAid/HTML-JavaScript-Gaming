# BUILD_PR_VECTOR_ASSET_SYSTEM

## Purpose
Implement the first-class vector asset system defined in `PLAN_PR_VECTOR_ASSET_SYSTEM.md` while preserving the accepted platform boundaries and avoiding engine core API changes.

## Build Scope
- add `vector` as a first-class registry-owned asset type
- integrate vector assets into the dependency graph, validation, packaging, and runtime flows
- use the SVG-focused tool as the authoring bridge for normalized vector asset output
- normalize forward-facing tool naming to:
  - `toolbox/Sprite Editor/`
  - `toolbox/Tilemap Studio/`
  - `toolbox/Parallax Scene Studio/`
  - `toolbox/Vector Asset Studio/`
- document transitional compatibility for legacy tool paths

## Implemented Files
- `toolbox/shared/projectAssetRegistry.js`
- `toolbox/shared/projectAssetValidation.js`
- `toolbox/shared/projectPackaging.js`
- `toolbox/shared/gameplaySystemLayer.js`
- `toolbox/shared/vector/vectorAssetBridge.js`
- `toolbox/shared/vectorAssetSystem.js`
- `tests/tools/VectorAssetSystem.test.mjs`
- `tests/run-tests.mjs`
- `games/Asteroids/platform/assets/vectors/asteroids-ship.vector.json`
- `games/Asteroids/platform/assets/vectors/asteroids-asteroid-large.vector.json`
- `games/Asteroids/platform/assets/vectors/asteroids-title.vector.json`
- `toolbox/index.html`
- `toolbox/Sprite Editor/*`
- `toolbox/Tilemap Studio/*`
- `toolbox/Parallax Scene Studio/*`
- `toolbox/Vector Asset Studio/*`

## Vector Asset Contracts
- Registry adds a `vectors` section with normalized `source.kind`, `source.path`, geometry, style, and optional `paletteId`.
- Dependency graph adds `vector` nodes and deterministic `usesPalette` edges for palette-backed vector assets.
- Validation adds deterministic vector checks for malformed source definitions, missing geometry paths, invalid style, and missing registry references.
- Packaging accepts `vectorDocument.assetRefs.vectorId` as a strict packaging root and keeps stable ordering.
- Runtime consumes packaged vector assets through the existing strict data-asset path, preserving deterministic load order and fail-fast behavior.

## SVG Authoring Bridge
- Added `toolbox/shared/vector/vectorAssetBridge.js` to normalize SVG-authored path data into first-class vector asset definitions.
- `toolbox/Vector Asset Studio/` is now the normalized forward-facing authoring path.
- The current implementation bridge redirects to `toolbox/Vector Asset Studio/` during the transition window.

## Tool Naming Normalization
Forward-facing normalized paths now exist in the repo and should be treated as the target standard:

- `toolbox/Sprite Editor/`
- `toolbox/Tilemap Studio/`
- `toolbox/Parallax Scene Studio/`
- `toolbox/Vector Asset Studio/`

## Transitional Compatibility
Legacy implementation paths remain intact during transition and are compatibility-only:

- `toolbox/Sprite Editor/` backs `toolbox/Sprite Editor/`
- `toolbox/Tilemap Studio/` backs `toolbox/Tilemap Studio/`
- `toolbox/Parallax Scene Studio/` backs `toolbox/Parallax Scene Studio/`
- `toolbox/Vector Asset Studio/` backs `toolbox/Vector Asset Studio/`

Legacy naming such as `SpriteEditor` is not treated as the target standard.

## Verification
- `node --check toolbox/shared/projectAssetRegistry.js`
- `node --check toolbox/shared/projectAssetValidation.js`
- `node --check toolbox/shared/projectPackaging.js`
- `node --check toolbox/shared/vector/vectorAssetBridge.js`
- `node --check toolbox/shared/vectorAssetSystem.js`
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
