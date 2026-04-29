# Codex Commands — PR 11.62

Model: GPT-5.4
Reasoning: high

```powershell
codex "Run BUILD_PR_LEVEL_11_62_MISSING_REFERENCE_REPAIR. Read docs/dev/reports/sample_json_js_reference_audit.csv. Fix the current stalled audit state by repairing stale missing references, especially metadata/index-only and manifest-only references. Do not perform blind bulk deletes. Reduce Missing reference count from 27 if possible. Write docs/dev/reports/pr_11_62_missing_reference_repair_report.md with before/after counts, rows fixed, files changed, blocked rows, and targeted validation. Do not run the full samples suite. Return a ZIP artifact at tmp/PR_11_62_MISSING_REFERENCE_REPAIR.zip." 
```

## Validation Commands

```powershell
.\scripts\PS\audit-sample-json-js-references.ps1
Import-Csv .\docs\dev\reports\sample_json_js_reference_audit.csv | Group-Object Status | Select-Object Name,Count
```
