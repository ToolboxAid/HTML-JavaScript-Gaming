# PR_26132_014-object-vector-studio-v2-animation-states

## Scope

Adds the Object Vector Studio V2 animation/state foundation only. The change stays within Object Vector Studio V2 schema, runtime UI/CSS/JS, and Workspace Manager V2 Playwright coverage.

## Changes

- Added durable object animation states for idle, thrust, damaged, destroyed, active, and inactive.
- Added state selector and Create State controls.
- Added per-state frame payloads with per-shape visibility and transform overrides.
- Added frame timeline UI with state/frame thumbnails, frame selection, frame duplication, and frame ordering controls.
- Added playback preview controls: Play, Pause, Stop, Loop, FPS, and onion-skin preview.
- Preserved active object selection while changing states and frames.
- Rendered selected state/frame overrides on the center work surface.
- Added state/frame metadata to SVG export.
- Kept JSON copy/export state-aware through the strict Object Vector Studio V2 schema.
- Rejected invalid animation/state/frame payloads through schema validation before render.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `node --check tools/object-vector-studio-v2/js/bootstrap.js`
- `node --check tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=line -g "Object Vector Studio V2"`
- `npm run test:workspace-v2`

Result:

- Targeted Object Vector Studio V2 coverage passed: 4 passed.
- Full Workspace Manager V2 suite passed: 43 passed.
- Playwright V8 coverage report generated at `docs/dev/reports/playwright_v8_coverage_report.txt` and copied to required report path `docs/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request; this PR is limited to Object Vector Studio V2 animation/state runtime and is covered by targeted Workspace V2 Playwright validation.

## Playwright Coverage

Validates:

- State creation from the fixed Object Vector Studio V2 state set.
- Frame duplication and ordering.
- Playback controls and FPS/loop wiring.
- State/frame selection synchronization while preserving the active object.
- Per-state frame transform overrides.
- Onion-skin preview.
- State-aware JSON copy/export and SVG metadata export.
- Invalid animation payload rejection before render.

Expected pass behavior:

- Valid state/frame operations mutate only schema-valid object payloads and render the selected frame.

Expected fail behavior:

- Invalid animation payloads are rejected through schema validation and logged as FAIL without partial render.

## Manual Validation

1. Open `tools/object-vector-studio-v2/index.html`.
2. Load a schema-valid Object Vector Studio V2 payload and runtime palette.
3. Create a template object, select `Idle`, and click `Create State`.
4. Duplicate and reorder frames, then adjust a selected shape transform.
5. Use Play, Pause, Stop, Loop, FPS, and Onion controls.
6. Export SVG and JSON.

Expected outcome:

- The active object remains selected, frame thumbnails stay synchronized, preview playback advances frames, JSON includes states/frames, and SVG includes state/frame metadata.

## Out Of Scope

- No World Vector Studio V2 changes.
- No sample JSON changes.
- No full samples smoke test.
