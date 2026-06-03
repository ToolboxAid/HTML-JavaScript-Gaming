# BUILD_PR - PR_26124_047-palette-manager-right-column-and-hex-fixes

## Purpose
Apply one scoped Palette Manager V2 fix bundle covering right-column accordion sizing, user-added source locking, and 8-digit hex input support.

## Scope
- `tools/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Implementation
1. Update Palette Manager V2 right-column layout so the Import/Export section flexes only while open.
2. Keep Validation/Error Viewer bottom-anchored with capped usable height.
3. Set source to exactly `User Added` for swatches created through Add User Swatch.
4. Keep selected/user-added swatch source visible but not user-editable.
5. Update local hex validation to accept `#RRGGBB` and `#RRGGBBAA`, preserving alpha.
6. Update local hex hint text from `#RRGGBB` to `#RRGGBBAA`.

## Boundaries
- Do not change workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not modify shared accordionV2.
- Do not add dependencies.
- Do not refactor outside the targeted local fix.

## Validation
- Syntax check changed JavaScript files.
- Run a targeted browser layout and form behavior check for Palette Manager V2.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
