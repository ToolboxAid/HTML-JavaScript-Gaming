# PR_26139_005-collision-inspector-shared-tool-polish Report

## Summary

Polished Collision Inspector V2 into a shared manifest-driven tool. The tool now loads manifests through a reusable shared loader, removes Asteroids-specific UI/docs wording, preserves viewport aspect ratio, supports Workspace Manager launch context automatically, and uses manifest-owned screen dimensions shared with Asteroids runtime boot.

Playwright impacted: Yes.

## Scope Completed

- Added shared manifest loading under `src/tools/common/GameManifestLoader.js`.
- Updated Collision Inspector V2 to use the shared loader for file, URL path, and Workspace Manager launch context loading.
- Removed Asteroids-specific wording and direct Asteroids load controls from Collision Inspector V2 UI/docs.
- Moved the manifest file picker into the tool header and hid it for Workspace Manager launches.
- Added Workspace Manager return behavior consistent with workspace-launched tool headers.
- Maintained Collision Inspector viewport aspect ratio from the active manifest screen dimensions.
- Updated fullscreen layout so the left column pins left, the right column pins right, and the center viewport fills available horizontal space.
- Added `screen.width` and `screen.height` to the Asteroids game manifest and schemas.
- Updated Asteroids runtime boot and scene setup to consume manifest screen dimensions instead of hardcoded runtime dimensions.
- Propagated manifest screen dimensions through Workspace Manager V2 synthesized contexts and Asset Manager workspace context validation.
- Added targeted screen-dimension/Asteroids launch smoke coverage.

## Guardrails

- Collision Inspector V2 still uses the shared engine collision path.
- No hardcoded Asteroids geometry was added.
- No fallback/default vector maps were added.
- Collision Inspector V2 uses manifest `objects[].shapes[]` geometry only.
- Existing intentional ship flame flicker and asteroid scale tuning were not changed.

## Validation

PASS:

- `npm run build:manifest`
  - Passed. This repo does not define a plain `npm run build` script.
- `node --check` on touched Collision Inspector V2 modules, shared loader, Asteroids runtime modules, Workspace Manager service, Asset Manager workspace bridge, and touched Playwright specs.
- JSON parse check for:
  - `games/Asteroids/game.manifest.json`
  - `tools/schemas/game.manifest.schema.json`
  - `tools/schemas/workspace.manifest.schema.json`
- `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - 2 passed.
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"`
  - 1 passed.
- `node -e "import('./tests/games/AsteroidsManifestScreenDimensions.test.mjs').then(({ run }) => run())"`
  - Passed. Confirmed Asteroids runtime and scene receive manifest screen dimensions.
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering"`
  - 1 passed. Used as targeted Asteroids launch smoke validation for the manifest dimension change.
- `git diff --check`
  - Passed with line-ending warnings only.
- `rg "Asteroids|loadAsteroids|ASTEROIDS" tools/collision-inspector-v2 -n`
  - No matches.

FAIL, broader existing gate:

- `npm test`
  - Fails in `pretest` at `tools/dev/checkSharedExtractionGuard.mjs`.
  - Reported `185 unexpected violation(s)`, `baseline_expected=609`, `baseline_resolved=6`, `total_violations=848`.
  - Remaining failures are broad repository guard drift also present before this PR_005 scope.

FAIL, broader existing Workspace V2 suite:

- `npm run test:workspace-v2`
  - 54 passed, 2 failed.
  - Failing test: `validates optional Text to Speech V2 schema contract through Workspace Manager V2 schema`
    - Expected `activeContext.tools` to include `text2speech-V2`; received false.
  - Failing test: `tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes`
    - Expected generated manifest schema validation failure; save succeeded.
  - Collision Inspector V2 and Workspace Manager launch paths passed inside this run.

FAIL, broader Asteroids fixture not used as final targeted gate:

- `node -e "import('./tests/games/AsteroidsValidation.test.mjs').then(({ run }) => run())"`
  - Failed on an existing stale bullet geometry point-order assertion unrelated to screen dimensions or Collision Inspector V2.
  - A focused `AsteroidsManifestScreenDimensions.test.mjs` smoke test was added and passed for this PR scope.

## Notes

- Full samples smoke test was not run. The request called for targeted Asteroids launch smoke only because manifest dimensions affect runtime.
- The `npm run build:manifest` command wrote a generated `docs/build/` artifact during validation; it was removed from the delta because it is build output and not part of this PR scope.
