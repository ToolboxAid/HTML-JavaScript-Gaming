# BUILD_PR - PR_26124_054-palette-manager-menu-json-actions-and-tag-delete-visibility

## Purpose
Implement one scoped Palette Manager V2 UI update: move JSON action buttons to `menuSample`, rename the JSON preview accordion, and hide tag delete controls while tags are in use.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Implementation
1. Add a nav/menu area immediately before `<div class="palette-manager-v2 app-shell">`.
2. The menu label must be exactly `menuSample`.
3. Move these existing controls from Import/Export into the new menu area while preserving IDs and behavior:
   - `Import JSON`
   - `Copy JSON`
   - `Export JSON`
4. Keep the hidden JSON file input available to the existing import control behavior.
5. Rename the Import/Export accordion/header to `Palette JSON`.
6. Keep the JSON preview/viewer in Palette JSON.
7. Do not duplicate moved buttons inside Palette JSON.
8. Hide/remove the delete `x` for tags used by any User Palette swatch.
9. Show the delete `x` only for unused tags.
10. Preserve tag-button click behavior for toggling tags on/off for the selected swatch.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not modify shared accordionV2.
- Do not add dependencies.
- Do not broaden changes beyond Palette Manager V2 behavior and PR workflow docs.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 menu JSON action and tag delete visibility check.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
