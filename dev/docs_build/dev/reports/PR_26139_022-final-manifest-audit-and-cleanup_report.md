# PR_26139_022 Final Manifest Audit And Cleanup Report

## Scope

- Final manifest/tooling audit cleanup after PR_26139_021.
- Kept changes limited to manifest-facing metadata, validation, Asset Manager V2 chrome asset lookup, and targeted validation expectations.
- Did not introduce new game runtime behavior.

## Cleanup

- `games/metadata/games.index.metadata.json`
  - Synced active game `toolsUsed` from each `game.manifest.json` tool map.
  - Synced manifest preview metadata where the manifest preview role differed, including Pong `preview1.svg`.
  - Replaced remaining deprecated planned-game tool tokens with current active tool IDs.

- `games/index.render.js`
  - Removed the hardcoded Skin Editor filter injection so the games index filter list comes from normalized metadata only.

- `scripts/validate-json-contracts.mjs`
  - Removed legacy `asset-browser` validation from game manifest validation.
  - Removed exact Asteroids filename checks for background/bezel/font assets.
  - Added generic Asset Manager V2 preview/background/bezel local file validation by role.
  - Added explicit deprecated game-manifest tool-key rejection.

- `src/engine/runtime/fullscreenBezel.js`
  - Removed Asteroids-specific bezel stretch config path redirection.
  - Restricted manifest stretchOverride scanning to `tools.asset-manager-v2.assets`.

- `tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs`
  - Updated the targeted Object Vector Studio V2 validation fixture and expectations to current schema/UI behavior:
    - `objects[].tags` required.
    - object count includes state count.
    - Shape Geometry/Shape Transform labels are current.
    - Tools button reflects the current accordion label.

## Audit Results

- Game manifests validated against current schema: PASS, 11 manifests, 0 invalid.
- Asset Manager V2 preview role exists for every game manifest: PASS.
- Preview/background/bezel file paths are validated by Asset Manager V2 role instead of hardcoded filenames: PASS.
- Deprecated game-manifest tool keys (`asset-browser`, `palette-browser`, `primitive-skin-editor`, `vector-map-editor`): none found.
- Games index metadata deprecated/unknown tool IDs: none found.
- Active audited runtime/tool paths contain no hardcoded `assets/images/background.png` or old Pong `/games/Pong/assets/images/preview.svg` request strings.
- Object Vector Studio V2 manifest geometry audit found no `objectVectorRoles`, `vectorMaps`, or `vector-map-editor` markers in game manifests.

## Validation

- `npm run build:manifest` PASS.
- `node scripts/validate-json-contracts.mjs --mode=games --details` PASS.
- Custom metadata tool audit PASS.
- Custom game manifest deprecated-tool and preview-role audit PASS.
- Custom Object Vector Studio V2 manifest marker audit PASS.
- Hardcoded preview/background request scan PASS.
- `npx playwright test tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs --project=playwright --workers=1 --reporter=list` PASS, 4 passed.
- `npx playwright test tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs --project=playwright --workers=1 --reporter=list` PASS, 3 passed.
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "discovers Active Game options from selected repo manifests"` PASS, 1 passed.
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"` PASS, 1 passed.
- `npx playwright test tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs --project=playwright --workers=1 --reporter=list` PASS, 4 passed.

## Notes

- Full samples smoke test was not run because this PR is a final manifest/tooling cleanup pass and does not broadly modify shared sample loading.
- The first Object Vector Studio V2 validation run exposed stale test expectations from prior schema/UI cleanup; the spec was updated narrowly and rerun successfully.
