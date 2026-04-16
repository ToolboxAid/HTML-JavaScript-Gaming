# BUILD PR: Level 17.17 Camera Debug Panel

## Purpose
Implement the camera debug panel as a minimal, testable 3D debug surface slice.

## Scope
- Update the existing `3d.camera` panel output to include camera pose readouts.
- Extend the camera summary provider to normalize camera position and rotation fields.
- Add one targeted test that validates camera summary normalization and panel rendering lines.

## Out Of Scope
- scene graph inspector changes
- collision overlay changes
- render pipeline stage panel changes
- non-camera 3D debug feature expansion

## Exact Targets
- `src/engine/debug/standard/threeD/providers/cameraSummaryProvider.js`
- `src/engine/debug/standard/threeD/panels/panel3dCamera.js`
- `tests/tools/CameraDebugPanel.test.mjs`

## Validation
- `node --input-type=module -e "import { run } from './tests/tools/CameraDebugPanel.test.mjs'; await run(); console.log('PASS CameraDebugPanel');"`

## Acceptance
- [ ] Camera summary includes deterministic position and rotation values.
- [ ] `3d.camera` panel renders camera pose lines and existing camera metadata lines.
- [ ] Validation command passes.
