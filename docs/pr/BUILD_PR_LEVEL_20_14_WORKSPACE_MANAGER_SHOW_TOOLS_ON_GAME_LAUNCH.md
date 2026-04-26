# BUILD_PR_LEVEL_20_14_WORKSPACE_MANAGER_SHOW_TOOLS_ON_GAME_LAUNCH

## Purpose

Fix the current UAT blocker where clicking `Open with Workspace Manager` from `games/index.html` opens Workspace Manager but shows the game surface instead of the tool/workspace tools surface.

## Current UAT Observation

User-verified:

- Samples path appears to work:
  - `Open <tool>` opens the tool
  - data appears
  - data correctness still needs later validation

- Games path is partially working:
  - clicking `Open with Workspace Manager` opens Workspace Manager
  - but Workspace Manager displays the game, not the tools/workspace tool selection surface

## Scope

One PR purpose only:

- keep game launch routed through `tools/Workspace Manager/index.html`
- preserve explicit `gameId`
- preserve external launch memory clear
- preserve no fallback/default behavior
- change Workspace Manager game-launch initial view so it presents the tool/workspace tools surface, not the hosted game surface

## Required Behavior

For this UAT path:

```text
games/index.html
  -> Open with Workspace Manager
  -> tools/Workspace Manager/index.html?gameId=<id>&mount=game
```

Workspace Manager must:

- open Workspace Manager
- load explicit game context from `gameId`
- clear external launch memory before hydrating context
- show the tools/workspace selection surface
- not immediately mount/show the game iframe as the primary view
- not auto-select the first tool
- not fallback to stale memory
- not fallback to `game`
- not use default route/tool/workspace behavior

## Important Clarification

The `mount=game` query value identifies that the launch came from a game context.

It must NOT force Workspace Manager to display the game surface as the initial primary view.

The initial view for `Open with Workspace Manager` must be the Workspace Manager tool/workspace surface for the selected game context.

## Allowed Changes

Allowed:

- targeted edits to Workspace Manager launch/mount/view selection logic
- validation report
- recovery roadmap status marker update only if execution-backed

Likely target:

- `tools/Workspace Manager/main.js`

Codex may inspect nearby Workspace Manager files only if required to identify the existing view-selection pattern.

## Forbidden Changes

Codex must NOT:

- alter samples behavior
- alter `Open <tool>` sample labels
- alter `Open with Workspace Manager` game labels
- route games directly to tools
- restore first-tool selection
- restore `gameId || game`
- introduce new default/fallback behavior
- create a second SSoT
- broadly refactor Workspace Manager
- modify unrelated tools
- modify unrelated games
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
- first-item selection
- legacy query fallback
- stale memory reuse
- label-text route guessing
- DOM-order route guessing

## Required Validation

Create:

- `docs/dev/reports/workspace_manager_game_launch_tools_view_validation.md`

Validation must include:

- changed files
- proof `Open with Workspace Manager` still routes to Workspace Manager
- proof explicit `gameId` is still required
- proof `gameId || game` fallback is not restored
- proof `toolIds[0]` first-tool selection is not restored
- proof external launch memory clear remains intact
- proof initial game-launched Workspace Manager view shows tools/workspace surface, not the game surface
- proof sample `Open <tool>` behavior remains untouched
- anti-pattern self-check

## Acceptance

- `games/index.html -> Open with Workspace Manager` opens Workspace Manager.
- Workspace Manager shows tools/workspace surface for selected game context.
- Workspace Manager does not immediately show the game surface as the primary view.
- No fallback/default behavior is restored.
- Samples behavior remains untouched.
