# Runtime Manifest Parser Slice

PR: PR_26152_169-runtime-manifest-parser-slice
Date: 2026-06-02

## Scope

- Added first manifest runtime parser slice in `src`.
- Parsed only minimum manifest fields required for runtime bootstrap planning.
- Rejected invalid payloads visibly through structured error codes.
- Added no game runtime launch.
- Added no sample work.

## Files

- `src/engine/runtime/manifestRuntimeParser.js`
- `tests/engine/ManifestRuntimeParser.test.mjs`

## Behavior

The parser validates and normalizes:

- `schema`
- `version`
- `game.id`
- `game.name`
- `game.folder`
- `launch.directPath`
- optional `launch.workspaceManagerPath`
- optional `launch.workspaceManagerOptional`
- optional `screen.width`
- optional `screen.height`
- optional `tools`
- optional `objects`
- optional `rules`

Invalid input returns `valid: false`, `manifest: null`, and explicit error records. The slice does not launch a game, render, read samples, execute rules, instantiate runtime objects, process input, or run physics.

## Validation

Commands:

```powershell
node --check src/engine/runtime/manifestRuntimeParser.js
node tests/engine/ManifestRuntimeParser.test.mjs
```

Result: PASS.

## PASS/FAIL/WARN/SKIP

| Status | Item |
| --- | --- |
| PASS | Parser syntax check passed. |
| PASS | Valid manifest payload parses minimum bootstrap fields. |
| PASS | Invalid payloads reject visibly with structured errors. |
| PASS | Parser clones returned manifest data instead of exposing mutable source payload. |
| SKIP | Game launch, rendering, input, physics, and samples. |

## Lanes Executed

- engine - targeted parser validation.
- runtime - parser-only runtime data validation.

## Lanes Skipped

- integration - no ProjectWorkspace handoff behavior changed.
- samples - permanently out of scope.
- recovery/UAT - no recovery behavior changed.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope.

## Playwright

Playwright impacted: No. This PR adds parser-only Node validation.

## Blocker Scope

No blocker for the parser slice.
