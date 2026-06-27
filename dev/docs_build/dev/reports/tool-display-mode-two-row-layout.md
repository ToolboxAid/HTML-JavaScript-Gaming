# Tool Display Mode Two Row Layout

PR: PR_26155_104-tool-display-mode-two-row-layout

## Summary

- Tool Display Mode body keeps the required two-row structure:
  - Row 1: character/image/tool name on one line.
  - Row 2: Previous Tool link and Next Tool link on one line.
- Previous/Next remain under the tool identity row.
- Tool identity remains visually primary through the existing character/name row.
- Previous/Next remain visually secondary by rendering as normal links, not button-styled controls.

## Markup Contract

- Identity row: `data-tool-display-mode-row="identity"`
- Navigation row: `data-tool-display-mode-row="navigation"`
- Existing Theme V2 row utility: `content-cluster`

No new CSS was required.

## Validation Notes

- PASS: `npm run test:lane:tool-display-mode`
- PASS: `git diff --check`

The targeted lane verifies row order and child tag order for Game Design and Build Game.

## Manual Test Notes

1. Open `toolbox/build-game/index.html?role=user`.
2. Confirm row 1 shows the Build Game character/image and `Build Game`.
3. Confirm row 2 shows `Previous: Videos` and `Next: Game Testing`.
4. Confirm Previous/Next are not on the same row as the tool name.

## Skipped Lane Rationale

- Broad page/template validation was skipped because this PR changes only the shared Tool Display Mode row content and the targeted lane opens representative affected tool pages directly.
- Full samples smoke test was skipped because samples are out of scope.
