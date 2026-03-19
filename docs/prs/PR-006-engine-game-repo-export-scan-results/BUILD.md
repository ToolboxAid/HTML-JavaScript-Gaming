PR-006 - engine/game repo export scan results build

### Purpose

This BUILD_PR records the verified `engine/game` export surface from the local repo scan.

### Current Status

Verified scan executed against local repo files on 2026-03-19.

### What This BUILD_PR Does

- records exact export names as exposed by `engine/game` entry files
- records defining files and re-export files where applicable
- records direct exports versus re-exports
- records factual compatibility notes only when explicitly visible
- preserves compatibility and remains docs-only

### Output Artifact

- `docs/prs/PR-006-engine-game-repo-export-scan-results/EXPORT_SCAN_RESULTS.md`

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
