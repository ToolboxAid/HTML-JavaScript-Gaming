PR-020 — engine/game first runtime-neutral code patch build

### Purpose

This BUILD_PR records the docs-only specification for the first runtime-neutral `engine/game` code patch.

### Verified Baseline

This build uses:
- the PR-018 first-code-PR guardrails
- the PR-019 first-code-PR alignment plan
- the completed docs-first architecture and compatibility groundwork

### What This BUILD_PR Does

- defines the exact file-level patch contents for the first code PR
- defines the intended runtime-neutral comment insertions
- defines per-file patch purpose and review notes
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
