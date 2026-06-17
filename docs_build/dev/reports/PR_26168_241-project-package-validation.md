# PR_26168_241-project-package-validation

## Branch Validation
- PASS: current branch verified as `main`.
- Expected branch: `main`.

## Summary
- Added Validate Project Package workflow with `.gfsp` file selection in Admin Operations.
- Validation checks package integrity, required files, schema validity, compatibility, and asset references without importing.

## Requirement Checklist
- PASS: Validate Project Package action is visible under Project Packaging.
- PASS: UI provides `.gfsp` file selection.
- PASS: Browser posts selected package bytes to the Local API and does not own package authority.
- PASS: Server validation checks integrity, required files, schema, compatibility, and asset references.
- PASS: No import is performed by validation.
- PASS: Missing package bytes fail visibly with actionable diagnostics.

## Validation Lane Report
- PASS: Admin Operations Playwright verified `.gfsp` file selection and base64 payload posting for Validate Project Package.
- PASS: direct Node package round trip validated generated `.gfsp` contents.
- PASS: `node --check assets/theme-v2/js/admin-operations.js`.
- PASS/WARN: V8 coverage covers Admin Operations browser code; Node-only package validator is advisory WARN.

## Manual Validation Notes
- Validation result message explicitly says no import was performed.
- Conflict detection is reported as a validation warning, not an import action.

## Full Samples Decision
- SKIP: package validation is Admin-only and does not affect samples.
