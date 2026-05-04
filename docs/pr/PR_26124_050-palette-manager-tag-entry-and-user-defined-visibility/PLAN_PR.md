# PLAN_PR - PR_26124_050-palette-manager-tag-entry-and-user-defined-visibility

## Goal
Refine Palette Manager V2 tag editing so tags are added through explicit tag entry controls, and show User Defined Swatch form data only for selected user-defined swatches.

## Scope
- `tools/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Do not change shared accordionV2.
- Preserve pin/unpin, sort, search, size, and import/export behavior.

## Implementation Plan
1. Remove the Remove Selected button from User Defined Swatch.
2. Replace direct tag text editing with tag entry areas in Selected Swatch and User Defined Swatch.
3. Add dependency-free tag suggestion behavior from tags already used in the active user palette.
4. Support Enter and Add Tag to add a typed or active suggestion tag.
5. Prevent duplicate tags on the same swatch.
6. Show populated User Defined Swatch form data only when the selected swatch is user-defined.
7. Clear User Defined Swatch form data when the selected swatch is not user-defined.
8. Preserve import/export tag roundtrip.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after Palette Manager V2-only changes.
- Expected fail behavior: failures identify Workspace V2 regressions or a missing validation command.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2 through a local server.
2. Add a user-defined swatch and confirm User Defined Swatch shows populated form data.
3. Select a source-palette swatch and confirm User Defined Swatch form data is cleared.
4. Confirm Selected Swatch and User Defined Swatch tags cannot be edited directly.
5. Type a tag and press Add Tag, then confirm it appears in the swatch tags and export JSON.
6. Type a matching prefix and press Enter, then confirm the current suggestion is added.
7. Attempt to add a duplicate tag and confirm it is not duplicated.
8. Confirm import/export preserves existing tags.
