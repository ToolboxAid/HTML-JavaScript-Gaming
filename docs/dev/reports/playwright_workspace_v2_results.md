# PR_26133_045 Workspace V2 Playwright Results

Task: PR_26133_045-object-preview-pan-direction-and-strict-schema-fix
Date: 2026-05-15

## Result

PASS - `npm run test:workspace-v2` completed successfully.

- Command: `npm run test:workspace-v2`
- Playwright target: `tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list`
- Final result: 51 passed, 0 failed.
- Runtime/console guard: Workspace Manager V2 and Object Vector Studio V2 scenarios completed with no reported page errors.

## PR-Specific Coverage

- Verified the Center control toggles the center dot without recentering or changing the viewport.
- Verified Up/Down/Left/Right pan only the viewport origin and update the Canvas origin display.
- Verified pan controls do not mutate selected shape geometry or transform state.
- Verified pointer X/Y coordinate display remains logical after the viewport-origin display change.
- Verified the transform origin/pivot marker reflects the applied origin used for rotation/scale behavior.
- Verified `game.gameData.objectVectorRuntime` and unknown `gameData` fields fail strict schema validation.
- Verified the workspace manifest schema rejects an unknown root field.

## Additional Validation

- `node` JSON parse check passed for `tools/schemas/game.manifest.schema.json`, `tools/schemas/workspace.manifest.schema.json`, and `games/Asteroids/game.manifest.json`.
- `node` schema-service check: current Asteroids manifest returned `{ ok: true }`.
- `node` schema-service check: injected `game.gameData.objectVectorRuntime` returned `{ ok: false }`.
- `node` schema-service check: injected `game.gameData.debugUnknown` returned `{ ok: false }`.
- `node` schema-service check: injected workspace root `debugUnknown` returned `{ ok: false }`.
