# PR-012: engine/game isolate drawPlayerSelection overlay test failure

## Title

engine/game: isolate drawPlayerSelection overlay test failure after player-selection split

## Scope

This is an investigation-first PR package. It is intended to isolate the failing
`gameUtilsTest` assertion around `drawPlayerSelection` background overlay count
after PR-011.

Primary investigation targets:
- `engine/game/gameUtils.js`
- `engine/game/gamePlayerSelectionUtils.js`
- `GamePlayerSelectUi` source
- `gameUtilsTest`
- any related player-selection UI/render test files

Support files:
- `CODEX_COMMANDS.md`
- `PRE_COMMIT_TEST_CHECKLIST.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this PR exists

PR-011 passed the most important direct extraction checks:
- approved file scope
- compatibility bridge preservation
- export stability
- direct equivalence between `GameUtils` and `GamePlayerSelectionUtils`
  for selection-helper outputs

However, the broader test suite still reported:
- `drawPlayerSelection should draw the background overlay once`

This PR isolates whether that failure is:
1. pre-existing baseline noise
2. a test-only assumption exposed by the split
3. a real production regression

## Working hypotheses

### Hypothesis A: pre-existing failure
The UI/render assertion already failed before PR-011 and the split merely surfaced it again.

### Hypothesis B: static/shared state issue
`hasWarnedAboutControllerLimit` moved from `GameUtils` to `GamePlayerSelectionUtils`.
If tests reset one static location but not the other, test behavior may shift indirectly.

### Hypothesis C: hidden test coupling
A test or UI helper may mock/spy on `GameUtils` implementation details rather than use only its public methods.

### Hypothesis D: import/load-order sensitivity
The new extracted file may alter module evaluation order or test setup timing.

## Investigation tasks

### 1. Baseline comparison
Run the exact failing test on:
- pre-PR-011 baseline
- PR-011 applied state

Goal:
- determine whether the failure existed before the split

### 2. Dependency-path trace
Trace `GamePlayerSelectUi.drawPlayerSelection` to identify any dependency on:
- `GameUtils`
- `GamePlayerSelectionUtils`
- selection config/result helpers
- controller warning state
- overlay draw conditions

### 3. Test-assumption audit
Inspect the failing test for:
- spies/stubs on `GameUtils`
- implementation-location assumptions
- render-count assumptions
- state reset omissions

### 4. Static-state audit
Explicitly inspect whether tests reset:
- `GameUtils.hasWarnedAboutControllerLimit`
- `GamePlayerSelectionUtils.hasWarnedAboutControllerLimit`

### 5. Result classification
End the investigation with one of:
- pre-existing baseline failure
- test-only fix needed
- production bug exposed by split
- inconclusive, more tracing needed

## Preferred outcome

Produce a small evidence-backed conclusion and recommend the next step:
- no-op / document baseline issue
- test-only fix
- surgical production fix

## Guardrails

- do not roll back PR-011 without proof
- do not change production behavior just to make tests pass
- do not mix unrelated architecture work into this investigation
