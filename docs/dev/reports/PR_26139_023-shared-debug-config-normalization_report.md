# PR_26139_023 Shared Debug Config Normalization Report

## Summary
- Removed the Asteroids-specific debug storage key from `src/shared/utils/debugConfigUtils.js`.
- Added a caller-supplied `storageKey` option to `resolveDebugConfig`.
- Preserved Asteroids debug persistence by passing `toolbox.sample.asteroids.debug.enabled` from Asteroids-specific boot code.
- Wired Breakout to pass its existing Breakout debug storage key instead of depending on shared utility state.
- Audited nearby shared utilities for similar game-specific debug constants; none remain.

## Scope
- Kept changes limited to shared debug config normalization and direct callers of `resolveDebugConfig`.
- Did not change debug query parsing, debug mode defaults, local-development behavior, or dev console wiring.

## Shared Utility Behavior
- `resolveDebugConfig(documentRef, { storageKey })` now reads and writes remembered debug state only when a caller provides `storageKey`.
- Calls without `storageKey` still resolve query/local debug state, but do not persist remembered debug state to a hardcoded key.
- `src/shared/utils/debugConfigUtils.js` no longer contains `Asteroids`, `asteroids`, or `toolbox.sample.asteroids`.

## Validation
- PASS: `npm run build:manifest`
- PASS: `node tests\games\AsteroidsValidation.test.mjs`
- PASS: shared utility import/storage validation with caller-supplied Asteroids key
- PASS: no Asteroids string remains in `src/shared/utils/debugConfigUtils.js`
- PASS: nearby shared utility audit found no game-specific debug storage constants

## Generated Output Cleanup
- `npm run build:manifest` generated `docs/build/sample-manifest.json`.
- Removed `docs/build/` after validation so generated build output is not included in the delta.
