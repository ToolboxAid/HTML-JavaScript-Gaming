# BUILD_PR_11_316

## Implementation
- Updated `tools/asset-manager-v2/index.js` add/remove hardening:
  - blank or whitespace-only add fields are rejected with explicit missing-field messaging
  - duplicate asset id rejection remains explicit and blocking
  - remove-by-id rejection remains explicit when id is not found
  - valid add/remove continues through existing load/validate/persist flow
- Added targeted runtime test:
  - `tests/runtime/V2AssetManagerAddRemoveHardening.test.mjs`
  - validates rejected add/remove actions and successful persistence path

## Validation
- `node --check tools/asset-manager-v2/index.js`
- `node --check tests/runtime/V2AssetManagerAddRemoveHardening.test.mjs`
- `node tests/runtime/V2AssetManagerAddRemoveHardening.test.mjs`
