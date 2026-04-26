# BUILD_PR_LEVEL_20_27_FORCE_DELEGATED_WORKSPACE_PAGER_EVENTS

## Purpose

Force Workspace Manager pager buttons to work by replacing direct/stale button bindings with delegated click handling from a stable parent.

## Current UAT Failure

After 20_26:

- pager renders
- label resolves
- `[PREV]` and `[NEXT]` still do not function

This means the prior event repair did not bind the live rendered buttons or the buttons are replaced after binding.

## Scope

One PR purpose only:

- implement stable delegated event handling for the pager
- bind from a parent that survives pager/content re-render
- make Prev/Next update selected tool, label, and mounted content
- add visible/console diagnostics proving handler execution
- do not move pager or alter layout

## Required Implementation Direction

Do NOT rely on direct event listeners attached only to button nodes that may be recreated.

Use delegated click handling from one stable parent, such as:

- `[data-tool-host-mount-container]`
- `.tool-host-workspace`
- another stable Workspace Manager shell root that is not replaced during pager/tool renders

The delegated handler must:

- detect clicks on `[data-tool-host-prev]`
- detect clicks on `[data-tool-host-next]`
- prevent default
- stop only if needed by existing code
- call the same selection/remount path used to initialize the selected tool
- update current tool label
- update/mount active tool content

## Required Button Attributes

Ensure rendered buttons contain stable selectors:

```html
<button type="button" data-tool-host-prev>[PREV]</button>
<button type="button" data-tool-host-next>[NEXT]</button>
```

Do not depend on button text for behavior.

## Required State Rule

Pager state must be stored in one authoritative runtime state object or existing state pattern.

Do not use DOM text as source of truth.

Prev/Next must calculate from the available tool list and current tool id/index.

## Required Diagnostics

For this PR only, add temporary diagnostics in validation-safe form:

- `console.debug("[Workspace Manager] pager next", ...)`
- `console.debug("[Workspace Manager] pager prev", ...)`

or equivalent existing repo diagnostic pattern.

If the handler cannot find required state or tool list, render a visible diagnostic in the mount container/status area.

Silent no-op is forbidden.

## Required Behavior

For:

```text
tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game
```

On load:

- pager shows resolved first/current tool label
- selected tool is mounted/active

Click `[NEXT]`:

- delegated handler fires
- selected tool changes
- pager label changes
- mounted/active tool changes

Click `[PREV]`:

- delegated handler fires
- selected tool changes
- pager label changes
- mounted/active tool changes

## Forbidden Changes

Codex must NOT:

- move pager location
- add duplicate pager
- create a new header/banner
- restore dropdown + Select Tool + Mount flow
- require `tool=` for game launch
- restore `gameId || game`
- use button label text for route/tool decisions
- change sample behavior
- broad refactor Workspace Manager
- modify unrelated files
- modify `start_of_day`

## Required Validation

Create:

- `docs/dev/reports/workspace_pager_delegated_events_validation.md`

Validation must include:

- changed files
- explanation why previous button binding failed
- stable parent used for delegated listener
- proof `[data-tool-host-prev]` and `[data-tool-host-next]` exist
- proof delegated handler is bound once
- proof repeated render does not duplicate listener
- proof NEXT handler fires
- proof NEXT changes label and mounted tool
- proof PREV handler fires
- proof PREV changes label and mounted tool
- proof no click path depends on button text
- proof game launch works without `tool=`
- proof `gameId || game` fallback is not restored
- proof samples remain untouched
- anti-pattern self-check

## Acceptance

- PREV works.
- NEXT works.
- Label changes.
- Mounted content changes.
- No duplicate listeners.
- No layout changes.
