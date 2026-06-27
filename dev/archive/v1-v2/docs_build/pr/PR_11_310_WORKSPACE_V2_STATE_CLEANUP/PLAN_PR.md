# PLAN_PR_11_310

## Purpose
Remove conflicting and legacy Workspace V2 state paths so import/export/session activation each use one active flow.

## Scope
- `toolbox/workspace-v2/index.js`
- Remove dead import/export code paths
- Remove diagnostics panel UI + logic
- Consolidate session activation path

## Steps
1. Remove diagnostics bindings/logic and panel render path.
2. Remove dead tool-mode import/export handlers.
3. Consolidate session activation through one helper path.
4. Verify no legacy workspace shape references remain in runtime logic.
5. Run targeted syntax validation and package artifacts.
