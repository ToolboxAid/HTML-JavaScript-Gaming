# PR_26140_072 Engine Debug Index Barrel Removal

## Summary
- Removed active imports from the targeted debug index barrels:
  - `src/engine/debug/index.js`
  - `src/engine/debug/standard/threeD/index.js`
  - `src/engine/debug/network/index.js`
  - `src/engine/debug/inspectors/index.js`
- Replaced debug barrel imports with direct canonical imports to the owning debug files.
- Deleted the four targeted debug index barrel files after active imports were removed.
- Kept changes import-only. No schema files, sample JSON, sample/game entry `index.js` files, Git commits, pushes, or GitHub PRs were created.

## Direct Import Mapping
- Debug panels:
  - `drawSceneFrame`, `drawFrame`, `drawPanel` -> `src/engine/debug/DebugPanel.js`
  - stacked debug panel helpers -> `src/engine/debug/DebugOverlayLayout.js`
  - combat/debug overlay helpers -> their owning files under `src/engine/debug/`
- Standard 3D debug:
  - provider registry and provider constants/helpers -> `src/engine/debug/standard/threeD/providers/*`
  - panel registry and panel constants/helpers -> `src/engine/debug/standard/threeD/panels/*`
  - presets/bootstrap helpers -> `src/engine/debug/standard/threeD/presets/*` and `bootstrap/*`
- Network debug:
  - providers, panels, command packs, dashboard helpers, and diagnostics now import from their owning files under `src/engine/debug/network/`
- Advanced inspectors:
  - registry, host, commands, bootstrap, presets, and view models now import from owning files under `src/engine/debug/inspectors/`

## Validation
- PASS: debug barrel scan reports `NO_DEBUG_BARREL_IMPORTS`.
- PASS: target deletion scan confirms all four targeted debug `index.js` files no longer exist.
- PASS: no JSON files changed.
- PASS: `node --check` passed for 226 changed existing JS/MJS files.
- PASS: local import target validation passed for 226 changed existing JS/MJS files.
- PASS: `npm run test:workspace-v2` passed 59/59 tests.
- PASS: focused debug Node tests passed:
  - `tests/final/DebugObservabilityMaturity.test.mjs`
  - `tests/final/NetworkDebugAndServerDashboardCloseout.test.mjs`
  - `tests/tools/CameraDebugPanel.test.mjs`
  - `tests/tools/CollisionOverlaysDebugPanel.test.mjs`
  - `tests/tools/RenderPipelineStagesDebugPanel.test.mjs`
  - `tests/tools/SceneGraphInspectorDebugPanel.test.mjs`
  - `tests/tools/TransformInspectorDebugPanel.test.mjs`
- FAIL: `tests/runtime/Phase17DebugOverlayBottomRightPosition.test.mjs`
  - Failure: Node could not resolve browser-root import `/src/engine/scene/Scene.js` from `samples/phase-17/1701/RaycastDemoScene.js`.
  - Error path: `C:\src\engine\scene\Scene.js`.
  - This surfaced during extra focused debug validation and appears related to existing Node execution of browser-root sample imports, not to debug barrel ownership.
- STOPPED: per unattended workflow instruction, PR_26140_073 and PR_26140_074 were not started after this validation failure.
- SKIPPED: full samples smoke test, per instruction.
