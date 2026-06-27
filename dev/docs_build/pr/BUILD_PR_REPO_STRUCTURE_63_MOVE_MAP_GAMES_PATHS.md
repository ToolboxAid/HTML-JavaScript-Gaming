# BUILD PR — Repo Structure Move Map (Games Paths)

## Purpose
Normalize remaining games import paths to align with canonical structure.

## Exact Target Files
- files that currently reference incorrect games paths

## Required Code Changes
- replace any remaining incorrect game paths such as:
  games/... → games/... (correct relative vs root alignment)

## Constraints
- ONLY modify files that already contain incorrect paths
- DO NOT scan broadly
- DO NOT move files
- DO NOT refactor code
- DO NOT change logic

## Acceptance Criteria
- no incorrect game path imports remain in touched files
- imports resolve correctly
