# PR 11.82 - Enforce Utils Rules

## Purpose
Add a report-only and CI-capable enforcement script for the utility consolidation lane.

## Scope
- Adds `scripts/PS/enforce-utils-rules.ps1`.
- Reports dead/shared utility candidates.
- Reports duplicate shared utility basenames.
- Reports any remaining `src/engine/utils` files or import/reference paths.
- Writes `docs_build/dev/reports/utils_rules_audit.csv` when run.

## Out of Scope
- No deletions.
- No import rewrites.
- No file moves.
- No wrappers or alias shims.

## Testing
Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\PS\enforce-utils-rules.ps1 -Details
```

CI mode:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\PS\enforce-utils-rules.ps1 -Ci
```
