# BUILD_PR_LEVEL_11_107_TOOL_VS_ASSET_KIND_CLARIFICATION

## Purpose
Clarify and enforce separation between:
- Tool IDs
- Asset Kinds

## Key Rule

Tool ≠ Asset Kind

They are DIFFERENT layers.

## Definitions

### Tool ID (FULL NAME)
Used for:
- UI
- routing
- registry
- manifest.tools

Examples:
- sprite-editor
- vector-map-editor
- asset-browser

### Asset Kind (DATA TYPE)
Used for:
- asset classification
- filtering
- validation

Examples:
- sprite
- vector-map
- model
- tilemap

## Correct Relationship

Tool -> accepts Asset Kind(s)

Example:

sprite-editor -> ["sprite"]
vector-map-editor -> ["vector-map"]

## What NOT to do

❌ DO NOT use tool names as asset kinds:
["sprite-editor"]

❌ DO NOT mix layers:
toolId === assetKind

## Current Function (CORRECT)

The function is correct structurally:

toolId (full name) → asset kinds (data types)

## Required Enforcement

- Tool IDs remain full canonical names
- Asset kinds remain canonical data types
- No overlap
- No aliasing
- No duplication

## Acceptance

- Tool IDs are never used as asset kinds
- Asset kinds are never tool IDs
- Mapping is clean and 1-directional
