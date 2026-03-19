PR-011 — engine/game usage-based risk tiering build

### Purpose

This BUILD_PR records a docs-only risk-tiering of the compatibility-retained `engine/game`
exports using the verified caller evidence captured in PR-010.

### Verified Baseline

This build uses:
- the PR-008 compatibility-retained export baseline
- the PR-010 verified caller scan results

### What This BUILD_PR Does

- assigns a usage-risk tier to each compatibility-retained export
- records concise rationale grounded in verified caller evidence
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
