# Runtime Object Default Rejection

PR: PR_26152_176-runtime-object-default-rejection
Date: 2026-06-02

## Scope

- Added default rejection validation for runtime object creation.
- Rejects missing required fields instead of silently defaulting.
- Rejects fallback runtime fields such as position, size, velocity, sprite, behavior, rendering, physics, collision, and default field variants.
- Does not add silent defaults or touch samples.

## Required Fields

- `objectId`
- `objectType`
- `geometryRef`
- `rules`

## Validation

Command:

```powershell
node tests/engine/RuntimeObjectDefaultRejection.test.mjs
```

Result: PASS.

## Lanes Executed

- engine - runtime object creation rejection behavior.
- runtime - default rejection boundary only.

## Lanes Skipped

- rendering - no rendering behavior added.
- input - no input behavior added.
- physics - no physics behavior added.
- rule execution - no rule execution added.
- samples - permanently out of scope.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope.

## Playwright

Playwright impacted: No. This PR validates engine object creation errors through targeted Node tests only.

## Manual Validation

Review `RuntimeObjectDefaultRejection.test.mjs` and confirm missing required fields and fallback runtime fields fail with visible error codes.

## Blocker Scope

No blocker for runtime object default rejection.
