# PR_26139_004-collision-inspector-engine-alignment Report

## Summary

Aligned Collision Inspector V2 with shared engine Object Vector collision logic and kept Asteroids collision consumers on the same manifest geometry path. The inspector now calls `src/engine/collision/objectVector.js` for bounds, vector, pixel/sprite, and hybrid checks instead of maintaining its own competing polygon/mask implementation.

Playwright impacted: Yes.

## Scope Completed

- Added shared Object Vector collision support under `src/engine/collision/objectVector.js` and exported it through `src/engine/collision/index.js`.
- Moved reusable Object Vector geometry normalization, transformed points, bounds, raster-mask, and collision-mode recommendation logic into the engine.
- Updated Collision Inspector V2 to consume `evaluateObjectVectorCollisionPair(...)` and shared engine diagnostics only.
- Refactored `CollisionInspectorV2App.js` into one-class files:
  - `CollisionInspectorV2App.js`
  - `CollisionInspectorV2Controls.js`
  - `CollisionInspectorV2Logger.js`
  - `CollisionInspectorV2ManifestLoader.js`
  - `CollisionInspectorV2Renderer.js`
- Kept `bootstrap.js` as a thin element/class wiring entry point.
- Added inspector schema support with `toolbox/schemas/tools/collision-inspector-v2.schema.json` and wired it through `workspace.manifest.schema.json`.
- Moved Collision Inspector V2 into the Workspace Manager V2 `Viewers` group and tools index viewer category.
- Added object-pair collision-mode auto-selection with manual override.
- Moved Collision Mode under Object B, moved Reset into the Collision Pair accordion, removed Copy Report, and added zoom.
- Updated Asteroids entity/object-geometry collision transforms to use shared collision helpers while continuing to load manifest Object Vector Studio V2 objects only.

## Guardrails

- No hardcoded Asteroids object geometry was added.
- No fallback/default vector maps were added.
- Collision Inspector V2 uses manifest `objects[].shapes[]` geometry only.
- Existing intentional ship flame flicker and asteroid scale tuning were preserved.

## Validation

PASS:

- `node --check` on touched Collision Inspector V2 modules and touched Asteroids entity modules.
- `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - 2 passed.
- `node -e "import('./tests/final/PrecisionCollisionSystems.test.mjs').then(({ run }) => run())"`
- `node -e "import('./tests/games/AsteroidsVectorTransforms.test.mjs').then(({ run }) => run())"`
- `node -e "import('./tests/games/AsteroidsCollisionTimingStress.test.mjs').then(({ run }) => run())"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "registers Workspace Manager V2 from the tools index"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering"`
- `git diff --check`
  - Passed with line-ending warnings only.

FAIL, broader existing gate:

- `npm test`
  - Fails in `pretest` at `toolbox/dev/checkSharedExtractionGuard.mjs`.
  - Reported `185 unexpected violation(s)`, `baseline_expected=609`, `baseline_resolved=6`, `total_violations=848`.
  - The PR_003 Collision Inspector helper hits are removed; remaining failures are broad repository guard drift across existing game, sample, engine, and tool files.

FAIL, broader existing Workspace V2 suite:

- `npm run test:workspace-v2`
  - 54 passed, 2 failed.
  - Failing test: `validates optional Text to Speech V2 schema contract through Workspace Manager V2 schema`
    - Expected `activeContext.tools` to include `text2speech-V2`; received false.
  - Failing test: `tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes`
    - Expected generated manifest schema validation failure; save succeeded.
  - Collision Inspector V2 category, schema, hydration, tile enablement, launch, and storage-session checks passed inside this run.

## Notes

- The targeted Asteroids collision stress fixture was adjusted to place the ship at the current manifest-accurate asteroid edge. The prior point was outside the restored Object Vector geometry and correctly produced no collision under the shared polygon path.
- Full samples smoke test was not run; this PR is scoped to Collision Inspector V2, shared Object Vector collision, Asteroids targeted collision validation, and Workspace Manager launch wiring.
