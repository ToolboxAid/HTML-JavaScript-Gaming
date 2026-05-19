# PR_26139_019 Game Manifest Version Preview Normalization Report

## Summary
- Added current `$schema` declarations and Asset Manager V2 preview registries to older game manifests that only had legacy tool payloads.
- Preserved existing populated preview paths for Asteroids (`assets/images/preview.png`), Gravity Well (`assets/images/preview.svg`), and Pong (`assets/images/preview1.svg`).
- Added the missing `games/vector-arcade-sample/assets/images/preview.svg` file so the newly required preview manifest entry resolves on disk.
- Tightened `game.manifest.schema.json` so game manifests require `tools.asset-manager-v2` and validate that payload against the Asset Manager V2 schema.
- Extended game manifest validation to check the current game manifest schema and preview file existence for every game manifest.

## Manifest Updates
- Added `assets.image.preview.preview -> assets/images/preview.svg` to:
  - `AITargetDummy`
  - `Bouncing-ball`
  - `Breakout`
  - `Pacman`
  - `SolarSystem`
  - `SpaceDuel`
  - `SpaceInvaders`
  - `vector-arcade-sample`
- Left existing preview paths unchanged:
  - `Asteroids -> assets/images/preview.png`
  - `GravityWell -> assets/images/preview.svg`
  - `Pong -> assets/images/preview1.svg`

## Validation
- PASS: `npm run build:manifest`
- PASS: `node scripts/validate-json-contracts.mjs --mode=games --details`
  - `game_manifest_schema_validation: total=11 invalid=0`
- PASS: preview file existence check
  - `OK preview assets exist for 11 games`
- PASS: `npx playwright test tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs --project=playwright --workers=1 --reporter=list`
  - `4 passed`
- PASS: `node --check scripts/validate-json-contracts.mjs`
- PASS: `node --check tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs`
- PASS: `git diff --check`

## Manual Validation
- Open `/games/index.html` and confirm each game card thumbnail renders from the manifest preview asset.
- Open `/games/Pong/index.html` and confirm the thumbnail uses `assets/images/preview1.svg`.
- Confirm no page requests `/games/Pong/assets/images/preview.svg`.

## Notes
- `games/index.html` and `games/Pong/index.html` remain manifest-driven; no preview path was hardcoded into HTML or runtime.
- Full samples smoke test was skipped because this PR is limited to game manifest normalization and targeted game preview validation.
