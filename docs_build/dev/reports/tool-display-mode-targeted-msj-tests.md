# Tool Display Mode Targeted MSJ Tests

PR: PR_26155_102-tool-display-mode-targeted-msj-tests

## Summary

- Added `npm run test:lane:tool-display-mode`.
- Added `tool-display-mode` lane registration to `scripts/run-targeted-test-lanes.mjs`.
- Added `tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`.
- Updated the existing `ToolNavigationPrevNext` expectations to match the new `Previous:` / `Next:` link labels.

## Targeted Coverage

The new lane validates:

- Game Design row layout:
  - identity row
  - navigation row
  - character and tool name in the first row
  - Previous/Next anchors in the second row
- Game Design registry links:
  - `Previous: Project Workspace`
  - `Next: Game Configuration`
- Project Workspace registry links.
- Game Configuration multi-path fallback to Toolbox Group view.
- AI Assistant missing previous target as disabled text with no `href`.
- No console errors, page errors, failed requests, or navigation buttons inside Tool Display Mode navigation.

## Validation Results

- PASS: `npm run test:lane:tool-display-mode`
  - 4 tests passed.
- PASS: `npm run test:lane:tool-navigation`
  - 5 tests passed.
- PASS: `npm run test:workspace-v2`
  - 4 tests passed.
- PASS: `git diff --check`

`npm run test:workspace-v2` is a legacy command name. User-facing naming remains Project Workspace.

## Impacted Lanes

- `tool-display-mode`
- `tool-navigation` because existing expectations were updated to the new labels.
- `workspace-contract` through the legacy `npm run test:workspace-v2` command because shared Tool Display Mode behavior changed.

## Skipped Lanes

- `game-design`, `game-configuration`, and `project-workspace`: skipped because no tool-owned runtime or mock repository behavior changed.
- `build-path` and `tools-progress`: skipped because registry build order data and Admin Tools Progress table behavior were not changed in this stack.
- `engine-src`: skipped because no `src/` engine/shared runtime code changed.
- `samples`: skipped because sample JSON and sample runtime behavior are out of scope.

Full suite is required only when shared runtime, shared parser, shared DB, shared Theme V2, or cross-tool integration behavior changes beyond the targeted Tool Display Mode surface.
