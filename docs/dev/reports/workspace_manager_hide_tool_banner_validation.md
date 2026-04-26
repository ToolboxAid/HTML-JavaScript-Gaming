# Workspace Manager Hide Tool Banner Validation

## Changed Files

- `tools/Workspace Manager/index.html`
- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/toolHost.css`
- `docs/dev/reports/workspace_manager_hide_tool_banner_validation.md`

## Proof Initial Game-Launched Page Shows Workspace Manager Shell/Status

Required URL path remains valid:

```text
/tools/Workspace%20Manager/index.html?gameId=SolarSystem&mount=game
```

Resolver check output:

```text
{
  href: '/tools/Workspace%20Manager/index.html?gameId=SolarSystem&mount=game',
  error: ''
}
```

Initial shell/status elements are present in page markup:

- title: `tools/Workspace Manager/index.html:11`
- first-class tools surface copy: `tools/Workspace Manager/index.html:21`
- game source: `tools/Workspace Manager/index.html:12`
- workspace actions: `tools/Workspace Manager/index.html:23-25`
- workspace loaded status: `tools/Workspace Manager/index.html:27`
- shared palette/assets status: `tools/Workspace Manager/index.html:28`

## Proof Detached Tool Banner Is Not Visible Before Tool Selection

The tool-controls panel is hidden in HTML by default:

- `tools/Workspace Manager/index.html:29` includes `data-tool-host-controls-panel hidden`

Init path keeps controls hidden when no explicit tool query exists:

- `tools/Workspace Manager/main.js:749` (`setControlsPanelVisible(false)`)
- `tools/Workspace Manager/main.js:806-809` (`!requestedToolId` keeps controls hidden and returns)

Game popstate path with no explicit tool also keeps controls hidden:

- `tools/Workspace Manager/main.js:707-713`

## Proof Tool Controls Appear Only After Explicit Tool Selection

Explicit selection path via workspace action:

- `tools/Workspace Manager/main.js:607-627`
- `tools/Workspace Manager/main.js:620` (`setControlsPanelVisible(true)` only after valid selected tool)
- `tools/Workspace Manager/main.js:630-633` (action button invokes explicit selection handler)

Explicit valid tool context path:

- `tools/Workspace Manager/main.js:811-812` (`setControlsPanelVisible(true)` then `mountSelectedTool("init")` when query has valid tool)
- `tools/Workspace Manager/main.js:715-716` (`setControlsPanelVisible(true)` then `mountSelectedTool("popstate")` when query has valid tool)

## Proof No First-Tool/Default Selection Restored

- no first-item fallback code path was reintroduced.
- game/init paths with no explicit tool return without mounting (`tools/Workspace Manager/main.js:707-713`, `tools/Workspace Manager/main.js:806-809`).

## Proof `toolIds[0]` Not Restored

Command output:

```text
toolIds0 0
```

## Proof `gameId || game` Not Restored

Command output:

```text
gameIdOrGame 0
legacyGameParamRead 0
```

## Proof Valid `gameId` Still Loads Game Context

When game context is valid, game source and workspace loaded status are populated:

- `tools/Workspace Manager/main.js:699-701` (popstate valid game entry)
- `tools/Workspace Manager/main.js:784-786` (init valid game entry)

## Proof Invalid/Missing Context Renders Visible Diagnostic

Missing `gameId` diagnostics:

- `tools/Workspace Manager/main.js:684`
- `tools/Workspace Manager/main.js:767`

Invalid `gameId` diagnostics:

- `tools/Workspace Manager/main.js:695`
- `tools/Workspace Manager/main.js:777`

Diagnostic panel remains visible-capable in markup:

- `tools/Workspace Manager/index.html:14-17`

## Proof External Memory Clear Remains Intact

Runtime check output:

```text
clearResult true
localAfterClear [ [ 'keep.one', 'x' ] ]
sessionAfterClear [ [ 'keep.two', 'y' ] ]
launchResult true
assignCalls [
  '/tools/Workspace%20Manager/index.html?gameId=SolarSystem&mount=game'
]
localAfterLaunch [ [ 'keep.one', 'x' ] ]
sessionAfterLaunch [ [ 'keep.two', 'y' ] ]
```

## Proof Samples `Open <tool>` Remain Untouched

- sample label remains `Open <tool>`: `samples/index.render.js:104`
- sample external launch reset path unchanged: `samples/index.render.js:539`

## Static Validation

Commands run successfully:

```bash
node --check tools/Workspace\ Manager/main.js
node --check games/index.render.js
node --check samples/index.render.js
```

## Anti-Pattern Self-Check

- No sample behavior or labels changed.
- No `gameId || game` fallback restored.
- No `toolIds[0]` fallback restored.
- No first-tool auto-selection restored.
- No tool mount on initial game launch without explicit tool context.
- No second SSoT introduced.
- No broad Workspace Manager refactor performed.
- No start_of_day files changed.