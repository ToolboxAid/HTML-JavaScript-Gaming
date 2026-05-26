# Targeted File Manifest Report

Generated: 2026-05-26T22:17:10.906Z
Status: PASS

## Manifest-Generated Lane Inputs

| Lane | Ownership | Status | Source | Tests | Helpers | Fixtures | Imports / Dependencies | Dependency Graph Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| integration | integration | PASS | generated | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs; tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Pong/game.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | 4138c2ded15059b2 | efd808f21c146e0b | Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime. |

## Discovery Expansion Control

Prevented discovery expansion: Yes
Prevented redundant scans: 5
Targeted file/helper reads: 6

## Runtime Savings Observations

- Each selected lane receives one deterministic manifest before runtime scheduling.
- Manifest inputs replace repeated recursive test, helper, and fixture discovery during targeted execution.
- Runtime command targets must be declared by the lane manifest before browser launch.
- Manifest hashes lock lane inputs so runtime lane mutation is detected before execution.
