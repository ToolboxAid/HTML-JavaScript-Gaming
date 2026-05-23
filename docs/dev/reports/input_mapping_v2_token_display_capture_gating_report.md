# Input Mapping V2 Token Display and Capture Gating Report

Task: PR_26140_108-polish-input-mapping-v2-token-display-and-capture-gating

## Scope
- Read docs/dev/PROJECT_INSTRUCTIONS.md before making changes.
- Treated the explicit PR_26140_108 request as the active BUILD scope; docs/pr/BUILD_PR.md currently describes an unrelated Level 18 rebase workflow.
- Did not change schemas.
- Did not touch sample JSON.
- Did not run the full samples smoke test because this PR is limited to Input Mapping V2 tool UI/runtime behavior and is covered by targeted syntax checks plus Workspace V2 Playwright.

## Implementation
- Updated Captured Mappings token rendering so each mapping is a single bracketed token/span with comma-separated parts inside the token, for example `[Keyboard, KeyH, Hold]`, `[Mouse, Left Button, Click]`, and `[Game Controller, Axis 0+, Button]`.
- Removed separate comma separator elements outside mapping tokens.
- Preserved hover/title metadata by leaving token title generation tied to the existing detailed input metadata.
- Added capture gating based on the selected gesture source:
  - Keyboard gestures enable only Capture Keyboard.
  - Mouse gestures enable only Capture Mouse.
  - Game Controller gestures enable only detected game controller capture buttons.
  - Combo gestures keep multi-device capture available.
- Preserved selected tile indication, used-input highlighting, active capture highlight/cancel, and combo capture behavior.
- Normalized visible game controller axis detail from `Axis 0 +` to `Axis 0+` for compact token display.

## Playwright Impact
Playwright impacted: Yes.

Validated behavior:
- Bracketed mapping tokens render commas inside each token/span and no outside separator spans are created.
- Keyboard Hold renders `[Keyboard, KeyH, Hold]`.
- Mouse Click renders `[Mouse, Left Button, Click]`.
- Mocked game controller axis capture renders `[Game Controller, Axis 0+, Button]`.
- Selecting Mouse > Click disables Keyboard and Game Controller capture buttons while leaving Mouse enabled.
- Selecting Keyboard > Press/Hold enables Keyboard capture only.
- Selecting Game Controller > Button enables game controller capture buttons only.
- Existing Input Mapping V2 flows still pass, including combo capture, used-input highlight, selected tile behavior, JSON/Copy JSON, haptics, and shortcut/context behavior.

Expected pass behavior:
- All targeted syntax checks pass.
- Input Mapping V2 focused Playwright slice passes.
- `npm run test:workspace-v2` passes.

Expected fail behavior:
- Tests fail if separator comma spans reappear outside tokens, if bracketed token text regresses, or if non-selected capture devices remain enabled after selecting a device-specific gesture.

## Validation
- PASS: `node --check tools/input-mapping-v2/js/ToolStarterApp.js`
- PASS: `node --check tools/input-mapping-v2/js/controls/CaptureControl.js`
- PASS: `node --check tools/input-mapping-v2/js/controls/PreviewPanelControl.js`
- PASS: `node --check tools/input-mapping-v2/js/services/EngineInputSourceService.js`
- PASS: `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "Input Mapping V2"` (6 passed)
- PASS: `npm run test:workspace-v2` (65 passed)
- PASS: `git diff --check` (line-ending warnings only)
- Generated: `docs/dev/reports/playwright_v8_coverage_report.txt`
- Generated: `docs/dev/reports/coverage_changed_js_guardrail.txt`

## Manual Validation
1. Open `tools/input-mapping-v2/index.html`.
2. Select `Keyboard > Hold`, capture `H`, and confirm the tile shows `[Keyboard, KeyH, Hold]` as one token.
3. Select `Mouse > Click`, confirm Capture Keyboard and game controller buttons are disabled/grayed out, then capture left click and confirm `[Mouse, Left Button, Click]`.
4. With a browser-exposed game controller, select `Game Controller > Button`, confirm Keyboard/Mouse capture are disabled and the controller capture button is enabled.
5. Hover captured tokens and confirm detailed metadata remains available.

## Files Changed
- `tools/input-mapping-v2/js/ToolStarterApp.js`
- `tools/input-mapping-v2/js/controls/CaptureControl.js`
- `tools/input-mapping-v2/js/controls/PreviewPanelControl.js`
- `tools/input-mapping-v2/js/services/EngineInputSourceService.js`
- `tools/input-mapping-v2/styles/inputMappingV2.css`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
