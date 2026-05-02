# BUILD_PR_11_277_WORKSPACE_V2_MANIFEST_ONLY_EXPORT_ENFORCEMENT

## Purpose
Implement manifest-only export/import enforcement for Workspace V2 with schema-gated validation and no custom wrapper.

## Files
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tools/schemas/workspace.manifest.schema.json
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/dev/reports/PR_11_277_workspace_v2_manifest_only_export_enforcement_report.md

## Implementation
1. Replace Workspace V2 export builder from custom `{ version, toolId, workspaceSession }` wrapper to manifest-root document:
   - `documentKind`, `schema`, `version`, `id`, `name`, `tools`
   - `workspaceV2Session` payload block for Workspace V2 session persistence.
2. Enforce export/import validation through one manifest-contract validator method in Workspace V2 before export download/import apply.
3. Block export/import when wrapper payload is supplied (`workspaceSession` root), with explicit actionable message.
4. Keep runtime-only fields blocked from portable export/import payloads.
5. Import path reads manifest-root `workspaceV2Session` and restores sessionStorage/library + active payload.
6. Update runtime test to assert:
   - no custom wrapper
   - manifest-root shape
   - schema field presence for `workspaceV2Session`
   - active payload preservation under `workspaceV2Session.toolSessions`.
7. Add only minimal workspace manifest schema additions needed for Workspace V2 session persistence.

## Acceptance
- Workspace export root is manifest shape, not wrapper.
- Export/import are blocked when manifest contract is invalid.
- No `workspaceSession` wrapper is emitted.
- Runtime-only fields are excluded from portable payload.
- Save/Load/Diff/Merge remain operational under same session source.

## Validation
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2CurrentSessionExport.test.mjs`
