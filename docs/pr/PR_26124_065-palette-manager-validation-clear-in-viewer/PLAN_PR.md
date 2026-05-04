# PLAN_PR - PR_26124_065-palette-manager-validation-clear-in-viewer

## Goal
Move Palette Manager V2 Validation/Error Viewer Clear into the Validation/Error Viewer header/control area while preserving display-only clear behavior.

## Scope
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not change Clear tag checkbox behavior.
- Do not change tag sorting.
- Do not change source/sample pin scroll preservation.
- Do not change pin button size.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Avoid broad refactor.

## Implementation Plan
1. Move `#clearValidationViewerButton` from Validation/Error Viewer content into its header/control area.
2. Match the sibling header/action pattern used by User Palette and Sample Palette Swatch.
3. Keep `#clearValidationViewerButton` id unchanged so existing behavior remains wired.
4. Keep Validation/Error Viewer Clear behavior unchanged: clear visible history only, then show future validation/action events normally.
5. Add scoped CSS for the Validation/Error Viewer header/action row.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by this Palette Manager V2-only UI placement update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm the Validation/Error Viewer Clear button appears in the Validation/Error Viewer header/control area.
3. Trigger a validation error.
4. Click Clear and confirm displayed status/errors are removed.
5. Trigger another validation error and confirm it displays normally.
6. Confirm palette state, swatch state, tags, sorting, pinning, import/export data, pin button size, and source/sample pin scroll behavior are unchanged.
