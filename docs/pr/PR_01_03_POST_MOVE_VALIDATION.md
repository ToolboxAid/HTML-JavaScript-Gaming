# PR_01_03_POST_MOVE_VALIDATION

## Purpose
Lock repo-structure normalization by validating the applied move map and confirming there is no post-move drift.

## Scope
- validation only
- no structural changes unless required to fix a validation-detected broken reference
- no engine/game/tool logic refactors

## Inputs
- docs/reference/features/docs-system/move-history-preserved.md
- docs/reports/validation_checklist.txt

## Required Work
1. Re-run post-move validation across moved structure.
2. Confirm imports/paths resolve after the applied moves.
3. Confirm no orphaned old-path references remain in the moved scope.
4. Confirm sample navigation is still intact.
5. Confirm no duplicate destination/source folders remain where the move map intended consolidation.
6. Produce final validation artifacts.

## Deliverables
- docs/reports/file_tree_snapshot.txt
- docs/reports/validation_results.txt
- docs/reports/orphan_scan.txt

## Validation
- move-map targets exist as expected
- no unresolved imports in moved scope
- no unresolved live sample links
- no orphaned old-path references in moved scope
- runtime harness phase matcher remains intact

## Output
<project folder>/tmp/PR_01_03_POST_MOVE_VALIDATION.zip
