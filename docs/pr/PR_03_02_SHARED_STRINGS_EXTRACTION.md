# PR_03_02_SHARED_STRINGS_EXTRACTION

## Purpose
Normalize duplicated string helper usage into the shared layer.

## Scope
- string helper consolidation only
- no behavior changes
- no API changes
- no non-string helper extraction

## Target Layer
- src/shared/utils/

## Required Work
1. Inventory active string helpers duplicated across the repo within this PR scope.
2. Build an exact extraction map for string helpers moving to or standardizing on `src/shared/utils/`.
3. Consolidate existing consumers onto shared string helpers.
4. Remove only the duplicated local string helper implementations made obsolete by this consolidation.
5. Keep changes surgical and execution-backed.

## Candidate Focus
- normalizeString
- safeTrim
- toLowerSafe
- stringCompare

## Constraints
- no broad repo scan beyond string-helper consumers needed for this PR
- no number/id/object helper work in this PR
- no engine logic refactors
- no sample/game/tool behavior changes
- preserve public contracts

## Deliverables
- docs/reports/string_usage_scan.txt
- docs/reports/extraction_map.txt
- docs/reports/validation_checklist.txt

## Validation
- shared string helpers are canonical for this PR scope
- consumers in scope resolve to shared string helpers
- no duplicate string helper remains in moved scope
- tests/smoke in impacted scope pass

## Output
<project folder>/tmp/PR_03_02_SHARED_STRINGS_EXTRACTION.zip
