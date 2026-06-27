# PR_26168_242-project-package-import

## Branch Validation
- PASS: current branch verified as `main`.
- Expected branch: `main`.

## Summary
- Added Import Project Package workflow to Admin Operations.
- Import validates before import, detects existing project conflicts, and supports Replace Existing or Import As New Project.
- Replace Existing requires checkbox confirmation and typed `REPLACE`.

## Requirement Checklist
- PASS: Import Project Package action is visible under Project Packaging.
- PASS: UI provides `.gfsp` file selection.
- PASS: UI provides Import As New Project and Replace Existing modes.
- PASS: Server validates package before import.
- PASS: Existing project conflicts are detected from API-owned project records.
- PASS: Replace Existing requires explicit confirmation before overwrite.
- PASS: No silent overwrite path exists.
- PASS: Import As New Project imports without overwriting existing records.

## Validation Lane Report
- PASS: Admin Operations Playwright verified selected package file, `replace-existing` mode, checkbox confirmation, typed `REPLACE`, and Local API payload.
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`.
- PASS: `node --check src/engine/api/admin-operations-api-client.js`.
- PASS/WARN: V8 coverage covers Admin Operations browser code and API client; server import handler is advisory WARN.

## Manual Validation Notes
- Import failure paths return `FAIL` when package validation fails or Replace Existing lacks confirmation.
- Replace Existing opens/updates the existing Project Workspace record only after explicit confirmation.

## Full Samples Decision
- SKIP: package import is Admin-only and does not affect sample JSON or sample launch.
