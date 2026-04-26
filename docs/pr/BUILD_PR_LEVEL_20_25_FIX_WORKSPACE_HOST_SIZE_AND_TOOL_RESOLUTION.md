# BUILD_PR_LEVEL_20_25_FIX_WORKSPACE_HOST_SIZE_AND_TOOL_RESOLUTION

## Purpose

Fix the current Workspace Manager host view so it fills the browser viewport and resolves the selected tool name instead of showing `No tool available`.

## Current UAT Failure

URL example:

```text
tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game&tool=palette-browser
```

Observed:

- page is rendered only in a tiny upper-left area
- visible Workspace Manager surface is too small to use
- should fill the browser viewport top/bottom/left/right
- not browser fullscreen mode; just full available page area
- pager says:

```text
[PREV]No tool available[NEXT]
```

## Scope

One PR purpose only:

- make Workspace Manager host shell and mount container fill the available browser viewport
- ensure mounted Workspace Manager surface fills available width/height
- resolve `tool=palette-browser` through the active tool registry/SSoT
- show the resolved tool display name in the pager
- mount/activate the resolved tool
- if no explicit tool is present, use first available tool as user-approved default for this Workspace Manager view

## Required Layout Behavior

Workspace Manager host page must occupy the available browser viewport:

- top to bottom
- left to right
- no tiny fixed-size upper-left container
- no clipped mini scrollbox
- no constrained iframe-like pane unless the mounted tool itself intentionally scrolls
- body/html/host/mount container must allow full page layout

The fix may target CSS such as:

- `html`
- `body`
- `.tool-host-page`
- `.tool-host-workspace`
- `.tool-host-workspace__mount`
- mounted Workspace Manager root container

Use existing style patterns where possible.

## Required Tool Resolution Behavior

For:

```text
?gameId=Bouncing-ball&mount=game&tool=palette-browser
```

Workspace Manager must:

- read explicit `tool` query value
- resolve `palette-browser` against the tool registry/SSoT
- display the actual tool name, such as:

```text
Palette Browser / Manager
```

- mount/activate that tool

If the explicit tool value is invalid:

- show visible diagnostic
- do not display `No tool available` silently
- do not mount unrelated tool silently

If no `tool` query value is present:

- select first available tool for the game context
- display its name
- mount/activate it

## Pager Behavior

Pager must show:

```text
[PREV] <resolved tool display name> [NEXT]
```

Never show:

```text
[PREV]No tool available[NEXT]
```

for a valid game context with available tools.

Prev/Next must:

- cycle or step through available tools according to existing pattern
- update display name
- mount/activate selected tool

## Forbidden Changes

Codex must NOT:

- change samples behavior
- change sample `Open <tool>` labels
- change game `Open with Workspace Manager` labels
- restore `gameId || game`
- use legacy `game` query fallback
- create a second SSoT
- add new header/banner
- put pager above site chrome
- leave mount area tiny
- leave mount area blank
- silently swallow tool resolution errors
- modify unrelated tools/games/samples
- modify `start_of_day`
- broad refactor Workspace Manager

## Required Validation

Create:

- `docs/dev/reports/workspace_host_size_and_tool_resolution_validation.md`

Validation must include:

- changed files
- proof host page fills browser viewport
- proof mount container fills available browser area
- proof no tiny upper-left constrained viewport remains
- proof `tool=palette-browser` resolves to display name
- proof pager no longer shows `No tool available` for valid tool/game
- proof selected tool mounts/activates
- proof missing `tool` selects first available tool
- proof invalid `tool` renders visible diagnostic
- proof `gameId || game` fallback is not restored
- proof samples remain untouched
- anti-pattern self-check

## Acceptance

- Workspace Manager is usable at full browser page size.
- Pager displays resolved tool name.
- `tool=palette-browser` works.
- No silent `No tool available` state for valid game/tool context.
