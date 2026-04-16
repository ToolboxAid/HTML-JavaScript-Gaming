# BUILD_PR_LEVEL_17_56_DEBUG_OVERLAY_TEST_INPUT_KEY_REMAP

## Purpose
Replace stale Level 17 test inputs that still simulate `Tab` for debug overlay cycling so the automated checks validate the current non-Tab interaction contract.

## Scope
This PR is limited to Level 17 test coverage and test helpers that still encode the old cycle key.

Included:
- Update Level 17 tests that currently use `makeInput(['Tab'])`
- Align those tests to the active non-Tab overlay cycle key already established by the runtime-facing PRs
- Verify no Level 17 debug overlay tests continue to require browser-reserved Tab behavior

Excluded:
- Runtime keybinding changes
- Overlay layout changes
- Sample stack mapping changes
- Non-Level-17 test cleanup

## Implementation Notes
- Use the already-approved replacement cycle key from the current Level 17 overlay work
- Prefer shared test constants/helpers if they already exist; otherwise introduce the smallest local test-safe normalization needed
- Do not broaden this into a repo-wide input cleanup
- Do not modify `start_of_day` content

## Test Steps
1. Search Level 17 tests for `makeInput(['Tab'])`
2. Replace each stale input with the approved non-Tab cycle key
3. Run the affected Level 17 test files
4. Confirm overlay cycle assertions still pass under the new input
5. Confirm no remaining Level 17 tests reference `Tab` for overlay cycling

## Expected Result
- Level 17 tests validate the current non-Tab overlay cycle behavior
- No stale `makeInput(['Tab'])` calls remain in the affected Level 17 test surface
- The change stays test-only and does not alter runtime behavior
