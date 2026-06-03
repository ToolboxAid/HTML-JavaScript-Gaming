# Runtime Object Definition Reader

PR: PR_26152_170-runtime-object-definition-reader
Date: 2026-06-02

## Scope

- Added object definition reader slice in `src`.
- Read manifest object definitions only.
- Validated object type names against the approved object model baseline.
- Did not instantiate runtime objects.
- Added no sample work.

## Files

- `src/engine/runtime/objectDefinitionReader.js`
- `tests/engine/ObjectDefinitionReader.test.mjs`

## Approved Object Types

- `static`
- `dynamic`
- `killable`
- `collectible`
- `trigger`
- `projectile`
- `zone`
- `ui`

## Behavior

The reader accepts manifest object definitions from an object map or array, validates `objectId`, validates `objectType`, validates optional `rules`, and returns read-only definition records. It does not create `entityId`, ECS components, runtime objects, collision state, timers, or render state.

## Validation

Commands:

```powershell
node --check src/engine/runtime/objectDefinitionReader.js
node tests/engine/ObjectDefinitionReader.test.mjs
```

Result: PASS.

## PASS/FAIL/WARN/SKIP

| Status | Item |
| --- | --- |
| PASS | Reader syntax check passed. |
| PASS | All approved object type names validate. |
| PASS | Invalid object root, missing object id, invalid object type, and invalid rule refs reject visibly. |
| PASS | Reader does not instantiate runtime objects or create `entityId`. |
| SKIP | ECS object factory, rendering, input, physics, rule execution, and samples. |

## Lanes Executed

- engine - targeted object definition reader validation.
- runtime - reader-only runtime data validation.

## Lanes Skipped

- integration - no ProjectWorkspace handoff behavior changed.
- samples - permanently out of scope.
- recovery/UAT - no recovery behavior changed.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope.

## Playwright

Playwright impacted: No. This PR adds reader-only Node validation.

## Blocker Scope

No blocker for the object definition reader slice.
