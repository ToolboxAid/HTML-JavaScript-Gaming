# BUILD_PR_LEVEL_18_15_TRACK_F_DOCS_SYSTEM_CLASSIFICATION_FOUNDATION

## Purpose
Execute a docs-first Track F foundation slice that classifies the current `docs/` tree into explicit non-overlapping buckets and prepares a move map proposal for later cleanup PRs.

## Scope
- scan `docs/` tree only
- generate inventory/classification/rules/move-map reports
- no code changes
- no doc deletions
- no `start_of_day` modifications
- status-only roadmap transitions only when execution-backed

## Required Outputs
- `docs/reports/docs_inventory_tree.txt`
- `docs/reports/docs_classification_matrix.md`
- `docs/reports/docs_bucket_rules.md`
- `docs/reports/docs_move_map_proposed.md`
- `docs/reports/BUILD_PR_LEVEL_18_15_TRACK_F_DOCS_SYSTEM_CLASSIFICATION_FOUNDATION_VALIDATION.md`

## Roadmap Status Rules
Allowed transitions in this PR only:
- Track F docs-system cleanup marker: `[ ] -> [.]`
- `classify all docs into buckets`: `[ ] -> [x]`

No other roadmap text rewrites or status jumps are permitted.

## Acceptance
- every file under `docs/` is bucket-classified
- bucket rules are explicit and non-overlapping
- move map is proposal-only (no deletions)
- roadmap transitions are status-only and execution-backed
