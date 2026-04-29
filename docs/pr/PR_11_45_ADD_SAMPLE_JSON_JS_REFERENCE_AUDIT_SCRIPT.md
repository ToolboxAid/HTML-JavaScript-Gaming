# PR 11.45 — Add Sample JSON to JS Reference Audit Script

## Purpose
Add a PowerShell utility that recursively scans sample directories for JSON files and verifies each JSON file is referenced by JavaScript files in the same sample subtree.

## Required Behavior
For each JSON file under `samples/**`:
- resolve the owning sample root as `samples/<group>/<sample>/`
- recursively scan JS files under that sample root
- check whether the JSON filename, basename, or relative path is referenced
- write a CSV report to `docs/dev/reports/sample_json_js_reference_audit.csv`

## Usage
```powershell
powershell -ExecutionPolicy Bypass -File scripts/audit-sample-json-js-references.ps1
```

Optional failure mode:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/audit-sample-json-js-references.ps1 -FailOnMissing
```

## Scope
- Adds script only.
- No sample cleanup in this PR.
- No runtime behavior change.
- No full sample smoke test required.

## Acceptance
- Script runs from repo root.
- CSV report is created.
- Missing references are printed.
- `-FailOnMissing` exits non-zero when unreferenced JSON exists.
