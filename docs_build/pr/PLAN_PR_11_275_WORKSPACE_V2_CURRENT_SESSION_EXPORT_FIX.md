# PLAN_PR_11_275_WORKSPACE_V2_CURRENT_SESSION_EXPORT_FIX

## Purpose
Fix Workspace V2 "Export Current Session JSON" so it downloads the active session payload with explicit success/failure status messaging.

## Scope
- toolbox/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/report only

## Goals
- Export downloads JSON file when a valid active session exists.
- Export uses same active session source path used by Save Session active-session checks.
- Export filename includes tool/session identity when available.
- Export preserves active payload exactly.
- Export shows explicit no-active-session status when unavailable.
- No fallback/default export payloads.

## Out of Scope
- No session library/diff/merge behavior changes.
- No schema changes.
- No shared framework/sample changes.

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2CurrentSessionExport.test.mjs
- node tests/runtime/V2CurrentSessionExport.test.mjs
