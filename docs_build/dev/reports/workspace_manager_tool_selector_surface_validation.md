# Workspace Manager Tool Selector Surface Validation

## Changed Files

- `toolbox/Workspace Manager/index.html`
- `toolbox/Workspace Manager/main.js`
- `toolbox/Workspace Manager/toolHost.css`
- `docs_build/dev/reports/workspace_manager_tool_selector_surface_validation.md`

## Proof Tool Selector No Longer Renders As Top Detached Banner

Header now contains shell/title + source + status, not selector controls:

- `toolbox/Workspace Manager/index.html:10-13`

Key evidence lines:

- `toolbox/Workspace Manager/index.html:11` (`Workspace Manager` shell title)
- `toolbox/Workspace Manager/index.html:12` (`data-tool-host-game-source`)
- `toolbox/Workspace Manager/index.html:13` (`data-tool-host-status`)

Selector controls were removed from header and relocated to main surface.

## Proof Tool Selector Appears Inside First-Class Tools Surface

Main tools surface contains selector and controls:

- `toolbox/Workspace Manager/index.html:19` (`<main class="tool-host-workspace">`)
- `toolbox/Workspace Manager/index.html:20` (`<section class="tool-host-surface" ...>`)
- `toolbox/Workspace Manager/index.html:21` (`tool-host-surface__controls`)
- `toolbox/Workspace Manager/index.html:23` (`data-tool-host-select`)
- `toolbox/Workspace Manager/index.html:31-32` (`data-tool-host-current-label`, `data-tool-host-switch-meta`)

Layout styling binds this section as embedded surface:

- `toolbox/Workspace Manager/toolHost.css:77` (`.tool-host-surface`)
- `toolbox/Workspace Manager/toolHost.css:84` (`.tool-host-surface__controls`)
- `toolbox/Workspace Manager/toolHost.css:91` (`.tool-host-workspace__mount`)

## Proof Explicit Tool Selection Is Still Required

Explicit selection guard remains intact:

- `toolbox/Workspace Manager/main.js:528-529`
- `toolbox/Workspace Manager/main.js:706-707`

Behavior still writes visible status `Select a tool to mount.` when no explicit tool is selected.

## Proof No First-Tool Selection Is Restored

- No first-item selection fallback logic was reintroduced.
- Game-launch and init paths still return with explicit status when no requested tool exists (`toolbox/Workspace Manager/main.js:628-631`, `toolbox/Workspace Manager/main.js:706-707`).

## Proof `toolIds[0]` Is Not Restored

Command output:

```text
toolIds0 0
```

## Proof `gameId || game` Is Not Restored

Command output:

```text
gameIdOrGame 0
legacyGameParamRead 0
```

## Proof Game Source/Status Still Render

Header shell keeps source + status visible:

- `toolbox/Workspace Manager/index.html:12` (`data-tool-host-game-source`)
- `toolbox/Workspace Manager/index.html:13` (`data-tool-host-status`)

Runtime writes explicit game source values:

- `toolbox/Workspace Manager/main.js:199` (`writeGameSource`)
- `toolbox/Workspace Manager/main.js:609` (`missing gameId`)
- `toolbox/Workspace Manager/main.js:617` (`invalid gameId`)
- `toolbox/Workspace Manager/main.js:622` (`valid game source`)
- `toolbox/Workspace Manager/main.js:639` (`none`)

## Proof Sample `Open <tool>` Remains Untouched

Sample launch label and launch behavior remain unchanged:

- `samples/index.render.js:104` (`Open <tool>` label)
- `samples/index.render.js:539` (`launchWithExternalToolWorkspaceReset(launchHref)`)

## Static Validation

Commands run successfully:

```bash
node --check toolbox/Workspace\ Manager/main.js
node --check games/index.render.js
node --check samples/index.render.js
```

## Anti-Pattern Self-Check

- No samples behavior/labels changed.
- No second SSoT introduced.
- No default/fallback route/view/tool/workspace behavior restored.
- No `gameId || game` restoration.
- No `toolIds[0]` restoration.
- No first-item auto-selection restoration.
- Changes remain scoped to Workspace Manager markup/CSS placement and minimal status/source wiring.