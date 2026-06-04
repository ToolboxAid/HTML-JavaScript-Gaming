# BUILD_PR — PR_11_327

## Scope
- One tool only: `palette-manager-v2`
- Minimal/surgical code change only
- No schema edits
- No unrelated runtime edits

## Change
- Updated `toolLabel` mapping in `toolbox/palette-manager-v2/index.js`:
  - from `"Asset Browser V2"`
  - to `"Asset Manager V2"`

## Why This Fix
- Aligns launch/breadcrumb UI contract with the current tool ID rename (`asset-manager-v2`).
- Prevents mismatched standalone/workspace launch wording for the same tool.

## Validation Performed
1. `node --check toolbox/palette-manager-v2/index.js` -> PASS
2. `npm run test:workspace-v2` -> PASS (`1 passed`, `failed=0`)

## Full Samples Smoke
- Skipped.
- Reason: single-line, single-tool label correction with no engine/schema/sample/runtime-contract mutation.
