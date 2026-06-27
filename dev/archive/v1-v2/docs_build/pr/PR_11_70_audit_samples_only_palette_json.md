# PR 11.70 - Fix palette-only sample audit script

Purpose: replace broken prose-contaminated PowerShell with a clean executable script.

Scope:
- Recursively scan samples/** leaf sample folders.
- Print paths where the only JSON files are *.palette.json.
- Print the total count at the end.
- Export CSV to docs_build/dev/reports/samples_only_palette_json_audit.csv.

Validation:
```powershell
.\scripts\PS\audit-samples-only-palette-json.ps1
```

Do not run the full samples smoke test.
