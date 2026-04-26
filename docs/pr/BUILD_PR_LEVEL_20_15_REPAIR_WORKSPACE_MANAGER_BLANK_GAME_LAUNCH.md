# BUILD_PR_LEVEL_20_15_REPAIR_WORKSPACE_MANAGER_BLANK_GAME_LAUNCH

## Purpose

Repair the new Workspace Manager blank-page blocker introduced after 20_14.

## User UAT Failure

The following URL now renders a blank page with no visible error:

```text
http://127.0.0.1:5500/tools/Workspace%20Manager/index.html?gameId=Breakout&mount=game
```

User also confirmed the blank page occurs for multiple different `Open with Workspace Manager` launches.

## Scope

One PR purpose only:

- repair Workspace Manager rendering for valid game-launched context
- ensure visible diagnostics if launch context/view resolution fails
- preserve the 20_13 no-fallback requirements
- preserve sample behavior

## Required Behavior

For:

```text
tools/Workspace Manager/index.html?gameId=Breakout&mount=game
```

Workspace Manager must:

- render a visible Workspace Manager page
- load explicit `gameId=Breakout` context
- clear external launch memory before hydration
- show tools/workspace surface for the selected game context
- not show a blank page
- not silently fail
- not restore default/fallback behavior
- not auto-select first tool
- not fallback to legacy `game` query param
- not reuse stale memory

## Diagnostic Requirement

If any Workspace Manager boot, game context load, SSoT lookup, or view selection fails:

- render a visible diagnostic panel on the page
- include the failing phase
- include the missing/invalid field
- include the URL/query context
- do not continue with guessed/default values

Silent blank page is forbidden.

## Likely Target

Codex should inspect narrowly:

- `tools/Workspace Manager/index.html`
- `tools/Workspace Manager/main.js`
- any directly imported Workspace Manager boot/view helpers

Do not scan or rewrite unrelated tools.

## Hard Constraints

Codex must NOT:

- change samples behavior
- change sample `Open <tool>` labels
- change game `Open with Workspace Manager` labels
- restore `gameId || game`
- restore `toolIds[0]`
- restore first-item selection
- introduce default tool/workspace
- introduce fallback route/view
- introduce stale memory reuse
- create a second SSoT
- broadly refactor Workspace Manager
- modify unrelated games/tools/samples
- modify `start_of_day`
- rewrite roadmap text outside status markers

## Anti-Pattern Guards

Do not introduce:

- alias variables
- pass-through variables
- duplicate state
- stored derived state
- vague names
- hidden fallback behavior
- duplicated launch paths
- silent redirects
- silent caught errors
- first-item selection
- legacy query fallback
- stale memory reuse
- label-text route guessing
- DOM-order route guessing

## Required Validation

Create:

- `docs/dev/reports/workspace_manager_blank_game_launch_repair_validation.md`

Validation must include:

- changed files
- root cause of blank page
- proof URL renders visible Workspace Manager content:
  - `tools/Workspace Manager/index.html?gameId=Breakout&mount=game`
- proof multiple gameIds do not blank
- proof visible diagnostic renders on invalid/missing gameId
- proof `gameId || game` fallback is not restored
- proof `toolIds[0]` first-tool selection is not restored
- proof no default/fallback route/view was added
- proof external memory clear remains intact
- proof sample `Open <tool>` path remains untouched
- anti-pattern self-check

## Acceptance

- Valid game-launched Workspace Manager URL renders visible page.
- Blank page is eliminated.
- Invalid context renders visible diagnostic.
- No fallback/default behavior is restored.
- Samples behavior remains untouched.
