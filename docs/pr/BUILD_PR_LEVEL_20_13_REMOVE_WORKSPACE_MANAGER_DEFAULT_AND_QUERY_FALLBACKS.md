# BUILD_PR_LEVEL_20_13_REMOVE_WORKSPACE_MANAGER_DEFAULT_AND_QUERY_FALLBACKS

## Purpose

Remove the exact Workspace Manager launch blockers found by the Phase 20 recovery UAT gate.

## Scope

One PR purpose only:

- remove default first-item tool selection in `tools/Workspace Manager/main.js`
- remove legacy query fallback `gameId || game` in `tools/Workspace Manager/main.js`
- restore the missing `docs/dev/specs/TOOL_LAUNCH_SSOT.md` path if absent
- preserve current UAT labels and routes

## Exact Blockers

From `BUILD_PR_LEVEL_20_12_UAT_VALIDATE_AND_LOCK_RECOVERY_GATE`:

- File: `tools/Workspace Manager/main.js`
- Failing UAT path:
  - `games/index.html -> Open with Workspace Manager -> tools/Workspace Manager/index.html?gameId=<id>&mount=game`
- Blocking residues:
  - default first-item selection via `toolIds[0]`
    - lines around `270`, `463`, `475`
  - legacy query fallback:
    - `gameId || game`
    - lines around `153`, `284`
- Missing required spec path:
  - `docs/dev/specs/TOOL_LAUNCH_SSOT.md`

## Required Behavior

### Workspace Manager

When launched from games:

```text
tools/Workspace Manager/index.html?gameId=<id>&mount=game
```

Workspace Manager must:

- require explicit `gameId`
- reject missing `gameId` visibly
- not fallback to `game`
- not select `toolIds[0]`
- not select first available tool
- not infer a tool from DOM order
- not reuse stale launch memory
- clear external launch memory before hydrating explicit launch context

### Missing Tool Selection

If no explicit tool is selected in valid context:

- do not auto-select the first tool
- show a visible diagnostic / empty state
- require explicit SSoT-driven selection

## Allowed Changes

Allowed:

- targeted edits to `tools/Workspace Manager/main.js`
- restore/create `docs/dev/specs/TOOL_LAUNCH_SSOT.md` if missing
- create validation report
- update recovery roadmap status markers only if this blocker is resolved

Forbidden:

- broad cleanup
- unrelated Workspace Manager refactor
- changes to games unrelated to the failing launch path
- changes to samples
- new route systems
- second SSoT
- fallback/default behavior
- start_of_day changes
- roadmap text rewrite outside status markers

## Anti-Pattern Guards

Do not introduce:

- variable aliasing
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

- `docs/dev/reports/workspace_manager_default_query_fallback_removal_validation.md`

Validation must include:

- changed files
- exact removal of each `toolIds[0]` default selection
- exact removal of each `gameId || game` fallback
- proof `gameId` is required
- proof missing `gameId` fails visibly
- proof no first-tool selection remains in touched flow
- proof external launch memory clear remains intact
- proof `TOOL_LAUNCH_SSOT.md` exists at `docs/dev/specs/TOOL_LAUNCH_SSOT.md`
- anti-pattern self-check

## Acceptance

- `gameId || game` fallback removed from touched flow.
- `toolIds[0]` default selection removed from touched flow.
- Missing gameId fails visibly.
- No first-tool fallback remains in Workspace Manager launch path.
- SSoT spec exists at required path.
- Validation report exists.
