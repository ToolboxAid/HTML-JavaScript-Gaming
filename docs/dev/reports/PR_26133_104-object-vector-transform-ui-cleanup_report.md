# PR_26133_104-object-vector-transform-ui-cleanup

## Summary
- Removed active Shape Transform origin controls and shape-origin behavior from Object Vector Studio V2.
- Kept Shape Transform controls, but Shape Rotate now rewrites selected shape geometry around the selected object origin instead of persisting shape rotation/origin state.
- Kept Object Transform in the left column; Object Rotate continues to use objectOrigin and may persist transform rotation on object shapes.
- Kept Resize as a geometry rewrite path; Object Transform scale input no longer persists object-scale preview transforms and object shape scales remain 1 until Resize bakes geometry.
- Removed shapeOrigin from Object Vector schema defaults/required transform contracts and from the Asteroids object-vector manifest payload.
- Added loader compatibility that strips legacy shapeOrigin from imported Object Vector V2 shape transforms before validation/storage.
- Updated the runtime Object Vector asset renderer to use objectOrigin as the transform pivot when rendering transforms without shapeOrigin.

## Scope Notes
- Workspace manifest/schema structures were preserved.
- No start_of_day folders were modified.
- No files were written under tmp except the final required ZIP package.
- PR_26133_103 delta ZIP was not available in tmp, so the current integrated clean repo state was used as baseline.

## Targeted Verification
- Shape Transform origin inputs/buttons are absent.
- Shape Transform rotate changes selected shape geometry and does not persist transform.rotation or shapeOrigin.
- Object Transform rotate affects all shapes in the selected object and uses objectOrigin.
- Object Transform scale step/input changes do not persist scale to object shapes; Resize rewrites geometry and resets scale to 1.
- Runtime Object Vector rendering works with transforms that do not include shapeOrigin.

## Validation Results
- PASS `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- PASS `node --check tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`
- PASS `node --check src/engine/rendering/ObjectVectorRuntimeAssetService.js`
- PASS JSON parse for Object Vector schema, game manifest schema, and `games/Asteroids/game.manifest.json`
- PASS `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --grep "Object Vector Studio V2" --workers=1 --reporter=list` (16 passed)
- PASS `npm run test:workspace-v2` (56 passed)
- PASS `git diff --check`
- Full samples smoke test skipped as requested.
