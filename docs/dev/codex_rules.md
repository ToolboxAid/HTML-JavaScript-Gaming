# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.
If any rule is violated, the output is incorrect.

Codex must prefer the existing repo pattern over any new pattern, unless the PR explicitly says otherwise.

## Baseline

The last known assistant-produced baseline is:

- commit: `3f7e9df`
- PR: `BUILD_PR_LEVEL_20_1_PHASE20_TOOL_PRESET_INTEGRATION`

All recovery analysis must compare current repo state against this baseline.

## Recovery Safety

- Do NOT run destructive git commands.
- Do NOT run `git reset --hard`.
- Do NOT delete files.
- Do NOT modify implementation files in this PR.
- Do NOT rewrite roadmap text.
- Do NOT modify `start_of_day` folders.
- Do NOT invent fallback/default behavior.
- Do NOT preserve junk code silently.

## Anti-Patterns Strictly Forbidden

- variable aliasing: one concept renamed into another variable
- pass-through variables
- duplicate state
- stored derived state
- vague names such as data, temp, obj, item, thing, value
- hidden fallback behavior
- default behavior where explicit routing is required
- broad truthy/falsy checks that alter behavior
- magic strings or magic numbers
- duplicate event listeners
- globals
- new managers/factories/service layers unless explicitly requested
- route/URL/ID/label changes unless explicitly requested
- public API changes unless explicitly requested
- unrelated cleanup
- unrelated refactoring
- scope expansion
- duplicated launch paths
- sample/game launch bypasses
- workspace launch memory carryover from external entry

## Validation

Before completing, verify:

- no implementation files changed
- no destructive command used
- all required reports exist
- reset recommendation is explicit
- all identified anti-patterns include file paths
