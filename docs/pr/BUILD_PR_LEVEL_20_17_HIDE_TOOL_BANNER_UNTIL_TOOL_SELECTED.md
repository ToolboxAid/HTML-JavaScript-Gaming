# BUILD_PR_LEVEL_20_17_HIDE_TOOL_BANNER_UNTIL_TOOL_SELECTED

## Purpose

Remove/hide the Workspace Manager detached tool banner until a tool is explicitly selected.

## User UAT Finding

After 20_16, the detached top banner is still visible.

The desired behavior is now clarified:

- Do not show the banner on initial game-launched Workspace Manager open.
- Show the normal Workspace Manager page/shell/status first.
- Only show tool mount controls after a tool is selected.
- Keep explicit tool selection required.
- Do not restore default/fallback tool selection.

## Current Unwanted Banner

The following must not show on initial Workspace Manager load:

```text
Tool
Prev
Next
Mount
Unmount
Open Standalone
Optional JSON state for mounted tool
No tool mounted.
Switch target 1/3.
Select a tool to mount.
```

## Required Initial Page

For:

```text
tools/Workspace Manager/index.html?gameId=SolarSystem&mount=game
```

Initial visible content must be the Workspace Manager shell/status surface, similar to:

```text
Workspace Manager (Asset Browser / Import Hub)
First-Class Tools Surface
Shared shell, engine theme, and workspace context applied from the active tool registry
Approved asset browsing and non-destructive import planning surface for vectors, palettes, parallax, tilemaps, and sprite workflow assets.

Game Source: SolarSystem
New Workspace
Open Workspace
Save Workspace
Save Workspace As
Close Workspace
Workspace
SolarSystem
shared workspace shell ready
Workspace: Loaded
Shared Palette: Solar System Classic Palette
Shared Assets: Solar System Classic Skin
```

## Scope

One PR purpose only:

- hide/remove detached tool banner on initial Workspace Manager game-launched load
- show the normal Workspace Manager shell/status surface on initial load
- show tool controls only after explicit tool selection
- preserve explicit selection requirement
- preserve no default/fallback behavior
- preserve samples behavior

## Required Behavior

When launched from games:

```text
games/index.html
  -> Open with Workspace Manager
  -> tools/Workspace Manager/index.html?gameId=<id>&mount=game
```

Workspace Manager must:

- render visible page content
- show Workspace Manager shell/status first
- show Game Source
- show workspace actions/status
- not show tool control banner before tool selection
- not auto-select first tool
- not mount a tool by default
- not restore `toolIds[0]`
- not restore `gameId || game`
- not silently fail
- still provide visible diagnostics on invalid/missing context

## Tool Controls Rule

Tool controls may appear only when one of these is true:

- user explicitly selected a tool
- a valid explicit tool id is present in the launch context
- Workspace Manager is in an internal tool-mounted state that was reached through explicit user action

Tool controls must not appear merely because Workspace Manager has a list of tools.

## Allowed Changes

Allowed:

- targeted Workspace Manager render/view visibility changes
- targeted CSS/class changes if needed to hide detached initial banner
- validation report

Likely files:

- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/index.html`
- Workspace Manager CSS only if required

## Forbidden Changes

Codex must NOT:

- change samples behavior
- change sample `Open <tool>` labels
- change game `Open with Workspace Manager` labels
- restore default/fallback tool selection
- restore `toolIds[0]`
- restore `gameId || game`
- auto-select first tool
- mount a tool on initial game launch
- hide the whole Workspace Manager page
- create a second SSoT
- broad refactor Workspace Manager
- modify unrelated tools/games/samples
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

- `docs/dev/reports/workspace_manager_hide_tool_banner_validation.md`

Validation must include:

- changed files
- proof initial game-launched page shows Workspace Manager shell/status
- proof detached tool banner is not visible before tool selection
- proof tool controls appear only after explicit tool selection
- proof no first-tool/default selection is restored
- proof `toolIds[0]` is not restored
- proof `gameId || game` is not restored
- proof valid `gameId` still loads game context
- proof invalid/missing context renders visible diagnostic
- proof samples `Open <tool>` behavior remains untouched
- anti-pattern self-check

## Acceptance

- Initial game-launched Workspace Manager page shows shell/status.
- Detached tool banner is gone until tool selection.
- Tool selection remains explicit.
- No fallback/default behavior is restored.
- Samples remain unchanged.
