# PR 11.181 Mapping Strategy

## Decision
Stop shell debugging until SVG actually launches.

## Evidence
The latest log only shows Vector Map Editor launch:
- `requestedToolId: vector-map-editor`
- `normalizedToolId: vector-map-editor`

No SVG launch or SVG entry logs appear.

## Debug order
1. Registry
2. Rendered tile data
3. Click handler
4. Launch URL

## Goal
Clicking SVG Asset Studio must produce:
`[WORKSPACE_TOOL_LAUNCH] svg-asset-studio`
