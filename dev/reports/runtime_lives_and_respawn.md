# Runtime Lives And Respawn

PR: PR_26152_216-runtime-lives-and-respawn
Date: 2026-06-03

## Scope

- Added lives and respawn processing.
- Kept life records and respawn rules manifest-driven.
- Required explicit respawn rules and locations.
- Avoided hard-coded spawn points.

## Validation

Command:

```powershell
node tests/engine/RuntimeLivesAndRespawn.test.mjs
```

Result: PASS.

## Lane Status

| Area | Status | Notes |
| --- | --- | --- |
| Lives | PASS | Death events decrement lives through explicit life records. |
| Respawn | PASS | Respawn uses manifest-defined scene and position. |
| Terminal state | PASS | Zero-life records become terminal without hidden respawn. |
| Invalid rules | PASS | Missing respawn location rejects visibly. |
| Samples | SKIP | Permanently out of scope. |
| Tools | SKIP | Out of scope. |

## Lanes Executed

- engine - runtime lives and respawn validation.
- runtime - manifest-driven life/respawn processing only.

## Lanes Skipped

- samples - permanently out of scope.
- tools - out of scope.
- browser Playwright - not part of this headless engine validation.

## Playwright

Playwright impacted: No browser/tool UI impact. This PR validates a headless engine runtime slice through targeted Node tests.

## Manual Validation

Review `src/engine/runtime/runtimeLivesAndRespawn.js` and `tests/engine/RuntimeLivesAndRespawn.test.mjs` to confirm respawn behavior uses only explicit manifest-owned rules.

## Blocker Scope

No blocker for the runtime lives and respawn lane.
