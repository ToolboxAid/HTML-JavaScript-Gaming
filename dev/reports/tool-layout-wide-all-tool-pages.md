# Tool Layout Wide All Tool Pages

Stacked PR bundle:
- PR_26155_056-tool-layout-wide-all-tool-pages
- PR_26155_057-tool-layout-width-validation-report

## Summary

Applied the approved reusable Theme V2 wide tool layout pattern across first-class Toolbox tool pages.

Approved existing Theme V2 classes used:
- `container--tool-wide`
- `tool-workspace--wide`

No CSS was added. No CSS was modified. No page-local CSS, inline styles, style blocks, or tool-local CSS were introduced.

## Implementation Notes

Audited 43 `toolbox/**/*.html` files.

After this PR:
- 41 active first-class Toolbox tool pages use the wide layout pattern.
- `toolbox/project-workspace/index.html` was already compliant before this PR.
- 40 additional active Toolbox tool pages were updated in this PR.
- `dev/templates/tool-template-v2.html` was also updated so future copied tool shells inherit the approved wide layout.
- `toolbox/index.html` was skipped because it is the Toolbox listing surface, not a first-class tool shell.

The page-level change is intentionally limited to:
- `class="container"` to `class="container container--tool-wide"`
- `class="tool-workspace"` to `class="tool-workspace tool-workspace--wide"`

During targeted Playwright validation, `toolbox/assets/index.html` exposed a missing ToolDisplayMode character image request derived from the `assets` slug. A targeted asset reference correction was applied to `toolbox/assets/index.html`, `toolbox/code/index.html`, `toolbox/midi/index.html`, and `toolbox/particles/index.html` so they use the existing Theme V2 generic character image at `assets/theme-v2/images/characters/index.png`.

## Validation Notes

Impacted lane:
- Project Workspace targeted lane, because the representative layout coverage lives in the Project Workspace Playwright lane.
- Legacy command/test lane `npm run test:workspace-v2`, because shared toolbox shell wiring changed across active Toolbox pages.

Skipped lanes:
- Full samples smoke test was skipped because no samples changed.
- Archive/deprecated lanes were skipped because no archived material changed.
- Full suite was skipped because the change reused existing Theme V2 layout classes and did not change shared runtime, parser, DB, or cross-tool data behavior.

Commands run:
- `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `npm run test:lane:project-workspace`
- `npm run test:workspace-v2`
- `git diff --check`

Results:
- `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`: passed.
- `npm run test:lane:project-workspace`: passed, 6 tests.
- `npm run test:workspace-v2`: passed, 4 tests.
- `git diff --check`: passed.

Manual/targeted page coverage included representative Toolbox tool pages across:
- Create: `toolbox/objects/index.html`
- Build: `toolbox/game-design/index.html`
- Content: `toolbox/assets/index.html`
- Media: `toolbox/audio/index.html`
- Test: `toolbox/controls/index.html`
- Share: `toolbox/publish/index.html`
- Account: `toolbox/saved-data/index.html`

The representative Playwright check verifies:
- `.container--tool-wide` is visible.
- `.tool-workspace--wide` is visible.
- The wide container uses more than 95% of a 1440px viewport.
- The center panel remains dominant.
- Left and right panels remain balanced.
- No inline style attributes, style blocks, or inline script blocks exist on the checked pages.
- No failed requests, page errors, or console errors occur.

## Theme V2 Gap Findings

No Theme V2 gap was found. The existing approved wide layout classes were sufficient.
