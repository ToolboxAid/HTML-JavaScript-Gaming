Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Engine Boundary Cleanup Step 2B: Fullscreen Injection

## Goal
Tighten fullscreen ownership so the engine composes with an explicitly provided fullscreen dependency rather than relying on hidden browser defaults in production call sites.

## In Scope
- `engine/core/Engine.js`
- `engine/runtime/FullscreenService.js`
- `tests/engine/` fullscreen-focused coverage
- `tests/run-tests.mjs` only if required

## Out of Scope
- timing composition changes
- canvas ownership cleanup
- event bus casing cleanup
- metrics cleanup
- gameplay changes
- scene lifecycle redesign

## Required Changes

### 1. Explicit fullscreen composition
Refactor `Engine` construction/composition so fullscreen ownership is explicit at the engine boundary.
Avoid production call paths that depend on `FullscreenService` silently reaching for `globalThis.document`.

### 2. Preserve browser behavior
The browser/runtime behavior must remain unchanged for normal usage:
- fullscreen still attaches correctly
- fullscreen still detaches correctly
- fullscreen still reacts to browser fullscreen changes correctly

### 3. Keep service shape narrow
Do not broaden fullscreen responsibilities in this PR.
This is an injection/ownership cleanup, not a fullscreen feature expansion.

### 4. Test coverage
Add focused engine-level tests that prove:
- `Engine` can compose with an injected fullscreen service or fullscreen double
- attach/detach behavior is exercised
- browser-default dependency is not required for engine-level tests

## Acceptance Criteria
- `Engine` no longer depends on implicit fullscreen browser globals in its production construction path
- fullscreen behavior remains stable in browser use
- focused engine-level fullscreen composition tests are present
- no unrelated subsystems are changed
