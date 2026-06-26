# PR_26177_DELTA_005-hitboxes-testable-mvp

## Purpose
Make Hitboxes a creator-testable MVP in one focused stacked Delta PR.

## Changed Files
- `toolbox/hitboxes/index.html`
- `assets/toolbox/hitboxes/js/index.js`
- `src/dev-runtime/persistence/tool-repositories/hitboxes-mock-repository.js`
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/engine/collision/hitboxCollision.js`
- `tests/engine/HitboxCollisionContract.test.mjs`
- `tests/playwright/tools/HitboxesTool.spec.mjs`

## Implementation Summary
- Replaced the read-only Hitboxes page with a Theme V2 creator tool shell.
- Added Object A/Object B selection backed by the Local API `hitboxes` repository.
- Added DEV review/test object sources through the server/service contract when no eligible real Objects exist.
- Added canvas-based Object A/Object B visual placeholders tied to object records, bounding boxes, origins, hitbox overlays, and motion path rendering.
- Added rectangle hitbox creation, selection, drag move, resize, field editing, delete, enable/disable, visible/hidden, unsaved status, and save status.
- Added server-owned Hitbox persistence with ULID keys in `hitbox_definition_records`.
- Added guest save redirect to `/account/sign-in.html`.
- Added shared engine static AABB contact classification and used shared engine swept AABB for motion preview.

## Validation Summary
- PASS: `node tests\engine\HitboxCollisionContract.test.mjs`
- PASS: `node --check assets\toolbox\hitboxes\js\index.js`
- PASS: `node --check src\dev-runtime\persistence\tool-repositories\hitboxes-mock-repository.js`
- PASS: `node --check src\engine\collision\hitboxCollision.js`
- PASS: `node --check tests\playwright\tools\HitboxesTool.spec.mjs`
- PASS: `node -e "import('./src/dev-runtime/server/local-api-router.mjs').then(() => console.log('local api router import ok'))"`
- PASS: Hitboxes repository contract smoke check for DEV samples and server-generated ULIDs.
- PASS: `git diff --check`
- PASS: HTML inline rule scan found no inline styles, style blocks, script blocks, or inline handlers.
- BLOCKED: `npx playwright test tools/HitboxesTool.spec.mjs --project=playwright` discovered tests but could not launch because Playwright Chromium is missing.
- BLOCKED: `npx playwright install chromium` timed out after 304 seconds.
