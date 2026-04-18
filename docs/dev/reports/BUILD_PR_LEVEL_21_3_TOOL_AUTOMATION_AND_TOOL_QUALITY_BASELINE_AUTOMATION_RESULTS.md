# BUILD_PR_LEVEL_21_3_TOOL_AUTOMATION_AND_TOOL_QUALITY_BASELINE_AUTOMATION_RESULTS

## Execution Log
1. `node --input-type=module -` (runs):
   - `tests/tools/RequiredToolsBaseline.test.mjs`
   - `tests/tools/ToolEntryLaunchContract.test.mjs`
   - `tests/tools/ToolsIndexRegistrySmoke.test.mjs`
2. `node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --tools`
3. `node ./scripts/validate-tool-registry.mjs`
4. `node ./scripts/validate-active-tools-surface.mjs`

## Results
| Command | Result | Evidence |
| --- | --- | --- |
| targeted `tests/tools/*` run | PASS | `PASS ./tests/tools/RequiredToolsBaseline.test.mjs`<br>`PASS ./tests/tools/ToolEntryLaunchContract.test.mjs`<br>`PASS ./tests/tools/ToolsIndexRegistrySmoke.test.mjs` |
| `node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --tools` | PASS | `PASS=17 FAIL=0 TOTAL=17` and `docs/dev/reports/launch_smoke_report.md` updated |
| `node ./scripts/validate-tool-registry.mjs` | FAIL | Reports registry drift and utility-folder false positives (captured in `tool_known_bugs.md`, TB-001) |
| `node ./scripts/validate-active-tools-surface.mjs` | FAIL | Fails with `ENOENT` for missing `docs/pr/BUILD_PR_VECTOR_SHOWCASE_AND_GEOMETRY_RUNTIME_FINAL.md` dependency (captured in `tool_known_bugs.md`, TB-002) |

## Automation Status
- Boot/load/index/registry/basic smoke automation exists and is execution-backed for the active tools lane.
- Remaining failures are isolated to legacy validators with stale assumptions, not runtime launch failures.
