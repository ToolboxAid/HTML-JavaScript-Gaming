# PR_26177_OWNER_007-project-instructions-single-source-eod-lock

Date: 2026-06-26
Branch: PR_26177_OWNER_007-project-instructions-single-source-eod-lock
Scope: Project Instructions single-source governance, EOD main lock, branch lifecycle governance, and docs_build/dev root cleanup
Status: PASS

## Summary

- Established docs_build/dev/ProjectInstructions/ as the only active Project Instructions source.
- Added canonical Branch Lifecycle governance: START, WORK, END.
- Documented START commands and required results, including clean main, main...origin/main 0 0, and HEAD matching published EOD SHA.
- Documented WORK rules requiring Codex to remain on the PR branch, validate from the PR branch, commit only on the PR branch, and push only the PR branch.
- Documented END rules requiring PR branch push, PR update, merge, immediate main checkout/fetch/ff-only pull, clean 0 0 confirmation, and publication of Branch, HEAD SHA, and date/time as the next baseline.
- Added mandatory hard stops for main-before-commit, dirty branch creation, non-synced main, baseline mismatch, unvalidated merge, and starting new PR work before synchronized main return.
- Deleted duplicate active instruction files from docs_build/dev root.
- Deleted stale one-off PR/restart files listed by OWNER review from docs_build/dev root.
- Updated active governance docs so the only active Project Instructions source is docs_build/dev/ProjectInstructions/.
- Preserved docs_build/dev/ProjectInstructions/**, docs_build/dev/reports/**, current PR reports, and active validation/audit docs.
- No product/runtime, start_of_day, feature, or legacy SQLite file changes were made.

## Cleanup Files

Deleted duplicate active instruction files:
- docs_build/dev/PROJECT_INSTRUCTIONS.md
- docs_build/dev/PROJECT_MULTI_PC.txt

Deleted stale one-off root files:
- docs_build/dev/BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md
- docs_build/dev/PLAN_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md
- docs_build/dev/codex_commands.md
- docs_build/dev/codex_rules.md
- docs_build/dev/commit_comment.txt
- docs_build/dev/next_command.txt (local untracked/ignored stale file, removed from disk)
- docs_build/dev/NEXT_RESTART.md
- docs_build/dev/restart_notes_11_105.md
- docs_build/dev/restart_notes_11_110.md
- docs_build/dev/restart_notes_11_111.md
- docs_build/dev/restart_notes_11_112.md
- docs_build/dev/restart_notes_11_116.md
- docs_build/dev/restart_notes_11_118.md
- docs_build/dev/restart_notes_11_119.md
- docs_build/dev/restart_notes_11_120.md
- docs_build/dev/restart_notes_11_121.md
- docs_build/dev/restart_notes_11_122.md
- docs_build/dev/restart_notes_11_123.md

## Validation

- PASS: current branch is PR_26177_OWNER_007-project-instructions-single-source-eod-lock.
- PASS: targeted path checks confirm duplicate root instruction files and listed stale one-off files are absent.
- PASS: targeted grep found no active duplicate ProjectInstructions source-of-truth claim outside the active source.
- PASS: targeted grep confirmed canonical lifecycle language appears in active governance docs.
- PASS: product/runtime and start_of_day changed-file check returned no files.
- PASS: git diff --check.
- PASS: Playwright not run because this PR changes documentation/governance only.

## Artifact

- tmp/PR_26177_OWNER_007-project-instructions-single-source-eod-lock_delta.zip
