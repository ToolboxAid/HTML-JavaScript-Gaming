# templates/ Validation Guard

Generated: 2026-04-12
Purpose: Define mandatory checks that must pass before any future PR can move/rename/delete `templates/`.

## A) Reference Scan Commands (Pre + Post)
Run from repo root.

1. Code/tests template path usage:
```powershell
rg -n "templates/" tools src games samples tests
```

2. Active docs/planning usage (exclude archives):
```powershell
rg -n "templates/" docs --glob "!docs/archive/**"
```

3. Direct module import/require guard:
```powershell
rg -n "^\s*import .*templates/|^\s*.*require\(.*templates/|^\s*export .* from .*templates/" tools src games samples tests
```

4. Old/legacy path regression guard:
```powershell
rg -n -F "from '/engine/" tools src games samples
rg -n -F "from '../engine/" tools src games samples
rg -n -F "from './engine/" tools src games samples
```

## B) templates/ Structural Integrity Checks
1. Confirm no accidental template edits in docs-only lanes:
```powershell
git status --short -- templates
```

2. Confirm no template move/rename/delete in PR scope:
```powershell
git diff --name-status -- templates
```

## C) Smoke Validation Surfaces (When Migration Is Attempted)
Run both before and after migration:
```powershell
npm run test:launch-smoke -- --tools
```

Recommended follow-up smoke (if migration touches game/sample references):
```powershell
npm run test:launch-smoke -- --games --samples
```

## D) Test Surfaces To Re-run
1. Template contract tests:
```powershell
node -e "import('./tests/tools/VectorNativeTemplate.test.mjs').then(m=>m.run())"
node -e "import('./tests/tools/GameTemplates.test.mjs').then(m=>m.run())"
```

2. Any test suite asserting template path text/contract output must be updated and rerun in the same PR.

## E) Docs/Contracts Requiring Synchronized Updates (If Path Changes)
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- `docs/dev/reports/repo_cleanup_targets.txt`
- `docs/dev/reports/roadmap_status_delta.txt`
- `docs/dev/reports/templates_live_usage_inventory.md`
- `docs/dev/reports/templates_policy_decision.md`
- `docs/dev/reports/validation_checklist.txt`
- Any active `docs/pr/*` build/plan spec that references template path policy
- Consumer docs such as `games/vector-arcade-sample/README.md` if provenance path changes

## F) Blocking Failure Conditions
Stop migration execution if any of the following occur:
- unresolved `templates/` references remain without explicit path-map coverage;
- runtime helper paths are rewritten without synchronized tests;
- tests/smoke regress after path changes;
- docs/contracts are out of sync with actual template location;
- `templates/` was moved/deleted without validated rollback and evidence report;
- unrelated cleanup targets are mixed into the same migration lane.

## Guard Summary
No future `templates/` cleanup lane should execute structural changes unless all reference scans, test/smoke checks, and doc-sync requirements pass as a single exact-scope bundle.
