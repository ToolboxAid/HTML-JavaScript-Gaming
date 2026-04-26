# Workspace Manager Game Launch Tools View Validation

## Changed Files

- `tools/Workspace Manager/main.js`
- `docs/dev/reports/workspace_manager_game_launch_tools_view_validation.md`

## Proof `Open with Workspace Manager` Still Routes To Workspace Manager

- Game card launch label remains exactly `Open with Workspace Manager` in `games/index.render.js:263`.
- Games continue to launch via `launchWithExternalToolWorkspaceReset(workspaceHref)` in `games/index.render.js:419`.
- `workspaceHref` is still produced by `resolveGameWorkspaceLaunchHref(..., { launchSource: "games", launchType: "game-to-workspace" })` in `games/index.render.js:150-152`.
- `resolveGameWorkspaceLaunchHref` still resolves to Workspace Manager SSoT target path and appends `?gameId=<id>&mount=game` in `tools/shared/toolLaunchSSoT.js:95-118`.
- Workspace Manager SSoT target path remains `/tools/Workspace%20Manager/index.html` in `tools/shared/toolLaunchSSoTData.js:63-70`.
- Direct resolver check output:

```text
{
  href: '/tools/Workspace%20Manager/index.html?gameId=2001&mount=game',
  error: ''
}
```

## Proof Explicit `gameId` Is Still Required

- Game-launch mode still requires `gameId` and fails visibly when missing:
  - `tools/Workspace Manager/main.js:573-576`
  - `tools/Workspace Manager/main.js:626-630`
- Visible error message remains:

```text
Workspace Manager game launch requires a valid gameId query parameter.
```

## Proof `gameId || game` Fallback Is Not Restored

Command output:

```text
gameIdOrGame 0
legacyGameParamRead 0
```

- `tools/Workspace Manager/main.js` contains no `gameId || game` and no legacy `searchParams.get("game")` query read.

## Proof `toolIds[0]` First-Tool Selection Is Not Restored

Command output:

```text
toolIds0 0
```

- `tools/Workspace Manager/main.js` contains no first-item `toolIds[0]` launch selection fallback.

## Proof External Launch Memory Clear Remains Intact

Runtime check output:

```text
clearResult true
localAfterClear [ [ 'keep.one', 'x' ] ]
sessionAfterClear [ [ 'keep.two', 'y' ] ]
launchResult true
assignCalls [ '/tools/Workspace%20Manager/index.html?gameId=2001&mount=game' ]
localAfterLaunch [ [ 'keep.one', 'x' ] ]
sessionAfterLaunch [ [ 'keep.two', 'y' ] ]
```

- Clearing still happens in `tools/shared/toolLaunchSSoT.js:121-136`.
- External launch still clears first, then navigates via `window.location.assign(...)` in `tools/shared/toolLaunchSSoT.js:138-145`.

## Proof Initial Game-Launched Workspace Manager View Shows Tools/Workspace Surface (Not Game Surface)

- Removed auto hosted-game mount on initial game launch by deleting:
  - `await mountGameFrame(initialGameEntry)` branch from `init()` launch path.
  - `void mountGameFrame(gameEntry)` branch from game `popstate` path.
- Current behavior with no explicit `tool` in game launch path:
  - `popstate` now unmounts any mounted content and returns with visible tool-selection status in `tools/Workspace Manager/main.js:590-595`.
  - `init()` now returns with visible tool-selection status in `tools/Workspace Manager/main.js:657-659`.
- No direct runtime calls remain to auto-mount hosted game content during initialization/navigation:

```text
awaitMountGameFrame 0
voidMountGameFrame 0
```

## Proof Sample `Open <tool>` Behavior Remains Untouched

- Sample label logic remains `Open <tool>` via:
  - `const label = \`Open ${normalize(tool.displayName) || normalize(tool.name) || toolId}\`` at `samples/index.render.js:104`.
- Sample external launch path still routes through memory-clear helper via `launchWithExternalToolWorkspaceReset(launchHref)` at `samples/index.render.js:539`.
- This BUILD made no edits to sample launch files.

## Static Validation

Commands run successfully:

```bash
node --check tools/Workspace\ Manager/main.js
node --check tools/shared/toolLaunchSSoT.js
node --check tools/shared/toolLaunchSSoTData.js
node --check games/index.render.js
node --check samples/index.render.js
```

## Anti-Pattern Self-Check

- No alias variables introduced.
- No pass-through variables introduced.
- No duplicate launch state introduced.
- No duplicated launch paths introduced.
- No fallback/default tool/workspace behavior introduced.
- No stale memory reuse path introduced.
- No label-text or DOM-order guessing introduced.
- No sample/game label changes introduced.
- Change remains scoped to the Workspace Manager initial game-launched view path.
