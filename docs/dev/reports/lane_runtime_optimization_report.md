# Lane Runtime Optimization Report

Generated: 2026-05-26T22:55:37.501Z
Status: PASS

## Runtime Cost Summary

Reused runtime sessions: 0
Reused lane snapshots: 0
Reused warm-start lanes: 0
Reused dependency hydration: 0
Prevented graph rebuilds: 0
Prevented redundant initialization: 0
Prevented redundant browser launches: 0
Prevented redundant lane execution: 5
Baseline Playwright/browser launches: 0
Scheduled Playwright/browser launches: 0

## Scheduled Lane Order

1. engine-src

## Scheduling Blockers

No zero-browser, compilation, or dependency blockers were found.

## Lane Plans

| Lane | Snapshot | Warm Start | Hydration | Baseline Browser Launches | Scheduled Browser Launches | Commands | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| engine-src | INVALIDATED | INVALIDATED | INVALIDATED | 0 | 0 | C:\nvm4w\nodejs\node.exe scripts/run-node-test-files.mjs tests/core/EngineCoreBoundaryBaseline.test.mjs tests/core/FrameClock.test.mjs tests/core/FixedTicker.test.mjs tests/assets/AssetLoaderSystem.test.mjs tests/audio/AudioService.test.mjs tests/input/InputMap.test.mjs tests/input/KeyboardState.test.mjs tests/input/MouseState.test.mjs tests/input/GamepadInputAdapter.test.mjs tests/input/GamepadHapticsService.test.mjs tests/render/Renderer.test.mjs | Engine/src lane validates reusable runtime surfaces through targeted node tests. |

## Runtime Savings Observations

- Zero-browser preflight, lane compilation, and dependency validation run once per targeted runner invocation.
- Reused lane snapshots avoid rebuilding identical targeted execution graphs.
- Validated warm-start lanes reuse deterministic initialization state when manifest and dependency hashes are unchanged.
- Reused dependency hydration avoids repeated helper resolution and fixture ownership traversal for compatible targeted runs.
- Compatible Playwright specs with matching options are kept in shared CLI invocations to avoid redundant browser startup.
- Unselected lanes are not scheduled after isolated targeted lane failures.
- Workspace V2 and samples lanes are not escalated unless explicitly selected.
