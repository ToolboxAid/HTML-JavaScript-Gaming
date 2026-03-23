# Sample Template

Use this as the current baseline for new sample work.

## Standard Shape

```text
samples/sampleXX-sample-name/
├─ index.html
├─ main.js
└─ SampleScene.js
```

Late samples may instead use shared sample-owned helpers from `samples/_shared/` for bootstrap or layout, but the same separation of concerns still applies.

## main.js Rules
- bootstrap only
- import `Engine` from `engine/core/Engine.js` when booting directly
- prefer public engine barrels such as `engine/input/index.js`, `engine/theme/index.js`, and `engine/scenes/index.js`
- set the scene and start the engine

## Scene Rules
- extend `Scene` from `engine/scenes/index.js`
- own sample-specific state, update, and render logic
- do not own engine construction or document-wide wiring

## Sample Goals
- prove one main concept clearly
- stay small and readable
- document controls and expected behavior in the HTML page
- act as a truthful consumer of the current engine surface
