# BUILD_PR_TOOL_HOST_FOUNDATION

## Purpose
Introduce a minimal Tool Host foundation that can load boot-contract-normalized tools through a shared host shell without changing tool-specific behavior.

## Why This PR Now
The previous lane normalized tool boot contracts. The next safest step is to add a host foundation that can:
- load a selected tool
- pass `container` and `config`
- call `destroy()` on tool switch/unload
- preserve existing standalone tool entry points

## Scope
- host shell foundation only
- dynamic tool loading path
- tool registry / manifest handshake
- minimal adapters where needed
- no tool-specific workflow changes

## In Scope
- shared host entry
- tool registration / lookup model
- mount/unmount lifecycle handling
- lightweight config handoff
- fallback behavior for tools still transitioning

## Out of Scope
- tool UI redesign
- theme restyling
- editor-state refactors
- render-pipeline changes
- templates/ cleanup
- legacy deletion
- broad repo structure cleanup

## Build Strategy
1. create a minimal host shell entry
2. define a single registry/manifest path for active tools
3. mount one tool at a time into a shared container
4. enforce `init(container, config)` and `destroy()` usage where already available
5. preserve direct standalone tool launch pages

## Active Tool Targets
- tools/Asset Browser
- tools/Palette Browser
- tools/Parallax Scene Studio
- tools/Sprite Editor
- tools/Tilemap Studio
- tools/Vector Asset Studio
- tools/Vector Map Editor

## Validation
- npm run test:launch-smoke -- --tools
- direct standalone tool pages still launch
- host shell loads selected tool without console regressions
- tool switch/unmount does not leak prior tool UI into container

## Stop Conditions
Stop and report if:
- any tool requires editor-state redesign to mount
- host work expands into theme restyling
- host work requires render-pipeline rewrites
- registry shape becomes speculative without current tool evidence

## Expected Output
- repo-structured delta ZIP under <project folder>/tmp/
- exact files changed reported
- host foundation kept minimal and reversible
