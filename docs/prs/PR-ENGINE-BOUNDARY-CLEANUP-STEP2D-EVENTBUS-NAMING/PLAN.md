Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Engine Boundary Cleanup Step 2D: EventBus Naming + Ownership

## Goal
Normalize EventBus import/file casing and preserve explicit engine-owned injected ownership.

## In Scope
- `engine/events/EventBus.js`
- all direct EventBus import paths/usages
- focused tests/validation for import casing or portability
- `tests/run-tests.mjs` only if required

## Out of Scope
- timing composition changes
- fullscreen cleanup
- canvas ownership cleanup
- metrics cleanup
- gameplay changes
- event system redesign

## Required Changes

### 1. Normalize casing
Ensure repo usage consistently references:
- `engine/events/EventBus.js`

Remove any casing drift that only works on case-insensitive filesystems.

### 2. Preserve ownership
Keep EventBus as:
- engine-owned
- injectable
- instance-based

Do not introduce:
- process-global singleton behavior
- unrelated event system redesign

### 3. Preserve behavior
Current EventBus semantics must remain unchanged.

### 4. Validation
Add focused validation or tests that help prevent casing drift or portability regressions where practical.

## Acceptance Criteria
- EventBus casing is normalized across repo usage
- cross-platform portability risk is reduced or removed
- EventBus ownership remains explicit and instance-based
- no unrelated subsystems are changed
