# Codex Commands - PR 11.82

## Purpose
Add CI-safe utils rule enforcement after the `src/engine/utils` to `src/shared/utils` consolidation lane.

## Command
Run this from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\PS\enforce-utils-rules.ps1 -Details
```

For CI/regression mode:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\PS\enforce-utils-rules.ps1 -Ci
```

## Acceptance
- Script runs without parser errors.
- CSV report is written to `docs/dev/reports/utils_rules_audit.csv`.
- `-Details` shows findings only when requested.
- `-Ci` exits nonzero when findings exist.
- No files are deleted or moved by this PR.
