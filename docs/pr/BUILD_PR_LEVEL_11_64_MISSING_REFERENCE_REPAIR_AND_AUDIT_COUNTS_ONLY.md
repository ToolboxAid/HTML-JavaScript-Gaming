# BUILD_PR_LEVEL_11_64_MISSING_REFERENCE_REPAIR_AND_AUDIT_COUNTS_ONLY

## Objective
Perform a focused missing-reference repair pass and bundle the audit script output cleanup in the same PR.

## Required execution steps

1. Run baseline audit:

```powershell
.\scripts\PS\audit-sample-json-js-references.ps1
```

2. Confirm the baseline is approximately:

```text
JSON files scanned: 66
Referenced: 42
Missing reference: 24
```

3. Open the CSV report:

```text
docs/dev/reports/sample_json_js_reference_audit.csv
```

4. For every row marked missing, classify it:

```text
A. stale metadata/index reference only -> remove metadata/index entry
B. active JS/runtime reference to missing JSON -> restore/move correct JSON or fix reference
C. ambiguous/shared -> keep and document
```

5. Apply fixes for all safe rows. Do not skip metadata-only stale entries.

6. Update `scripts/PS/audit-sample-json-js-references.ps1` so default output prints the summary counts and then stops. Do not print the detailed YES/NO list again after counts.

Recommended implementation pattern:

```powershell
param(
    [switch]$Details
)

# ... existing audit collection logic ...

Write-Host "Sample JSON reference audit complete."
Write-Host "JSON files scanned: $TotalCount"
Write-Host "Referenced: $ReferencedCount"
Write-Host "Missing reference: $MissingReferenceCount"
Write-Host "Report: docs/dev/reports/sample_json_js_reference_audit.csv"

if (-not $Details) {
    return
}

# Existing detailed YES/NO output remains below this point only for -Details mode.
```

If the script already has `param(...)`, merge `[switch]$Details` into the existing param block instead of adding a second param block.

7. Run targeted validation:

```powershell
.\scripts\PS\audit-sample-json-js-references.ps1
.\scripts\PS\audit-sample-json-js-references.ps1 -Details
```

8. Capture before/after output under:

```text
docs/dev/reports/pr_11_64_before_audit.txt
docs/dev/reports/pr_11_64_after_audit.txt
docs/dev/reports/pr_11_64_missing_reference_repair_report.md
```

## Validation requirements
- Default audit output must stop after counts/report path.
- `-Details` mode may print the detailed list.
- Missing reference count must go below 24 unless every remaining row is documented as intentionally retained.
- Do not run the full sample suite; document that targeted audit validation was used because only sample JSON references and audit output behavior changed.
