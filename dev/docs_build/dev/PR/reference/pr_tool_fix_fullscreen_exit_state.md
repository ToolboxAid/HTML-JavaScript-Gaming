# PR — Fix Fullscreen Exit Header State

## Purpose

Fix the remaining fullscreen shell issue where exiting fullscreen leaves the header/details area in fullscreen/open state.

This PR is tools-only and focused only on fullscreen exit state synchronization.

---

## Observed Issue

Verbiage is now correct, but after exiting fullscreen:

- UI still behaves as if it is in fullscreen
- Header/details remain visible/open
- The toggle/header state is not restored correctly

---

## Scope

Target only:

- shared fullscreen enter/exit handling
- header/details open/closed state
- fullscreen CSS state classes/attributes
- shared platform shell event handling

Likely files:

- `src/shared/toolbox/platformShell.js`
- `src/shared/toolbox/platformShell.css`

Do not modify:

- King of the Iceberg files
- sample games
- runtime engine files
- `start_of_day` folders

---

## Required Behavior

When entering fullscreen:

- Fullscreen class/state is applied.
- Fullscreen header text includes active tool name.
- Fullscreen intro text includes active tool name.
- Header/details visibility follows the fullscreen design.

When exiting fullscreen:

- Fullscreen class/state is removed.
- Any fullscreen-only header/details state is cleared.
- Header/details should not remain stuck open because of stale fullscreen state.
- Toggle label should reflect non-fullscreen state.
- Tool-specific wording must remain correct.

---

## State Synchronization Requirements

The platform shell must keep these in sync:

- browser fullscreen state
- shell fullscreen class/attribute
- collapsible open/closed state
- summary/toggle label
- header/details visibility

Required events to handle:

- explicit fullscreen enter button/action
- explicit fullscreen exit button/action
- browser Escape key fullscreen exit
- `fullscreenchange`
- tool shell re-render

---

## Acceptance Criteria

- Enter fullscreen: header/intro show correct tool-specific text.
- Exit fullscreen: UI no longer says/stays in fullscreen.
- Exit fullscreen: header details are hidden/collapsed as expected.
- Exit fullscreen using Escape also clears fullscreen UI state.
- Toggle label is tool-specific and matches current state.
- No visible generic labels return:
  - `Header and Intro`
  - `Hide Header and Details`
  - `Show Header and Details`
- No CSS-only masking of stale state.
- No KOTI/sample/runtime/start_of_day files change.

---

## Targeted Validation

Do not run long sample suites.

Run:

```powershell
node --check src/shared/toolbox/platformShell.js
```

If CSS only changes, note CSS review in report.

Browser validation:

1. Open Parallax Scene Studio.
2. Confirm normal header state.
3. Enter fullscreen.
4. Confirm fullscreen header/intro.
5. Exit fullscreen using UI.
6. Confirm fullscreen class/state removed.
7. Confirm header/details no longer stuck open.
8. Re-enter fullscreen.
9. Exit fullscreen using Escape.
10. Confirm fullscreen class/state removed again.
11. Repeat one additional shared-shell tool if cheap.

---

## Required Evidence

Create:

```txt
tmp/pr_tool_fix_fullscreen_exit_state_validation.json
```

Include:

- tool id
- enter fullscreen state/classes
- exit fullscreen state/classes
- header/details open state after exit
- toggle label after exit
- escape-exit result
- PASS/FAIL

---

## Required Report

Create:

```txt
dev/docs_build/dev/reports/PR_tool_fix_fullscreen_exit_state_report.md
```

Include:

- PASS/FAIL
- changed files
- root cause
- state/classes fixed
- validation commands/results
- remaining issues
