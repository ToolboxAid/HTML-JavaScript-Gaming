# BUILD_PR_LEVEL_20_26_REPAIR_WORKSPACE_PAGER_BUTTON_EVENTS

## Purpose

Repair Workspace Manager pager button behavior after tool label resolution was fixed.

## Current UAT Status

Current visible pager:

```text
[PREV]Palette Browser / Manager[NEXT]
```

This confirms:

- tool resolution now works
- the selected tool label renders

Remaining issue:

- `[PREV]` and `[NEXT]` buttons do not function

## Scope

One PR purpose only:

- bind or rebind pager button events after the pager is rendered inside the mount/content area
- ensure Prev/Next update selected tool
- ensure Prev/Next update displayed tool label
- ensure Prev/Next remount/activate the selected tool
- preserve current working label resolution

## Likely Root Cause

The pager was moved/rendered after prior DOM binding occurred, or existing handlers still query old host-shell pager elements.

Codex must inspect the current Workspace Manager pager rendering and event-binding order.

Likely issue types:

- click handlers bound before pager exists
- handlers still referencing removed top-level pager
- handlers querying stale elements
- handlers not reattached after mount-container render
- Prev/Next buttons missing data attributes used by existing handler
- event listener lost when mount container innerHTML is replaced

## Required Behavior

For:

```text
tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game
```

On load:

- pager shows selected tool name
- selected tool is active/mounted

When clicking `[NEXT]`:

- selected tool changes to the next available tool
- displayed label updates
- mounted/active tool updates
- no page reload unless existing design requires it
- no blank mount container

When clicking `[PREV]`:

- selected tool changes to the previous available tool
- displayed label updates
- mounted/active tool updates
- no page reload unless existing design requires it
- no blank mount container

## Tool Query Cleanup Clarification

Game launch does not require `tool=`.

For this PR:

- do not add `tool=` requirement
- do not depend on `tool=` for Prev/Next
- if `tool=` exists, it may initialize selection
- normal game launch must work with only:

```text
?gameId=<id>&mount=game
```

## Required Button Binding Rule

Pager click handlers must bind to the actual rendered pager buttons inside mounted content.

Use one of these safe patterns:

- bind after rendering pager
- or use delegated click handling from a stable parent that survives remounts

Do not bind to stale nodes removed from DOM.

## Forbidden Changes

Codex must NOT:

- change samples behavior
- change game `Open with Workspace Manager` routing
- restore `gameId || game`
- require `tool=` for game launch
- create duplicate pager
- move pager back to top host shell
- reintroduce dropdown + Select Tool + Mount flow
- create a new header/banner
- broadly refactor Workspace Manager
- modify unrelated tools/games/samples
- modify `start_of_day`

## Anti-Pattern Guards

Do not introduce:

- alias variables
- pass-through variables
- duplicate state
- stale DOM references
- duplicate event listeners on repeated render
- silent caught errors
- hidden fallback routing
- label-text route guessing
- DOM-order route guessing
- broad truthy/falsy behavior changes

## Required Validation

Create:

- `docs/dev/reports/workspace_pager_button_events_validation.md`

Validation must include:

- changed files
- root cause of non-functioning buttons
- proof pager label still resolves
- proof `[NEXT]` changes selected tool label
- proof `[NEXT]` remounts/activates selected tool
- proof `[PREV]` changes selected tool label
- proof `[PREV]` remounts/activates selected tool
- proof game launch works without `tool=`
- proof `tool=` is not required
- proof no duplicate event listeners are added on repeated render
- proof `gameId || game` fallback is not restored
- proof samples remain untouched
- anti-pattern self-check

## Acceptance

- `[PREV]` works.
- `[NEXT]` works.
- Tool label updates.
- Mounted tool updates.
- Game launch works without `tool=`.
- No duplicate pager or old header returns.
