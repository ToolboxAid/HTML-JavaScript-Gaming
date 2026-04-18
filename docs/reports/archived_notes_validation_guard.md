# Archived Notes Validation Guard

Generated: 2026-04-12
Purpose: Define mandatory checks before any future PR can move/rename/delete archived notes content.

## A) Reference Scan Commands (Pre + Post)
Run from repo root.

1. Active reference scan for archived notes path usage:
```powershell
rg -n "docs/archive/" docs tools src games samples tests --glob "!docs/archive/**" --glob "!**/node_modules/**"
```

2. Docs-only reference scan (non-archive surfaces):
```powershell
rg -n "docs/archive/" docs --glob "!docs/archive/**"
```

3. Optional classification assist for consumer file list:
```powershell
rg -l "docs/archive/" docs tools src games samples tests --glob "!docs/archive/**" --glob "!**/node_modules/**"
```

## B) Structural Integrity Checks
1. Confirm no accidental edits under archive tree in docs-only policy lanes:
```powershell
git status --short -- docs/archive
```

2. Confirm no archive move/rename/delete in PR scope:
```powershell
git diff --name-status -- docs/archive
```

3. Confirm no protected start_of_day changes:
```powershell
git status --short -- docs/dev/start_of_day/chatGPT docs/dev/start_of_day/codex
```

## C) Validation Surfaces If Archive Movement Is Ever Attempted
1. Documentation contract surfaces requiring synchronized updates:
- `docs/reference/root/README.md`
- `docs/reference/root/repo-directory-structure.md`
- `docs/reference/root/getting-started.md`
- `docs/reference/root/review-checklist.md`
- `docs/operations/dev/README.md`
- `docs/operations/dev/paths.md`
- cleanup policy/report artifacts that reference archive paths

2. Governance surfaces:
- `docs/reports/cleanup_live_reference_inventory.txt`
- `docs/reports/cleanup_keep_move_future_delete_matrix.md`
- `docs/reports/repo_cleanup_targets.txt`
- `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

3. Recommended smoke run if movement lane also touches tooling/docs integrations:
```powershell
npm run test:launch-smoke -- --tools
```

## D) Roadmap Check Rule (Only if Roadmap Is Modified)
```powershell
git diff --unified=0 -- docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md
```
Accept only bracket-state changes on exact existing lines.

## E) Blocking Failure Conditions
Stop cleanup execution immediately if:
- unresolved `docs/archive/` references remain without synchronized updates;
- `docs/archive/` has move/delete/rename entries without explicit destination and rollback map;
- protected start_of_day directories show any change;
- roadmap requires wording rewrite (non bracket-only) to reflect status;
- cleanup scope expands into unrelated targets (`templates`, `SpriteEditor_old_keep`, `legacy class-retention policy marker`, legacy import guard) in the same lane.

## Guard Summary
No future archived-notes structural cleanup should proceed without full reference proof, synchronized docs updates, structural integrity checks, and rollback-ready execution evidence.


