# APPLY_PR - PR_26124_045-palette-manager-hidden-header-wide-layout

## Apply Summary
Applied the Palette Manager hidden-header wide layout override.

## Result
- Normal Palette Manager layout remains unchanged.
- When the platform header/details area is hidden, Palette Manager uses the full available width.
- Left and right panels anchor to their sides.
- The center panel fills the remaining width and available height.
- accordionV2 behavior remains unchanged.

## Review Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26124_045-palette-manager-hidden-header-wide-layout_delta.zip`

## Validation Result
- CSS/manual layout validation passed.
- Related JS syntax checks passed.
- `npm run test:workspace-v2` could not run because the npm script is missing from `package.json`.
- Full samples smoke test was not run.

## Manual Apply Check
1. Open `toolbox/palette-manager-v2/index.html`.
2. Confirm normal layout is unchanged.
3. Click `Hide Header and Details`.
4. Confirm left/right panels anchor to the viewport sides.
5. Confirm center fills the space between them and uses available height.
6. Confirm accordionV2 open/collapse behavior is unchanged.
