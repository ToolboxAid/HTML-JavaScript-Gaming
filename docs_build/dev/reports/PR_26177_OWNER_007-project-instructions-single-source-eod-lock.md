# PR_26177_OWNER_007-project-instructions-single-source-eod-lock

Date: 2026-06-26
Scope: Project Instructions single-source and canonical branch lifecycle governance
Status: PASS

## Summary

- Established docs_build/dev/ProjectInstructions/ as the only active Project Instructions source.
- Added canonical Branch Lifecycle governance: START, WORK, END.
- Documented START commands and required results, including clean main, main...origin/main 0 0, and HEAD matching published EOD SHA.
- Documented WORK rules requiring Codex to remain on the PR branch, validate from the PR branch, commit only on the PR branch, and push only the PR branch.
- Documented END rules requiring PR branch push, PR update, merge, immediate main checkout/fetch/ff-only pull, clean 0 0 confirmation, and publication of Branch, HEAD SHA, and date/time as the next baseline.
- Added mandatory hard stops for main-before-commit, dirty branch creation, non-synced main, baseline mismatch, unvalidated merge, and starting new PR work before synchronized main return.
- Updated active governance/team workflow docs under docs_build/dev/ProjectInstructions/ to reference the canonical lifecycle.
- No product/runtime, start_of_day, feature, or legacy SQLite file changes were made.

## Validation

- PASS: targeted grep found no active duplicate ProjectInstructions source-of-truth claim outside the active source.
- PASS: targeted grep confirmed canonical lifecycle language appears in active governance docs.
- PASS: product/runtime and start_of_day changed-file check returned no files.
- PASS: git diff --check.

## Artifact

- tmp/PR_26177_OWNER_007-project-instructions-single-source-eod-lock_delta.zip
