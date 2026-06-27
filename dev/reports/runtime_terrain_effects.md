# Runtime Terrain Effects

PR: PR_26152_191-runtime-terrain-effects
Date: 2026-06-02

## Scope

- Applied terrain effects such as slide, drag, friction, and surface damage.
- Terrain effects remain terrain/material owned.
- No samples or rendering behavior added.

## Validation

Command:

```powershell
node tests/engine/RuntimeTerrainEffects.test.mjs
```

Result: PASS.

## Lanes Executed

- engine - terrain effect processing validation.
- runtime - terrain/material effects only.

## Lanes Skipped

- samples - permanently out of scope.
- environment effects, input, collision, and rendering - handled separately.

## Playwright

Playwright impacted: No browser/tool UI impact. This is headless engine terrain effect validation through targeted Node tests.

## Manual Validation

Review the test to confirm ice changes velocity and lava reduces health through terrain material ownership.

## Blocker Scope

No blocker for runtime terrain effects.
