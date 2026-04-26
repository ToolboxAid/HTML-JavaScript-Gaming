# BUILD_PR_LEVEL_20_18_AUTO_MOUNT_TOOL_SELECTION_WORKSPACE_SURFACE

## Purpose

Simplify the Workspace Manager game-launched tool selection flow.

Current UAT requires too many steps:

1. choose dropdown workspace action
2. click Select Tool
3. select tool
4. click Mount

Desired behavior:

- show one tool dropdown above Editors
- hide/lock editor cards below with an overlay until a tool is selected
- when a tool is selected, automatically activate/mount the selected tool
- remove the separate Select Tool and Mount step from the initial workflow

## User UAT Finding

Current page shows Workspace Manager content and tool cards, but also still has an extra tool-control area at the top.

The user is forced through multiple actions before a tool becomes active.

The desired UX is:

```text
Workspace Manager
Game Source: <game>

[Tool dropdown above Editors]

Editors
[overlay / disabled until tool selected]

User selects tool from dropdown
-> tool is automatically selected and mounted
-> overlay clears
-> selected tool surface becomes active
```

## Scope

One PR purpose only:

- move the tool selector dropdown above the Editors section
- hide/lock tools/cards below with an overlay until explicit tool selection
- auto-mount/activate the selected tool when the dropdown changes
- remove or hide redundant Select Tool / Mount controls from the initial game-launched flow
- preserve explicit selection requirement
- preserve no default/fallback behavior
- preserve sample behavior

## Required Behavior

For:

```text
tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game
```

Workspace Manager must:

- render the normal Workspace Manager shell/status
- show Game Source
- show workspace actions/status
- show one explicit tool dropdown above Editors
- show Editors/tool cards below
- block Editors/tool cards with an overlay until a tool is selected
- not auto-select a default tool on load
- not mount a default tool on load
- when user selects a tool from dropdown:
  - validate selected tool id against SSoT/registry
  - activate/mount that tool automatically
  - remove/hide overlay
  - update status to mounted/active tool
- not require separate Select Tool button
- not require separate Mount button
- not restore `toolIds[0]`
- not restore `gameId || game`
- not fallback to stale memory

## Tool Selector Placement

The tool dropdown must appear directly above the Editors area in the Workspace Manager first-class tools surface.

It must not appear as a detached top banner.

It must not appear above the Toolbox Aid shared header.

It must not duplicate with another tool dropdown in the banner/top control area.

## Overlay Requirement

Before tool selection:

- Editors/tool cards remain visible enough to communicate available tools
- an overlay or disabled state communicates:
  - select a tool to activate workspace tools
- clicking blocked tools before selection must not mount a default tool
- blocked click must either do nothing or show a visible diagnostic message

After tool selection:

- overlay is removed/hidden
- selected tool is active/mounted
- normal tool interaction can proceed

## Allowed Changes

Allowed:

- targeted Workspace Manager render/view changes
- targeted Workspace Manager tool selection behavior change
- targeted CSS/class changes for overlay/disabled state
- validation report

Likely files:

- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/index.html`
- Workspace Manager CSS only if required by existing layout

## Forbidden Changes

Codex must NOT:

- change samples behavior
- change sample `Open <tool>` labels
- change game `Open with Workspace Manager` labels
- restore default/fallback tool selection
- restore `toolIds[0]`
- restore `gameId || game`
- auto-select first tool on load
- mount a tool on initial game launch before user selection
- create a second SSoT
- broadly refactor Workspace Manager
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

- `docs/dev/reports/workspace_manager_auto_mount_tool_selection_validation.md`

Validation must include:

- changed files
- proof initial page shows one dropdown above Editors
- proof detached top banner/tool controls are gone
- proof Editors/tools are overlaid/disabled before tool selection
- proof no default tool is selected on load
- proof selecting a tool from dropdown auto-mounts/activates it
- proof separate Select Tool and Mount actions are not required for initial flow
- proof `toolIds[0]` is not restored
- proof `gameId || game` is not restored
- proof valid `gameId` still loads game context
- proof invalid/missing context renders visible diagnostic
- proof sample `Open <tool>` behavior remains untouched
- anti-pattern self-check

## Acceptance

- Initial game-launched Workspace Manager page shows shell/status and one tool dropdown above Editors.
- Editors are locked/overlaid until explicit tool selection.
- Selecting a tool automatically mounts/activates it.
- No separate Select Tool + Mount sequence is required.
- No fallback/default behavior is restored.
- Samples remain unchanged.
