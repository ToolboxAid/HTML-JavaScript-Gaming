# BUILD_PR_LEVEL_11_141_CLOSE_CURRENT_DIRECT_JSON_ROUTE

## Purpose
Close the current direct-JSON route without expanding into repo-wide fallback cleanup.

## Context
Repo-wide fallback debt is large:
- 610 `*fallback*` matches
- 133 files

Do NOT address repo-wide fallback cleanup in this PR.

## STRICT SCOPE

ALLOWED FILES:
- toolHostRuntime.js
- docs/dev/reports/current_route_closeout_11_141.txt

ALLOWED CHANGES:
- verify minimal runtime input path from PR 11.140
- remove only direct route violations in toolHostRuntime.js if present
- document current route status

## Current Route Definition

The current route is:

payloadJson -> tool schema validation -> tool render/error

Optional palette route:

paletteJson -> palette schema validation -> tool render/error

Runtime only performs minimal type checks:
- payloadJson is a plain object
- paletteJson is null or a plain object

Runtime must NOT:
- detect wrappers
- detect parent JSON
- scan for fallback keys
- scan for implicit/global keys
- fingerprint/mutation scan
- normalize
- transform
- convert
- repair

## Required Verification

Codex must verify in `toolHostRuntime.js`:

1. `validateInput` is minimal.
2. No wrapper detection helpers remain.
3. No parent JSON detection helpers remain.
4. No fallback scan helpers remain.
5. Launch still passes:
   - `payloadJson`
   - `paletteJson`
6. No repo-wide fallback cleanup is attempted.

## Important

Do not search/fix all 610 fallback matches.

Only check this route file and report the known debt as out of scope.

## Validation

Run targeted validation only:
- syntax check `toolHostRuntime.js`
- report final route status

## Reports

Codex must write:

- `docs/dev/reports/current_route_closeout_11_141.txt`

Report must include:
- changed files
- confirmation scope respected
- final `validateInput` summary
- note that repo-wide fallback cleanup is intentionally deferred

## Acceptance

- current route is complete
- runtime validation is minimal
- schema remains authority
- no repo-wide cleanup attempted
