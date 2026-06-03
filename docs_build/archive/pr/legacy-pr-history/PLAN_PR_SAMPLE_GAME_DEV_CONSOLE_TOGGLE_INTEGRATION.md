Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_SAMPLE_GAME_DEV_CONSOLE_TOGGLE_INTEGRATION.md

# PLAN PR
Sample Game Dev Console Toggle Integration

## Objective
Integrate the existing dev console and debug overlay runtime into one sample game with a keyboard toggle,
while keeping engine core contracts clean and avoiding engine pollution.

## Scope
- Wire the existing `tools/shared/devConsoleDebugOverlay.js` runtime into a single sample/dev entry
- Add a toggle key for console visibility
- Add a toggle key for overlay visibility
- Route collected diagnostics into the runtime once per frame
- Render overlay text through the sample-facing surface only
- Keep implementation isolated to sample/dev integration points and allowed debug surface hooks

## Non-Goals
- No engine-wide debug framework rewrite
- No new tool contract changes
- No replacement of renderer core APIs
- No hotkey manager redesign
- No global debug behavior forced into production samples

## Required Constraints
- Reuse the already-built runtime from `tools/shared/devConsoleDebugOverlay.js`
- Do not duplicate console logic in the sample
- Do not spread debug-specific conditionals across unrelated engine systems
- Keep the feature disabled by default unless explicitly toggled
- Preserve current render ordering; debug overlay renders last
- Commit comment file must have NO header

## Candidate Target
Use one representative sample game or dev sample entry that already exercises scene loading and rendering.

## Integration Design
1. Import runtime from `tools/shared/devConsoleDebugOverlay.js`
2. Create one runtime instance during sample init
3. Register keyboard toggle(s):
   - backquote / tilde for console surface
   - F3 or similar for overlay visibility, if needed
4. Per frame:
   - gather diagnostics
   - update runtime state
   - render overlay after world render
5. On command submit:
   - execute console input through runtime
   - log or surface output through the sample debug layer

## Diagnostics Minimum Set
- runtime summary
- scene info
- frame/fps
- camera
- entities
- render stages
- tilemap
- input
- hot reload
- validation

## Acceptance Criteria
- Sample launches with no regression
- Toggle key opens/closes console deterministically
- Overlay can be shown/hidden
- Existing world rendering still works
- Overlay renders after gameplay content
- `help` command works in the wired sample
- `status` and `scene.info` return meaningful output
- Invalid command does not crash the sample
- Feature can be disabled cleanly

## File Targets
Expected implementation focus:
- one sample entry file
- optional sample-local debug helper
- no broad engine churn

## Validation
- Run sample manually
- Press toggle key repeatedly
- Confirm overlay ordering
- Execute `help`
- Execute `status`
- Execute `scene.info`
- Confirm no duplicate runtime instances
- Confirm no memory leak or double-render on repeated toggle

## Risks
- Input collision with existing sample controls
- Overlay draw path mixed too deeply into renderer
- Runtime instantiated more than once
- Debug output coupled to production flow

## Deliverable
Create BUILD_PR_SAMPLE_GAME_DEV_CONSOLE_TOGGLE_INTEGRATION as a docs-only, repo-structured delta.
