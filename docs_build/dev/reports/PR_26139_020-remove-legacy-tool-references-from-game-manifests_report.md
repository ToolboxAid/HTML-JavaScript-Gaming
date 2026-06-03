# PR_26139_020 Remove Legacy Tool References From Game Manifests

## Summary
- Removed legacy `asset-browser`, `primitive-skin-editor`, and `palette-browser` entries from game manifests that still carried them.
- Preserved active V2/current tooling payloads, including each manifest's `asset-manager-v2` preview asset data.
- Added the required Workspace Manager V2 schema preload for `asset-manager-v2` so current game manifests validate through the browser Workspace Manager path.

## Manifest Cleanup
- `games/AITargetDummy/game.manifest.json`: removed `asset-browser`, `primitive-skin-editor`, `palette-browser`.
- `games/bouncing-ball/game.manifest.json`: removed `primitive-skin-editor`, `palette-browser`.
- `games/breakout/game.manifest.json`: removed `primitive-skin-editor`, `palette-browser`.
- `games/Pacman/game.manifest.json`: removed `asset-browser`, `primitive-skin-editor`, `palette-browser`.
- `games/SolarSystem/game.manifest.json`: removed `primitive-skin-editor`, `palette-browser`.
- `games/SpaceDuel/game.manifest.json`: removed `primitive-skin-editor`, `asset-browser`, `palette-browser`.
- `games/SpaceInvaders/game.manifest.json`: removed `primitive-skin-editor`, `asset-browser`, `palette-browser`.
- `games/vector-arcade-sample/game.manifest.json`: removed `primitive-skin-editor`, `asset-browser`, `palette-browser`.

## Active Replacements Preserved
- All 11 game manifests retain `tools.asset-manager-v2`.
- Existing active V2/current tool entries such as `palette-manager-v2`, `object-vector-studio-v2`, `sprite-editor`, `tile-map-editor`, `parallax-editor`, `svg-asset-studio`, and `preview-generator-tool` were left intact.
- Preview asset paths remain manifest-owned; no HTML/runtime preview fallback was added.

## Validation
- PASS: `npm run build:manifest`
- PASS: `node scripts/validate-json-contracts.mjs --mode=games --details`
  - `game_manifest_schema_validation: total=11 invalid=0`
- PASS: `rg -n '"(asset-browser|primitive-skin-editor|palette-browser)"' games -g 'game.manifest.json'`
  - No remaining matches in game manifests.
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "discovers Active Game options from selected repo manifests"`
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"`

## Notes
- Workspace Manager V2 browser validation previously failed current game manifests with `root.tools.asset-manager-v2: unresolved schema reference toolbox/asset-manager-v2.schema.json`. The manifest schema requires `asset-manager-v2`, so Workspace Manager now preloads and registers that schema alongside the other referenced tool schemas.
