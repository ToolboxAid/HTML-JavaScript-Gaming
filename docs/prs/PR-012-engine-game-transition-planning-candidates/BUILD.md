PR-012 — engine/game transition-planning candidates build

### Purpose

This BUILD_PR records a docs-only split of the compatibility-retained `engine/game`
exports into actively supported compatibility surfaces versus transition-planning candidates.

### Verified Baseline

This build uses:
- the PR-008 compatibility-retained export baseline
- the PR-011 usage-based risk tiers

### What This BUILD_PR Does

- labels each compatibility-retained export as either actively supported or a transition-planning candidate
- records concise rationale grounded in documented risk and usage evidence
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
