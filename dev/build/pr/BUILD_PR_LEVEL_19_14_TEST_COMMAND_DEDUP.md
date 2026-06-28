# BUILD_PR_LEVEL_19_14_TEST_COMMAND_DEDUP

## Purpose
Remove duplicate test execution paths to streamline validation.

## Scope
- Single purpose PR
- Deduplicate test commands
- No functional changes

## Change
Standardize on:
- node ./scripts/run-node-tests.mjs

Remove redundant use of:
- npm test (when it executes same suite)

## Overlap Confirmation
- `package.json` defines `"test": "node ./scripts/run-node-tests.mjs"`.
- Therefore `npm test` and `node ./scripts/run-node-tests.mjs` execute the same node test suite path, with `npm test` adding npm lifecycle wrapper behavior.

## Validation
- Ensure selected command covers full suite
- Ensure no loss in coverage

## Acceptance
- One canonical test command
- No duplicate execution paths
