# PLAN_PR_11_276_WORKSPACE_V2_NAV_MODE_SEPARATION_AND_EXPORT_CONTRACT_CORRECTION

## Purpose
Separate tool-vs-workspace navigation modes in Workspace V2 import/export controls and correct workspace export to a portable workspace-level contract.

## Scope
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/report only

## Goals
- Add explicit nav mode separation:
  - tool mode (navTools) exposes only tool import/export actions
  - workspace mode (navWorkspace) exposes only workspace import/export actions
- Keep tool mode import/export tool-session scoped.
- Make workspace mode export a portable workspace wrapper contract.
- Remove runtime-only fields from workspace export payload.
- Keep Save/Load/Overwrite/Diff/Merge operational with imported/exported workspace data.

## Out of Scope
- No schema file rewrites.
- No unrelated tool changes.
- No merge/diff algorithm refactors.

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2CurrentSessionExport.test.mjs
- node tests/runtime/V2CurrentSessionExport.test.mjs
