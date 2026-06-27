# Theme V2 Bad Migration Removal Validation - PR_26152_031-remove-bad-v2-css-migration

## Scope

- Removed the bad Theme V2 CSS foundation migration that prior audit evidence classified as V1/legacy-propagated.
- Changed only GameFoundryStudio Theme V2 CSS and required reports.
- Did not change HTML.
- Did not change JavaScript.
- Did not migrate pages.
- Did not add new visual patterns.

## Removal Evidence

The removed CSS is the Theme V2 CSS delta introduced by `PR_26152_028-theme-v2-css-foundation`.

The later audit report, `docs_build/dev/reports/theme_v2_gap_audit.md`, classified those affected areas as:
- moved existing CSS
- consolidated duplicate CSS from legacy surfaces
- possible one-off CSS
- ownership mismatches

Because current governance prohibits V1/legacy CSS as a source, that CSS was migration-invalid and was removed from Theme V2 instead of preserved or reworked from V1.

## Removed CSS Areas

- Horizontal accordion toggle and tool-column accordion overrides.
- Tool display mode summary arrow styling.
- Tool workspace, tool columns, tool center panel, tool grid, and focus-mode layout.
- Tool card and tool display body styling.
- Meaning color utilities, brand background utilities, side accent additions, and tool-column header color variants.
- Button row, inline row, and return-to-top meaning-variable hooks.
- Form row, field stack, and control fieldset helpers.
- Status/log/pill/role/tool-group metadata styling.
- Dialog baseline and dialog sample styling.
- `.table` class styling.
- Tool-shell, dialog, card image, and focus-mode tokens introduced with the bad migration.

## Preserved CSS

- Existing approved Theme V2 files and imports remain.
- Existing Theme V2 baseline styling that predated the bad migration remains.
- Generic `tables.css` baseline remains, including `.table-wrapper`, `table`, `caption`, `th`, and `td`.

## Validation Commands

- `git diff --name-only`
- `git diff --stat -- GameFoundryStudio\assets\css\theme\v2`
- `git diff --check -- GameFoundryStudio\assets\css\theme\v2`
- Theme import resolver script for `GameFoundryStudio/assets/css/theme/v2/theme.css`
- Changed-file guard that fails if `.html` or `.js` files changed.
- Page-migration guard that fails if any `GameFoundryStudio/**/*.html` page changed.
- Legacy dependency guard that fails if the GameFoundryStudio diff adds legacy stylesheet references.
- Invalid selector scan for removed V1-propagated families.

## Results

- PASS: Only Theme V2 CSS files and required reports changed.
- PASS: No HTML files changed.
- PASS: No JavaScript files changed.
- PASS: No page migration occurred.
- PASS: No legacy CSS dependency was added.
- PASS: Theme V2 `theme.css` imports still resolve.
- PASS: `git diff --check -- GameFoundryStudio\assets\css\theme\v2` passed.
- PASS: Removed CSS matches the prior audit's migration-invalid Theme V2 foundation footprint.
- PASS: Invalid selector scan found no removed V1-propagated selector families remaining in Theme V2 except `.table-wrapper`, which predates the invalid migration and is preserved as existing Theme V2 baseline.

## Lanes

Lanes executed:
- GameFoundryStudio CSS/static validation because this PR only changes Theme V2 CSS and reports.

Lanes skipped:
- runtime, integration, engine, samples, and recovery/UAT because no HTML, JavaScript, runtime behavior, engine code, samples, or page migration changed.

Samples decision:
- SKIP because samples are out of scope and no sample files changed.

Expected PASS behavior:
- The migration-invalid Theme V2 CSS from the bad foundation migration is removed.
- Theme V2 remains the only styling target.
- Missing patterns are documented as Theme V2 design-system gaps instead of being solved from V1.

Expected WARN behavior:
- Not-yet-migrated page families may still reference legacy CSS until their migration PR.
- Removed tool-shell, dialog, status, form helper, and table class patterns are now gaps requiring approval before direct Theme V2 implementation.
