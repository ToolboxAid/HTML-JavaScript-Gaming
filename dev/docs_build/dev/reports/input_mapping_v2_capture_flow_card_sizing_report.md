# Input Mapping V2 Capture Flow And Card Sizing Report

Task: PR_26140_110-fix-input-mapping-v2-capture-flow-and-card-sizing

## Source Reading
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before making changes.
- Read `.codex/skills/repo-build/SKILL.md` and followed the repo BUILD workflow.
- Read `docs_build/pr/BUILD_PR.md`; it still describes an unrelated overlay runtime hardening rebase, so the explicit PR110 request was used as the active build scope.

## Implementation
- Increased Captured Mappings cards to 250px wide while preserving 225px height.
- Changed captured mapping tokens from fixed 250px width to 100% of the tile content width.
- Prevented capture from auto-creating mapping tiles. Captures now require a selected action tile created through Add.
- Added an actionable WARN when capture is attempted without an existing tile.
- Changed Combo gesture selection so it only selects gesture mode. Combo capture now starts only after a Capture button is pressed.
- Preserved two-input combo commit behavior; Capture Keyboard waits for Ctrl + S before committing one combo mapping.
- Moved wheel and pointer-drag descriptor commits behind Capture Mouse so selecting a gesture alone does not create mappings.
- Preserved the pointer-drag snapshot selected before Capture Mouse so clicking the capture button does not overwrite drag bounds.
- Removed visible `div#inputMappingV2UsedInputHighlights` duplicate output while preserving used-input highlight classes on Keyboard, Mouse, and Game Controller capture controls.
- Preserved PR109 scroll position restoration and token click-to-delete behavior.

## Validation
- `node --check toolbox/input-mapping-v2/js/ToolStarterApp.js`
- `node --check toolbox/input-mapping-v2/js/services/InputMappingState.js`
- `node --check toolbox/input-mapping-v2/js/controls/CaptureControl.js`
- `node --check toolbox/input-mapping-v2/js/bootstrap.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "Input Mapping V2"`: 7 passed.
- `npm run test:workspace-v2`: 66 passed.
- `git diff --check`: passed; PowerShell reported line-ending normalization warnings only.

## Playwright Coverage
Playwright impacted: Yes.

Validated behavior:
- mapping cards are 250px wide.
- token display uses 100% flex basis inside each tile.
- Combo selection alone does not create mappings.
- Capture Keyboard waits for Ctrl + S before committing a combo.
- capture does not auto-create a tile and warns when no tile exists.
- Add creates the tile.
- duplicate used-input highlight UI is absent.
- used-input highlighting still appears on capture controls.
- mapping scroll position remains preserved across selection, refresh, combo commit, and token deletion.

V8 coverage guardrail:
- `(68%) toolbox/input-mapping-v2/js/controls/PreviewPanelControl.js`
- `(86%) toolbox/input-mapping-v2/js/controls/CaptureControl.js`
- `(92%) toolbox/input-mapping-v2/js/services/InputMappingState.js`
- `(95%) toolbox/input-mapping-v2/js/ToolStarterApp.js`
- `(100%) toolbox/input-mapping-v2/js/bootstrap.js`
- Guardrail warnings: none.

## Manual Test Notes
1. Open Input Mapping V2.
2. Select an action without clicking Add, then click Capture Keyboard. Expected: WARN tells the user to select an action and click Add; no tile appears.
3. Click Add for an action. Expected: a 250px wide mapping tile appears.
4. Select Keyboard Combo, then press Ctrl and S without clicking Capture Keyboard. Expected: no mapping is created.
5. Click Capture Keyboard, press Ctrl then S. Expected: one `Combo, Ctrl + S` token appears.
6. Click a mapping token. Expected: only that token is removed and the tile remains.
7. Select a tile with keyboard, mouse, or controller mappings. Expected: the related Capture button highlights; no duplicate used-input highlight panel appears.

Full samples smoke test was not run because this PR is scoped to Input Mapping V2 and Workspace V2 validation covers the impacted behavior.
