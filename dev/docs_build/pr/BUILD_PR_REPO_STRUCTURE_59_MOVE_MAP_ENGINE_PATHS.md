# BUILD PR — Repo Structure Move Map (Engine Paths)

## Purpose
Continue repo structure normalization using exact move-map execution only.
This PR focuses strictly on correcting remaining engine import paths.

## Exact Target Files
- files still referencing incorrect engine path (Codex must ONLY update existing imports)
- no file moves in this PR

## Required Code Changes
- replace any remaining:
  engine/... → src/engine/...

## Constraints
- DO NOT scan entire repo blindly
- only modify files that already contain incorrect paths
- DO NOT move files
- DO NOT refactor code
- DO NOT change logic

## Acceptance Criteria
- no remaining incorrect engine path imports in touched files
- no new paths introduced
