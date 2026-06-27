# Tool Display Mode Previous Next

PR: PR_26155_097-tool-display-mode-prev-next

## Summary

- `assets/theme-v2/js/tool-display-mode.js` now adds Previous Tool and Next Tool controls inside the shared Tool Display Mode body.
- Controls are generated from `getToolNavigationTargets(toolSlug)` in `toolbox/toolRegistry.js`.
- Controls follow the registry build order used by Admin Tools Progress.
- Disabled controls render as disabled buttons when no previous or next target exists.
- Role query parameters are preserved on generated navigation links.

## Examples Verified

- Game Design:
  - Previous Tool: Project Workspace
  - Next Tool: Game Configuration
- Project Workspace:
  - Previous Tool: AI Assistant
  - Next Tool: Game Design

## Files

- `assets/theme-v2/js/tool-display-mode.js`
- `toolbox/toolRegistry.js`
- `tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`

## Validation

- PASS: `node --check assets/theme-v2/js/tool-display-mode.js`
- PASS: `npm run test:lane:tool-navigation`
- PASS: `npm run test:workspace-v2`
- PASS: `git diff --check`

`npm run test:workspace-v2` is a legacy command name. User-facing naming remains Project Workspace.

## Manual Test Notes

1. Open `toolbox/game-design/index.html?role=user`.
2. Confirm Tool Display Mode shows Previous Tool: Project Workspace.
3. Confirm Tool Display Mode shows Next Tool: Game Configuration.
4. Confirm both links preserve `role=user`.
5. Open `toolbox/project-workspace/index.html?role=user`.
6. Confirm Previous Tool and Next Tool render from registry build order.

## Validation Scope

Impacted lane:
- `tool-navigation`

Additional shared navigation gate:
- `workspace-contract` through the legacy `npm run test:workspace-v2` command.

Skipped lanes:
- Game Design, Game Configuration, and Project Workspace runtime lanes were skipped because page-specific runtime behavior was not changed.
- Full samples smoke test was skipped because no sample JSON or sample loader behavior changed.
