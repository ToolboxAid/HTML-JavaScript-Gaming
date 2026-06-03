# Engine V2 Chase Flee Behavior

PR: PR_26152_226-engine-v2-chase-flee-behavior
Date: 2026-06-03

## Scope

- Added manifest-driven chase and flee behavior.
- Supported target selectors from manifest config.
- Supported `instanceId` and `tag` selectors.
- Rejected invalid target references visibly.
- Avoided game-specific AI logic.

## Validation

Command:

```powershell
node tests/engine/EngineV2ChaseFleeBehavior.test.mjs
```

Result: PASS.

## Lane Status

| Area | Status | Notes |
| --- | --- | --- |
| Chase | PASS | Chase behavior emits movement toward selected target. |
| Flee | PASS | Flee behavior emits movement away from selected target. |
| Target selectors | PASS | `instanceId` and `tag` selectors resolve from manifest config. |
| Invalid targets | PASS | Missing selector targets reject visibly. |
| Samples | SKIP | Permanently out of scope. |
| Tools | SKIP | Out of scope. |

## Lanes Executed

- engine - Engine V2 chase/flee behavior validation.
- runtime - manifest-driven steering command generation only.

## Lanes Skipped

- samples - permanently out of scope.
- tools - out of scope.
- browser Playwright - not part of this headless engine validation.

## Playwright

Playwright impacted: No browser/tool UI impact. This PR validates a headless Engine V2 runtime slice through targeted Node tests.

## Manual Validation

Review `src/engine/runtime/engineV2ChaseFleeBehavior.js` and `tests/engine/EngineV2ChaseFleeBehavior.test.mjs` to confirm selectors and behavior are manifest-driven and generic.

## Blocker Scope

No blocker for the Engine V2 chase/flee behavior lane.
