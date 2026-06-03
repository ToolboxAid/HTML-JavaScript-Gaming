# BUILD_PR - PR_26124_044-accordionv2-theme-extract

## Scope Applied
- Extracted the working Palette Manager center accordionV2 behavior into `src/engine/theme/accordionV2/`.
- Updated Palette Manager V2 to consume the shared accordionV2 CSS/JS and generic class names.
- Did not change palette JSON logic, source palette logic, workspace/toolState/session code, sample JSON, games, or `tools/shared`.
- Did not add dependencies.

## Files Changed
- `src/engine/theme/accordionV2/accordionV2.css`
- `src/engine/theme/accordionV2/accordionV2.js`
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `tools/palette-manager-v2/paletteManagerV2.css`
- `docs_build/pr/PR_26124_044-accordionv2-theme-extract/PLAN_PR.md`
- `docs_build/pr/PR_26124_044-accordionv2-theme-extract/BUILD_PR.md`
- `docs_build/pr/PR_26124_044-accordionv2-theme-extract/APPLY_PR.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26124_044_report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation
- Added generic `.accordion-v2`, `.accordion-v2__header`, `.accordion-v2__icon`, and `.accordion-v2__content` CSS.
- Added minimal shared JS to initialize existing `.accordion-v2` panels and toggle `is-open`, `aria-expanded`, `hidden`, and `data-accordion-v2-open`.
- Replaced Palette Manager center local accordion classes with generic shared classes.
- Imported shared accordionV2 CSS/JS into Palette Manager.
- Removed Palette Manager-local accordionV2 binding from `PaletteManagerApp`.
- Kept Palette Manager-specific center sizing rules in Palette Manager CSS, using generic accordion selectors only where layout needs tool context.

## Validation
- `node --check src/engine/theme/accordionV2/accordionV2.js` -> PASS
- `node --check tools/palette-manager-v2/modules/PaletteManagerApp.js` -> PASS
- `git diff --check -- src/engine/theme/accordionV2 tools/palette-manager-v2/index.html tools/palette-manager-v2/modules/PaletteManagerApp.js tools/palette-manager-v2/paletteManagerV2.css docs_build/pr/PR_26124_044-accordionv2-theme-extract/PLAN_PR.md` -> PASS with existing Git LF/CRLF warnings
- Shared component boundary search -> PASS: no Palette Manager, workspace, toolState, session, sample JSON, or `tools/shared` references in `src/engine/theme/accordionV2/`
- Browser/manual layout validation at 1440x960 -> PASS:
  - center panel has zero `details`/`summary` elements
  - center panel has two shared `.accordion-v2` sections
  - center panel has zero Palette Manager-local accordionV2 classes
  - both open panels share height
  - User collapsed makes Add User Swatch fill remaining center height
  - Add User Swatch collapsed makes User Palette fill remaining center height
  - user/source grids retain `overflow-y: auto`
  - source select, search, sort buttons, size buttons, and tile pin button remain present
  - no horizontal page overflow
- `npm run test:workspace-v2` -> FAIL before test execution because `package.json` has no `test:workspace-v2` script.

## Full Samples Smoke
- Skipped by explicit instruction.
- Sample JSON remains out of scope until the sample alignment phase.

## Known Validation Blocker
- The required Workspace V2 npm validation command is unavailable in the current `package.json`.
