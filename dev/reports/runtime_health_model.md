# Runtime Health Model

PR: PR_26152_214-runtime-health-model
Date: 2026-06-03

## Scope

- Added a manifest-driven runtime health model.
- Supported health, maxHealth, invulnerability windows, and alive/dead state.
- Rejected invalid or inconsistent health records without hidden defaults.
- Avoided game-specific health logic.

## Validation

Command:

```powershell
node tests/engine/RuntimeHealthModel.test.mjs
```

Result: PASS.

## Lane Status

| Area | Status | Notes |
| --- | --- | --- |
| Health records | PASS | Explicit manifest-owned health records validate. |
| Invulnerability | PASS | Invulnerability windows derive from explicit current time and record data. |
| Alive/dead state | PASS | Inconsistent alive/dead state rejects visibly. |
| Samples | SKIP | Permanently out of scope. |
| Tools | SKIP | Out of scope. |

## Lanes Executed

- engine - runtime health model validation.
- runtime - manifest-driven health record creation only.

## Lanes Skipped

- samples - permanently out of scope.
- tools - out of scope.
- browser Playwright - not part of this headless engine validation.

## Playwright

Playwright impacted: No browser/tool UI impact. This PR validates a headless engine runtime slice through targeted Node tests.

## Manual Validation

Review `src/engine/runtime/runtimeHealthModel.js` and `tests/engine/RuntimeHealthModel.test.mjs` to confirm health state is explicit and invalid health payloads reject without fallback.

## Blocker Scope

No blocker for the runtime health model lane.
