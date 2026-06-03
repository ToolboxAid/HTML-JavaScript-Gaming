# PLAN_PR_11_276_WORKSPACE_V2_STRICT_NAV_MODE_SEPARATION

## Purpose
Enforce strict Workspace V2 navigation mode separation by removing mode switching and keeping Workspace V2 import/export controls workspace-session only.

## Scope
- toolbox/workspace-v2/index.html
- toolbox/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/report only

## Goals
- Remove/hide navigation mode dropdown in Workspace V2.
- Workspace V2 exposes only navWorkspace import/export controls.
- No Tool Mode controls on Workspace V2.
- Workspace import/export validates workspace-session shape.
- Tool pages do not expose workspace import/export controls.
- No overlap/switching/fallback between navTools and navWorkspace.

## Out of Scope
- No schema rewrites unless strictly required.
- No unrelated tool behavior changes.

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2CurrentSessionExport.test.mjs
- node tests/runtime/V2CurrentSessionExport.test.mjs
