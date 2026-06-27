# Runtime Rule Definition Reader

PR: PR_26152_171-runtime-rule-definition-reader
Date: 2026-06-02

## Scope

- Added rule definition reader slice in `src`.
- Read manifest rule definitions only.
- Validated rule names against the approved rule registry baseline.
- Did not execute rules.
- Added no sample work.

## Files

- `src/engine/runtime/ruleDefinitionReader.js`
- `tests/engine/RuleDefinitionReader.test.mjs`

## Approved Rule Types

- `movement`
- `bounce`
- `gravity`
- `health`
- `damage`
- `collision`
- `spawn`
- `despawn`
- `scoring`
- `cooldown`

## Behavior

The reader accepts manifest rule definitions from an object map or array, validates `ruleId`, validates `ruleType`, validates optional `targets`, and returns read-only definition records. It does not execute rules, attach rules to runtime objects, process physics, process input, render, or mutate game state.

## Validation

Commands:

```powershell
node --check src/engine/runtime/ruleDefinitionReader.js
node tests/engine/RuleDefinitionReader.test.mjs
```

Result: PASS.

## PASS/FAIL/WARN/SKIP

| Status | Item |
| --- | --- |
| PASS | Reader syntax check passed. |
| PASS | All approved rule type names validate. |
| PASS | Invalid rule root, missing rule id, invalid rule type, and invalid targets reject visibly. |
| PASS | Reader does not execute rules or create runtime execution state. |
| SKIP | Rule interpreter, rendering, input, physics, game launch, and samples. |

## Lanes Executed

- engine - targeted rule definition reader validation.
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

No blocker for the rule definition reader slice.
