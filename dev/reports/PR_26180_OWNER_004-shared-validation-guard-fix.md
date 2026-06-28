# PR_26180_OWNER_004-shared-validation-guard-fix

Team: OWNER

Branch: PR_26180_OWNER_004-shared-validation-guard-fix

## Scope

Fix the shared extraction guard regression in `toolbox/messages/messages.js` only.

## Changes

- Imported `isFiniteNumber` from `src/shared/number/numbers.js`.
- Replaced two direct `Number.isFinite(...)` checks in Messages typewriter-speed handling with `isFiniteNumber(...)`.
- Preserved the existing numeric conversion, fallback, and validation behavior.

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `node --check toolbox/messages/messages.js` | PASS | Syntax check passed |
| `node dev/tools/toolbox-dev/checkSharedExtractionGuard.mjs` | PASS | Shared extraction guard passed against baseline |
| `git diff --check` | PASS | No whitespace errors |
| `npm test` | FAIL | Guard passed, then node test runner failed on unrelated missing module `src/engine/combat/Combat.js` imported by `dev/tests/combat/Combat.test.mjs` |

## Shared Guard Result

The original failure is fixed:

- File: `toolbox/messages/messages.js`
- Rule: `inline-helper-clone`
- Match: `rule:number-is-finite-usage`
- Previous unexpected count: 2
- Current guard status: PASS

## NPM Test Blocker

`npm test` passed the `pretest` shared extraction guard, then failed in the node test runner:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'src/engine/combat/Combat.js' imported from dev/tests/combat/Combat.test.mjs
```

This PR does not change combat tests or engine combat files.

## Merge / Baseline Status

- PR merge: BLOCKED by `npm test` failure.
- Baseline commit: NOT CREATED because the requested condition was `If PASS`.

## ZIP

- `dev/workspace/zips/PR_26180_OWNER_004-shared-validation-guard-fix_delta.zip`
