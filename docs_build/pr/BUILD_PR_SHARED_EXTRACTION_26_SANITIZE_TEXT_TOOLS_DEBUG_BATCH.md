# BUILD_PR_SHARED_EXTRACTION_26_SANITIZE_TEXT_TOOLS_DEBUG_BATCH

## Purpose
Eliminate duplicated `sanitizeText(value)` implementations across the tools/dev/shared debug slice by centralizing them to one shared utility and updating only the listed consumers.

## Single PR Purpose
Normalize `sanitizeText(value)` ONLY for this exact tools/debug batch:

1. `tools/dev/canvasDebugHudRenderer.js`
2. `tools/dev/devConsoleCommandRegistry.js`
3. `tools/dev/devConsoleIntegration.js`
4. `tools/dev/interactiveDevConsoleRenderer.js`
5. `tools/dev/advanced/debugMacroExecutor.js`
6. `tools/dev/advanced/debugMacroRegistry.js`
7. `tools/dev/advanced/debugPanelGroupRegistry.js`
8. `tools/dev/commandPacks/groupCommandPack.js`
9. `tools/dev/commandPacks/inspectorCommandPack.js`
10. `tools/dev/commandPacks/macroCommandPack.js`
11. `tools/dev/commandPacks/overlayCommandPack.js`
12. `tools/dev/commandPacks/packUtils.js`
13. `tools/dev/inspectors/inspectorStore.js`
14. `tools/dev/plugins/debugPluginSystem.js`
15. `tools/dev/presets/debugPresetApplier.js`
16. `tools/dev/presets/debugPresetRegistry.js`
17. `tools/dev/presets/registerPresetCommands.js`
18. `tools/shared/devConsoleDebugOverlay.js`

This BUILD does not change game files, sample files, or engine files.

## Exact Files Allowed
Edit only these 19 files:

### Canonical shared source
1. `src/src/engine/debug/inspectors/shared/inspectorUtils.js`

### Consumer files
2. `tools/dev/canvasDebugHudRenderer.js`
3. `tools/dev/devConsoleCommandRegistry.js`
4. `tools/dev/devConsoleIntegration.js`
5. `tools/dev/interactiveDevConsoleRenderer.js`
6. `tools/dev/advanced/debugMacroExecutor.js`
7. `tools/dev/advanced/debugMacroRegistry.js`
8. `tools/dev/advanced/debugPanelGroupRegistry.js`
9. `tools/dev/commandPacks/groupCommandPack.js`
10. `tools/dev/commandPacks/inspectorCommandPack.js`
11. `tools/dev/commandPacks/macroCommandPack.js`
12. `tools/dev/commandPacks/overlayCommandPack.js`
13. `tools/dev/commandPacks/packUtils.js`
14. `tools/dev/inspectors/inspectorStore.js`
15. `tools/dev/plugins/debugPluginSystem.js`
16. `tools/dev/presets/debugPresetApplier.js`
17. `tools/dev/presets/debugPresetRegistry.js`
18. `tools/dev/presets/registerPresetCommands.js`
19. `tools/shared/devConsoleDebugOverlay.js`

Do not edit any other file.

## Source-of-Truth for duplication
This BUILD is based on the duplicate report showing `sanitizeText(value)` duplicated across this tools/debug batch and in other slices.
This PR intentionally handles ONLY the tools/debug batch, not the game/sample duplicates.

## Shared Helper Assumption
Use the existing canonical helper:

- `src/src/engine/debug/inspectors/shared/inspectorUtils.js`

Fail fast unless that file exists and exports:

```js
sanitizeText
```

If the file exists and contains `sanitizeText` but does not export it correctly, the only allowed shared-file change is the minimum export fix.

Do not create a new shared file in this PR.

## Exact Change Rules

### Shared source file
#### `src/src/engine/debug/inspectors/shared/inspectorUtils.js`
Allowed:
- confirm `sanitizeText` exists
- confirm `sanitizeText` is exported
- if needed, make the minimum export-only fix

Not allowed:
- no behavior changes
- no renaming
- no adding unrelated helpers
- no refactor

### Consumer files
For each of the 18 listed consumer files:

If a local function definition exists matching:
```js
function sanitizeText(value)
```
then:
- remove the local `sanitizeText` function definition
- add exactly one import for `sanitizeText` from the correct relative path to:
  - `src/src/engine/debug/inspectors/shared/inspectorUtils.js`
- if the file already imports from that shared module, add `sanitizeText` to the existing import with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file does not currently contain a local `sanitizeText(value)` function:
- leave that file unchanged

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/src/engine/debug/inspectors/shared/inspectorUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no game files
- no sample files
- no engine files beyond `src/src/engine/debug/inspectors/shared/inspectorUtils.js`
- no repo-wide sanitizeText cleanup
- no helper behavior changes
- no import path normalization beyond this exact helper move
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 19 listed files changed
2. Confirm `src/src/engine/debug/inspectors/shared/inspectorUtils.js` exports `sanitizeText`
3. Confirm local `function sanitizeText(value)` definitions no longer exist in the changed listed consumer files
4. Confirm changed consumer files import `sanitizeText` from the correct relative path to `src/src/engine/debug/inspectors/shared/inspectorUtils.js`
5. Confirm no game, sample, or unrelated engine file changed
6. Confirm no behavior changes were made

## Non-Goals
- no sanitizeText cleanup in games
- no sanitizeText cleanup in network sample mains
- no sanitizeText cleanup in samples
- no sanitizeText cleanup in other tools/shared files outside the 18 listed consumers
- no refactor beyond this exact duplicate-removal batch
