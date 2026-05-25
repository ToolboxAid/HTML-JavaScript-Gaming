# Space Invaders Manifest Collision Contract Report

## Summary
- Cleaned `games/SpaceInvaders/game.manifest.json` so Space Invaders no longer declares `tools.object-vector-studio-v2`.
- Added root `screen.width` and `screen.height` to Space Invaders, Space Duel, and Vector Arcade Sample. Space Duel and Vector Arcade Sample still expose object-vector geometry and now satisfy the Collision Inspector screen contract.
- Migrated Space Invaders audio asset records into `tools.asset-manager-v2.assets` before deleting the obsolete asset catalog.
- Deleted the duplicated Space Invaders palette/catalog files:
  - `games/SpaceInvaders/assets/palettes/space-invaders-classic.palette.json`
  - `games/SpaceInvaders/assets/workspace.asset-catalog.json`
- Updated Space Invaders audio asset IDs and metadata so runtime audio still resolves through manifest-owned Asset Manager V2 data.
- Updated Workspace Manager V2 coverage so Space Invaders keeps Object Vector Studio V2 and Collision Inspector V2 disabled, while Space Duel remains enabled from real object-vector geometry.

## Collision Contract
- Space Invaders has `screen: { width: 960, height: 720 }`, but no object-vector payload. Object Vector Studio V2 and Collision Inspector V2 remain disabled for Space Invaders because no valid object-vector geometry exists.
- Space Duel has 6 object-vector objects and now has `screen: { width: 960, height: 720 }`.
- Vector Arcade Sample has 5 object-vector objects and now has `screen: { width: 960, height: 720 }`.
- Asteroids already had valid root screen dimensions and object-vector geometry.
- No hidden fallback/default object geometry was added.

## SpaceInvadersSpriteData.js Review
`games/SpaceInvaders/game/SpaceInvadersSpriteData.js` remains runtime sprite constants in this PR. It is actively consumed by `SpaceInvadersScene.js` and `SpaceInvadersWorld.js` for bitmap sprite frames and shield overlay data, not object-vector collision geometry.

Recommended future path: make it first-class Sprite Data Tool or Sprite Editor input, then reference the exported sprite data through Asset Manager V2/manifest-owned data assets. It should not be converted into Object Vector Studio V2 data unless a future PR explicitly creates real vector geometry for authoring or collision.

## Validation
- `node --check games/SpaceInvaders/game/SpaceInvadersAudio.js`: passed.
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`: passed.
- `node scripts/validate-json-contracts.mjs`: game manifest schema validation passed with `total=12 invalid=0`. The script also reports pre-existing tool/sample JSON invalid counts outside this PR scope.
- Affected manifest cleanup check: passed.
- Active reference check for removed Space Invaders palette/catalog paths: no matches.
- Workspace Manager V2 service validation for Space Invaders game manifest and generated toolState context: passed.
- Focused Playwright coverage for object-vector/collision enablement: `1 passed`.
- `npm run test:workspace-v2`: `72 passed`.
- `git diff --check`: passed.

Full samples smoke test was not run, per request.
