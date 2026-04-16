MODEL: GPT-5.4
REASONING: medium

COMMAND:
Create BUILD_PR_LEVEL_17_56_DEBUG_OVERLAY_TEST_INPUT_KEY_REMAP as a smallest-scope test-only PR.

Requirements:
- Find Level 17 tests that still use `makeInput(['Tab'])` for debug overlay cycling
- Replace each stale Tab-based test input with the active non-Tab cycle key already used by the current Level 17 runtime behavior
- Keep scope limited to affected Level 17 tests and the smallest supporting test helper change if required
- Do not change runtime keybinding code
- Do not change overlay positioning or sample stack mapping
- Do not modify start_of_day folders
- Run the affected tests and package the repo-structured ZIP to <project folder>/tmp/BUILD_PR_LEVEL_17_56_DEBUG_OVERLAY_TEST_INPUT_KEY_REMAP.zip
