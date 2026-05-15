# PR_26133_044 Workspace V2 Playwright Results

Task: PR_26133_044-remove-duplicated-object-vector-runtime-bindings
Date: 2026-05-15

## Result

PASS - `npm run test:workspace-v2` completed successfully.

- Command: `npm run test:workspace-v2`
- Playwright target: `tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list`
- Final result: 51 passed, 0 failed.
- Runtime/console guard: Asteroids Object Vector runtime and Workspace Manager V2 tests completed with no reported page errors.

## PR-Specific Coverage

- Verified Asteroids launches Object Vector runtime assets from `game.workspace.tools.object-vector-studio-v2.objects`.
- Verified runtime role validation resolves `object.asteroids.*` IDs directly from the loaded Object Vector object list.
- Verified `game.gameData.objectVectorRuntime` is absent from `games/Asteroids/game.manifest.json`.
- Verified schema validation rejects a manifest when `game.gameData.objectVectorRuntime` is re-added.
- Verified runtime rendering counts for asteroids, ship, and UFO remain active after removing the duplicate binding map.

## Additional Validation

- `node` manifest-schema check: current Asteroids manifest returned `{ ok: true }`.
- `node` manifest-schema check: injected `game.gameData.objectVectorRuntime` returned `{ ok: false }`.
- Targeted node smoke checks passed for `tests/games/AsteroidsPlatformDemo.test.mjs` and `tests/games/AsteroidsAssetReferenceAdoption.test.mjs`.

## Notes

- `npm test` is blocked before the node suite by the existing shared-extraction guard baseline drift; this PR did not touch those unrelated guard violations.
