# BUILD_PR_LEVEL_11_54_CONTROLLED_JSON_CLEANUP_8

## Codex Task
Execute PR 11.54 controlled JSON cleanup.

## Steps
1. Run:
   ```powershell
   .\scripts\PS\audit-sample-json-js-references.ps1
   ```
2. Select exactly 8 `NO` JSON files that are safe tool/debug/utility-specific cleanup candidates.
3. For each candidate, run direct and broad reference checks.
4. Remove only candidates with no references and no indirect/manual usage risk.
5. Do not modify protected files or sample 1902.
6. Run targeted validation only.
7. Re-run audit and record counts.
8. Write evidence to `docs_build/dev/reports/PR_11_54_controlled_json_cleanup_8_report.md`.

## Required Report Content
- Initial audit YES/NO/TOTAL counts.
- List of 8 removed files.
- Reference-check result for each removed file.
- Targeted validation performed.
- Final audit YES/NO/TOTAL counts.
- Full samples suite status: skipped, with reason.

## Commit Comment
Use the text from `docs_build/dev/commit_comment.txt`.
