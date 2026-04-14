# BUILD_PR — LEVEL 08.06 BOUNDARY ENFORCEMENT

## Purpose
Lock Phase 08 by enforcing consistent boundaries across all games.

## Scope
- Validation rules only (no code changes)
- Applies to all games/*

## Enforcement Rules
- flow/, game/, rules/ must exist
- rules contains all shared constants
- no duplication between flow and game
- no cross-game imports

## Acceptance Criteria
- violations detectable via static scan
- no inference-based completion

## Out of Scope
- engine changes
- launcher/index.html
