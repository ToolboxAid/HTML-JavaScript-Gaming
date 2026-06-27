# Tool Display Mode Links Not Buttons

PR: PR_26155_103-tool-display-mode-links-not-buttons

## Summary

- Removed `btn btn-secondary` from Tool Display Mode Previous/Next anchors.
- Previous/Next controls remain anchors when a registry route exists.
- Missing previous/next targets remain disabled text, not broken links.
- No page-local CSS, tool-local CSS, inline styles, style blocks, or new Theme V2 CSS were added.

## Files

- `assets/theme-v2/js/tool-display-mode.js`
- `tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`

## Validation Notes

- PASS: `node --check assets/theme-v2/js/tool-display-mode.js`
- PASS: `node --check tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`
- PASS: `npm run test:lane:tool-display-mode`
- PASS: `git diff --check`

The targeted lane verifies Tool Display Mode Previous/Next controls are anchors, not buttons, and do not include `btn` or `btn-secondary`.

## Manual Test Notes

1. Open `toolbox/game-design/index.html?role=user`.
2. Confirm Previous/Next appear as normal text links, not button-styled controls.
3. Inspect the Previous/Next anchors and confirm `btn` and `btn-secondary` are absent.
4. Confirm no console errors.

## Skipped Lane Rationale

- `tool-navigation` was not rerun because this PR only removes button styling from Tool Display Mode links and adds Build Game coverage to the narrower `tool-display-mode` lane.
- Game Design, Game Configuration, and Project Workspace runtime lanes were skipped because no repository, save/update, validation, handoff, or project data behavior changed.
- Engine and samples lanes were skipped because no engine runtime or sample JSON behavior changed.
