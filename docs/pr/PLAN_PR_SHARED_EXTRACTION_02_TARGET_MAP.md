# PLAN PR — Shared Extraction (02) Target Map

## Purpose
Prepare the exact target-file map required for the first real helper-move BUILD.

## Why this exists
A BUILD cannot be vague. Before moving helpers into `src/shared`, the next bundle must name:
- exact source files
- exact destination files
- exact non-goals
- exact validation

## Candidate helper buckets already identified
### Numbers
- asFiniteNumber
- asPositiveInteger

### Objects
- isPlainObject

### State / Naming review
- getState
- getSimulationState
- getReplayState
- getEditorState

## Required output of the next mapping pass
1. Exact file list containing each duplicate helper
2. Canonical destination under:
   - src/shared/utils/numbers/
   - src/shared/utils/objects/
   - src/shared/state/
3. Rename decisions for ambiguous helpers
4. Keep-local decisions for sample/tool-only helpers
5. Validation plan for the first move PR

## Non-Goals
- No code changes
- No file moves
- No API changes
- No Codex execution
