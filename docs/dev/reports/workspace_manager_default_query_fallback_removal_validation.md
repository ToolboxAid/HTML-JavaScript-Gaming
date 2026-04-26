# Workspace Manager Default And Query Fallback Removal Validation

## Changed Files

- `tools/Workspace Manager/main.js`
- `docs/dev/reports/workspace_manager_default_query_fallback_removal_validation.md`

## Exact Removal Proof For `toolIds[0]`

Command output:

```text
toolIds0 0
```

Evidence command checked `tools/Workspace Manager/main.js` for `toolIds[0]` occurrences and found none.

## Exact Removal Proof For `gameId || game`

Command output:

```text
gameOrFallbackA 0
gameOrFallbackB 0
legacyGameRead 0
```

Evidence command checked `tools/Workspace Manager/main.js` for:

- `searchParams.get("gameId") || searchParams.get("game")`
- `url.searchParams.get("game") || url.searchParams.get("gameId")`
- any `searchParams.get("game")` legacy query read

All counts are zero.

## Proof `gameId` Is Required

Workspace Manager now enforces explicit `gameId` for game-launch mode:

- `tools/Workspace Manager/main.js:573`
- `tools/Workspace Manager/main.js:623`

Visible failure message used in both init/popstate game-launch paths:

```text
Workspace Manager game launch requires a valid gameId query parameter.
```

## Proof Missing `gameId` Fails Visibly

Code path evidence:

- `tools/Workspace Manager/main.js:573-576`
- `tools/Workspace Manager/main.js:623-627`

Behavior:

- when `mount=game` is requested and `gameId` is missing, Workspace Manager writes explicit status text and returns without fallback mount.

## Proof No First-Tool Selection Remains In Touched Flow

- no `toolIds[0]` fallback remains.
- Tool mounting requires explicit selection/query:
  - `tools/Workspace Manager/main.js:494-497`
  - `tools/Workspace Manager/main.js:659-660`

## Proof Memory Clear Remains Intact

Command output:

```text
clearResult true
localAfterClear [ [ 'keep.one', 'x' ] ]
sessionAfterClear [ [ 'keep.two', 'y' ] ]
launchResult true
assignCalls [ '/tools/Workspace%20Manager/index.html?gameId=2001&mount=game' ]
localAfterLaunch [ [ 'keep.one', 'x' ] ]
sessionAfterLaunch [ [ 'keep.two', 'y' ] ]
```

Code path evidence:

- `tools/shared/toolLaunchSSoT.js:121`
- `tools/shared/toolLaunchSSoT.js:138`
- `games/index.render.js:419`
- `samples/index.render.js:539`

## Proof `docs/dev/specs/TOOL_LAUNCH_SSOT.md` Exists

Command output:

```text
True
```

Path:

- `docs/dev/specs/TOOL_LAUNCH_SSOT.md`

## Guardrail Check (Labels Unchanged)

- sample label remains `Open <tool>` at `samples/index.render.js:104`
- game label remains `Open with Workspace Manager` at `games/index.render.js:263`

## Static Validation

Commands run:

```bash
node --check tools/shared/toolLaunchSSoTData.js
node --check tools/shared/toolLaunchSSoT.js
node --check samples/index.render.js
node --check games/index.render.js
node --check tools/Workspace Manager/main.js
```

All commands exited successfully.

## Anti-Pattern Self-Check

- No broad cleanup or unrelated refactor performed.
- No second SSoT introduced.
- No launch label changes introduced.
- No new fallback/default behavior introduced in touched flow.
- No duplicate event listeners added.
- No globals/new manager/factory/service layer introduced.
