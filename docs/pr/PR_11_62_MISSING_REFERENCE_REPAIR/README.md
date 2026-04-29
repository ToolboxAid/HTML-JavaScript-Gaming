# PR 11.62 — Missing Reference Repair

## Purpose
Fix the stalled audit state where the audit reports:

- Referenced: 39
- Missing reference: 27
- Report: `docs/dev/reports/sample_json_js_reference_audit.csv`

This PR is not another blind bulk-delete pass. It must read the CSV and repair the remaining missing-reference rows by category.

## Scope
One purpose only: reduce `Missing reference` count from 27 toward 0 by removing stale references or restoring required files only when proven necessary.

## Required Inputs
- `docs/dev/reports/sample_json_js_reference_audit.csv`
- `samples/metadata/samples.index.metadata.json`
- affected sample/tool JSON references reported by the CSV

## Rules
- Do not modify roadmap content except status-only if execution-backed.
- Do not touch `palette.json`.
- Do not touch `tile-map-editor-document.json`.
- Do not touch sample 1902 unless the CSV proves it is only stale metadata and no runtime/shared dependency exists.
- Do not run the full sample suite.
- Do not guess.
- Do not delete JS files.
- Do not create fallback/default payloads.

## Repair Strategy
For each CSV row where status is `Missing reference`:

1. Identify the missing JSON path.
2. Search references to that exact path and filename.
3. Classify the source:
   - stale metadata/index reference
   - stale sample manifest/reference
   - stale JS direct reference
   - required runtime asset missing from repo
4. Apply the correct fix:
   - metadata-only reference: remove the metadata/index entry or field
   - sample manifest-only reference: remove or correct the stale manifest reference
   - JS direct reference: do not delete silently; repair to correct existing asset path or document as blocked
   - required runtime asset: restore/recreate only if source content exists in repo history or another canonical file; otherwise document blocked
5. Re-run the audit script.
6. Confirm the `Missing reference` count decreases.

## Acceptance
- `Missing reference` count decreases from 27.
- Every modified reference is listed in `docs/dev/reports/pr_11_62_missing_reference_repair_report.md`.
- Any remaining missing references are listed with exact blocker reason.
- No full sample suite run; targeted audit validation only.
