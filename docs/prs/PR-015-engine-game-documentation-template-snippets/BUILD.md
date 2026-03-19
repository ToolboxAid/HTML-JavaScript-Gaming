PR-015 — engine/game documentation template snippets build

### Purpose

This BUILD_PR records a docs-only reusable snippet framework for the compatibility-retained
`engine/game` exports based on the documentation postures and wording rules established in PR-013 and PR-014.

### Verified Baseline

This build uses:
- the PR-013 documentation posture split
- the PR-014 wording-treatment rules
- the previously documented compatibility, usage, and transition-planning evidence

### What This BUILD_PR Does

- defines reusable documentation snippet templates for each documentation posture
- records placeholder structure for future docs reuse
- provides usage rules for when each snippet type should be used
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
