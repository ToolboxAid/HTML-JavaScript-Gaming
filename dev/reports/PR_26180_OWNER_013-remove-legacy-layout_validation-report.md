# PR_26180_OWNER_013-remove-legacy-layout Validation Report

Generated: 2026-06-28T23:33:01.682Z

## Commands

| Command | Result |
|---|---|
| git diff --check | PASS |
| npm run validate:canonical-structure | PASS |
| npm run validate:platform | PASS |
| targeted legacy-path scan | PASS |
| node --test dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs dev/tests/runtime/V2ToolLaunch.test.mjs dev/tests/shared/ContractIndexValidation.test.mjs dev/tests/dev-runtime/AdminNotesBoundary.test.mjs dev/tests/tools/ToolManifestBoundary.test.mjs dev/tests/production/TestsValidationCombinedPass.test.mjs dev/tests/shared/ContractFixtureIsolationValidation.test.mjs dev/tests/shared/ContractNegativeCaseCoverage.test.mjs dev/tests/dev-runtime/ApiMenuPathCleanup.test.mjs | PASS |

## Platform Validation

`npm run validate:platform` completed successfully with 8/8 scenarios passing.

## Canonical Structure

`npm run validate:canonical-structure` completed successfully with 0 blocking violations.

## Legacy Path Scan

Targeted scan excluded reports, archives, and generated workspace output, and checked active GitHub workflows, api, dev/scripts, dev/tests, src, www, and package.json for obsolete filesystem references.

Result: PASS.

## Bootstrap Command Check

Covered by targeted TeamAwareBootstrap test. The public command surface remains preserved by prior PR012 and is not changed by this PR.
