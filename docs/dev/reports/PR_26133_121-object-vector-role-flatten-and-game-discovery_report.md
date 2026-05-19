# PR_26133_121-object-vector-role-flatten-and-game-discovery

## Summary
- Flattened Asteroids Object Vector role ownership out of `vectorMaps.objectVectorRoles`.
- Kept `objects[].shapes[]` as the Object Vector Studio V2 geometry SSoT.
- Fixed Workspace Manager V2 game manifest validation so Asteroids is discovered in the Active Game dropdown.

## Cleanup Decisions
- Removed `object-vector-studio-v2.vectorMaps.objectVectorRoles` from `games/Asteroids/game.manifest.json`.
- Kept the existing role tags on `objects[]` as the manifest-owned runtime role source.
- Updated Asteroids role resolution to derive required runtime roles from `objects[].tags`.
- Kept concrete object IDs for direct object identity checks such as `object.asteroids.bullet`, `object.asteroids.ship`, and attract object IDs.
- Updated the Asteroids manifest loader to reject legacy `vectorMaps.objectVectorRoles` with an actionable error.
- Removed Object Vector Studio V2 schema definitions for `objectVectorRoles` and role bindings.
- Updated Object Vector Studio V2 delete cleanup so it no longer edits a removed role map.
- Updated Workspace Manager V2's game manifest schema reference from the removed `vectorMapDocument` definition to `objectVectorShapeDocument`.
- Updated Workspace Manager V2 summary fallback wording from old vector-map `vectors` to current `vectorMaps.shapes`.

## Validation
- Playwright impacted: Yes. This PR changes Workspace Manager V2 game discovery and Object Vector manifest loading.
- PASS targeted Workspace Manager V2 game dropdown validation:
  `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "discovers Active Game options from selected repo manifests"`
- PASS direct Workspace Manager V2 Asteroids manifest validation.
- PASS direct Workspace Manager V2 game discovery includes Asteroids.
- PASS targeted Asteroids tag-flatten manifest-load validation.
- PASS targeted Object Vector Studio V2 tag-flatten manifest-load validation.
- PASS `node -e "import('./tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs').then(async (m) => { await m.run(); console.log('PASS ObjectVectorStudioV2DeleteCleanup'); })"`
- PASS `node -e "import('./tests/games/AsteroidsValidation.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsValidation'); })"`
- PASS `node -e "import('./tests/games/AsteroidsVectorTransforms.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsVectorTransforms'); })"`
- PASS `node -e "import('./tests/games/AsteroidsAssetReferenceAdoption.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsAssetReferenceAdoption'); })"`
- PASS `node -e "import('./tests/games/AsteroidsPlatformDemo.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsPlatformDemo'); })"`
- PASS `node -e "import('./tests/games/AsteroidsPresentation.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsPresentation'); })"`
- PASS `node --check` for changed runtime, tool, schema-service, targeted test, and targeted Playwright files.
- PASS JSON parse for changed manifest/schema JSON files.
- PASS `git diff --check`.

## Skipped
- Full Workspace Manager V2 suite via `npm run test:workspace-v2` skipped in favor of the PR-requested targeted dropdown validation.
- Full regression/full samples smoke test skipped per PR instructions.

## Artifacts
- Review diff: `docs/dev/reports/codex_review.diff`
- Changed files report: `docs/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26133_121-object-vector-role-flatten-and-game-discovery_delta.zip`
