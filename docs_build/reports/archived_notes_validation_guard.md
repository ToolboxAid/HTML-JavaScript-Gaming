# Archived Notes Validation Guard

Generated: 2026-04-12
Purpose: Define mandatory checks before any future PR can move/rename/delete archived notes content.

## A) Reference Scan Commands (Pre + Post)
Run from repo root.

1. Active reference scan for archived notes path usage:
```powershell
rg -n "archive/v1-v2/docs_build/archive/" docs tools src games samples tests --glob "!archive/v1-v2/docs_build/archive/**" --glob "!**/node_modules/**"
```

2. Docs-only reference scan (non-archive surfaces):
```powershell
rg -n "archive/v1-v2/docs_build/archive/" docs --glob "!archive/v1-v2/docs_build/archive/**"
```

3. Optional classification assist for consumer file list:
```powershell
rg -l "archive/v1-v2/docs_build/archive/" docs tools src games samples tests --glob "!archive/v1-v2/docs_build/archive/**" --glob "!**/node_modules/**"
```

## B) Structural Integrity Checks
1. Confirm no accidental edits under archive tree in docs-only policy lanes:
```powershell
git status --short -- archive/v1-v2/docs_build/archive
```

2. Confirm no archive move/rename/delete in PR scope:
```powershell
git diff --name-status -- archive/v1-v2/docs_build/archive
```

3. Confirm no protected start_of_day changes:
```powershell
git status --short -- docs_build/dev/start_of_day/chatGPT docs_build/dev/start_of_day/codex
```

## C) Validation Surfaces If Archive Movement Is Ever Attempted
1. Documentation contract surfaces requiring synchronized updates:
- `docs/reference/root/README.md`
- `docs/reference/root/repo-directory-structure.md`
- `docs/reference/root/getting-started.md`
- `docs/reference/root/review-checklist.md`
- `docs_build/operations/dev/README.md`
- `docs_build/operations/dev/paths.md`
- cleanup policy/report artifacts that reference archive paths

2. Governance surfaces:
- `docs_build/reports/cleanup_live_reference_inventory.txt`
- `docs/reference/features/docs-system/move-history-preserved.md`
- `docs_build/reports/repo_cleanup_targets.txt`
- `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`

3. Recommended smoke run if movement lane also touches tooling/docs integrations:
```powershell
npm run test:launch-smoke -- --tools
```

## D) Roadmap Check Rule (Only if Roadmap Is Modified)
```powershell
git diff --unified=0 -- docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md
```
Accept only bracket-state changes on exact existing lines.

## E) Blocking Failure Conditions
Stop cleanup execution immediately if:
- unresolved `archive/v1-v2/docs_build/archive/` references remain without synchronized updates;
- `archive/v1-v2/docs_build/archive/` has move/delete/rename entries without explicit destination and rollback map;
- protected start_of_day directories show any change;
- roadmap requires wording rewrite (non bracket-only) to reflect status;
- cleanup scope expands into unrelated targets (`templates`, `SpriteEditor_old_keep`, `legacy class-retention policy marker`, legacy import guard) in the same lane.

## Guard Summary
No future archived-notes structural cleanup should proceed without full reference proof, synchronized docs updates, structural integrity checks, and rollback-ready execution evidence.


