# PLAN PR — Shared Extraction Preparation

## Purpose
Prepare exact, surgical extraction of duplicated helpers into `src/shared/`.

## Scope
- Identify duplicate helpers across:
  - samples/
  - tools/
  - src/
- Classify into target buckets:
  - numbers/
  - objects/
  - arrays/
  - strings/
  - state/
- Define exact move targets (no execution yet)

## Constraints
- No code changes
- No file moves yet
- No refactors
- No API changes

## Output
- exact file list for next BUILD PR
