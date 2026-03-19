PR-006 - engine/game repo export scan execution build

### Purpose

This BUILD_PR records the executed factual scan of the `engine/game` module entry files
and captures the real export surface from this repo.

### Current Status

Execution completed against local repo files on 2026-03-19.

### What This BUILD_PR Does

- records the factual export scan output for `engine/game`
- captures export names exactly as exposed
- records defining files and re-export files where applicable
- marks direct exports versus re-exports
- preserves compatibility and keeps scope docs-only

### Output Artifact

- `docs/prs/PR-006-engine-game-repo-export-scan-execution/EXPORT_SCAN_RESULTS.md`

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not remove exports
