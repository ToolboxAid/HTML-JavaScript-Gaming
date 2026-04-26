# Tool Launch SSoT Data Layer Validation

## Exact SSoT File Path

- `tools/shared/toolLaunchSSoTData.js`

## Changed Files

- `tools/shared/toolLaunchSSoTData.js`
- `tools/shared/toolLaunchSSoT.js`
- `samples/index.render.js`
- `games/index.render.js`
- `docs/dev/reports/tool_launch_ssot_data_layer_validation.md`

## List of Launch IDs

Command output:

```text
launchIdsCount 18
launchIds [
  'tool.vector-map-editor',
  'tool.vector-asset-studio',
  'tool.tile-map-editor',
  'tool.parallax-editor',
  'tool.sprite-editor',
  'tool.skin-editor',
  'tool.asset-browser',
  'tool.palette-browser',
  'tool.state-inspector',
  'tool.replay-visualizer',
  'tool.performance-profiler',
  'tool.physics-sandbox',
  'tool.asset-pipeline-tool',
  'tool.tile-model-converter',
  'tool.3d-json-payload-normalizer',
  'tool.3d-asset-viewer',
  'tool.3d-camera-path-editor',
  'workspace-manager.game-to-workspace'
]
```

Launch id structure is defined in SSoT data layer:

- `tools/shared/toolLaunchSSoTData.js:55`
- `tools/shared/toolLaunchSSoTData.js:65`

## Proof Sample Actions Still Say `Open <tool>`

- `samples/index.render.js:104`

```text
const label = `Open ${normalize(tool.displayName) || normalize(tool.name) || toolId}`;
```

## Proof Game Actions Still Say `Open with Workspace Manager`

- `games/index.render.js:263`

```text
Open with Workspace Manager
```

## Proof Sample Target Paths Come From SSoT

1. Sample launch resolution now reads launch metadata from SSoT data layer:

- `tools/shared/toolLaunchSSoT.js:68`
- `tools/shared/toolLaunchSSoT.js:72`

2. Sample launch target path is defined in SSoT data layer as `targetPath`:

- `tools/shared/toolLaunchSSoTData.js:53`
- `tools/shared/toolLaunchSSoTData.js:57`

3. Sample UI launch call passes source/type context and uses resolver:

- `samples/index.render.js:92`
- `samples/index.render.js:93`
- `samples/index.render.js:94`

Command output proof:

```text
sampleDefinition {
  launchDefinition: {
    launchId: 'tool.sprite-editor',
    displayName: 'Sprite Editor',
    targetPath: '/tools/Sprite%20Editor/index.html',
    allowedLaunchSources: [ 'samples', 'tools', 'workspace', 'internal' ],
    allowedLaunchTypes: [ 'sample-to-tool', 'tool-internal', 'workspace-internal' ]
  },
  error: ''
}
sampleLaunch {
  href: '/tools/Sprite%20Editor/index.html?sampleId=1208&sampleTitle=Tool+Formatted+Tiles+Parallax',
  error: ''
}
```

## Proof Game Workspace Manager Target Path Comes From SSoT

1. Game launch resolution now reads workspace launch metadata from SSoT data layer:

- `tools/shared/toolLaunchSSoT.js:101`
- `tools/shared/toolLaunchSSoT.js:105`

2. Workspace Manager target path is defined in SSoT data layer as `targetPath`:

- `tools/shared/toolLaunchSSoTData.js:67`

3. Game UI launch call passes source/type context and uses resolver:

- `games/index.render.js:148`
- `games/index.render.js:149`
- `games/index.render.js:150`

Command output proof:

```text
gameDefinition {
  launchDefinition: {
    launchId: 'workspace-manager.game-to-workspace',
    displayName: 'Workspace Manager',
    targetPath: '/tools/Workspace%20Manager/index.html',
    allowedLaunchSources: [ 'games', 'workspace', 'internal' ],
    allowedLaunchTypes: [ 'game-to-workspace', 'workspace-internal' ]
  },
  error: ''
}
gameLaunch {
  href: '/tools/Workspace%20Manager/index.html?gameId=2001&mount=game',
  error: ''
}
```

## Proof External Launch Memory Clear Remains Intact

Code path remains:

- `tools/shared/toolLaunchSSoT.js:121`
- `tools/shared/toolLaunchSSoT.js:138`
- `samples/index.render.js:539`
- `games/index.render.js:419`

Command output proof:

```text
clearResult true
localAfterClear [ [ 'keep.one', 'x' ] ]
sessionAfterClear [ [ 'keep.two', 'y' ] ]
launchResult true
assignCalls [ '/tools/Workspace%20Manager/index.html?gameId=2001&mount=game' ]
localAfterLaunch [ [ 'keep.one', 'x' ] ]
sessionAfterLaunch [ [ 'keep.two', 'y' ] ]
```

## Proof Missing Target Does Not Fallback

1. Missing/invalid SSoT launch target id does not route and returns visible error:

```text
missingSsotTarget { href: '', error: 'Tool "not-a-real-tool" is not registered.' }
```

2. Invalid source/type for an SSoT launch id does not route and returns visible error:

```text
disallowedSource {
  href: '',
  error: 'Launch "workspace-manager.game-to-workspace" does not allow source "samples".'
}
```

3. Guard rails are explicit in SSoT data + resolver:

- `tools/shared/toolLaunchSSoTData.js:100`
- `tools/shared/toolLaunchSSoTData.js:121`
- `tools/shared/toolLaunchSSoT.js:69`
- `tools/shared/toolLaunchSSoT.js:102`

## Static Validation

Commands run:

```bash
node --check tools/shared/toolLaunchSSoTData.js
node --check tools/shared/toolLaunchSSoT.js
node --check samples/index.render.js
node --check games/index.render.js
```

All commands exited successfully.

## Anti-Pattern Self-Check

- One launch SSoT data layer added; no second launch-path source introduced in touched flow.
- No fallback/default route/tool/workspace logic added.
- No duplicate event listeners introduced.
- No new globals/managers/factories/service layers introduced.
- No unrelated cleanup or scope expansion.
