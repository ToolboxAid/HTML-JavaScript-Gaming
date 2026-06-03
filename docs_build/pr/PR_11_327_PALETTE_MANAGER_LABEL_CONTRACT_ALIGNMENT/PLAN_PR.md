# PLAN_PR — PR_11_327

## Purpose
Fix the next failing tool from `tool_completion_audit.md` with a single-tool, minimal implementation.

## Target Tool
- `palette-manager-v2`

## Problem Chosen
- User-facing launch label drift remained in `palette-manager-v2` after the repo-wide rename from Asset Browser to Asset Manager.
- `toolLabel("asset-manager-v2")` still returned `"Asset Browser V2"`.

## Scoped Implementation
1. Update `toolbox/palette-manager-v2/index.js` label mapping:
   - `asset-manager-v2` -> `"Asset Manager V2"`
2. No schema changes.
3. No cross-tool/runtime refactors.

## Validation
1. `node --check toolbox/palette-manager-v2/index.js`
2. `npm run test:workspace-v2`

## Packaging
- Build repo-structured ZIP at:
  - `tmp/PR_11_327_<timestamp>.zip`
  - `tmp/PR_11_327_delta.zip`
