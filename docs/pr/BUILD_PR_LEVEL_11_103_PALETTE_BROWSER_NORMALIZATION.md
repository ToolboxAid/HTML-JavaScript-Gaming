# BUILD_PR_LEVEL_11_103_PALETTE_BROWSER_NORMALIZATION

## Purpose
Normalize palette tool naming to canonical `palette-browser` across schema and workspace manifest.

## Scope
- docs-first
- no implementation code
- remove ambiguous `palette` key
- enforce `palette-browser` as single canonical name

## Required Changes

### 1. Workspace Manifest Schema
- Replace required key:
  - `palette` → `palette-browser`

- Update:
  - required: ["palette-browser"]
  - properties.palette → properties.palette-browser

### 2. Tool Registry Consistency
- All references must use:
  - `palette-browser`

### 3. Disallowed
- `palette`
- `palette-browser`
- duplicate palette tool definitions

## Validation
- workspace manifests must include:
  - tools.palette-browser

- no schema validation allowed for:
  - tools.palette-browser

## Notes
- This is a breaking contract correction
- Required before schema lock
