# APPLY_PR - PR_26124_048-palette-manager-right-accordion-v2

## Applied Change
Replaced Palette Manager V2 right-column `details`/`summary` accordions with shared accordionV2 markup and right-column-only sizing rules.

## Runtime Files Changed
- `toolbox/palette-manager-v2/index.html`
- `toolbox/palette-manager-v2/paletteManagerV2.css`

## Behavior
- Import/Export now uses `section.accordion-v2` with a shared `accordion-v2__header` and `accordion-v2__content`.
- Validation/Error Viewer now uses `section.accordion-v2` with a shared `accordion-v2__header` and `accordion-v2__content`.
- Collapsed Import/Export is header-only.
- Open Import/Export fills the available right-column height above Validation/Error Viewer.
- JSON preview starts directly below the buttons, stretches to the bottom of the Import/Export content area, and scrolls internally.
- Validation/Error Viewer remains compact, bottom-anchored, and internally scrollable.
- Right column clips overflow so content does not extend below the right panel.

## Validation
- JavaScript syntax checks: no JavaScript files changed by PR048.
- Targeted served-browser Palette Manager V2 right-column check: PASS.
- `git diff --check`: PASS with Git line-ending warnings for changed files.
- `git diff --cached --check`: PASS.
- `npm run test:workspace-v2`: FAILED because the repository has no `test:workspace-v2` script.
- Full samples smoke test: skipped by instruction.

## Manual Test
1. Open Palette Manager V2 through a local server.
2. Confirm the right Import/Export and Validation/Error Viewer panels use the same accordionV2 toggle style as the center column.
3. Collapse Import/Export and confirm it is header-only.
4. Open Import/Export and confirm it fills available height above Validation/Error Viewer.
5. Confirm the JSON preview begins near the buttons, reaches the bottom of Import/Export, and scrolls internally for long JSON.
6. Confirm Validation/Error Viewer remains compact at the bottom and scrolls internally if errors overflow.
