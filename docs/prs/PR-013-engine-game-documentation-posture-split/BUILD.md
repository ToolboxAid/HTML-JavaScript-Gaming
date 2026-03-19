PR-013 — engine/game documentation posture split build

### Purpose

This BUILD_PR records a docs-only documentation-posture split for the compatibility-retained
`engine/game` exports identified in PR-012.

### Verified Baseline

This build uses:
- the PR-012 split between actively supported compatibility surfaces and transition-planning candidates
- the previously documented usage and risk evidence

### What This BUILD_PR Does

- assigns a documentation posture to each compatibility-retained export
- records concise rationale for each posture
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
