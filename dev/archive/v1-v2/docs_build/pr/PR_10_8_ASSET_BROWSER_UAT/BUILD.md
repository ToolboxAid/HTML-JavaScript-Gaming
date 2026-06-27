# BUILD_PR_10_8_ASSET_BROWSER_UAT

## Required Behavior

### Empty State
If no assets:
- Show: "No assets loaded"
- Show: "Import or create asset"
- No blank panel

### Data Present
- First asset auto-selected
- Selection visually highlighted

### Controls
- Disabled when no selection
- Enabled when selection exists

### Stability
- No UI flicker
- No reset on click
- No workspace-triggered reload

## Constraints
- Do not modify asset data
- Do not add new features
