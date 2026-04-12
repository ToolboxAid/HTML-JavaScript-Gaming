# Cleanup Execution Guard

Generated: 2026-04-12
Scope: Global execution rules for future cleanup PRs, derived from approved cleanup/templates evidence.

## A) Required Pre-Checks
1. Reference scan requirement:
   - Confirm current reference state for the exact target before proposing any action.
2. Existence/path verification:
   - Verify whether the target path exists on disk and whether references are runtime, test, docs-only, or mixed.
3. Target classification confirmation:
   - Confirm classification from `cleanup_keep_move_future_delete_matrix.md` and any overriding target policy artifact (for `templates/`, policy remains keep-in-place-for-now).
4. Target-specific guard selection requirement:
   - Select and apply the guard set appropriate to the target:
     - `templates/`: use `templates_validation_guard.md` in full.
     - Legacy policy/docs targets: use this global guard plus target-specific reference scans.

## B) Required Validation Surfaces
1. Before/after smoke validation expectations:
   - If a future PR attempts any path/structure change, run before and after smoke checks:
     - `npm run test:launch-smoke -- --tools`
   - Add `--games --samples` when changes could affect sample/game surfaces.
2. Docs sync surfaces:
   - Synchronize relevant docs in the same PR when path/policy states change:
     - `docs/dev/reports/repo_cleanup_targets.txt`
     - `docs/dev/reports/cleanup_live_reference_inventory.txt`
     - `docs/dev/reports/cleanup_keep_move_future_delete_matrix.md`
     - `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
     - target-specific policy/guard reports (including templates reports where relevant)
3. Target-specific tests if path change is attempted:
   - For `templates/`, rerun template contract tests from `templates_validation_guard.md`.
   - For tool-path targets, include tool launch smoke validation surfaces.

## C) Required Command Patterns
Run from repo root.

1. Reference scans:
```powershell
rg -n "templates/" tools src games samples tests
rg -n "SpriteEditor_old_keep|legacy class-retention policy marker|docs/archive/|legacy retirement|imports pointing to legacy paths" docs --glob "!docs/archive/**"
rg -n "from '/engine/|from '../engine/|from './engine/" tools src games samples tests
```

2. Structural-change diff checks:
```powershell
git diff --name-status
git diff --name-status -- templates
```

3. Protected-directory checks:
```powershell
git status --short -- docs/dev/start_of_day/chatGPT docs/dev/start_of_day/codex
```

4. Runtime/test surface change checks:
```powershell
git diff --name-only -- tools src games samples tests
```

5. Roadmap diff checks (when roadmap is modified):
```powershell
git diff --unified=0 -- docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md
```

## D) Global Forbidden Actions
- Repo-wide cleanup scans used as execution scope for structural edits.
- Mixed-purpose cleanup PRs combining policy, migration, and unrelated runtime changes.
- Delete/move/rename of live-reference targets without synchronized validation and docs alignment.
- Any `templates/` structural action that conflicts with active templates policy/guard artifacts.
- Structural cleanup changes inside docs-only evidence/policy lanes.

## E) Blocking Failure Conditions
Stop execution immediately if any of the following occur:
- target classification cannot be reconciled with current policy artifacts;
- unresolved live references remain for a target proposed for move/delete;
- runtime/test files change in a docs-only cleanup lane;
- protected start_of_day directories show any changes;
- roadmap wording changes are needed (non bracket-only) to represent progress;
- cleanup scope expands beyond approved targets.

## Guard Summary
Future cleanup execution must stay target-specific, evidence-backed, and validation-first. Policy and enforcement docs alone do not authorize structural cleanup.

