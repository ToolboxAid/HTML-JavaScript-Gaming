# Tool Display Mode Navigation Layout

PR: PR_26155_100-tool-display-mode-nav-layout

## Summary

- Updated `assets/theme-v2/js/tool-display-mode.js` so Tool Display Mode body renders two explicit rows.
- Row 1 uses `tool-display-mode__identity-row content-cluster` with:
  - character image
  - tool name
- Row 2 uses `tool-display-mode__navigation-row content-cluster` with:
  - Previous link/text
  - Next link/text
- Character and tool name are no longer appended as separate stacked body children.
- Navigation no longer renders buttons inside Tool Display Mode.
- No CSS was added.

## Layout Markers

- `data-tool-display-mode-row="identity"`
- `data-tool-display-mode-row="navigation"`

These markers are markup-only validation hooks and do not add styling or behavior.

## Validation

- PASS: `node --check assets/theme-v2/js/tool-display-mode.js`
- PASS: `node --check tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`
- PASS: `npm run test:lane:tool-display-mode`
- PASS: `npm run test:lane:tool-navigation`
- PASS: `npm run test:workspace-v2`
- PASS: `git diff --check`

`npm run test:workspace-v2` is a legacy command name. User-facing naming remains Project Workspace.

## Manual Test Notes

1. Open `toolbox/game-design/index.html?role=user`.
2. Confirm the Tool Display Mode body shows the character and `Game Design` on the first row.
3. Confirm the second row shows `Previous: Project Workspace` and `Next: Game Configuration`.
4. Confirm Tool Display Mode navigation uses links/text only and no buttons.

## Theme V2 Gap Findings

No Theme V2 gap was found. Existing `content-cluster`, `btn`, `btn-secondary`, and `pill` classes were sufficient.
