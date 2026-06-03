# PR_26139_003-collision-inspector-v2 Report

## Summary

Built Collision Inspector V2 into a usable manifest-driven debugging tool for object orientation and collision behavior.

Playwright impacted: Yes.

## Scope Completed

- Added an Asteroids validation load path to Collision Inspector V2.
- Loaded selectable Object A/Object B entries from `tools.object-vector-studio-v2.objects`.
- Added collision modes: Bounds, Vector, Pixel/Sprite, and Hybrid.
- Added mouse drag movement for either selected object.
- Added per-object runtime rotation controls.
- Added live diagnostics for collision state, overlap, bounds, object origins, world origins, rotation, transformed point samples, and debug log output.
- Routed Pixel/Sprite and Hybrid checks through manifest vector shape raster masks generated at runtime from the selected manifest objects.
- Removed synthetic fallback geometry from unsupported shapes; unsupported geometry produces no collision polygon instead of defaulting to a rectangle.
- Added Workspace Manager V2 launch/hydration for Collision Inspector V2 when Object Vector Studio V2 manifest objects are present.
- Kept Asteroids object geometry manifest-owned only; no hardcoded Asteroids geometry or fallback vector maps were added.

## Files Changed

- `tools/collision-inspector-v2/index.html`
- `tools/collision-inspector-v2/js/bootstrap.js`
- `tools/collision-inspector-v2/js/CollisionInspectorV2App.js`
- `tools/collision-inspector-v2/styles/collisionInspectorV2.css`
- `tools/collision-inspector-v2/README.md`
- `tools/toolRegistry.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `tools/workspace-manager-v2/js/controls/ToolTilesControl.js`
- `tests/playwright/tools/CollisionInspectorV2.spec.mjs`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`

## Validation

PASS:

- `node --check tools/collision-inspector-v2/js/CollisionInspectorV2App.js`
- `node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `node --check tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - 2 passed.
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "syncs Workspace Manager V2 dirty lifecycle buttons and closes clean toolState data"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "registers Workspace Manager V2 from the tools index"`

FAIL, broader existing gate:

- `npm test`
  - Fails in `pretest` at `tools/dev/checkSharedExtractionGuard.mjs`.
  - Reported `189 unexpected violation(s)` across existing shared-extraction guard categories.
  - The failure spans existing game, sample, engine, and tool files; it also flags changed Collision Inspector V2 helper patterns as part of that broader guard.

FAIL, broader existing Workspace V2 suite:

- `npm run test:workspace-v2`
  - 54 passed, 2 failed.
  - Failing test: `validates optional Text to Speech V2 schema contract through Workspace Manager V2 schema`
    - Expected `activeContext.tools` to include `text2speech-V2`; received false.
  - Failing test: `tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes`
    - Expected a generated manifest schema validation failure; save succeeded instead.
  - Collision Inspector V2 launch, tile, hydration, and toolState cleanup coverage passed inside this run.

Advisory coverage:

- `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `docs_build/dev/reports/coverage_changed_js_guardrail.txt` list changed runtime JS files.
- Workspace-only coverage reports WARN for Collision Inspector V2 runtime files because the Workspace V2 suite does not collect that page. The targeted Collision Inspector V2 Playwright spec exercises the Collision Inspector V2 page directly.

Full samples smoke test:

- Skipped. This PR is limited to Collision Inspector V2 and Workspace Manager V2 launch wiring, and the current repo instructions say full samples smoke is only for broad shared sample/runtime impact.

## Manual Validation

1. Start the repo server used by Playwright or any local static server for the repo.
2. Open `/tools/collision-inspector-v2/index.html`.
3. Click `Load Asteroids Manifest`.
4. Confirm the summary reports Asteroids and 7 vector objects loaded.
5. Select `object.asteroids.ship` as Object A and `object.asteroids.large-asteroid` as Object B.
6. Drag Object B into Object A.
7. Switch collision mode through Bounds, Vector, Pixel/Sprite, and Hybrid.
8. Change Object A/Object B rotation values and confirm origins, rotation, transformed points, and summary JSON update live.
9. Open Workspace Manager V2, select Asteroids, and launch Collision Inspector V2 from the Utilities group.
10. Confirm the Workspace nav is visible, the tool loads Asteroids objects from workspace context, and Return to Workspace works.

Expected result:

- Collision Inspector V2 only uses Object Vector Studio V2 manifest objects.
- No default vector maps or hardcoded Asteroids geometry appear.
- Missing or invalid manifest object data produces visible/actionable log failures instead of hidden fallback geometry.
