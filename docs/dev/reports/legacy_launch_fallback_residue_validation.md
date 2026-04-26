# Legacy Launch Fallback Residue Validation

## Changed Files

- `tools/shared/toolLaunchSSoTData.js`
- `docs/dev/reports/legacy_launch_fallback_residue_validation.md`

## Exact Residue Removed

1. Removed fallback-style tool lookup that could bypass launch SSoT visibility scope:

- removed `getToolById` usage (full registry lookup)
- replaced with active+visible-only lookup in launch SSoT data (`findActiveVisibleToolById`)

2. Removed label-text fallback chain in launch SSoT data:

- removed `displayName || name || id`
- now requires explicit `displayName` from SSoT-backed tool metadata

3. Removed weak missing-target error wording tied to generic registry presence:

- `Tool "..." is not registered.`
- replaced with SSoT-scoped failure: `Tool "..." is not available in launch SSoT.`

These changes remove compatibility-style branches that could permit non-SSoT launch selection and label guessing.

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

Code path:

- `tools/shared/toolLaunchSSoT.js:68`
- `tools/shared/toolLaunchSSoT.js:72`
- `tools/shared/toolLaunchSSoTData.js:53`
- `tools/shared/toolLaunchSSoTData.js:57`
- `samples/index.render.js:92`

Command output:

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

Code path:

- `tools/shared/toolLaunchSSoT.js:101`
- `tools/shared/toolLaunchSSoT.js:105`
- `tools/shared/toolLaunchSSoTData.js:67`
- `games/index.render.js:148`

Command output:

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

Code path:

- `tools/shared/toolLaunchSSoT.js:121`
- `tools/shared/toolLaunchSSoT.js:138`
- `samples/index.render.js:539`
- `games/index.render.js:419`

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

## Proof Missing Target/Context Does Not Fallback

1. Missing target id fails visibly with no route fallback:

```text
missingSsotTarget {
  href: '',
  error: 'Tool "not-a-real-tool" is not available in launch SSoT.'
}
```

2. Invalid launch context (source/type) fails visibly with no route fallback:

```text
disallowedContext {
  href: '',
  error: 'Launch "workspace-manager.game-to-workspace" does not allow source "samples".'
}
```

3. Resolver still enforces explicit source/type access checks:

- `tools/shared/toolLaunchSSoTData.js:130`
- `tools/shared/toolLaunchSSoT.js:72`
- `tools/shared/toolLaunchSSoT.js:105`

## Proof No Default/Fallback Residue Remains In Touched Launch Flow

- No full-registry fallback lookup remains in touched SSoT data path (`getToolById` removed).
- No label fallback chain remains in touched SSoT data path (`displayName || name || id` removed).
- Launch selection in touched resolver path remains SSoT-gated by launch id + allowed source/type.

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

- No second source of truth introduced.
- No fallback/default route selection introduced.
- No duplicate listeners or globals introduced.
- No unrelated cleanup or scope expansion.
