# PLAN_PR_11_276_WORKSPACE_V2_FULL_SESSION_EXPORT_CONTRACT_CORRECTION

## Purpose
Correct Workspace V2 export so it outputs the full Workspace session container instead of a single active-tool payload object.

## Scope
- toolbox/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/report only

## Goals
- Export uses active-session validation gate.
- Export serializes a Workspace V2 session wrapper preserving:
  - workspace/session identity
  - active/default tool identity
  - included session library payloads
  - included recent session history payloads
  - session selection metadata
  - merge audit metadata
- Export filename includes workspace + tool + session identity when available.
- Export does not flatten to a single tool payload object.
- No fallback/default export payload path.

## Out of Scope
- No schema file edits.
- No unrelated tool changes.
- No session library/diff/merge behavior-path changes beyond export-source consistency.

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2CurrentSessionExport.test.mjs
- node tests/runtime/V2CurrentSessionExport.test.mjs
