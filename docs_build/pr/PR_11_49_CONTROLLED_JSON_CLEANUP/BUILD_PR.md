# BUILD_PR_LEVEL_11_49_CONTROLLED_JSON_CLEANUP

## Objective
Execute the next controlled cleanup batch by resolving exactly two safe `NO` JSON audit findings.

## Required Steps
1. Confirm clean working tree or record current state.
2. Run:
   ```powershell
   .\scripts\PS\audit-sample-json-js-references.ps1 | Tee-Object -FilePath docs_build\dev\reports\PR_11_49_audit_before.txt
   ```
3. Select exactly two safe tool-specific `NO` JSON files.
4. Do not select excluded files:
   - `palette.json`
   - `tile-map-editor-document.json`
   - anything under sample `1902`
5. For each selected JSON file:
   - search for filename references
   - search for basename references
   - inspect the owning sample/tool JS
   - decide keep, move, or delete
6. Apply only confirmed corrections.
7. Run targeted validation for the affected files/samples/tools.
8. Rerun audit and save:
   ```powershell
   .\scripts\PS\audit-sample-json-js-references.ps1 | Tee-Object -FilePath docs_build\dev\reports\PR_11_49_audit_after.txt
   ```
9. Write final evidence report to:
   `docs_build/dev/reports/PR_11_49_controlled_json_cleanup_report.md`
10. Update `docs_build/dev/commit_comment.txt` if the final PR description changes.

## Constraints
- No implementation refactors.
- No mass cleanup.
- No silent default payloads.
- No hardcoded hidden fallback assets.
- No unrelated files.
- No roadmap text edits except status-only transitions when execution-backed.
- Preserve exact file names unless moving a file is the chosen correction.

## Evidence Report Required Sections
- Audit before summary
- Selected JSON files
- Manual validation notes
- Action taken per file
- Files changed
- Targeted validation commands and results
- Full samples test decision and reason
- Audit after summary

## Full Sample Suite Decision
Default: skipped.

Reason: this PR is limited to sample/tool-specific JSON cleanup and does not modify shared loader/framework code.

