# PR_26140_064 Deep Normalize Shared Method Domains

## Summary
- Moved JSON read/write helpers from `src/shared/io/jsonIO.js` to `src/shared/json/jsonIO.js`.
- Moved shared record/object normalization into `src/shared/object/objects.js`.
- Moved shared array normalization into `src/shared/array/arrays.js` and record-array normalization into `src/shared/array/recordArrays.js`.
- Moved `isRecord` consumers to the object domain and `isNonEmptyString` to the string domain.
- Removed unused pass-through shared files for `src/shared/index.js`, `src/shared/io/index.js`, `src/shared/data/index.js`, `src/shared/data/normalization.js`, and `src/shared/types/index.js`.

## Domain Audit Decisions
- `safeJsonParse`, `safeJsonStringify`, `cloneJsonData`: JSON serialization/deserialization helpers; canonical file is now `src/shared/json/jsonIO.js`.
- `normalizeRecord`: object/record coercion helper; canonical file is now `src/shared/object/objects.js`.
- `normalizeArray`: array coercion helper; canonical file is now `src/shared/array/arrays.js`.
- `normalizeRecordArray`: array-of-records helper; canonical file is now `src/shared/array/recordArrays.js`.
- `isRecord`: object/record predicate; canonical file is now `src/shared/object/objects.js`.
- `isNonEmptyString`: string predicate; canonical file is now `src/shared/string/strings.js`.
- `isFunction` and `isBoolean`: retained in `src/shared/types/typeGuards.js` because they are primitive type predicates and not array/object/string/json methods.
- Existing state, contract, debug, game, runtime, validation, math, number, id, and geometry methods were reviewed and left in their current domain folders where the file domain already matched the exported behavior.

## Guardrail Checks
- `src/shared/io/jsonIO.js` no longer exists.
- `src/shared/data/normalization.js` no longer exists, so array methods do not remain there.
- No active imports or references remain for moved `shared/io`, `shared/data`, root `shared/index`, or `types/index` paths outside excluded historical/report areas.
- No root-level shared pass-through export file remains at `src/shared/index.js`.
- No `../` export chains exist under `src/shared/**/*.js`.
- No sample JSON files were modified.

## Validation
- PASS: targeted syntax validation for 14 changed JavaScript files, including untracked files.
- PASS: targeted import-target validation for 14 changed JavaScript files, including untracked files.
- PASS: `npm run test:workspace-v2` with 59 passed.
- PASS: stale moved-path scan for active JavaScript.
- PASS: `git diff --check` completed with only Git CRLF normalization warnings for existing files.

## Coverage Guardrail
- Playwright generated the existing advisory V8 coverage report. Missing/low coverage entries remain WARN-only per project instructions.

## Full Samples Smoke Test
- Skipped. This PR only changes shared import/domain placement and the requested validation covered syntax/import correctness plus Workspace V2 behavior.

## Manual Validation
1. Review `docs/dev/reports/codex_review.diff` for the shared domain moves and import updates.
2. Confirm `src/shared/json/jsonIO.js`, `src/shared/object/objects.js`, and `src/shared/array/recordArrays.js` are the canonical locations for the moved methods.
3. Confirm Workspace Manager V2 still launches and runs through the tested tool flows.
