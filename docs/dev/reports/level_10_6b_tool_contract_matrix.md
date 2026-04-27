# LEVEL 10.6B Tool Contract Matrix

Validation source:
- `npm run test:sample-standalone:data-flow`
- `tmp/sample-standalone-tool-data-flow-results.json`

| Tool / Area | Current signal (validated) | Expected fix type | Payload received? | UI/state bound? | Status |
|---|---|---|---|---|---|
| Asset Browser / Import Hub | No failure signal; targeted samples loaded preset | explicit payload binding | YES | YES | PASS |
| Asset Pipeline Tool | No failure signal; targeted samples loaded preset | explicit payload binding | YES | YES | PASS |
| Parallax Scene Studio | No failure signal for prior failing samples (`0306`,`1204`,`1205`,`1208`) | contract/path alignment | YES | YES | PASS |
| Performance Profiler | No failure signal for prior failing samples (`0512`,`1319`,`1407`) | stale path/manifest route fix | YES | YES | PASS |
| Physics Sandbox | No failure signal for prior failing samples (`0210`,`0303`,`1606`) | stale path/manifest route fix | YES | YES | PASS |
| Replay Visualizer | No failure signal for prior failing samples (`0708`,`1315`,`1406`) | event payload normalization | YES | YES | PASS |
| Palette | No failure signal; targeted palette samples bind and render swatches | binding slot correction | YES | YES | PASS |
| State Inspector | No generic failure signal reported in current run (`0205`,`0208`,`0217`) | valid explicit JSON sample payload | Not asserted in 10.6B closeout contracts | Not asserted in 10.6B closeout contracts | PASS (no blocker) |
| Tile Model Converter | No failure signal for prior failing samples (`0221`,`0305`,`1209`) | payload shape alignment | YES | YES | PASS |
| Tilemap Studio | No generic failure signal in current run (`0221`,`0305`,`1208`,`1209`,`1210`) | payload shape/binding alignment | YES | YES | PASS |
| Vector Asset Studio | No generic failure signal in current run (`0901`,`1204`,`1208`,`1215`,`1216`,`1217`) | explicit manifest input | No regression signal; explicit 10.6B contract assertion not expanded for this tool | No regression signal; explicit 10.6B contract assertion not expanded for this tool | PASS (no blocker) |
| Vector Map Editor | No generic failure signal in current run (`0901`,`1204`,`1205`,`1212`,`1213`,`1214`) | explicit manifest input | YES (via load-signal checks) | YES (via load-signal checks) | PASS |

## Closeout check
- Generic failure signals after closeout: `0`
- Remaining generic failures: none
