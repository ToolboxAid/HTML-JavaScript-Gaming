Toolbox Aid
David Quesenberry
03/30/2026
LEVEL_10_7_MODULE_PUBLIC_API.md

# Level 10.7 - Module Public API

## Pilot Module Target
`createWorldGameStateSystem(options)`

Creates the contract-only pilot module behind a public API boundary.

### Options Target
- `passiveMode?: boolean`
- `strictTransitions?: boolean`
- `publishEvent?: function`
- `now?: function`
- `correlationIdFactory?: function`

### Public API Target
- `getSnapshot()`
- `getReadonlyView()`
- `select(selectorName, ...args)`
- `requestTransition(transitionName, payload, meta)`
- `applyExternalSnapshotPatch(patch)`
- `getTransitionNames()`
- `getSelectorNames()`
- `getPublicApi()`

## Registration Target
`registerWorldGameStateSystem({ integrationApi, eventPipeline, stateSystem, consumerFactory })`

Registers the pilot through a Level 10.5-style integration boundary.

## Optional Consumer Target
`createObjectiveProgressMirrorConsumer(options)`

### Consumer Public API Target
- `getId()`
- `attach({ subscribe, getStateApi })`
- `detach()`
- `getLastMirror()`

## Contract Notes
- selectors never expose mutable internal references
- transitions return explicit result envelopes
- registration tolerates missing optional hooks
- this document defines the API target only; Codex performs implementation
