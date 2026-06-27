# Manifest Palette Rules

## Source of Truth
workspace.manifest.json defines:
- sample ownership
- tool mapping
- palette linkage

## Required Fields
- sampleId
- tool
- palette (when applicable)

## Do Not
- Do not scan filesystem at runtime
- Do not infer palettes
- Do not allow missing palette references
