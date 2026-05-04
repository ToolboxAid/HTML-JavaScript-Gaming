# PLAN_PR - PR_26124_057-palette-manager-source-pin-all

## Goal
Add a Palette Manager V2 Sample Palette Swatch `Pin All` action and remove `Tag` sorting from Sample Palette Swatch while keeping `Tag` sorting for User Palette.

## Scope
- `tools/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Preserve accordionV2 behavior.
- Preserve import/export behavior.
- Preserve individual pin/unpin behavior.
- Avoid broad refactor.

## Implementation Plan
1. Keep User Palette sort options as Hue, Saturation, Brightness, Name, and Tag.
2. Restrict Sample Palette Swatch sort options to Hue, Saturation, Brightness, and Name.
3. Add a `Pin All` button to the Sample Palette Swatch controls.
4. Place `Pin All` to the right of the Source palette dropdown with a compact local size bump.
5. Wire `Pin All` to the currently visible/filtered source swatches.
6. Copy each visible source swatch into User Palette with the current source palette id.
7. Do not add tags to Sample Palette Swatch pins.
8. Skip swatches that fail the existing user duplicate guards for name, RGB/hex, or symbol.
9. Show a clear status with pinned and skipped counts.
10. Keep individual source swatch pin/unpin behavior unchanged.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by the Palette Manager V2-only source pin update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm User Palette sort shows Hue, Saturation, Brightness, Name, and Tag.
3. Confirm Sample Palette Swatch sort shows Hue, Saturation, Brightness, and Name only.
4. Search Sample Palette Swatch to filter visible swatches.
5. Click `Pin All` and confirm only visible swatches are added to User Palette.
6. Click `Pin All` again and confirm duplicates are skipped with a clear pinned/skipped status.
7. Confirm individual source swatch pin/unpin still works.
8. Export JSON and confirm pinned source swatches roundtrip without tags.
9. Confirm `Pin All` sits to the right of the Source palette dropdown.
