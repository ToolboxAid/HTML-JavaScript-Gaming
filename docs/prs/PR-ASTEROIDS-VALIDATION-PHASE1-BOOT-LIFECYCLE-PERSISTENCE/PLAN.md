Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Asteroids Validation Phase 1: Boot + Lifecycle + Persistence

## Goal
Use `games/Asteroids/` as the first serious post-stabilization proving ground by validating browser boot, scene lifecycle flow, fullscreen affordance, and persistence/snapshot behavior.

## In Scope
- `games/Asteroids/`
- focused tests under `tests/games/` and/or `tests/engine/` only as needed for validation
- minimal engine/runtime adjustments only if strictly required by the validation findings
- `tests/run-tests.mjs` only if required

## Out of Scope
- reusable logic promotion into `engine/`
- broad refactors
- sample consolidation
- UI redesign
- gameplay expansion/tuning unrelated to validation targets

## Required Validation Targets

### 1. Browser boot readiness
Validate the Asteroids browser entry path for:
- startup without missing browser assumptions
- fullscreen affordance / click-to-enter behavior where applicable
- font/readiness or boot sequencing issues if present
- stable initial scene/game state after boot

### 2. Scene lifecycle through real flow
Validate lifecycle behavior across:
- menu -> play
- play -> pause
- pause -> resume
- play -> game over
- game over -> restart or return path

The goal is to prove the recent lifecycle stabilization work under real game control flow.

### 3. Persistence / snapshot / player-swap safety
Validate:
- snapshot/state round-trip behavior
- player swap / session continuity safety
- load/restore behavior where present
- no corruption or invalid carryover across transitions

### 4. Fullscreen/browser interaction validation
Validate:
- fullscreen availability assumptions
- entry/click affordance behavior
- no broken state when fullscreen is unavailable or declined

## Allowed Runtime Changes
Only make runtime changes if they are:
- directly revealed by the validation work
- minimal
- tightly scoped to the validated failure
- not promotion/extraction disguised as validation

## Required Tests / Evidence
Add focused automated tests where practical and document any manual validation points that cannot be covered automatically.

Prefer:
- flow validation tests
- boot/lifecycle tests
- persistence round-trip tests
- guarded browser interaction tests

## Acceptance Criteria
- Asteroids boot path is validated
- lifecycle transitions are validated under real game flow
- persistence/snapshot behavior is validated
- fullscreen/browser-entry behavior is validated
- any runtime fixes are minimal and directly justified by validation
- no promotion/extraction work is included
