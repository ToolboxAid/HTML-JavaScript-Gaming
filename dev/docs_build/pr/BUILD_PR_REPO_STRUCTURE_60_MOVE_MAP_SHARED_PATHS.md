# BUILD PR — Repo Structure Move Map (Shared Paths)

## Purpose
Normalize remaining shared import paths to align with the canonical structure.

## Exact Target Files
- files that currently reference incorrect shared paths

## Required Code Changes
- replace any remaining:
  shared/... → src/shared/...

## Constraints
- ONLY modify files that already contain incorrect paths
- DO NOT scan broadly
- DO NOT move files
- DO NOT refactor code
- DO NOT change logic

## Acceptance Criteria
- no incorrect shared path imports remain in touched files
- imports resolve correctly
