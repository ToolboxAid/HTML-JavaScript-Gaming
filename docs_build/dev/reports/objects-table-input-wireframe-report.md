# PR_26161_004 Objects Table Input Wireframe Report

## Branch Guard

- Current branch: `main`
- Expected branch: `main`
- Branch validation before edits: PASS

## Scope Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Kept the change targeted to the Objects tool table-input wireframe and DB/mock-adapter handoff behavior.
- PASS: Moved Objects metadata status/release channel to `Wireframe` / `wireframe`, keeping it clickable from Toolbox.
- PASS: Removed old sample-path wording from the Objects UI, targeted Objects tests, Objects metadata, shared object-model copy, and Objects-specific reports.
- PASS: Renamed the visible role concept to `Role`.
- PASS: Replaced narrow sample-path roles with broader role choices: `Collectible`, `Custom`, `Enemy`, `Goal`, `Hazard`, `Hero`, `Platform`, `Projectile`, `Spawner`, `UI`, and `Wall`.
- PASS: Reworked Objects input from the sidebar form to an editable table with inline name/type/role/state/render controls.
- PASS: Placed `Add Object` below the table and disabled it while a new or edited row is active.
- PASS: Added saved-row `Edit` and `Trash` actions, plus active-row `Save` and `Cancel` actions on the right side.
- PASS: Preserved shared object-model registry/validator usage and Sprite render asset create/resolve handoff.
- PASS: Kept Theme V2 restrictions intact: no inline CSS, no inline JS, no script/style blocks, and no inline event handlers.
- PASS: Added no sample JSON alignment, production DB behavior, auth behavior, persistence behavior, or engine runtime behavior.

## Implementation Evidence

- `toolbox/objects/index.html` now presents Object Setup, Role Choices, readiness checks, and an Objects Table instead of a sidebar draft form.
- `toolbox/objects/objects.js` now owns row edit state, table rendering, inline row controls, add/save/cancel/edit/trash handlers, broader role traits, and the existing Sprite asset handoff path.
- `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` marks Objects as wireframe and updates Objects capability copy to `Object setup types`.
- `src/engine/object-model/objectModelRegistry.js` no longer exposes sample-path wording in the Dynamic body type description.
- `tests/playwright/tools/ObjectsTool.spec.mjs` validates table input, broad roles, add disabling, Cancel/Edit/Trash, Toolbox click-through, no `bounces` trait, and real sprite asset linking/resolution.

## Validation

- PASS: `node --check toolbox/objects/objects.js`
- PASS: `node --check src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- PASS: `node --check src/engine/object-model/objectModelRegistry.js`
- PASS: `node --check tests/engine/ObjectModelContract.test.mjs`
- PASS: `node --check tests/playwright/tools/ObjectsTool.spec.mjs`
- PASS: `node --check tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs`
- PASS: `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- PASS: `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- PASS: HTML restriction check for `toolbox/objects/index.html`
- PASS: `node tests/engine/ObjectModelContract.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs --workers=1 --reporter=line` (4 passed)
- PASS: `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --reporter=line` (4 passed)
- PASS: `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "toolbox index shows wireframe|toolbox status kickers|toolbox Build Path status filters" --reporter=line` (3 passed)
- PASS: Combined affected browser lane: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "Objects|Toolbox and Admin Tool Votes|Admin metadata edits|Toolbox page does not|Toolbox and Admin pages do not|toolbox index shows wireframe|toolbox status kickers|toolbox Build Path status filters" --reporter=line` (11 passed)
- PASS: targeted stale wording scan returned no matches across Objects UI, shared object-model files, targeted tests, Objects metadata, and Objects-specific reports.
- PASS: `git diff --check`

## Playwright V8 Coverage

- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` regenerated from the final single-worker Objects Playwright run.
- Covered changed browser/runtime modules:
  - `toolbox/objects/objects.js` at 95% function coverage.
  - `src/engine/object-model/objectDefinitionSchema.js` at 75%.
  - `src/engine/object-model/objectDefinitionValidator.js` at 70%.
  - `src/engine/object-model/objectModelRegistry.js` at 67%.
- WARN: `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` is server/dev-runtime metadata and was not collected by browser V8 coverage.
- WARN: `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` appears in the coverage helper's HEAD-change detection path and was not collected by browser V8 coverage; it is not modified in the PR_004 working diff.

## Skipped Lanes

- SKIP: Full samples validation. Safe to skip because no sample JSON, sample launch path, sample manifest, or engine runtime behavior changed.
- SKIP: Sprite Editor launch/handoff Playwright. Safe to skip because no Sprite Editor files, routes, or context contract files changed; Objects still links to the existing Sprite Editor route with `assetKey`, `objectKey`, and `sourceTool=objects`.
- SKIP: Full root future-state Playwright. Safe to skip because PR_004 validation targets Objects, Toolbox clickability, and Toolbox/Admin metadata. The touched root test change is limited to removing stale Objects wording and passed syntax check.
- SKIP: Production DB/auth/persistence validation. Safe to skip because this PR only uses existing mock-adapter/shared asset contracts and adds no production DB, auth, or persistence behavior.

## Remaining Follow-Up

- Behavior and physics configuration still belong in future Events/behavior lanes, not object identity.
- Sprite asset content editing remains owned by Sprite Editor; Objects only creates/resolves and links the shared sprite asset record.
- The Objects table remains a wireframe authoring surface with in-session object definitions and no manifest persistence.
