PR-007 — engine/game export classification from verified results build

### Purpose

This BUILD_PR records a docs-only classification of the verified `engine/game` exports captured in PR-006.

### Verified Input Baseline

This build uses the verified PR-006 export scan as its factual input baseline:
- 8 direct default exports were recorded under `engine/game`
- no re-export statements were found in the scanned entry files

### What This BUILD_PR Does

- classifies each verified export as public, internal, or transitional
- records concise architecture rationale for each classification
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
