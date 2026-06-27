# PLAN_PR - PR_26124_046-right-column-height-balance

## Goal
Balance Palette Manager V2 right column heights so Import/Export takes remaining column height after the Validation/Error viewer.

## Scope
- `toolbox/palette-manager-v2/paletteManagerV2.css`
- Workflow docs_build/reports required by `docs_build/dev/PROJECT_INSTRUCTIONS.md`

## Boundaries
- Do not change behavior or content.
- Do not touch workspace/toolState/session code.
- Do not touch sample JSON.
- Do not modify other panels.
- Do not add dependencies.

## Implementation Plan
1. Convert `.palette-manager-v2__panel--right` to a flex column.
2. Make the first right-column accordion, Import/Export, consume remaining height with `flex: 1 1 auto`, `min-height: 0`, and internal overflow.
3. Make the second right-column accordion, Validation/Error Viewer, fixed-auto height with `max-height: clamp(120px, 22vh, 260px)` and internal overflow.
4. Preserve existing markup and behavior.
5. Run targeted syntax/layout validation and the requested Workspace V2 command.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after the CSS-only right-column layout change.
- Expected fail behavior: failures identify Workspace V2 validation regressions or a missing validation command.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open `toolbox/palette-manager-v2/index.html`.
2. Confirm the right column contains Import/Export above Validation/Error Viewer.
3. Confirm Validation/Error Viewer height is capped.
4. Confirm Import/Export fills the remaining right-column height.
5. Confirm right-column content still scrolls internally where needed.
