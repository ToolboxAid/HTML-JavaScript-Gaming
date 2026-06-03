# PR_26133_127 Asteroids Manifest Render Path Cleanup

## Summary
- Replaced Asteroids attract/demo-only manifest ID names with shared Object Vector Studio V2 object IDs: bullet, ship, large/medium/small asteroid, large UFO, and small UFO.
- Required manifest geometry now explicitly includes `object.asteroids.small-ufo` with the other six runtime objects.
- Gameplay ship, ship lives, UFO, bullets, and asteroids now render with explicit `objectId` plus `requireManifestBinding: true`.
- Demo and attract ship/UFO/asteroid rendering now uses the same shared render keys and manifest object IDs as gameplay.

## Runtime Render Path Audit
- Removed active `attractShip`, `attractUfo`, and `attractAsteroid` render paths from Asteroids runtime code.
- No separate demo/attract object geometry definitions remain in Asteroids runtime code.
- Remaining direct renderer draws are non-object UI/effect paths: starfield background pixels, HUD/menu text, attract text panels, demo trail pixels, pause/initials overlays, particle effects, and ship debris fragments.
- Ship debris was left unchanged because it is an explosion effect, not a demo/attract object geometry source.

## Preserved Intentional Behavior
- Ship flame flicker state/shape data was not changed.
- Asteroid manifest geometry and scale tuning were not changed.
- Manifest-authored style colors remain sourced from Object Vector Studio V2 objects.
- No fallback/default vector maps or hardcoded object vector maps were added.

## Validation
- PASS: targeted Asteroids manifest/gameplay/demo/bullet node validation:
  - `AsteroidsValidation`
  - `AsteroidsPresentation`
  - `AsteroidsVectorTransforms`
  - `AsteroidsPlatformDemo`
  - `AsteroidsAssetReferenceAdoption`
- PASS: targeted Workspace Manager V2/Asteroids Playwright validation:
  - `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering"`
- PASS: `git diff --check`
- Playwright impacted: Yes. Validates Asteroids Object Vector runtime asset loading, attract/demo shared manifest IDs, gameplay manifest rendering, UFO/ship/asteroid render counts, and bullet runtime rendering.
- Full samples smoke test skipped as requested; this PR is limited to Asteroids render-path cleanup.

## Coverage
- Updated `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `docs_build/dev/reports/coverage_changed_js_guardrail.txt` to list the changed Asteroids runtime JS files from the targeted Playwright V8 coverage output.

## Manual Validation
- Open `/games/Asteroids/index.html`.
- Let attract mode enter title/demo phases; expected: ship, UFO, and all asteroids render from manifest-authored Object Vector Studio V2 objects.
- Start gameplay and fire bullets at multiple ship angles; expected: bullets use `object.asteroids.bullet` styling/geometry and rotate with fire direction.
- Confirm large, medium, and small asteroids preserve manifest-authored colors/scale tuning.
