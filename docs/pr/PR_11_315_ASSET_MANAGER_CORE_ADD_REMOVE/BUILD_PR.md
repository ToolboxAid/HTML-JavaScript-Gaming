# BUILD_PR_11_315

## Implementation
- Added minimal Asset Manager V2 add form in `menuTool`:
  - `id`
  - `label`
  - `kind`
  - `path`
  - `Add Asset` button
  - action status readout
- Implemented strict add validation in `tools/asset-manager-v2/index.js`:
  - requires non-empty `id`, `label`, `kind`, `path`
  - rejects duplicate `id`
  - rejects add when no valid session is loaded
- Implemented remove action per asset row:
  - remove by `id`
  - blocks when id not found or session is invalid
- Add/remove operations update `payloadJson.assetCatalog.entries` and re-run contract validation/render path.
- Updated valid state to keep Workspace persistence through existing write-back path so exports reflect add/remove updates.

## Validation
- `node --check tools/asset-manager-v2/index.js`
- legacy-id content audit -> zero matches
- legacy-id path audit -> zero matches
