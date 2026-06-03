# BUILD PR — Repo Structure Move Map (Tools Paths)

## Purpose
Normalize remaining tools import paths to align with canonical structure.

## Exact Target Files
- files that currently reference incorrect tools paths

## Required Code Changes
- replace any remaining:
  tools/... → tools/... (correct root alignment if mis-referenced, e.g., ./tools vs tools/)

## Constraints
- ONLY modify files that already contain incorrect paths
- DO NOT scan broadly
- DO NOT move files
- DO NOT refactor code
- DO NOT change logic

## Acceptance Criteria
- no incorrect tools path imports remain in touched files
- imports resolve correctly
