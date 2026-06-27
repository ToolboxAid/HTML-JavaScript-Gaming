# PR 11.164 — Dead Code Ledger and Revert Map

## Purpose
Create a failure ledger for the SVG Asset Studio workspace tile/badge lane from PR 11.154 forward before any additional behavior fixes are attempted.

## Scope
- Audit every file changed since the last known stable baseline immediately before PR 11.154.
- Identify every change made while trying to fix the SVG tile / shared shell badge problem.
- Classify each changed path as KEEP, REVERT, UNKNOWN, or INVESTIGATE.
- Produce a revert map that separates confirmed useful fixes from failed or speculative code.
- Do not implement another badge fix in this PR.

## Baseline
Use PR 11.154 as the start of the failed SVG tile fix lane.

## Required Codex Work
1. Compare the current working tree and commit history against the repo state immediately before PR 11.154.
2. List every changed file touched by PR 11.154 and later SVG tile/badge attempts.
3. For each changed path, record:
   - file path
   - first PR where it changed, if discoverable
   - reason it changed
   - whether the change produced confirmed success
   - classification: KEEP / REVERT / UNKNOWN / INVESTIGATE
   - recommended action
4. Write the ledger to:
   - `docs_build/dev/reports/pr_11_164_dead_code_ledger.md`
5. Write a concise revert map to:
   - `docs_build/dev/reports/pr_11_164_revert_map.md`
6. Do not change runtime code unless required only to generate/report audit evidence.
7. Do not touch schemas, sample JSON, or SVG tool behavior as part of a new fix.
8. Do not modify `start_of_day` folders.
9. If roadmap status is updated, only change status markers and do not rewrite roadmap text.

## Acceptance
- Ledger covers PR 11.154 forward, not PR 11.159 forward.
- Every SVG tile/badge-related changed path is classified.
- Failed speculative changes are clearly identified.
- No new badge behavior fix is attempted.
- Output ZIP is placed at `<project folder>/tmp/PR_11_164_DEAD_CODE_LEDGER_AND_REVERT_MAP.zip`.
