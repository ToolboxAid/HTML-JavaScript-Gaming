# BUILD_PR - PR_26124_050-palette-manager-tag-entry-and-user-defined-visibility

## Purpose
Implement one scoped Palette Manager V2 update: replace direct tag text editing with explicit tag entry controls, and hide populated User Defined Swatch form data unless the selected swatch is user-defined.

## Scope
- `tools/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Implementation
1. Remove `Remove Selected` from User Defined Swatch.
2. Selected Swatch:
   - keep selected swatch details visible,
   - do not allow direct tag text editing,
   - add a tag entry area with text input and Add Tag button,
   - add tags to the selected user swatch without duplicates.
3. User Defined Swatch:
   - display populated form data only when the selected swatch has source `User Added`,
   - clear all form data when no user-defined swatch is selected,
   - do not allow direct tag text editing,
   - add a tag entry area with text input and Add Tag button.
4. Tag entry behavior:
   - while typing, search existing User Palette swatch tags,
   - show type-ahead suggestions from existing User Palette tags,
   - Enter accepts the active/current suggestion when present,
   - Enter adds the typed tag when no suggestion is active,
   - Add Tag adds the typed tag,
   - duplicate tags on the same swatch are ignored.
5. Preserve import/export tag roundtrip.
6. Preserve pin/unpin, sort, search, size, import/export, and accordionV2 behavior.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Do not modify shared accordionV2.
- Do not broaden changes beyond Palette Manager V2 behavior and PR workflow docs.

## Validation
- Syntax check changed files.
- Run targeted served-browser Palette Manager V2 tag-entry/user-defined visibility check.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
