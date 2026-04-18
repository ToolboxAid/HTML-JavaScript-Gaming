# PR_03_01_SHARED_NUMBERS_NORMALIZATION

## Purpose
Normalize duplicated numeric helper usage into the shared math layer.

## Scope
- numeric helper consolidation only
- no behavior changes
- no API changes
- no non-numeric helper extraction

## Target Layer
- src/shared/math/

## Required Work
1. Inventory active numeric helpers currently duplicated across repo scope relevant to this PR.
2. Build an exact extraction map for numeric helpers moving to or standardizing on `src/shared/math/`.
3. Consolidate existing consumers onto shared numeric helpers.
4. Remove only the duplicated local numeric helper implementations made obsolete by this consolidation.
5. Keep changes surgical and execution-backed.

## Candidate Focus
- asFiniteNumber
- asPositiveInteger
- toFiniteNumber
- roundNumber

## Constraints
- no broad repo scan beyond numeric-helper consumers needed for this PR
- no string/id/object helper work in this PR
- no engine logic refactors
- no sample/game/tool behavior changes
- preserve public contracts

## Deliverables
- docs/reports/number_usage_scan.txt
- docs/reports/extraction_map.txt
- docs/reports/validation_checklist.txt

## Validation
- shared numeric helpers are canonical for this PR scope
- consumers in scope resolve to shared math helpers
- no duplicate numeric helper remains in moved scope
- tests/smoke in impacted scope pass

## Output
<project folder>/tmp/PR_03_01_SHARED_NUMBERS_NORMALIZATION.zip
