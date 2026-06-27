# LEVEL 9.8 - Direct Data Manifest Rollout (All Games)

## Build
- `BUILD_PR_LEVEL_9_8_DIRECT_DATA_MANIFEST_ROLLOUT_ALL_GAMES`

## Scope Applied
- Audited every `games/*/game.manifest.json` for:
  - `runtimeSource`
  - root `assetCatalog`
  - `game.manifest.json#` fragment refs
  - `#tools/` and `#tools.` fragment refs
- Applied runtime-safe cutover change where residue remained.

## Files Changed
- `games/Asteroids/game.manifest.json`
- `games/shared/workspaceGameAssetCatalog.js`

## Manifest Rollout Result
All game manifests now satisfy the requested constraints:
- `runtimeSource` count: `0` across all game manifests
- root `assetCatalog` count: `0` across all game manifests
- `game.manifest.json#` count: `0` across all game manifests
- `#tools/` count: `0` across all game manifests
- `#tools.` count: `0` across all game manifests

## Asteroids Change Detail
- Removed root `assetCatalog` from `games/Asteroids/game.manifest.json`.
- Preserved direct-data model by moving external media asset entries under:
  - `tools.asset-browser.assets.media`
- Kept inline tool-owned data intact.

## Runtime Wiring Change
- Updated `games/shared/workspaceGameAssetCatalog.js` manifest parsing to also resolve catalog entries from:
  - `tools["asset-browser"].assets.media`
- This preserves asset path resolution for games that use manifest-hosted media entries after `assetCatalog` removal.

## Direct Launch Validation
- Executed `npm run test:launch-smoke`
- Result summary from run:
  - `PASS=275`
  - `FAIL=0`
  - `TOTAL=275`
- Game direct launch entries explicitly passed, including:
  - `_template`
  - `AITargetDummy`
  - `Asteroids`
  - `Bouncing-ball`
  - `Breakout`
  - `GravityWell`
  - `Pacman`
  - `Pong`
  - `SolarSystem`
  - `SpaceDuel`
  - `SpaceInvaders`
  - `vector-arcade-sample`

## Constraints Check
- No `start_of_day` paths modified.
- No validator modules added.
