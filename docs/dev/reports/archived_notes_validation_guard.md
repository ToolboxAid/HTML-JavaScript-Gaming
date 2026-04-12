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
- `docs/README.md`
- `docs/repo-directory-structure.md`
- `docs/getting-started.md`
- `docs/review-checklist.md`
- `docs/dev/README.md`
- `docs/dev/paths.md`
- cleanup policy/report artifacts that reference archive paths

2. Governance surfaces:
- `docs/dev/reports/cleanup_live_reference_inventory.txt`
- `docs/dev/reports/cleanup_keep_move_future_delete_matrix.md`
- `docs/dev/reports/repo_cleanup_targets.txt`
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

3. Recommended smoke run if movement lane also touches tooling/docs integrations:
```powershell
npm run test:launch-smoke -- --tools
```

## D) Roadmap Check Rule (Only if Roadmap Is Modified)
```powershell
git diff --unified=0 -- docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md
```
Accept only bracket-state changes on exact existing lines.

## E) Blocking Failure Conditions
Stop cleanup execution immediately if:
- unresolved `docs/archive/` references remain without synchronized updates;
- `docs/archive/` has move/delete/rename entries without explicit destination and rollback map;
- protected start_of_day directories show any change;
- roadmap requires wording rewrite (non bracket-only) to reflect status;
- cleanup scope expands into unrelated targets (`templates`, `SpriteEditor_old_keep`, `classes_old_keep (docs-only placeholder, no on-disk path)`, legacy import guard) in the same lane.

## Guard Summary
No future archived-notes structural cleanup should proceed without full reference proof, synchronized docs updates, structural integrity checks, and rollback-ready execution evidence.

