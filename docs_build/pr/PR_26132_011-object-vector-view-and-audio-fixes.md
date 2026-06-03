# PR_26132_011-object-vector-view-and-audio-fixes

## Scope

Fixes Object Vector Studio V2 centered viewport behavior, palette swatch rendering, Asteroids object-vector manifest validation, and the shared game audio path/playback regression.

## Changes

- Object Vector Studio V2 now treats canvas origin `0,0` as the center of the SVG work surface.
- Reset View restores the viewport origin to `0,0` and logs the exact reset state.
- A visible center-origin dot is drawn at `0,0` in loaded, empty, and palette-blocked render states.
- Primitive default geometry now lands inside the centered viewport.
- Palette colors render as square swatches only, with hover/title and aria details for the color label/value.
- The Object Vector work-area row sizing was tightened so render summary text does not overlap or intercept SVG shape clicks.
- Asteroids audio now resolves current `asset-manager-v2` manifest IDs directly.
- Shared game asset catalog loading now reads `game.workspace.tools.asset-manager-v2.assets` and resolves `assets/...` paths against `game.workspace.assetsPath`.
- Gapless loop playback now records actionable load/play errors instead of failing silently.

## Asteroids Object Assets

Reviewed `games/Asteroids/game.manifest.json` Object Vector Studio V2 payload:

- `object.asteroids.ship`
- `object.asteroids.asteroid.large`
- `object.asteroids.asteroid.medium`
- `object.asteroids.asteroid.small`
- `object.asteroids.ufo.large`
- `object.asteroids.ufo.small`

Schema check passed against `toolbox/schemas/tools/object-vector-studio-v2.schema.json` with 6 objects and no validation errors.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check games/shared/workspaceGameAssetCatalog.js`
- `node --check games/Asteroids/systems/AsteroidsAudio.js`
- `node --check src/engine/audio/GaplessLoopPlayer.js`
- `node --check toolbox/object-vector-studio-v2/js/ToolStarterApp.js`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "resolves asset-manager-v2 audio catalog paths"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "shows Object Vector Studio V2 layout shell and schema-only palette gate"`
- `npm run test:workspace-v2`
- Object Vector Studio V2 Asteroids manifest schema validation via `ObjectVectorStudioV2SchemaService`

Result:

- `npm run test:workspace-v2`: 40 passed.
- Targeted audio/game validation passed for wav playback and wav/mp3 manifest path resolution.
- Full samples smoke test skipped because this PR is scoped to Workspace Manager V2/Object Vector Studio V2 and affected Asteroids audio path validation; broad sample-loader behavior was not changed.

## Manual Validation

1. Open Object Vector Studio V2, load a valid object payload and runtime palette, and confirm Reset View returns the work surface to centered origin `0,0`.
2. Confirm the center dot remains visible and shape clicks work near the center of the surface.
3. Hover palette swatches and confirm color details are visible.
4. Launch Asteroids and verify fire/loop sounds play from `game.manifest.json` asset-manager-v2 audio entries.

## Out Of Scope

- No unrelated gameplay changes.
- No full samples smoke test.
- No `start_of_day` changes.
