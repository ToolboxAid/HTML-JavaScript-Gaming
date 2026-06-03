# APPLY_PR - PR_26124_071-palette-manager-remove-tools-shared-shell

## Summary
Removed Palette Manager V2 dependency on `toolbox/shared/platformShell.css` and `toolbox/shared/platformShell.js` by moving the required visible shell behavior into Palette Manager V2-local files.

## Applied Changes
- Removed the `../shared/platformShell.css` stylesheet import from `toolbox/palette-manager-v2/index.html`.
- Removed the `../shared/platformShell.js` script import from `toolbox/palette-manager-v2/index.html`.
- Added local shell host attributes for Palette Manager header, summary, and status elements.
- Added `toolbox/palette-manager-v2/paletteManagerShell.js` for local header/status rendering, Hide Header and Details / Show Header and Details behavior, and fullscreen state synchronization.
- Added Palette Manager-local CSS for the shell frame, status bar, app-shell bounds, resize-panel behavior, fullscreen summary handling, and control focus/disabled styling previously supplied by the shared shell stylesheet.
- Preserved menuSample, accordionV2, scroll behavior, right-column spacing, current palette behavior, and EOF pin-button override.

## Validation
- `node --check toolbox/palette-manager-v2/paletteManagerShell.js`: PASS.
- `node --check toolbox/palette-manager-v2/main.js`: PASS.
- Palette Manager toolbox/shared shell dependency validation: PASS.
- Palette Manager CSS structural validation: PASS.
- Targeted Palette Manager local shell Playwright validation: PASS.
- `node tests/tools/ToolLayoutDockingControlNormalization.test.mjs`: PASS.
- `node tests/tools/ToolEntryLaunchContract.test.mjs`: PASS.
- `git diff --check -- toolbox/palette-manager-v2/index.html toolbox/palette-manager-v2/paletteManagerV2.css toolbox/palette-manager-v2/paletteManagerShell.js`: PASS with Git LF-to-CRLF warnings for changed HTML/CSS.
- `npm run test:workspace-v2`: FAIL, `package.json` does not define `test:workspace-v2`.
- Full samples smoke test: skipped by instruction.

## Artifacts
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26124_071-palette-manager-remove-tools-shared-shell_delta.zip`
