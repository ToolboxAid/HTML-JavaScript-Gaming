# Tool Display Mode Build Game Regression

PR: PR_26155_105-tool-display-mode-build-game-regression

## Summary

- Added Build Game regression coverage to `tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`.
- Build Game validates the registry build-order neighbors:
  - Previous: Videos
  - Next: Game Testing
- The regression verifies Previous/Next are anchors, not buttons.
- The regression verifies Previous/Next anchors do not use `btn` or `btn-secondary`.

## Validation Results

- PASS: `npm run test:lane:tool-display-mode`
  - 5 tests passed.
- PASS: `git diff --check`

## Impacted Lane

- `tool-display-mode`

## Targeted Checks

- `toolbox/build-game/index.html`
- `toolbox/game-design/index.html`
- `toolbox/game-configuration/index.html`
- `toolbox/ai-assistant/index.html` for missing previous disabled text.

## Manual Test Notes

1. Open `toolbox/build-game/index.html?role=user`.
2. Confirm Build Game identity row is first.
3. Confirm Previous/Next row is second.
4. Confirm Previous links to `toolbox/videos/index.html?role=user`.
5. Confirm Next links to `toolbox/game-testing/index.html?role=user`.
6. Confirm no console errors.

## Skipped Lane Rationale

- `tools-progress`, `build-path`, and registry lanes were skipped because registry order/data did not change.
- Tool runtime lanes for Game Design, Game Configuration, and Project Workspace were skipped because only shared Tool Display Mode presentation changed.
- `npm run test:workspace-v2` was skipped because the narrower `tool-display-mode` lane directly validates the affected shared Tool Display Mode behavior on the requested tool pages.
