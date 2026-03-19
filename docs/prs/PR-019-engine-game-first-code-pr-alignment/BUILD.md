PR-019 — engine/game first code PR alignment build

### Purpose

This BUILD_PR records the docs-only plan for the first non-docs, runtime-neutral alignment PR for `engine/game`.

### Verified Baseline

This build uses:
- the PR-018 first-code-PR guardrails
- the completed docs-first architecture and compatibility groundwork from PR-002 through PR-017

### What This BUILD_PR Does

- defines the single purpose of the first code PR
- defines the smallest practical file scope for that PR
- defines allowed runtime-neutral alignment changes
- defines review and success criteria
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
