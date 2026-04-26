# BUILD_PR_LEVEL_8_33_LEGACY_CATALOG_PARITY_AND_REMOVAL

## Objective
Eliminate duplicate/legacy manifest sources where safe.

## Targets
- games/*/assets/workspace.asset-catalog.json
- games/*/assets/tools.manifest.json

## Required Steps

### 1. Parity Check
For each game:
- compare contents of legacy catalogs with game.manifest.json
- ensure all referenced assets exist in game.manifest.json

### 2. Safe Removal Rule
Delete legacy catalog ONLY IF:
- no runtime reference
- no missing asset after removal
- no tool dependency

### 3. If NOT Safe
- retain file
- mark as legacy in report

## Report
Create:
docs/dev/reports/level_8_33_legacy_catalog_parity_report.md

Include:
- per-game parity status
- deleted files
- retained files
- reasons for retention

## Roadmap
Update status only:
- advance legacy catalog cleanup [ ] -> [.]
- or [.] -> [x]

## Acceptance
- no broken game launch
- only safe deletions performed
- all removals documented
