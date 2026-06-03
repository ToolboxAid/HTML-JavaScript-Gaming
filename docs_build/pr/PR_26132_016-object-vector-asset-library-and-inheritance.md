# PR_26132_016-object-vector-asset-library-and-inheritance

## Scope

Adds the Object Vector Studio V2 reusable asset library and inheritance foundation, then wires Asteroids runtime rendering to resolve assets through library entries. Palette remains a workspace/session runtime resource and is not embedded in Object Vector JSON.

## Changes

- Added durable `assetLibrary.assets` schema support with category, tags, and object references.
- Added object-level inheritance metadata through `baseObjectId`.
- Added strict validation for duplicate object ids, duplicate asset ids, missing base objects, missing library object references, circular inheritance chains, and inherited shape/frame references.
- Added Object Vector Studio V2 library browser UI, asset category/tag controls, library asset creation, usage reporting, dependency graph display, readonly inherited-field indicators, and Duplicate As Local workflow.
- Added runtime inherited object resolution, inherited render-payload cache, asset-id resolution, dependency logging, and cache hit/miss diagnostics.
- Registered Asteroids ship, asteroid, and UFO object vectors through reusable `asset.asteroids.*` library entries.
- Updated Asteroids gameplay rendering to resolve ship, asteroid, and UFO vectors through asset ids instead of direct object ids.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check src/engine/rendering/ObjectVectorRuntimeAssetService.js`
- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `node --check tools/object-vector-studio-v2/js/bootstrap.js`
- `node --check tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`
- `node --check games/Asteroids/index.js`
- `node --check games/Asteroids/game/AsteroidsGameScene.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- Object Vector schema validation against `games/Asteroids/game.manifest.json`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "asset library inheritance|loads Object Vector Studio V2 runtime|Object Vector Studio V2 animation"`
- `npm run test:workspace-v2`
- `git diff --check`

Result:

- Targeted Object Vector/Asteroids runtime validation passed: 3 passed.
- Full Workspace Manager V2 suite passed: 45 passed.
- Playwright V8 coverage generated at `docs_build/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request.

## Playwright Coverage

Validates:

- Library asset creation.
- Asset browser entries, category/tag metadata, usage report, and dependency graph.
- Inherited asset rendering through runtime preview.
- Duplicate As Local removes inheritance metadata from the local copy.
- Circular inheritance rejection.
- Missing dependency failure handling.
- Asteroids runtime asset loading through reusable library asset ids.

Expected pass behavior:

- Valid library assets and inheritance chains validate, resolve, cache, and render through the runtime vector pipeline.

Expected fail behavior:

- Missing dependencies, circular inheritance, invalid references, and invalid runtime payloads fail visibly before render with actionable FAIL logs.

## Manual Validation

1. Open `tools/object-vector-studio-v2/index.html`.
2. Import an Object Vector Studio V2 payload with `assetLibrary.assets` and at least one derived object using `baseObjectId`.
3. Confirm the asset library browser, usage report, dependency graph, inherited-field indicators, Runtime Preview, and Duplicate As Local.
4. Open Asteroids and start gameplay.
5. Confirm the ship, asteroids, and UFOs render from `asset.asteroids.*` library entries.

Expected outcome:

- Valid assets render, inherited assets resolve through their base object, duplicate local copies no longer include `baseObjectId`, and invalid inheritance payloads are rejected before render.

## Out Of Scope

- No World Vector Studio V2 changes.
- No sample JSON changes.
- No full samples smoke test.
