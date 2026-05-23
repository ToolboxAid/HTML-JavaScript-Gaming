# Input Mapping V2 Layout Sizing and Mapping Display Report

Task: PR_26140_107-polish-input-mapping-v2-layout-sizing-and-mapping-display

## Scope
- Read docs/dev/PROJECT_INSTRUCTIONS.md before making changes.
- Treated the explicit PR_26140_107 request as the active BUILD scope; docs/pr/BUILD_PR.md currently describes an unrelated Level 18 rebase workflow.
- Did not change schemas.
- Did not touch sample JSON.
- Did not run the full samples smoke test.

## Implementation
- Updated Input Mapping V2 column sizing so the Actions accordion sizes to its content, Devices owns the remaining left-column space, and Captured Mappings reserves/fills the center-column workspace area.
- Extended live-used highlighting beyond keyboard:
  - Mouse button down/up now activates and clears saved mouse mapping tokens.
  - Mouse wheel input now briefly activates saved wheel mapping tokens.
  - Game controller button/axis state is synced from the engine gamepad state during polling and refresh.
  - Flight Stick remains represented through the browser Gamepad API path; Touch, Pen, and VR Controller show safe capability/no-device states where direct capture is not testable in this tool.
- Kept active capture highlighting separate from saved/live-used mapping highlighting.
- Changed Captured Mappings tile token text to use available width with single-line entries and comma separators between multiple captured mappings.
- Preserved detailed hover/title metadata for captured inputs.
- Updated focused Playwright coverage for column sizing, safe empty states, single-line comma-separated tile display, and live-used highlighting for keyboard, mouse, wheel, and mocked game controller input.

## Validation
- PASS: `node --check tools/input-mapping-v2/js/ToolStarterApp.js`
- PASS: `node --check tools/input-mapping-v2/js/controls/PreviewPanelControl.js`
- PASS: `node --check tools/input-mapping-v2/js/controls/DeviceListControl.js`
- PASS: `node --check tools/input-mapping-v2/js/services/EngineInputSourceService.js`
- PASS: `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "Input Mapping V2"`
- PASS: `npm run test:workspace-v2` (64 passed)
- PASS: `git diff --check` (line-ending warnings only)

## Notes
- Existing compact-spacing assertions were updated to keep checking bottom whitespace directly while allowing setup accordions to scroll when Captured Mappings reserves the center workspace height.
- Sample JSON files were not modified.
