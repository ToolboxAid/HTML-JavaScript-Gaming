# Input Mapping V2 Spacing And Used Key Highlight Report

PR: `PR_26140_106-fix-input-mapping-v2-spacing-and-used-key-highlight`

## Scope

- Read `docs/dev/PROJECT_INSTRUCTIONS.md`.
- Checked `docs/pr/BUILD_PR.md`; it describes an unrelated Level 18 rebase, so the explicit PR106 user request was used as the source of truth.
- Reduced Input Mapping V2 Gestures/Capture bottom spacing without changing schemas or sample JSON.
- Fixed selected mapping highlights so saved selected tile data visibly highlights both the Captured Mappings tile token and the associated Keyboard/Mouse/Game Controller controls while active capture highlighting remains separate.
- Added live keyboard action feedback: when a saved keyboard mapping is pressed again, the matching Captured Mappings input token shows an orange `#f59f00` ring while the key is held.

## Changed Files

- `tools/input-mapping-v2/js/ToolStarterApp.js`
- `tools/input-mapping-v2/js/controls/CaptureControl.js`
- `tools/input-mapping-v2/js/controls/PreviewPanelControl.js`
- `tools/input-mapping-v2/styles/inputMappingV2.css`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`

## Implementation Notes

- Used-input chips now receive `is-selected-mapping-input`, `aria-current="true"`, and source metadata when rendered from the selected action's saved mapping data.
- Used-input chips now display the physical control only, such as `Keyboard KeyP`, `Mouse Right Button`, or `Game Controller X`, so the saved control itself is the visible highlighted element.
- The saved gesture is stored on `data-input-mapping-used-gesture` and appended to chip `title` metadata for default mappings such as Press, Click, and Button.
- Captured Mappings input tokens for the selected action now receive `is-selected-mapping-input`, `aria-current="true"`, and a visible glow. For example, the selected `Cancel` tile renders a saved mapping token as `Keyboard\nKeyP\nPress` and highlights that token from the tile data without requiring another key press.
- Captured Mappings input tokens now receive `is-action-active` and `data-input-mapping-action-active="true"` while a matching saved keyboard Press/Hold binding is physically down. The active state uses `#f59f00` for the token border/ring and clears on keyup.
- Live keyboard action feedback is skipped for editable fields so typing into Input Mapping V2 text/number/range controls does not re-render the tile grid.
- Active capture buttons keep their stronger `is-capturing` inset highlight even when the same source also has `has-used-input`.
- Gestures/Capture bottom padding was reduced from `6px` to `2px`, gesture cards align to their content start, and gesture lists avoid stretched bottom whitespace.
- Gestures and Capture accordions are content-sized again; the center panel scrolls when the combined setup and mapping areas exceed the viewport.
- Captured Mappings uses a fixed `360px` flex basis so the 225x225 tile grid keeps its own internal scrolling and does not overlap Delete Action/Delete Mappings.

## Playwright Impact

Playwright impacted: Yes.

Added/updated focused coverage for:

- Gestures device containers have no excessive bottom whitespace.
- Capture accordion/container has no excessive bottom whitespace.
- Gestures/Capture contents fit without internal clipping.
- Captured Mappings tile click point remains reachable and is not covered by mapping action controls.
- Selecting a tile mapped to `Keyboard KeyP Press` highlights the visible selected used-control chip.
- Selecting a tile mapped to `Keyboard KeyP Press` highlights the Captured Mappings tile input token with `is-selected-mapping-input` and `aria-current="true"`.
- Pressing `KeyP` again while the `Cancel / Keyboard / KeyP / Press` token is selected adds `is-action-active`, sets `data-input-mapping-action-active="true"`, and shows the `#f59f00` token ring until keyup.
- The visible selected chip is `Keyboard KeyP`, with saved control metadata `KeyP` and saved gesture metadata `Press`.
- Equivalent physical-control chips are asserted for Mouse and Game Controller mappings.
- Equivalent selected tile-token highlighting is asserted for Keyboard, Mouse, and Game Controller mappings.
- Highlight is driven by selected tile data, not by pressing `KeyP` again.
- Active capture highlight and saved used-input highlight can coexist without the active capture style being weakened.
- Existing Keyboard/Mouse/Game Controller selected used-control coverage remains in the PR105 gesture regression.

## Validation

PASS:

- `node --check tools/input-mapping-v2/js/controls/CaptureControl.js`
- `node --check tools/input-mapping-v2/js/ToolStarterApp.js`
- `node --check tools/input-mapping-v2/js/controls/PreviewPanelControl.js`
- `node --input-type=module -e "await import('./tools/input-mapping-v2/js/ToolStarterApp.js'); await import('./tools/input-mapping-v2/js/controls/PreviewPanelControl.js'); await import('./tools/input-mapping-v2/js/controls/CaptureControl.js'); console.log('input mapping controls import ok');"`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "keeps Input Mapping V2 spacing compact and highlights saved selected inputs" --reporter=line` (`1 passed`)
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "selects Input Mapping V2 gestures for capture and highlights used controls" --reporter=line` (`1 passed`)
- `npm run test:workspace-v2` (`63 passed`)
- `git diff --check`
- `git status --short -- games samples start_of_day` returned no sample/game/start_of_day changes.

Corrective iteration:

- An initial expanded gesture regression timed out after the new PR106 flow made that already-long test exceed the per-test timeout. The PR106 assertions were split into a focused test, and the final targeted/full validation passed.
- After review feedback that the original spacing fix had been removed while avoiding tile/action overlap, the compact accordion behavior was restored with a bounded Captured Mappings area and additional Playwright coverage for internal clipping and tile hit testing.
- After review feedback that the selected used-input highlight was not clear, the Capture used-control display was changed from full mapping text to highlighted physical-control chips with saved gesture metadata.
- After review feedback that the expected result should be visible on the Captured Mappings tile token itself, the Preview Panel now marks selected action tokens with the same selected-input class and a token-level glow.
- After review feedback that the action still did not visibly show as "in play", the tool now applies a separate `#f59f00` live pressed-state ring to the matching Captured Mappings token while the saved keyboard input is held. An initial mouse live-state attempt re-rendered during tile clicks, so the final implementation stays scoped to the requested keyboard press feedback.

## Full Samples Smoke

Skipped by explicit PR instruction: do not run the full samples smoke test.

## Manual Validation

1. Open `tools/input-mapping-v2/index.html`.
2. Add/select `Cancel`, select Keyboard Press, click Capture Keyboard, press `P`.
3. Select another mapping tile, then select `Cancel` again.
4. Expected: the `Cancel` tile token `Keyboard / KeyP / Press` is highlighted with a visible glow, `Keyboard KeyP` is highlighted in the Capture used-controls area without pressing `P` again, and hover/title metadata includes `Press`.
5. Press and hold `P` again.
6. Expected: the `Cancel` tile token `Keyboard / KeyP / Press` shows an orange `#f59f00` ring while `P` is down, then returns to the selected glow after keyup.
7. Click Capture Keyboard while `Cancel` is selected.
8. Expected: active capture highlight is stronger/distinct while the saved used-input state remains present.
9. Inspect Gestures and Capture accordions at desktop and narrower widths.
10. Expected: responsive wrapping remains intact and there is no excessive empty bottom space inside gesture cards or the Capture content.
11. Add enough mapping tiles to fill Captured Mappings.
12. Expected: the tile grid scrolls internally and tiles are not covered by Delete Action/Delete Mappings.
