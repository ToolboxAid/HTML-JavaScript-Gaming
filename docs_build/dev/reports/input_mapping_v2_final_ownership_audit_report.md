# Input Mapping V2 Final Ownership Audit Report

PR: `PR_26140_119-final-input-mapping-v2-ownership-audit`

Playwright impacted: Yes. This PR verifies and lightly stabilizes Input Mapping V2 runtime capture, Action Mapping(s) rendering, and Workspace V2 manifest launch behavior.

## Summary

- Final ownership audit passed after small cleanup fixes.
- Input Mapping V2 continues to consume engine input services for capture/combo/release/hold/double-click/drag/device compatibility behavior.
- Export and Copy JSON both use the filtered payload and exclude empty actions.
- Active `games/Asteroids/game.manifest.json` contains `tools.input-mapping-v2`, and Workspace Manager V2 references/discovers the tool through the manifest/tool registry path.
- Import remains intentionally disabled with an actionable UI reason, because Input Mapping V2 imports through Workspace Manager manifest launch data.

## Cleanup Applied

- `src/engine/input/PointerDragState.js`: mouse drag state now ignores move events when the originally pressed mouse button is no longer held, preventing accidental drag completion from unrelated mouse movement.
- `src/engine/input/InputCaptureSession.js`: invalid gamepad inputs keep strict validation but refresh the capture timeout so users can correct the input without the original timer expiring mid-flow.
- `toolbox/input-mapping-v2/js/ToolStarterApp.js`: gamepad button release bindings are displayed as transient live highlights so release gestures are visible long enough to verify.
- `toolbox/input-mapping-v2/js/controls/PreviewPanelControl.js`: Action Mapping(s) card elements are preserved across refreshes when the action set is unchanged, preventing transient card detach during visual-state refreshes.
- `toolbox/input-mapping-v2/styles/inputMappingV2.css`: center-column non-fill accordions size to content so Action Mapping(s) keeps the remaining vertical space.

## Audit Results

- JSON export/copy empty action filtering: PASS. `InputMappingState.payload()` filters actions with `inputs.length > 0`; explicit browser validation produced `emptyExportActions: 0`, `mappedExportActions: 1`, and matching copied/exported JSON.
- Active manifest wiring: PASS. `games/Asteroids/game.manifest.json` contains `tools.input-mapping-v2` with `toolId: "input-mapping-v2"` and `engineInputModel: "src/engine/input/InputMap"`.
- Workspace Manager discovery/load path: PASS. `toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`, `toolbox/toolRegistry.js`, and `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` reference `input-mapping-v2`.
- Local-only lifecycle audit: PASS. Search for local-only capture/combo/gesture lifecycle patterns in `toolbox/input-mapping-v2/js` returned no matches.
- Engine ownership audit: PASS. Reusable capture/combo/release/hold/double-click/drag/device compatibility behavior is under `src/engine/input/**`.
- Import behavior: PASS. Import controls are disabled with the actionable reason that Input Mapping V2 imports through Workspace Manager `game.manifest` launch data.
- Schemas and sample JSON: unchanged.

## Validation

- Targeted syntax validation: PASS.
- Engine input module import validation: PASS.
- Input Mapping V2 focused Playwright tests: PASS, `12 passed`.
- Workspace V2 suite: PASS, `71 passed`.
- Export/copy JSON empty-action confirmation: PASS.
- Active manifest check: PASS, `tools.input-mapping-v2` present.
- Workspace Manager load-path reference check: PASS.
- `git diff --check`: PASS, no whitespace errors. Git reported the existing CRLF normalization warning for `toolbox/input-mapping-v2/styles/inputMappingV2.css`.

## Manual Validation

1. Launch Workspace Manager V2 and select the Asteroids manifest.
2. Open Input Mapping V2 from the manifest-backed tool list.
3. Add an Action Mapping(s) tile, capture keyboard/mouse/gamepad inputs, and confirm mappings render on the selected tile.
4. Click JSON and Copy JSON; confirm only actions with inputs are present.
5. Use Import; confirm it is disabled with the manifest-launch-data reason.

Expected outcome: Input Mapping V2 loads from manifest wiring, captures through engine-backed flows, highlights live used inputs, and exports filtered JSON with no empty actions.

## Out Of Scope

- Full samples smoke test was not run. This PR is scoped to Input Mapping V2 and Workspace V2 validation, and sample JSON remains explicitly out of scope.
- No sample JSON was touched.
