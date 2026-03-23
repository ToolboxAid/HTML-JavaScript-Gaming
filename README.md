Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Engine Boundary Cleanup Step 2B (Fullscreen Injection)

## Purpose
Implement the second Step 2 follow-up from the approved static-global audit.

## Goal
Remove reliance on implicit browser globals in fullscreen composition and make fullscreen ownership explicit at the engine boundary.

## Scope
- `engine/core/Engine.js`
- `engine/runtime/FullscreenService.js`
- focused engine-level fullscreen composition tests
- `tests/run-tests.mjs` only if required

## Constraints
- No gameplay changes
- No timing changes
- No CanvasSurface work in this PR
- No EventBus casing work in this PR
- No metrics composition work in this PR
- Preserve current fullscreen behavior in browser

## Expected Outcome
- Engine no longer relies on `FullscreenService` implicit `globalThis.document` behavior from production construction paths
- fullscreen composition is explicit and testable
- focused tests prove attach/detach behavior with injected fullscreen doubles
