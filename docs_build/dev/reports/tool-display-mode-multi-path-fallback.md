# Tool Display Mode Multi Path Fallback

PR: PR_26155_098-tool-display-mode-multi-path-fallback

## Summary

- Game Configuration now has registry navigation metadata for multiple valid next choices.
- Multiple next choices route to Toolbox Group view instead of inventing a per-page target.
- The fallback route is registry-driven:
  - `toolbox/index.html?view=group&group=design`
- The current `role` query parameter is preserved when the Tool Display Mode link is created.
- `toolbox/tools-page-accordions.js` now reads `view=group&group=<slug>` on initial load.
- When a group slug is provided, only the requested group accordion opens.

## Files

- `toolbox/toolRegistry.js`
- `assets/theme-v2/js/tool-display-mode.js`
- `toolbox/tools-page-accordions.js`
- `tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`

## Validation

- PASS: `node --check toolbox/toolRegistry.js`
- PASS: `node --check toolbox/tools-page-accordions.js`
- PASS: `npm run test:lane:tool-navigation`
- PASS: `git diff --check`

## Manual Test Notes

1. Open `toolbox/game-configuration/index.html?role=admin`.
2. Confirm Next Tool reads `Next Tool: Design Tools`.
3. Confirm the link target is `toolbox/index.html?view=group&group=design&role=admin`.
4. Click the link.
5. Confirm Toolbox opens in Group view.
6. Confirm only the Design group accordion is expanded.

## Validation Scope

Impacted lane:
- `tool-navigation`

Skipped lanes:
- Build Path lane was skipped because the workflow table and project-specific Build Path behavior were not changed.
- Game Configuration runtime lane was skipped because no configuration repository, handoff, validation, or output behavior changed.
- Full samples smoke test was skipped because samples are out of scope.
