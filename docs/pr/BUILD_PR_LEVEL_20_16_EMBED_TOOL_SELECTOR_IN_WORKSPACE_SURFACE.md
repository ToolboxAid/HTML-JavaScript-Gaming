# BUILD_PR_LEVEL_20_16_EMBED_TOOL_SELECTOR_IN_WORKSPACE_SURFACE

## Purpose

Move the explicit Workspace Manager tool selector/controls out of the top banner area and embed them into the Workspace Manager first-class tools surface.

## User UAT Result

After the blank-page repair, Workspace Manager now renders instead of blanking.

Current top banner content:

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

This behavior is acceptable because it forces explicit tool selection and avoids default/fallback selection.

However, it must not render as a detached top banner.

It must be part of the Workspace Manager first-class tools surface:

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

- reposition/contain the explicit tool selector UI inside the Workspace Manager first-class tools surface
- preserve explicit selection behavior
- preserve no default/fallback behavior
- preserve game context display
- preserve sample behavior

## Required Behavior

For:

```text
tools/Workspace Manager/index.html?gameId=SolarSystem&mount=game
```

Workspace Manager must:

- render the normal Workspace Manager header/shell
- show game context (`Game Source: SolarSystem`)
- show workspace actions
- show workspace status
- show the explicit tool selector inside the first-class tools surface
- show the "No tool mounted" / "Select a tool to mount" message inside that surface
- not show the tool selector as a detached top banner
- not auto-select first tool
- not fallback to any default tool
- not restore `toolIds[0]`
- not restore `gameId || game`

## Placement Requirement

The following controls must be visually/content-owned by the Workspace Manager first-class tools surface:

- Tool selector heading/status
- Prev
- Next
- Mount
- Unmount
- Open Standalone
- Optional JSON state for mounted tool
- No tool mounted
- Switch target N/N
- Select a tool to mount

They must appear below or within the Workspace Manager surface content area, not above the main Workspace Manager title/header/shell.

## Allowed Changes

Allowed:

- targeted Workspace Manager markup/render placement changes
- targeted Workspace Manager CSS/class usage changes
- validation report

Likely files:

- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/index.html`
- Workspace Manager CSS only if the existing layout requires it

## Forbidden Changes

Codex must NOT:

- restore default/fallback tool selection
- restore `toolIds[0]`
- restore `gameId || game`
- auto-select first tool
- change sample `Open <tool>` behavior
- change game `Open with Workspace Manager` behavior
- route games directly to tools
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
- first-item selection
- legacy query fallback
- stale memory reuse
- label-text route guessing
- DOM-order route guessing

## Required Validation

Create:

- `docs/dev/reports/workspace_manager_tool_selector_surface_validation.md`

Validation must include:

- changed files
- proof tool selector no longer renders as top detached banner
- proof tool selector appears inside first-class tools surface
- proof explicit tool selection is still required
- proof no first-tool selection is restored
- proof `toolIds[0]` is not restored
- proof `gameId || game` is not restored
- proof game source/status still render
- proof sample `Open <tool>` behavior remains untouched
- anti-pattern self-check

## Acceptance

- Workspace Manager page is visible.
- Tool selector is embedded in the first-class tools surface.
- User must explicitly select/mount a tool.
- No fallback/default behavior is restored.
- Existing game context and workspace status remain visible.
