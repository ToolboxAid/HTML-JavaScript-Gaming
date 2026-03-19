PR-010 - engine/game verified caller scan execution build

### Purpose

This BUILD_PR records the executed, verified caller scan for compatibility-retained
`engine/game` exports.

### Current Status

Execution completed against local repo files on 2026-03-19.

### What This BUILD_PR Does

- records verified caller references for the requested compatibility-retained exports
- records export name, caller file, caller category, and reference type
- keeps notes factual and evidence-based
- preserves compatibility and remains docs-only

### Output Artifact

- `docs/prs/PR-010-engine-game-verified-caller-scan-execution/VERIFIED_CALLER_RESULTS.md`

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not remove exports
