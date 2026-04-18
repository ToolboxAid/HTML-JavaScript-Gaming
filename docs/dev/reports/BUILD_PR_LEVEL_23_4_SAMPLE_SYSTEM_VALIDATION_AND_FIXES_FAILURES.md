# BUILD_PR_LEVEL_23_4_SAMPLE_SYSTEM_VALIDATION_AND_FIXES — Failures

## Failure F-001 (Validated)
- Surface: sample runtime contract alignment (Node execution path)
- Command: `node ./tests/games/GravityValidation.test.mjs`
- Status: FAIL (pre-fix)
- Error:
  - `Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\src\engine\scene\index.js' imported from ...\samples\phase-03\0325\game\GravityScene.js`
- Root cause:
  - Sample `0325` used browser-root absolute `/src/...` module imports, which resolve to an invalid filesystem root in Node validation execution.

## Non-failing Validation Surfaces (pre-fix)
- Sample inventory/index alignment: PASS
  - `missingLinkCount=0`
- Sample discovery + launch smoke: PASS
  - `node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples`
  - `PASS=242 FAIL=0 TOTAL=242`
- Sample structural/contract metadata checks: PASS
  - `node --input-type=module -e "import { run } from './tests/samples/SamplesProgramCombinedPass.test.mjs'; run(); ..."`

## Failure Scope Decision
Only F-001 was fixed in this PR. No speculative or unrelated changes were applied.
