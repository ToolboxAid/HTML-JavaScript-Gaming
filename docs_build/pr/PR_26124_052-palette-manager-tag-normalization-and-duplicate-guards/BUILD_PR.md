# BUILD_PR - PR_26124_052-palette-manager-tag-normalization-and-duplicate-guards

## Purpose
Implement one scoped Palette Manager V2 update: lowercase tag normalization, duplicate guards for user-defined swatch fields, Add accordion field cleanup, and selected-tag removal.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Implementation
1. Force all tag values to lowercase when added, displayed, stored, imported, and exported.
2. Prevent duplicate User Defined/Add swatch values for:
   - `name`,
   - RGB/hex,
   - `symbol`.
3. Duplicate validation must block Add and Update with clear validation/error messages.
4. Remove Source field/textbox from the Add accordion.
5. Remove Tags field/textbox from the Add accordion.
6. In Selected Swatch, clicking an existing tag button removes that tag from the selected swatch.
7. Preserve valid tag import/export roundtrip after lowercase normalization.
8. Preserve pin/unpin, sort, search, size, import/export, and accordion behavior.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not modify shared accordionV2.
- Do not broaden changes beyond Palette Manager V2 behavior and PR workflow docs.

## Validation
- Syntax check changed files.
- Run targeted served-browser Palette Manager V2 tag normalization, duplicate guard, and selected-tag removal check.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
