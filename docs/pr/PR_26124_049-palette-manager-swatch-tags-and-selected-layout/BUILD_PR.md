# BUILD_PR - PR_26124_049-palette-manager-swatch-tags-and-selected-layout

## Purpose
Implement one scoped Palette Manager V2 update: optional swatch tags, selected/detail layout split, tag suggestions, and matching swatch schema support.

## Scope
- `tools/palette-manager-v2/*`
- `tools/schemas/tools/palette-browser.schema.json`
- PR workflow docs and required review artifacts only.

## Implementation
1. Update `tools/schemas/tools/palette-browser.schema.json`:
   - `tags` is optional,
   - `tags` is an array of strings,
   - each tag item is a non-empty string,
   - required swatch fields include `symbol`, `hex`, and `name`,
   - `additionalProperties: false` remains,
   - hex accepts `#RRGGBB` and `#RRGGBBAA`.
2. Update Palette Manager V2 swatch data handling so `tags` roundtrip through add/update/import/export.
3. Split left-column UI into Selected Swatch and User Defined Swatch accordions.
4. Selected Swatch displays selected swatch details with symbol, hex, name, and source read-only, and tags editable.
5. User Defined Swatch owns add/update/clear form actions.
6. Add dependency-free tag type-ahead suggestions from tags already present in the active palette.
7. Preserve existing source tracking and non-editable source behavior.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Do not modify shared accordionV2.
- Do not change pin/unpin, sort, search, size, import/export behavior except to preserve tags.

## Validation
- Syntax check changed files.
- Run targeted served-browser Palette Manager V2 behavior check.
- Validate the palette schema with positive and negative JSON samples.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
