# BUILD PR — Repo Structure Move Map (Shared ↔ Tools Boundary)

## Purpose
Enforce boundary between src/shared and tools by moving pure utility logic out of tools into shared.

## Exact Target Files
- tools/** files that contain reusable, non-UI logic (identified during execution)
- src/shared/** destination only (no new structure invention)

## Required Code Changes
- MOVE qualifying utility code from tools → src/shared
- UPDATE imports for moved files only

## Constraints
- ONLY move files that are:
  - pure logic
  - not UI-bound
- DO NOT refactor code
- DO NOT change behavior
- DO NOT scan entire repo — operate only on clearly identified files

## Acceptance Criteria
- no shared logic remains incorrectly inside tools
- moved files resolve correctly
- imports updated and working
