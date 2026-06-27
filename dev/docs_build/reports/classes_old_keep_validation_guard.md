# legacy class-retention policy marker Validation Guard

Generated: 2026-04-12
Purpose: define checks required before any future rename/removal/archive lane for `legacy class-retention policy marker` docs references.

## A) Windows PowerShell-Safe Search Commands (Text-Like Files)
Run from repo root.

1. Docs/planning/reference scan (text-like extensions only):
```powershell
Get-ChildItem -Recurse -File docs -Include *.md,*.txt,*.json,*.yml,*.yaml |
  Select-String -Pattern 'legacy class-retention policy marker' -SimpleMatch
```

2. Optional scoped scan for command/report metadata:
```powershell
Get-ChildItem -Recurse -File docs_build\dev -Include *.md,*.txt,*.json |
  Select-String -Pattern 'legacy class-retention policy marker' -SimpleMatch
```

3. Runtime/code contradiction check (only for contradiction validation):
```powershell
Get-ChildItem -Recurse -File tools,src,games,samples,tests -Include *.js,*.mjs,*.cjs,*.ts,*.tsx |
  Select-String -Pattern 'legacy class-retention policy marker' -SimpleMatch
```

## B) On-Disk Existence Check
```powershell
Test-Path legacy class-retention policy marker
```
Expected for current policy: `False`.

## C) Required Docs Synchronization Surfaces (If References Are Renamed/Removed)
- `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`
- `docs_build/reports/repo_cleanup_targets.txt`
- `docs_build/reports/cleanup_live_reference_inventory.txt`
- `docs/reference/features/docs-system/move-history-preserved.md`
- `docs_build/reports/cleanup_target_enforcement_map.md`
- `docs_build/reports/cleanup_target_normalization_report.md`
- active `docs_build/pr/*` specs referencing `legacy class-retention policy marker`

## D) Blocking Failure Conditions
Stop future cleanup execution if any of the following occur:
- `legacy class-retention marker path` path is created implicitly without explicit lane approval.
- runtime/code references are detected.
- roadmap/docs synchronization set is incomplete.
- changes expand into unrelated targets (`templates`, `archive/v1-v2/docs_build/archive`, SpriteEditor archive surfaces).
- roadmap requires wording rewrite (non bracket-only) during a status-only lane.

## Guard Summary
`legacy class-retention policy marker` remains a docs-only placeholder until a dedicated, synchronized docs cleanup lane resolves naming/retirement intent.


