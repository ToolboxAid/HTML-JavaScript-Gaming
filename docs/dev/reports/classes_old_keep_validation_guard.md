# classes_old_keep Validation Guard

Generated: 2026-04-12
Purpose: define checks required before any future rename/removal/archive lane for `classes_old_keep (docs-only placeholder, no on-disk path)` docs references.

## A) Windows PowerShell-Safe Search Commands (Text-Like Files)
Run from repo root.

1. Docs/planning/reference scan (text-like extensions only):
```powershell
Get-ChildItem -Recurse -File docs -Include *.md,*.txt,*.json,*.yml,*.yaml |
  Select-String -Pattern 'classes_old_keep' -SimpleMatch
```

2. Optional scoped scan for command/report metadata:
```powershell
Get-ChildItem -Recurse -File docs\dev -Include *.md,*.txt,*.json |
  Select-String -Pattern 'classes_old_keep' -SimpleMatch
```

3. Runtime/code contradiction check (only for contradiction validation):
```powershell
Get-ChildItem -Recurse -File tools,src,games,samples,tests -Include *.js,*.mjs,*.cjs,*.ts,*.tsx |
  Select-String -Pattern 'classes_old_keep' -SimpleMatch
```

## B) On-Disk Existence Check
```powershell
Test-Path classes_old_keep
```
Expected for current policy: `False`.

## C) Required Docs Synchronization Surfaces (If References Are Renamed/Removed)
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- `docs/dev/reports/repo_cleanup_targets.txt`
- `docs/dev/reports/cleanup_live_reference_inventory.txt`
- `docs/dev/reports/cleanup_keep_move_future_delete_matrix.md`
- `docs/dev/reports/cleanup_target_enforcement_map.md`
- `docs/dev/reports/cleanup_target_normalization_report.md`
- active `docs/pr/*` specs referencing `classes_old_keep (docs-only placeholder, no on-disk path)`

## D) Blocking Failure Conditions
Stop future cleanup execution if any of the following occur:
- `classes_old_keep/` path is created implicitly without explicit lane approval.
- runtime/code references are detected.
- roadmap/docs synchronization set is incomplete.
- changes expand into unrelated targets (`templates`, `docs/archive`, SpriteEditor archive surfaces).
- roadmap requires wording rewrite (non bracket-only) during a status-only lane.

## Guard Summary
`classes_old_keep (docs-only placeholder, no on-disk path)` remains a docs-only placeholder until a dedicated, synchronized docs cleanup lane resolves naming/retirement intent.

