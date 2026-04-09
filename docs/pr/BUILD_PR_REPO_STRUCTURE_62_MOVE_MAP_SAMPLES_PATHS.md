# BUILD PR — Repo Structure Move Map (Samples Paths)

## Purpose
Normalize remaining samples import paths to align with canonical structure.

## Exact Target Files
- files that currently reference incorrect samples paths

## Required Code Changes
- replace any remaining incorrect sample paths such as:
  samples/... → samples/... (correct relative vs root alignment)

## Constraints
- ONLY modify files that already contain incorrect paths
- DO NOT scan broadly
- DO NOT move files
- DO NOT refactor code
- DO NOT change logic

## Acceptance Criteria
- no incorrect sample path imports remain in touched files
- imports resolve correctly
