# PR_26133_119-object-vector-delete-and-manifest-cleanup Report

## Scope
- Fixed Object Vector Studio V2 object delete cleanup for `vectorMaps.objectVectorRoles`.
- Kept role bindings strict when present: each role entry still requires `objectId` and `tags`.
- Made role names generic in the Object Vector Studio V2 schema so delete can remove a role entry without requiring Asteroids-specific role names in every tool payload.
- Added schema reference validation so present `objectVectorRoles.*.objectId` values must reference existing `objects[]`.
- Removed the empty `text2speech-V2` payload from `games/Asteroids/game.manifest.json`.
- Kept Asteroids object geometry as the active source and verified required runtime vector/object IDs still resolve.

## Delete Behavior
- Before: deleting an object recursively removed matching `objectId` fields, which could leave `vectorMaps.objectVectorRoles.<role>` entries without required `objectId`.
- After: deleting an object removes matching `vectorMaps.objectVectorRoles` entries before generic reference cleanup runs.
- After: schema validation catches role bindings that keep an `objectId` pointing at a missing object.
- After: deleting a role-bound object can produce a schema-valid Object Vector payload without leaving partial role entries.

## Asteroids Manifest Cleanup
- Removed `tools["text2speech-V2"]: []` from the Asteroids manifest because it is an unrelated empty tool payload.
- Verified every Asteroids `objectVectorRoles` entry references an existing Object Vector object.
- Verified `ASTEROIDS_REQUIRED_VECTOR_MAP_IDS` and `ASTEROIDS_REQUIRED_OBJECT_VECTOR_ROLE_IDS` still resolve.

## Changed Files
- `games/Asteroids/game.manifest.json`
- `tests/games/AsteroidsValidation.test.mjs`
- `tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs`
- `tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`
- `tools/schemas/tools/object-vector-studio-v2.schema.json`

## Validation
- PASS: `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- PASS: `node --check tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`
- PASS: `node --check tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs`
- PASS: `node --check tests/games/AsteroidsValidation.test.mjs`
- PASS: JSON parse for `tools/schemas/tools/object-vector-studio-v2.schema.json` and `games/Asteroids/game.manifest.json`
- PASS: `node -e "import('./tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs').then(async (m) => { await m.run(); console.log('PASS ObjectVectorStudioV2DeleteCleanup'); })"`
- PASS: targeted Asteroids manifest-load cleanup validation:
  - no `text2speech-V2` payload remains
  - all `objectVectorRoles` entries keep required `objectId`
  - all role `objectId` values reference existing objects
  - Object Vector Studio V2 schema validation passes
  - Asteroids manifest vector loading passes
  - required runtime vector/object IDs resolve
- PASS: `node -e "import('./tests/games/AsteroidsValidation.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsValidation'); })"`
- PASS: `git diff --check` with line-ending warnings only.

## Skipped Validation
- Skipped full regression and full samples smoke tests as requested.
- Skipped `npm run test:workspace-v2`; PR-specific validation requested targeted Object Vector Studio V2 delete validation and targeted Asteroids manifest-load validation.
- Playwright impacted: No UI layout, browser interaction, capture path, or Workspace Manager lifecycle flow changed; the changed behavior is payload cleanup/schema validation and was covered with targeted Node validation.

## Manual Validation
- Open Object Vector Studio V2 with a payload containing `vectorMaps.objectVectorRoles` entries.
- Delete an object referenced by a role binding.
- Expected: the matching role entry is removed, no role entry remains with a missing `objectId`, and Copy/Export schema validation still succeeds.
- Open Asteroids after applying the manifest cleanup.
- Expected: Asteroids manifest loading succeeds, ship/asteroid/UFO Object Vector geometry still resolves, and no empty `text2speech-V2` payload is present in the Asteroids manifest.

