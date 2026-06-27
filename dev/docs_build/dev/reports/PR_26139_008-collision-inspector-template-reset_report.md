# PR_26139_008-collision-inspector-template-reset

## Scope
- Rebuilt Collision Inspector V2 shell/body styling around First-Class Tool Starter V2 class patterns.
- Added Tool Starter panel, accordion, field, and output classes to the Collision Inspector V2 markup.
- Kept the shared engine collision path and manifest-only Object Vector Studio V2 geometry usage unchanged.
- Kept the existing A/B rotation wiring and made the controls first-class, visible Tool Starter fields.
- Formatted Origins output as fixed three-decimal, separate-line text.

## Scale Normalization Rule
- Collision Inspector V2 uses the loaded manifest `screen.width` and `screen.height` as the canvas intrinsic size and CSS size at zoom `1x`.
- At Collision Inspector zoom `1x`, one manifest/world unit equals one canvas CSS pixel. Diagnostic zoom is applied only as a canvas transform for inspection and does not mutate object geometry.
- Asteroids runtime uses the same manifest screen dimensions and the shared Object Vector runtime renderer defaults object `scale` to `1` unless a runtime instance intentionally supplies a scale.
- Object Vector Studio V2 keeps its authoring grid/view scale separate from runtime geometry: its work surface uses `OBJECT_PREVIEW_DRAWING_SCALE = GRID_STEP` for editing, then maps pointer positions back by dividing by that drawing scale. Export/runtime object geometry remains manifest-unit `objects[].shapes[]` data.

## Layout Decisions
- Removed the conflicting custom app-shell sizing rules and replaced them with Tool Starter V2 shell, panel, accordion, field, menu, and output patterns.
- Left panel open accordions use `flex: 1 1 0`, so Manifest and Collision Pair share available vertical space evenly.
- Right panel open accordions use the same rule, so Live Result, Collision Summary, and Collision Logs share available vertical space evenly.
- Collision Summary and Live Result remain vertically scrollable within their accordion bodies.
- The manifest-size canvas is hosted in a scrollable viewport instead of being scaled down by CSS.

## Validation
- PASS: `node --check toolbox/collision-inspector-v2/js/CollisionInspectorV2Controls.js`
- PASS: `node --check toolbox/collision-inspector-v2/js/CollisionInspectorV2Renderer.js`
- PASS: `node --check tests/playwright/tools/CollisionInspectorV2.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - Validates Tool Starter layout classes.
  - Validates left/right accordion equal-space layout.
  - Validates A and B rotation inputs.
  - Validates Origins fixed 3-decimal line formatting.
  - Validates Collision Inspector canvas 1:1 CSS scale and Asteroids runtime canvas 1:1 scale.
  - Validates Object Vector Studio V2 authoring scale remains separate from runtime manifest-unit scale.
- PASS: `npm run build:manifest`
  - This repo does not define a plain `npm run build`; `build:manifest` is the available build script.
  - Removed generated `docs/build` output after validation.
- PASS: `git diff --check`
  - Only CRLF working-copy warnings were reported.
- FAIL: `npm run test:workspace-v2`
  - 54 passed, 2 failed.
  - Failure 1: `validates optional Text to Speech V2 schema contract through Workspace Manager V2 schema` expected `activeContext.tools` to contain `text2speech-V2`.
  - Failure 2: `tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes` expected a Workspace Manager schema-failure save log, but the save path succeeded.
  - No tracked files were changed by this validation run.

## Full Samples Smoke Test
- Skipped. This PR is limited to Collision Inspector V2 template/layout, rotate controls, and diagnostic scale display. It does not broadly change shared runtime sample loading.

## Changed Files
- `toolbox/collision-inspector-v2/index.html`
- `toolbox/collision-inspector-v2/styles/collisionInspectorV2.css`
- `toolbox/collision-inspector-v2/js/CollisionInspectorV2Controls.js`
- `toolbox/collision-inspector-v2/js/CollisionInspectorV2Renderer.js`
- `tests/playwright/tools/CollisionInspectorV2.spec.mjs`
