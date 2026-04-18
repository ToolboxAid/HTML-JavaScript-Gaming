# PR_03_03_SHARED_SELECTORS_CONTRACTS

## Purpose
Standardize shared selector usage and confirm state contract boundaries without changing behavior.

## Scope
- selector and contract consolidation only
- no logic changes
- no behavior changes
- no non-selector helper extraction

## Target Areas
- src/shared/state/
- public selector/read boundary surfaces

## Required Work
1. Inventory active selector variants and contract surfaces duplicated or inconsistently named in this PR scope.
2. Build an exact standardization map for selectors and contract readers.
3. Consolidate consumers in scope onto the standardized shared selector/contract surfaces.
4. Remove only obsolete duplicate selector/contract implementations made unnecessary by this consolidation.
5. Keep changes surgical and execution-backed.

## Candidate Focus
- getState
- getSimulationState
- getReplayState
- getEditorState
- public selector/read boundaries

## Constraints
- no broad repo scan beyond selector/contract consumers needed for this PR
- no number/string/id helper work in this PR
- no engine logic refactors
- no sample/game/tool behavior changes
- preserve public contracts

## Deliverables
- docs/reports/selector_usage_scan.txt
- docs/reports/contract_map.txt
- docs/reports/validation_checklist.txt

## Validation
- shared selector/contract surfaces are canonical for this PR scope
- consumers in scope resolve to standardized shared selector/contract surfaces
- no duplicate selector variants remain in moved scope
- impacted tests/smoke pass

## Output
<project folder>/tmp/PR_03_03_SHARED_SELECTORS_CONTRACTS.zip
