# PR 10.14 Fullscreen Header Summary Line Fix Report

- Generated: 2026-04-28T17:57:53.417Z
- PASS/FAIL: FAIL

## Files Changed
- tools/shared/platformShell.js
- tools/shared/platformShell.css
- docs/dev/reports/PR_10_14_FULLSCREEN_HEADER_SUMMARY_LINE_FIX_report.md
- tmp/PR_10_14_FULLSCREEN_HEADER_SUMMARY_LINE_FIX_validation.json

## Behavior Before
- Shared-shell summary presentation styles (`[data-tools-platform-summary-active]`) were applied outside fullscreen, so fullscreen-specific header/error treatment could leak into normal screen.
- Summary render path created two visible summary nodes (`header` + `intro`), allowing stacked summary lines and increasing risk of caret/label multi-line presentation in fullscreen.

## Behavior After
- Fullscreen summary treatment is now scoped to `html:fullscreen` only, preventing fullscreen-only summary/error styling from affecting normal mode.
- Summary render now outputs one visible line node (`.tools-platform-summary__line`) for the fullscreen summary row.
- Diagnostics are preserved via `title` and `data-tools-platform-summary-diagnostic` attributes; no multi-line visible error block is rendered in the summary row.

## Validation Steps (Normal Mode)
1. Run `node --check tools/shared/platformShell.js`.
2. Open each target tool page in normal mode (Vector Map Editor, Vector Asset Studio, Sprite Editor, State Inspector).
3. Confirm summary does not contain the old two-line (`header` + `intro`) visible structure and that fullscreen-only style treatment is not active in normal mode.

## Validation Steps (Fullscreen Mode)
1. Collapse header summary to trigger fullscreen path.
2. Confirm summary displays one horizontal line (`Tool Name ? Short Description`) and caret remains on the same row.
3. Confirm long text is handled with truncation/ellipsis behavior and diagnostic details remain available via summary `title`.

## Targeted Validation Evidence
- Evidence file: tmp/PR_10_14_FULLSCREEN_HEADER_SUMMARY_LINE_FIX_validation.json
- Vector Map Editor: FAIL | normalWhiteSpace=normal | fullscreenWhiteSpace=nowrap | fullscreenLine="Vector Map Editor — Map layout and collision authoring"
- Vector Asset Studio: FAIL | normalWhiteSpace=normal | fullscreenWhiteSpace=nowrap | fullscreenLine="Vector Asset Studio — SVG asset authoring and export"
- Sprite Editor: FAIL | normalWhiteSpace=normal | fullscreenWhiteSpace=nowrap | fullscreenLine="Sprite Editor — Palette-locked sprite and frame editing"
- State Inspector: FAIL | normalWhiteSpace=normal | fullscreenWhiteSpace=nowrap | fullscreenLine="State Inspector — Host/runtime state snapshot inspection"

## Scope Confirmation
- No tool data, manifests, or registry entries were modified.
- No `start_of_day` folders were modified.
- Change scope is surgical to shared-platform fullscreen summary rendering/styling and this report/evidence only.
