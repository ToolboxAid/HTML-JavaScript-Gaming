# BUILD_PR_LEVEL_20_19_FORCE_WORKSPACE_TOOL_PAGER_ABOVE_EDITORS

## Purpose

Stop the repeated Workspace Manager header/banner attempts and force the approved tool picker UI:

```text
[PREV] <toolname> [NEXT]
```

centered directly above the Editors section.

## User Direction

The prior attempts created an unwanted new top header/banner.

User explicitly said:

- do not use a new HEADER at all
- delete what has been created
- force creation of a centered control above Editors:
  - `[PREV] <toolname> [NEXT]`
- when page loads, default `<toolname>` to the first tool in the list
- no more attempts to keep the header

## Scope

One PR purpose only:

- remove/delete the newly created Workspace Manager top header/banner/control area
- create the centered `[PREV] <toolname> [NEXT]` control above Editors
- default selected tool name to the first tool in the available tool list on page load
- Prev/Next cycles through available tools
- update active/mounted tool to match the selected tool
- preserve game context and workspace status
- preserve sample behavior

## Explicit Rule Override

Earlier recovery rules blocked first-tool default selection.

This PR intentionally overrides that rule only for the Workspace Manager UI requested here:

- first tool in the available list becomes the initial selected tool name
- this is now approved behavior for this Workspace Manager game-launched UI
- this must not reintroduce legacy query fallback such as `gameId || game`
- this must not reintroduce hidden fallback routing
- this must not affect samples

## Required UI

For:

```text
tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game
```

Workspace Manager must show the normal existing page shell and the normal Editors section.

Immediately above Editors, centered, show:

```text
[PREV] Palette Browser / Manager [NEXT]
```

or the first available tool name for that game.

The control must be inside the existing Workspace Manager content surface, not a new top header/banner.

## Required Behavior

On page load:

- read explicit `gameId`
- load game context
- load available tools for that game
- choose first available tool as selected tool
- display selected tool name between Prev and Next
- activate/mount the selected tool
- show Editors section normally
- do not show the newly created top header/banner
- do not show dropdown workflow
- do not require Select Tool button
- do not require Mount button

Prev/Next:

- Prev selects previous available tool
- Next selects next available tool
- selection wraps only if existing repo UI patterns already wrap; otherwise clamp
- each selection updates selected tool name
- each selection activates/mounts the selected tool

## Delete / Remove Requirement

Remove the newly created top Workspace Manager header/banner/control area that currently shows content such as:

```text
Workspace Manager
Game Source: Bouncing-ball
Select a tool from Workspace actions.

First-Class Tools Surface copy: tools become available after explicit selection.
Workspace actions Select tool...
Workspace loaded status...
Shared palette/assets status...
Editors are locked until a tool is selected from Workspace actions.
```

Do not preserve this as hidden duplicated DOM if it can be removed cleanly.

## Forbidden Changes

Codex must NOT:

- create another header/banner replacement
- keep the new header/banner workflow
- keep the dropdown workflow above Editors
- require Select Tool button
- require Mount button
- change sample `Open <tool>` behavior
- change game `Open with Workspace Manager` behavior
- restore `gameId || game`
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
- hidden query fallback
- duplicated launch paths
- silent redirects
- silent caught errors
- legacy query fallback
- stale memory reuse
- label-text route guessing
- DOM-order route guessing

## Required Validation

Create:

- `docs/dev/reports/workspace_manager_tool_pager_above_editors_validation.md`

Validation must include:

- changed files
- proof newly created header/banner/control area was removed
- proof centered `[PREV] <toolname> [NEXT]` appears above Editors
- proof first available tool is selected on page load
- proof selected tool is active/mounted on page load
- proof Prev/Next changes selected/mounted tool
- proof dropdown + Select Tool + Mount initial workflow is removed
- proof `gameId || game` fallback is not restored
- proof game context still loads from explicit `gameId`
- proof sample `Open <tool>` remains untouched
- anti-pattern self-check

## Acceptance

- No new Workspace Manager header/banner exists.
- Centered `[PREV] <toolname> [NEXT]` appears above Editors.
- First available tool is selected and active on page load.
- Prev/Next switches tools.
- No dropdown + Select Tool + Mount workflow remains for initial game-launched page.
