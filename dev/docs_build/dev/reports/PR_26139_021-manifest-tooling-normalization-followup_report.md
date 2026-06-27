# PR_26139_021 Manifest Tooling Normalization Follow-Up

## Summary
- Tightened `game.manifest.schema.json` so `tools` only accepts current manifest-owned tool payloads.
- Removed stale manifest-owned tool payloads from `vector-arcade-sample` and converted its vector geometry to `object-vector-studio-v2.objects[]`.
- Removed optional Workspace Manager launch entries from manifests that do not have an active `palette-manager-v2` workspace context.
- Removed remaining active `asset-browser` manifest fallback reads from preview/chrome asset resolution.

## Manifest Decisions
- Direct-only manifests now keep only `launch.directPath`: AI Target Dummy, Bouncing Ball, Breakout, Pacman, Solar System, Space Duel, Space Invaders, and Vector Arcade Sample.
- Workspace-capable manifests keep current Workspace Manager V2 paths: Asteroids, Gravity Well, and Pong.
- `vector-arcade-sample` now uses:
  - `asset-manager-v2` for the preview asset.
  - `object-vector-studio-v2` for five converted objects: UI HUD, large obstacle, small obstacle, player, and UI title.
- Removed from `vector-arcade-sample` because the payloads were stale/non-current manifest ownership:
  - `sprite-editor`
  - `tile-map-editor`
  - `parallax-editor`
  - `svg-asset-studio`
  - `preview-generator-tool`

## Schema And Runtime Cleanup
- `toolbox/schemas/game.manifest.schema.json` now rejects unknown manifest tool keys instead of accepting arbitrary objects.
- `palette-manager-v2` is now a first-class game manifest schema property.
- Workspace Manager V2 now preloads/registers `palette-manager-v2.schema.json` when browser-validating game manifests.
- `src/engine/runtime/gameImageConvention.js` resolves chrome/preview image assets from Asset Manager V2 only.
- `games/shared/workspaceGameAssetCatalog.js` resolves manifest asset catalog entries from Asset Manager V2 only.
- `games/shared/workspaceGameLaunchGuard.js` points to `workspace-manager-v2` and no longer emits the old `mount=game` query.

## Validation
- PASS: `npm run build:manifest`
- PASS: `node scripts/validate-json-contracts.mjs --mode=games --details`
  - `game_manifest_schema_validation: total=11 invalid=0`
- PASS: manifest normalization audit
  - every manifest has `asset-manager-v2`
  - every manifest has exactly one preview role asset and the preview file exists
  - no stale manifest tool keys remain
  - no old Workspace Manager manifest launch paths remain
- PASS: `rg -n '"(asset-browser|primitive-skin-editor|palette-browser|vector-map-editor|preview-generator-tool|sprite-editor|tile-map-editor|parallax-editor|svg-asset-studio)"' games -g 'game.manifest.json'`
  - no remaining game manifest matches
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "discovers Active Game options from selected repo manifests"`
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"`
- PASS: `npx playwright test tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs --project=playwright --workers=1 --reporter=list`
- PASS: `git diff --check`

## Full Samples Smoke Test
- Skipped. This PR is scoped to manifest/tooling normalization plus targeted preview and Workspace Manager validation; it does not broadly change sample loading.
