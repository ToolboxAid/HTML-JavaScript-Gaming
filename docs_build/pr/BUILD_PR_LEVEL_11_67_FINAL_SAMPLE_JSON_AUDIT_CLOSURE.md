# BUILD_PR_LEVEL_11_67_FINAL_SAMPLE_JSON_AUDIT_CLOSURE

## Codex Task
Execute the final sample JSON audit closure pass.

## Steps
1. Run:
   ```powershell
   .\scripts\PS\audit-sample-json-js-references.ps1
   ```
2. Record baseline counts in:
   `docs_build/dev/reports/PR_11_67_sample_json_audit_closure.md`
3. Read:
   `docs_build/dev/reports/sample_json_js_reference_audit.csv`
4. For each remaining missing-reference row:
   - repair palette JSON when palette data can be derived from the matching sample JS file
   - update sample JS to reference the generated/existing JSON using the repo's existing loader style
   - remove stale metadata/index-only references when they are the only remaining reference
   - document unresolved blockers instead of guessing
5. Update the audit script output so once summary counts are printed, the detailed YES/NO list is not printed again by default.
6. Re-run the audit.
7. Record final counts and exact remaining blockers, if any.

## Validation
Run targeted validation only:
- PowerShell syntax/parse check for the audit script
- affected sample/tool smoke checks only when Codex can identify them from changed files
- no full sample suite

## Completion Rules
The PR is complete only if:
- before/after counts are recorded
- missing reference count decreases or every remaining row is documented as a real blocker
- no broad refactor was introduced
- no hidden sample/default asset loading was introduced
