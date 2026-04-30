# PR 11.95 Validation

## Scope
Applied `docs/pr/PR_11_95_FLATTEN_MANIFEST_ASSETS_AND_FIX_LOADERS.md`.
Implemented flat `tools["asset-browser"].assets` contract as the single manifest source for asset kinds across runtime + game manifests + key consumers.

## Files Changed
- `games/AITargetDummy/game.manifest.json`
- `games/GravityWell/game.manifest.json`
- `games/Pacman/game.manifest.json`
- `games/SpaceDuel/game.manifest.json`
- `games/SpaceInvaders/game.manifest.json`
- `games/vector-arcade-sample/game.manifest.json`
- `games/shared/workspaceGameAssetCatalog.js`
- `src/engine/runtime/gameImageConvention.js`
- `src/engine/runtime/fullscreenBezel.js`
- `tests/runtime/GamesIndexWorkspaceManagerOpen.test.mjs`
- `tests/core/BackgroundImageAndFullscreenBezel.test.mjs`
- `tools/shared/asteroidsPlatformDemo.js`
- `docs/dev/reports/PR_11_95_validation.md`

## Implementation Summary
- Flattened all game manifests still using `tools.asset-browser.assets.media` into direct flat map entries under `tools.asset-browser.assets`.
- Updated runtime loaders to consume flat `assets` directly:
  - `workspaceGameAssetCatalog` manifest extraction now reads `tools["asset-browser"].assets`.
  - `gameImageConvention` now collects image assets directly from flat `tools["asset-browser"].assets`.
  - `fullscreenBezel` stretch config extraction now scans flat asset map for bezel image entries with `stretchOverride`.
- Updated consumers/tests referencing nested media:
  - Workspace Manager runtime test now reads `assets` directly.
  - Asteroids shared demo manifest path updated to flat asset path fragment.
  - Bezel stretch test fragment path updated to `tools.asset-browser.assets.image.asteroids.bezel.stretchOverride`.

## Asteroids Contract Checks
- `image.asteroids.bezel.path` remains `/games/Asteroids/assets/images/bezel.png`.
- `image.asteroids.background.path` remains `/games/Asteroids/assets/images/deluxe.png`.
- `font.asteroids.vector-battle` exists under flat `tools.asset-browser.assets`.
- `stretchOverride.uniformEdgeStretchPx = 10` remains on `image.asteroids.bezel`.
- No `bezel1.png` references in source/manifests.
- No `asset-browser.assets.bezel` duplicate contract in source/manifests.

## Targeted Validation Commands and Results

### PR-doc search commands (equivalent recursive form)
Note: PowerShell `Select-String` in this environment does not support `-Recurse`, so equivalent `Get-ChildItem -Recurse -File | Select-String` was used.

1. `assets.media` search:
- Runtime/tool/test source scope (`src`, `games`, `tools`, `tests`): no matches.
- Repo-wide scan returns docs/history and temp browser cache text only.

2. `asset-browser.*media` search:
- Runtime/tool/test source scope: no matches.
- Repo-wide scan returns docs/history and temp browser cache text only.

3. `bezel1.png` search:
- Source/manifests scope: no matches.
- Repo-wide scan returns historical docs/reports/PR docs only.

4. `image.asteroids.bezel` search:
- Active manifest entry present in `games/Asteroids/game.manifest.json`.

5. `font.asteroids.vector-battle` search:
- Active manifest entry present in `games/Asteroids/game.manifest.json`.

### Syntax checks
- `node --check games/shared/workspaceGameAssetCatalog.js` PASS
- `node --check src/engine/runtime/gameImageConvention.js` PASS
- `node --check src/engine/runtime/fullscreenBezel.js` PASS
- `node --check tests/runtime/GamesIndexWorkspaceManagerOpen.test.mjs` PASS
- `node --check tools/shared/asteroidsPlatformDemo.js` PASS
- `node --check tests/core/BackgroundImageAndFullscreenBezel.test.mjs` PASS

### Targeted runtime checks
- `npm run test:workspace-manager:games` PASS
- `npm run test:manifest-payload:games` PASS

## Notes
- No aliases, shims, fallback paths, or media-compatibility layers were added.
- Full samples suite was skipped (targeted validation only, per PR scope).
