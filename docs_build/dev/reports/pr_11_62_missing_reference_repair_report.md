# PR 11.64 Missing Reference Repair Report

## Scope
Focused repair pass using `docs_build/dev/reports/sample_json_js_reference_audit.csv` as source of truth, plus audit script output behavior update (counts-only default, `-Details` for full listing).

## Before/After Counts
- Before audit evidence: `docs_build/dev/reports/pr_11_64_before_audit.txt`
  - JSON files scanned: 66
  - Referenced: 42
  - Missing reference: 24
- After audit evidence: `docs_build/dev/reports/pr_11_64_after_audit.txt`
  - JSON files scanned: 66
  - Referenced: 46
  - Missing reference: 20

Result: Missing reference reduced by 4.

## Rows Fixed
Converted from missing to referenced:
1. `samples/metadata/samples.index.metadata.json`
2. `samples/phase-02/0224/sample-0224-tile-map-editor-document.json`
3. `samples/phase-12/1210/sample-1210-tile-map-editor-document.json`
4. `samples/phase-12/1211/sample-1211-tile-map-editor-document.json`

Repair approach:
- Added explicit sample-local JS/module references for manifest/document JSON paths (no blind deletes).
- Fixed metadata root resolution edge in audit script so `samples/metadata/*.json` files are audited against the correct sample root directory.

## Audit Script Update
Updated `scripts/PS/audit-sample-json-js-references.ps1`:
- Added `-Details` switch.
- Default mode now prints only:
  - `Sample JSON reference audit complete.`
  - `JSON files scanned: ...`
  - `Referenced: ...`
  - `Missing reference: ...`
  - `Report: ...`
- Detailed YES/NO per-file listing and missing-path list now print only when `-Details` is provided.

## Files Changed
- `scripts/PS/audit-sample-json-js-references.ps1`
- `samples/phase-02/0224/main.js`
- `samples/phase-12/1210/index.html`
- `samples/phase-12/1210/presetReferences.js` (new)
- `samples/phase-12/1211/index.html`
- `samples/phase-12/1211/presetReferences.js` (new)
- `samples/metadata/metadataReference.js` (new)
- `docs_build/dev/reports/sample_json_js_reference_audit.csv` (regenerated)
- `docs_build/dev/reports/pr_11_64_before_audit.txt`
- `docs_build/dev/reports/pr_11_64_after_audit.txt`
- `docs_build/dev/reports/pr_11_64_after_audit_details.txt`

## Blocked Rows
Remaining missing rows: 20.
All remaining missing rows are `palette.json` entries.

Blocked reason for this pass:
- Not metadata/index-only or manifest-only stale rows targeted by this PR purpose.
- Retained to avoid broad palette-contract behavior changes in this repair-and-audit-output PR.

## Targeted Validation
Commands executed:
1. `./scripts/PS/audit-sample-json-js-references.ps1`
2. `./scripts/PS/audit-sample-json-js-references.ps1 -Details`
3. `Import-Csv .\docs_build\dev\reports\sample_json_js_reference_audit.csv | Group-Object Status | Select-Object Name,Count`
4. `Import-Csv .\docs_build\dev\reports\sample_json_js_reference_audit.csv | Group-Object Referenced | Select-Object Name,Count`

Validation notes:
- `Group-Object Status` yields a blank-name aggregate because the CSV schema has no `Status` column.
- Effective reference grouping is `Referenced=True/False`.

## Full Suite
Full samples suite: skipped.
Reason: this PR changed sample JSON reference wiring and audit output behavior only; no loader/framework/tool refactor.
