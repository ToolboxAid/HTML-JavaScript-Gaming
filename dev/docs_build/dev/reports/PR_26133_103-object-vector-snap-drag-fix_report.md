# PR_26133_103 Object Vector Snap Drag Fix

## Scope
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Used `tmp/PR_26133_102-object-vector-scale-anchor-fix_delta.zip` as the prior reference.
- Kept changes limited to Object Vector Studio V2 snap/drag coordinate correction and focused Workspace V2 coverage.

## Implementation
- Fixed geometry point drag snapping so handle movement is target-based instead of `original point + snapped pointer delta`.
- Geometry point and line endpoint drags now:
  - preserve the pointer grab offset from the transformed handle point,
  - snap the intended handle target through Snap Grid / Snap Point / Snap None,
  - convert the snapped world/object point back through the original shape transform with `localPointFromTransformedPoint`,
  - update the underlying local geometry so the visible grabbed point lands on the exact snap target.
- This corrects off-grid start overshoot and transformed shape scale/zoom mapping drift.
- Point coordinate UI rows now render fixed three-decimal values such as `47.000` for snapped whole-number coordinates while stored geometry remains numeric.

## Playwright Impact
Playwright impacted: Yes.

Validated behavior:
- Snap Grid point drag from an off-grid polygon point lands exactly on whole-number coordinates.
- Dragged polygon point row displays snapped coordinates as fixed three-decimal values.
- Scaled line endpoint drag converts cursor movement through the shape transform so the rendered endpoint lands exactly on the snapped target.
- Existing preview coordinate grid mapping, mouse editing, and dirty-state flows continue to pass.

Expected pass behavior:
- The dragged point tracks the cursor target and snaps without overshoot.
- Transformed/scaled endpoints visually land on the snapped grid coordinate.
- Workspace V2 suite remains green.

Expected fail behavior:
- A regression would leave polygon point values offset from the snap point, or a scaled line endpoint rendered away from the snapped target.

## Validation
- PASS: `node --check toolbox\object-vector-studio-v2\js\ToolStarterApp.js`
- PASS: `node --check tests\playwright\tools\WorkspaceManagerV2.spec.mjs`
- PASS: targeted Object Vector V2 snap/drag validation:
  - `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "edits Object Vector Studio V2 preview shapes with mouse actions and tile delete controls|maps Object Vector Studio V2 preview coordinates directly to visible grid lines"`
  - Result: 2 passed.
- PASS: targeted dirty-state validation:
  - `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes"`
  - Result: 1 passed.
- PASS: `npm run test:workspace-v2`
  - Result: 56 passed.
- PASS: `git diff --check -- toolbox/object-vector-studio-v2/js/ToolStarterApp.js tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
  - Only CRLF warning for the existing WorkspaceManagerV2 Playwright test file.

## Manual Validation Steps
1. Open Object Vector Studio V2 and select an object with polygon or line geometry.
2. Set Snap mode to Snap Grid.
3. Drag an off-grid polygon point handle to a nearby grid intersection.
4. Verify the geometry point lands on the exact snapped coordinate and the point row shows values like `47.000` / `10.000`.
5. Scale a shape, then drag a line endpoint handle.
6. Verify the rendered endpoint tracks the cursor and lands exactly on the snapped target instead of moving too far or too little.

## Full Samples Smoke Test
Skipped per PR_26133_103 instructions; this change is scoped to Object Vector Studio V2 snap/drag behavior.

## PR103 Delta Stat vs PR102 ZIP Baseline
```
toolbox/object-vector-studio-v2/js/ToolStarterApp.js: +54 -20
tests/playwright/tools/WorkspaceManagerV2.spec.mjs: +73 -16
```
