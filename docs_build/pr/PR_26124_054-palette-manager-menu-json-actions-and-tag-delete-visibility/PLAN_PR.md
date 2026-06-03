# PLAN_PR - PR_26124_054-palette-manager-menu-json-actions-and-tag-delete-visibility

## Goal
Move Palette Manager V2 JSON action buttons into a top `menuSample` area and hide tag delete controls for tags still used by User Palette swatches.

## Scope
- `tools/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not modify shared accordionV2.
- Do not add dependencies.
- Preserve pin/unpin, sort, search, size, import/export behavior, lowercase tag normalization, and duplicate user-defined guards.

## Implementation Plan
1. Add a top menu/nav area immediately before `<div class="palette-manager-v2 app-shell">`.
2. Label the new menu area exactly `menuSample`.
3. Move Import JSON, Copy JSON, Export JSON, and the hidden import file input into the menu area without changing IDs or event behavior.
4. Rename the right-column Import/Export accordion header to `Palette JSON`.
5. Leave only the JSON preview/viewer inside the Palette JSON accordion.
6. Add a Palette Manager V2 method that reports whether a tag is used by any User Palette swatch.
7. Render tag delete `x` controls only for unused available tags.
8. Preserve available tag click behavior for toggling tags on the current selected swatch.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by the Palette Manager V2-only UI update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm a top menu labeled `menuSample` appears immediately above the tool shell.
3. Confirm Import JSON, Copy JSON, and Export JSON buttons appear only in `menuSample`.
4. Confirm the right-column accordion header reads `Palette JSON`.
5. Confirm Palette JSON contains the JSON preview and no duplicate JSON action buttons.
6. Add a swatch with a tag and confirm the used tag has no delete `x`.
7. Remove the tag from all swatches and confirm the delete `x` appears.
8. Confirm clicking the tag name still toggles the tag on/off for the selected swatch.
