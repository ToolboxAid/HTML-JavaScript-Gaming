
# BUILD_PR_LEVEL_11_177_REMOVE_SHARED_DEPENDENCY_MODEL

## Purpose
Enforce contract-first independence:
SVG must NOT depend on palette or shared handoff.

## Core Rule
Each tool reads ONLY its own payload.

## SVG Contract
payloadJson.vectorAssetDocument:
- svgText (required)
- sourceName (optional label)

## Forbidden
- shared asset handoff
- palette-first logic
- cross-tool dependency
- global state reads

## Implementation

### 1. SVG Tool
- Remove any read of:
  - sharedAssetHandoff
  - sharedPaletteHandoff
- Use ONLY:
  payloadJson.vectorAssetDocument

### 2. platformShell
- Ensure no shared handoff reads affect SVG
- Hosted SVG must not use platformShell badge logic

### 3. workspaceShell
- Ensure SVG derives:
  assetLabel = sourceName || "Inline SVG"

## Acceptance
- SVG loads without palette
- SVG label correct
- No shared handoff reads for SVG
