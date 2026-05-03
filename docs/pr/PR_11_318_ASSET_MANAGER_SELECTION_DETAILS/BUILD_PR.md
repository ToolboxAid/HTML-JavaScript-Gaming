# BUILD_PR_11_318

## Implementation
- Added a minimal selected-asset details panel in `tools/asset-manager-v2/index.html`:
  - `id`
  - `label`
  - `kind`
  - `path`
  - default message: `Select an asset entry to inspect its session metadata.`
- Updated `tools/asset-manager-v2/index.js`:
  - added UI-only selection state: `selectedAssetId`
  - clicking an asset row now selects it and updates details panel
  - selected row is visually highlighted (pressed + border/background)
  - selection is cleared on empty/invalid states
  - no selection data is written to payload/session persistence

## Validation
- `node --check tools/asset-manager-v2/index.js`
