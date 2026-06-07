# PR_26157_010 Historical Limitation

Status: PASS, limitation documented

PR_26157_017 requested standalone report/package evidence for PR_26157_010 if available, or an exact historical limitation if it was missing.

## Findings

- No `docs_build/dev/reports/*26157_010*` report exists in the current workspace.
- No `tmp/*26157_010*` delta ZIP exists in the current workspace.
- No `tmp/*26157_011*` delta ZIP exists in the current workspace either.
- The later `docs_build/dev/reports/shared-mock-db-completion-validation-report.md` exists and documents PR_26157_011 follow-up validation, but it is not standalone PR_26157_010 package evidence.

## Limitation

The original PR_26157_010 standalone report and delta ZIP cannot be preserved from this workspace because those artifacts are not present locally. Reconstructing them now would create new evidence after the fact, so this report records the exact limitation instead.

## Current Cleanup Evidence

PR_26157_017 validates the current integrated state for the requested PR_26157_010 cleanup surface:

- DB Viewer session switching removed.
- Shared persisted Memory DB auth is required for Local users.
- Old role/project-data Playwright selectors removed.
- Removed fields remain absent: `createdByType`, `updatedByType`, `accountType`, `isSystemUser`, and `actors`.
- Palette and Asset raw `getTables()` now return DB-shaped rows directly.
