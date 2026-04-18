# BUILD_PR_LEVEL_21_3_TOOL_AUTOMATION_AND_TOOL_QUALITY_BASELINE_AUTOMATION_MATRIX

## Automated Coverage Matrix
| Surface | Entry/Contract Automation | Boot/Load Smoke Automation | Index/Registry Automation | Deep Workflow Automation | Blocker + Smallest Next Step |
| --- | --- | --- | --- | --- | --- |
| 3D Asset Viewer | `RequiredToolsBaseline.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add one fixture-driven load/edit/export test for 3D tool family. |
| 3D Camera Path Editor | `RequiredToolsBaseline.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add deterministic camera-path fixture import/export test. |
| 3D Map Editor | `RequiredToolsBaseline.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add deterministic map-document open/save test. |
| Asset Browser / Import Hub | `ToolEntryLaunchContract.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add import-plan fixture smoke with expected handoff payload check. |
| Asset Pipeline Tool | `RequiredToolsBaseline.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add one baseline conversion/validation fixture assertion. |
| Palette Browser / Manager | `ToolEntryLaunchContract.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add palette create/edit persistence smoke test. |
| Parallax Scene Studio | `ToolEntryLaunchContract.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add single-scene fixture open/edit/export smoke test. |
| Performance Profiler | `RequiredToolsBaseline.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add deterministic frame-sample ingestion test. |
| Physics Sandbox | `RequiredToolsBaseline.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add fixed-step sandbox scenario assertion test. |
| Replay Visualizer | `RequiredToolsBaseline.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add replay fixture ingest/timeline seek test. |
| Sprite Editor | `ToolEntryLaunchContract.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add sprite-frame edit persistence smoke test. |
| State Inspector | `RequiredToolsBaseline.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add snapshot render + invalid payload handling test. |
| Tile Model Converter | `RequiredToolsBaseline.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add one conversion fixture contract test. |
| Tilemap Studio | `ToolEntryLaunchContract.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add deterministic tilemap open/edit/save smoke test. |
| Tool Host | No dedicated contract test yet | `LaunchSmokeAllEntries.test.mjs --tools` | Covered by `ToolsIndexRegistrySmoke.test.mjs` host-link assertion | Not automated | Add `Tool Host` entry + query-param dispatch contract test. |
| Vector Asset Studio | `ToolEntryLaunchContract.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add vector asset open/edit/export fixture test. |
| Vector Map Editor | `ToolEntryLaunchContract.test.mjs` | `LaunchSmokeAllEntries.test.mjs --tools` | Covered through shared registry/index tests | Not automated | Add map geometry fixture import/export validation test. |
| Tools Index / Registry | `ToolsIndexRegistrySmoke.test.mjs` | Indirect (`--tools` launch path) | `ToolsIndexRegistrySmoke.test.mjs` + `ToolEntryLaunchContract.test.mjs` | Not automated | Harden legacy validator scripts to reflect active contract. |

## Notes
- This PR adds `tests/tools/ToolsIndexRegistrySmoke.test.mjs` to close the explicit index/registry automation gap.
- Legacy validator scripts were executed for evidence and documented as known bugs in `tool_known_bugs.md`.
