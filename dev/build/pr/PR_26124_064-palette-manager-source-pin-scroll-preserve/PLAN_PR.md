# PLAN_PR - PR_26124_064-palette-manager-source-pin-scroll-preserve

## Goal
Make Palette Manager V2 Sample/Source Palette individual pin/unpin preserve the current source grid scroll position reliably after render.

## Scope
- `toolbox/palette-manager-v2/controls/SourcePaletteBrowserControl.js`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not change Clear checkbox behavior.
- Do not change tag sorting.
- Do not change pin button size.
- Do not change Validation/Error Viewer behavior.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Avoid broad refactor.

## Implementation Plan
1. Update `SourcePaletteBrowserControl.js` scroll preservation helper.
2. Capture `sourceSwatchList.scrollTop` before pin/unpin action triggers render.
3. Restore `sourceSwatchList.scrollTop` in `requestAnimationFrame` after render completes.
4. Keep existing pin/unpin behavior unchanged.
5. Let Pin All continue using the same helper if already wired through it.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by this Palette Manager V2-only source-grid scroll timing update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Ensure the Sample/Source Palette grid has enough swatches to scroll.
3. Scroll the Sample/Source Palette grid down.
4. Click an individual red pin.
5. Confirm the source grid remains at the same scroll position after render.
6. Click an individual green pin/unpin.
7. Confirm the source grid remains at the same scroll position after render.
8. Confirm Clear checkbox behavior, tag sorting, pin button size, and Validation/Error Viewer behavior are unchanged.
