# PLAN_PR: LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT

## Purpose
Close the remaining generic failure signals in the standalone sample/tool data-flow contract test without adding new tools, schemas, or features.

## Roadmap phase
Phase 10 = TOOL + SAMPLE CONTRACT STABILITY

## Scope
Fix only standalone sample contract failures reported by:

```powershell
npm run test:sample-standalone:data-flow
```

Target failing areas from the prior report:

- Asset Browser / Import Hub
- Asset Pipeline Tool
- Parallax Scene Studio
- Performance Profiler
- Physics Sandbox
- Replay Visualizer
- Palette binding
- State Inspector JSON input
- Tile Model Converter
- Tilemap Studio
- Vector Asset Studio
- Vector Map Editor

## Required rule
Every fix must preserve this contract chain:

```text
sample -> schema -> normalized input -> tool -> UI/state
```

## Hard constraints
- Do not add silent fallback data.
- Do not add hardcoded asset paths.
- Do not hide failures by weakening assertions.
- Do not add new schemas unless an existing documented schema is missing from the sample contract path.
- Do not make repo-wide formatting or unrelated cleanup changes.
- Do not modify `start_of_day` folders.

## Debug priority
For each failure, answer this first:

```text
Did the tool receive the payload?
```

Then check:

- payload shape
- binding slot
- manifest path
- stale route/path
- required field mismatch
- JSON validity
- UI state update after payload ingest

## Expected result
The PR is complete when the standalone data-flow test report shows fewer generic failure signals than before, with all changed tools receiving explicit sample payloads through the documented contract path.
