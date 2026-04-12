# BUILD_PR_DEBUG_INSPECTOR_TOOLS

## Purpose
Introduce initial debug and inspector tools to improve visibility into runtime state, asset flow, and performance.

## Goals
- enable state inspection
- visualize runtime events/replay
- provide basic performance metrics

## Scope
- State Inspector Tool
- Replay Visualizer Tool
- Performance Profiler Tool (baseline)

## Out of Scope
- deep profiling integrations
- full timeline debugging systems
- UI-heavy redesigns

## Strategy
- integrate with existing tool host
- leverage shared project/state systems
- keep tools lightweight and opt-in

## Validation
- npm run test:launch-smoke -- --tools
- tools launch without errors
- basic inspection works
